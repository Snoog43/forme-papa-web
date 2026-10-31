// Séance guidée plein écran : une étape à la fois, minuteur, voix, bips, écran maintenu allumé.
import { animation } from './illustrations.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (s) => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

let L = null; // lecture en cours

// opts : { titre, etapes, kg(ex) -> nombre|null, onSerie(ex, index, kg), onFin({ minutes, rpe }), onAlerte() }
export function lancer(opts) {
  fermer(true);
  L = { ...opts, i: 0, fin: 0, pauseReste: null, debut: Date.now(), voix: localStorageGet('voix') !== 'non', dits: new Set(), compteurSerie: {} };
  document.body.classList.add('lecteur-ouvert');
  ecranAllume(true);
  demarrerEtape();
}

function localStorageGet(k) { try { return localStorage.getItem('formepapa.' + k); } catch { return null; } }
function localStorageSet(k, v) { try { localStorage.setItem('formepapa.' + k, v); } catch { /* sans importance */ } }

// ---------- Son, voix, écran ----------
let audio = null;
function bip(long = false) {
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = long ? 660 : 880; o.connect(g); g.connect(audio.destination);
    g.gain.setValueAtTime(0.25, audio.currentTime); g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + (long ? 0.6 : 0.15));
    o.start(); o.stop(audio.currentTime + (long ? 0.6 : 0.15));
  } catch { /* pas de son disponible */ }
}
function dire(t) {
  if (!L?.voix || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(t); u.lang = 'fr-FR'; u.rate = 0.95;
  speechSynthesis.speak(u);
}
let verrou = null;
async function ecranAllume(oui) {
  try {
    if (oui && 'wakeLock' in navigator) verrou = await navigator.wakeLock.request('screen');
    else if (!oui && verrou) { await verrou.release(); verrou = null; }
  } catch { /* refus du navigateur : sans importance */ }
}
document.addEventListener('visibilitychange', () => { if (L && !document.hidden) ecranAllume(true); });

// ---------- Déroulé ----------
const etape = () => L.etapes[L.i];
const minute = (e) => e.type === 'chrono' || e.type === 'repos';

function demarrerEtape() {
  const e = etape();
  L.dits = new Set();
  L.pauseReste = null;
  L.fin = minute(e) ? Date.now() + e.duree * 1000 : 0;
  rendre();
  const duree = e.duree >= 60 ? `${Math.round(e.duree / 60)} minutes` : `${e.duree} secondes`;
  if (e.type === 'serie') dire(`${e.titre}. Série ${e.serie} sur ${e.nb}. ${e.reps} répétitions.`);
  else if (e.type === 'repos') dire(`Repos, ${duree}. ${e.texte}.`);
  else if (e.type === 'chrono') dire(`${e.titre}, ${duree}.`);
  else dire(e.titre);
  clearInterval(L.tic);
  L.tic = setInterval(tic, 250);
}

function tic() {
  if (!L) return;
  const e = etape();
  if (!minute(e) || L.pauseReste != null) return;
  const reste = (L.fin - Date.now()) / 1000;
  const el = document.getElementById('lc-temps');
  if (el) el.textContent = fmt(reste);
  const barre = document.getElementById('lc-barre-etape');
  if (barre) barre.style.width = `${Math.min(100, (1 - reste / e.duree) * 100)}%`;
  const s = Math.ceil(reste);
  if (e.rappelMilieu && e.duree >= 600 && reste <= e.duree / 2 && !L.dits.has('milieu')) { L.dits.add('milieu'); dire('Mi-parcours. Vérifie que tu peux encore parler.'); }
  if (e.duree > 90 && s === 60 && !L.dits.has(60)) { L.dits.add(60); dire('Plus qu\'une minute.'); }
  if (s <= 3 && s >= 1 && !L.dits.has(s)) { L.dits.add(s); bip(); }
  if (reste <= 0) { bip(true); suivant(); }
}

function suivant() {
  if (!L) return;
  if (L.i >= L.etapes.length - 1) return terminer();
  L.i++;
  demarrerEtape();
}
function precedent() { if (L && L.i > 0) { L.i--; demarrerEtape(); } }
function pause() {
  const e = etape();
  if (!minute(e)) return;
  if (L.pauseReste == null) { L.pauseReste = (L.fin - Date.now()) / 1000; dire('Pause'); }
  else { L.fin = Date.now() + L.pauseReste * 1000; L.pauseReste = null; }
  rendre();
}

function terminer() {
  clearInterval(L.tic);
  L.termine = true;
  const minutes = Math.max(1, Math.round((Date.now() - L.debut) / 60000));
  L.minutes = minutes;
  dire('Bravo, séance terminée !');
  rendre();
}

export function fermer(silencieux) {
  if (!L) return;
  clearInterval(L.tic);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  L = null;
  ecranAllume(false);
  document.body.classList.remove('lecteur-ouvert');
  const z = document.getElementById('lecteur');
  if (z) z.innerHTML = '';
  if (!silencieux) document.dispatchEvent(new CustomEvent('lecteur-ferme'));
}

// ---------- Affichage ----------
function rendre() {
  const z = document.getElementById('lecteur');
  if (!z || !L) return;
  const n = L.etapes.length;
  if (L.termine) {
    z.innerHTML = `<div class="lc"><div class="lc-haut"><span></span><button class="lc-x" data-lc="fermer" aria-label="Fermer">✕</button></div>
      <div class="lc-centre"><div class="lc-bravo">Bravo !</div><p>Séance terminée en <b>${L.minutes} min</b>.</p>
      <p>Comment c'était ? (effort de 6 à 20)</p><div class="lc-rpe">${[10, 11, 12, 13, 14, 15].map((r) => `<button data-lc="rpe" data-v="${r}">${r}</button>`).join('')}</div>
      <p class="lc-aide">10-11 facile · 12-13 un peu difficile · 14-15 difficile</p></div></div>`;
    return;
  }
  const e = etape();
  const progres = Math.round((L.i / n) * 100);
  let milieu = '';
  if (e.type === 'serie') {
    const kg = L.kg?.(e.ex);
    milieu = `<div class="lc-info">Série <b>${e.serie}</b> sur ${e.nb} · <b>${esc(e.reps)}</b> répétitions</div>
      ${kg != null ? `<label class="lc-kg">Charge <input id="lc-kg" inputmode="decimal" value="${esc(String(kg).replace('.', ','))}"> kg</label>` : ''}
      ${e.variante ? `<p class="lc-texte">Pour démarrer : ${esc(e.variante)}</p>` : ''}
      <p class="lc-texte">Souffle pendant l'effort. Ne bloque pas ta respiration. Arrête 2 ou 3 répétitions avant de ne plus pouvoir.</p>`;
  } else if (minute(e)) {
    const reste = L.pauseReste != null ? L.pauseReste : (L.fin - Date.now()) / 1000;
    milieu = `<div class="lc-temps" id="lc-temps">${fmt(reste)}</div><div class="lc-barre"><i id="lc-barre-etape" style="width:${Math.min(100, (1 - reste / e.duree) * 100)}%"></i></div>
      ${e.texte ? `<p class="lc-texte">${esc(e.texte)}</p>` : ''}`;
  } else {
    milieu = `<p class="lc-texte grand">${esc(e.texte)}</p>`;
  }
  const action = e.type === 'serie' ? '<button class="lc-btn principal" data-lc="serie">Série terminée</button>'
    : e.type === 'etape' ? '<button class="lc-btn principal" data-lc="suivant">Suivant</button>'
      : `<button class="lc-btn principal" data-lc="pause">${L.pauseReste != null ? 'Reprendre' : 'Pause'}</button>`;
  z.innerHTML = `<div class="lc">
    <div class="lc-haut"><span class="lc-titre">${esc(L.titre)} · ${L.i + 1}/${n}</span>
      <button class="lc-voix" data-lc="voix" aria-label="Voix">${L.voix ? 'Voix : oui' : 'Voix : non'}</button>
      <button class="lc-x" data-lc="fermer" aria-label="Fermer">✕</button></div>
    <div class="lc-progres"><i style="width:${progres}%"></i></div>
    <div class="lc-centre"><div class="lc-anim">${animation(e.anim, 230)}</div>
      <div class="lc-type">${e.type === 'repos' ? 'Repos' : e.type === 'serie' ? 'Exercice' : ''}</div>
      <h2 class="lc-nom">${esc(e.titre)}</h2>${milieu}</div>
    <div class="lc-bas"><button class="lc-btn" data-lc="precedent" ${L.i === 0 ? 'disabled' : ''}>‹ Retour</button>${action}
      <button class="lc-btn" data-lc="suivant">${e.type === 'repos' ? 'Passer' : 'Suivant'} ›</button></div>
    <button class="lc-alerte" data-lc="alerte">Je ne me sens pas bien</button></div>`;
}

document.addEventListener('click', (ev) => {
  const b = ev.target.closest('[data-lc]');
  if (!b || !L) return;
  const a = b.dataset.lc;
  if (a === 'fermer') { if (L.termine || L.i === 0 || confirm('Arrêter la séance guidée ?')) fermer(); }
  else if (a === 'suivant') suivant();
  else if (a === 'precedent') precedent();
  else if (a === 'pause') pause();
  else if (a === 'voix') { L.voix = !L.voix; localStorageSet('voix', L.voix ? 'oui' : 'non'); if (!L.voix) speechSynthesis?.cancel(); rendre(); }
  else if (a === 'serie') {
    const e = etape(), kgEl = document.getElementById('lc-kg');
    const kg = kgEl ? parseFloat(kgEl.value.replace(',', '.')) : null;
    L.onSerie?.(e.ex, e.serie - 1, Number.isFinite(kg) ? kg : null);
    suivant();
  } else if (a === 'rpe') { const fin = L.onFin; const m = L.minutes; fermer(true); fin?.({ minutes: m, rpe: +b.dataset.v }); }
  else if (a === 'alerte') {
    clearInterval(L.tic); speechSynthesis?.cancel();
    L.onAlerte?.();
    document.getElementById('lecteur').innerHTML = `<div class="lc"><div class="lc-haut"><span></span><button class="lc-x" data-lc="fermer">✕</button></div>
      <div class="lc-centre"><h2 class="lc-nom">Arrête l'effort et assieds-toi</h2>
      <p class="lc-texte grand">Si tu as une douleur ou un serrement dans la poitrine, ou si ça ne passe pas en quelques minutes : appelle le 15.</p>
      <a class="lc-btn principal appel" href="tel:15">Appeler le 15</a><p class="lc-texte">Parles-en à ton cardiologue avant la prochaine séance.</p></div></div>`;
    L.termine = true;
  }
});
