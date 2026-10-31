// Interface. Toutes les données restent dans le téléphone (localStorage), avec export/import JSON.
import { CATEGORIES, EXERCICES, SIGNES_ALERTE } from './data.js';
import * as L from './logic.js';
import { animation, ANIM_SEANCE } from './illustrations.js';
import { lancer as lancerGuide } from './player.js';

const CLE = 'formepapa.v1';
const AUJ = () => L.ymd(new Date());
const prochainLundi = () => { const t = AUJ(); return L.dow(t) === 0 ? t : L.addDays(L.lundi(t), 7); };

const DEFAUT = {
  profil: { prenom: '', age: 56, sexe: 'H', taille: null, poids: 90, objectif: 85, debut: null, betabloquant: false, fcMax: null, intervalles: false, sel: 5, kcalPerso: null, ok: false },
  seances: {}, repas: {}, perso: [], pesees: [], recents: [], menuChoix: {},
};

const ui = { tab: 'jour', date: AUJ(), semaine: null, ajout: null, ouvert: {} };

function charger() {
  try {
    const d = JSON.parse(localStorage.getItem(CLE));
    if (d && d.profil) return nettoyer(d);
  } catch { /* stockage indisponible ou corrompu */ }
  const d = structuredClone(DEFAUT);
  d.profil.debut = prochainLundi();
  return d;
}

// Données lues (stockage ou fichier de sauvegarde) : on ne garde que des champs connus, aux bons types.
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/, RE_ID = /^[a-z0-9]{1,40}$/i;
const nb = (x) => (x === null || x === '' || x === undefined || !Number.isFinite(+x) ? null : +x);
const txt = (x, n) => String(x ?? '').slice(0, n);
function nettoyer(d) {
  const o = structuredClone(DEFAUT), p = d.profil || {};
  for (const [k, def] of Object.entries(DEFAUT.profil)) {
    if (k === 'prenom') o.profil.prenom = txt(p.prenom, 40);
    else if (k === 'sexe') o.profil.sexe = p.sexe === 'F' ? 'F' : 'H';
    else if (k === 'debut') o.profil.debut = RE_DATE.test(p.debut) ? p.debut : prochainLundi();
    else if (typeof def === 'boolean') o.profil[k] = !!p[k];
    else o.profil[k] = nb(p[k]) ?? def;
  }
  for (const [date, j] of Object.entries(d.seances || {})) {
    if (!RE_DATE.test(date) || !j) continue;
    const src = j.matin || j.soir ? j : { matin: j }; // ancien format : une séance par jour
    const jour = {};
    for (const q of ['matin', 'soir']) {
      const s = src[q];
      if (!s) continue;
      const ex = {};
      for (const [id, e] of Object.entries(s.ex || {})) if (RE_ID.test(id) && e) ex[id] = { kg: nb(e.kg), sets: Array.isArray(e.sets) ? e.sets.slice(0, 5).map(Boolean) : [] };
      jour[q] = { ex, fait: !!s.fait, alerte: !!s.alerte, court: !!s.court, rpe: nb(s.rpe), duree: nb(s.duree), fc: nb(s.fc), km: nb(s.km), note: txt(s.note, 200) };
      if (s.tests) jour[q].tests = { dist: nb(s.tests.dist), chaise: nb(s.tests.chaise) };
    }
    o.seances[date] = jour;
  }
  const NUM = ['kcal', 'prot', 'gluc', 'lip', 'ags', 'fib', 'sel', 'portion'];
  o.perso = (Array.isArray(d.perso) ? d.perso : []).filter((a) => a && RE_ID.test(a.id))
    .map((a) => ({ id: a.id, nom: txt(a.nom, 60), portionNom: 'portion', ...Object.fromEntries(NUM.map((k) => [k, Math.max(0, nb(a[k]) ?? 0)])) }))
    .map((a) => ({ ...a, portion: a.portion || 100 }));
  for (const [date, l] of Object.entries(d.repas || {})) {
    if (!RE_DATE.test(date) || !Array.isArray(l)) continue;
    o.repas[date] = l.filter((e) => e && L.MOMENTS[e.m]).map((e) => {
      const r = { m: e.m };
      if (L.MOMENTS[e.menu]) r.menu = e.menu;
      if (e.libre) r.libre = { nom: txt(e.libre.nom, 60), kcal: nb(e.libre.kcal) ?? 0, prot: nb(e.libre.prot) ?? 0 };
      else { r.a = RE_ID.test(e.a) ? e.a : ''; r.g = nb(e.g) ?? 0; }
      return r;
    });
  }
  o.pesees = (Array.isArray(d.pesees) ? d.pesees : []).filter((x) => x && RE_DATE.test(x.date) && nb(x.kg)).map((x) => ({ date: x.date, kg: nb(x.kg), tt: nb(x.tt) }));
  o.recents = (Array.isArray(d.recents) ? d.recents : []).filter((x) => RE_ID.test(x)).slice(0, 15);
  for (const [date, c] of Object.entries(d.menuChoix || {})) {
    if (!RE_DATE.test(date) || !c) continue;
    o.menuChoix[date] = Object.fromEntries(Object.keys(L.MOMENTS).filter((m) => Number.isInteger(c[m])).map((m) => [m, c[m]]));
  }
  return o;
}

let S = charger();
function sauver() { try { localStorage.setItem(CLE, JSON.stringify(S)); } catch { toast('Impossible d\'enregistrer sur ce téléphone'); } }

// ---------- Utilitaires ----------
const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const x = parseFloat(String(v).replace(',', '.')); return Number.isFinite(x) ? x : null; };
const fr = (x, d = 0) => (Math.round(x * 10 ** d) / 10 ** d).toLocaleString('fr-FR');
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/œ/g, 'oe');
const $ = (sel) => document.querySelector(sel);
const carte = () => L.indexAliments(S.perso);
const poidsActuel = () => (S.pesees.length ? [...S.pesees].sort((a, b) => a.date.localeCompare(b.date)).at(-1).kg : S.profil.poids);
const cible = () => L.cibles(S.profil, poidsActuel());
const semDe = (date) => L.semaineIndex(S.profil.debut, date);
const seanceDu = (date) => L.seance(semDe(date), L.dow(date), S.profil);
// Séance réellement prévue (version courte si choisie) et liste des séances faites avec leur durée.
const seanceEff = (date, q) => { const s = seanceDu(date)[q]; return s && S.seances[date]?.[q]?.court ? L.raccourcir(s) : s; };
const seancesFaites = () => Object.entries(S.seances).flatMap(([date, j]) => ['matin', 'soir'].filter((q) => j[q]?.fait)
  .map((q) => ({ date, minutes: j[q].duree || seanceEff(date, q)?.minutes || 30 })));
const animSeance = (s) => (s.type === 'cardio' ? (s.machine === 'velo' ? 'velo' : 'tapis') : ANIM_SEANCE[s.type] || 'etirement');
const journal = (date, q) => { const j = (S.seances[date] ||= {}); return (j[q] ||= { ex: {} }); };
const lu = (date, q) => S.seances[date]?.[q] || { ex: {} };
const repasDu = (date) => S.repas[date] || [];
const menusDu = (date) => L.menuJour(date, cible(), carte(), S.menuChoix[date]);
const nomCourt = (a, g) => (a.id === 'oeuf' ? `${g / 50} œuf${g > 50 ? 's' : ''}` : `${a.nom.toLowerCase()} ${g} g`);

function toast(t) {
  const el = $('#toast'); el.textContent = t; el.classList.add('vu');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('vu'), 2500);
}

function barre(label, val, max, unite, inverse = false) {
  const pct = max ? Math.min(100, (val / max) * 100) : 0;
  const trop = val > max * 1.05;
  const cls = inverse ? (trop ? 'mal' : 'bien') : trop ? 'mal' : val >= max * 0.9 ? 'bien' : '';
  return `<div class="barre"><div class="barre-l"><span>${label}</span><span><b>${fr(val, unite === 'g' && max < 20 ? 1 : 0)}</b> / ${fr(max)} ${unite}${inverse ? ' max' : ''}</span></div>
    <div class="barre-f"><i class="${cls}" style="width:${pct}%"></i></div></div>`;
}
const msgsHtml = (msgs) => msgs.map((m) => `<div class="msg ${m.niv}">${h(m.txt)}</div>`).join('');

function navDate(date, libre = true) {
  const auj = date === AUJ();
  return `<div class="navdate">
    <button class="rond" data-act="date" data-d="-1" aria-label="Jour précédent">‹</button>
    <div><div class="navdate-t">${auj ? 'Aujourd\'hui' : h(L.dateLongue(date))}</div>${auj ? `<div class="petit">${h(L.dateLongue(date))}</div>` : libre ? '<button class="lien" data-act="auj">Revenir à aujourd\'hui</button>' : ''}</div>
    <button class="rond" data-act="date" data-d="1" aria-label="Jour suivant">›</button></div>`;
}

// ---------- Écran Jour : la journée heure par heure ----------
function ecranJour() {
  const d = ui.date, s = seanceDu(d), p = S.profil, menus = menusDu(d);
  let html = navDate(d);
  let matin, soir;
  if (s.type === 'avant') {
    html += `<div class="carte"><h2>Le programme commence ${h(L.dateLongue(p.debut).toLowerCase())}</h2><p>D'ici là, tu peux déjà suivre les menus et marcher tranquillement.</p></div>`;
  } else {
    const sm = seanceEff(d, 'matin'), ss = seanceEff(d, 'soir');
    html += `<div class="phase">Semaine ${Math.min(s.semaine, 26)} sur 26 · Phase ${s.phase.n} : ${h(s.phase.nom)}${s.allegee ? ' · <b>semaine allégée</b>' : ''}${s.entretien ? ' · entretien' : ''}<br>${sm.minutes + (ss?.minutes || 0)} min de sport aujourd'hui</div>`;
    const m = lu(d, 'matin'), auj = d === AUJ();
    matin = carteSeance(d, 'matin', sm, s, auj && !m.fait);
    soir = ss ? carteSeance(d, 'soir', ss, s, auj && m.fait && !lu(d, 'soir').fait)
      : `<div class="carte"><h3>Repos</h3><p class="petit">Pas de séance ce soir. Quelques étirements doux si l'envie est là.</p></div>`;
  }
  const creneaux = [[L.HEURES.pdj, carteMenu(d, 'pdj', menus.pdj)], [L.HEURE_MATIN, matin], [L.HEURES.dej, carteMenu(d, 'dej', menus.dej)],
    [L.HEURES.col, carteMenu(d, 'col', menus.col)], [L.HEURE_SOIR, soir], [L.HEURES.din, carteMenu(d, 'din', menus.din)]];
  html += creneaux.filter(([, x]) => x).map(([heure, x]) => `<div class="creneau"><div class="heure">${heure}</div>${x}</div>`).join('');
  html += `<details class="carte alerte-c"><summary>Quand arrêter tout de suite</summary><ul>${SIGNES_ALERTE.map((x) => `<li>${h(x)}</li>`).join('')}</ul>
    <p><b>Arrête l'effort et assieds-toi.</b> Si ça ne passe pas en quelques minutes, ou en cas de douleur dans la poitrine : appelle le <b>15</b> (ou le 112).</p></details>`;
  html += `<details class="carte"><summary>L'échelle d'effort (6 à 20)</summary><table class="borg">
    <tr><td>9</td><td>Très facile, marche tranquille</td></tr><tr><td>11</td><td>Facile, on parle sans souci</td></tr>
    <tr><td>13</td><td>Un peu difficile, on parle encore</td></tr><tr><td>15</td><td>Difficile, parler devient dur : trop pour ce programme</td></tr>
    <tr><td>17+</td><td>Très difficile : à éviter</td></tr></table></details>`;
  return html + carteRepasResume(d);
}

function carteMenu(d, m, menu) {
  const map = carte(), mange = repasDu(d).some((e) => e.menu === m);
  return `<div class="carte menu ${mange ? 'faite' : ''}"><div class="menu-t"><div><div class="petit">${L.MOMENTS[m]}</div><h3>${h(menu.nom)}</h3></div>${mange ? '<span class="ok">Noté</span>' : ''}</div>
    <p class="petit">${menu.items.map((i) => h(nomCourt(map.get(i.a), i.g))).join(' · ')}</p>
    <p class="petit"><b>${fr(menu.totaux.kcal)} kcal · ${fr(menu.totaux.prot)} g de protéines</b></p>
    ${mange ? '' : `<div class="boutons"><button class="btn petit-btn" data-act="ajoutmenu" data-m="${m}">J'ai mangé ça</button><button class="btn sec petit-btn" data-act="autremenu" data-m="${m}">Autre idée</button></div>`}</div>`;
}

const icone = (s) => ({ force: 'H', cardio: s.machine === 'velo' ? 'V' : s.machine === 'tapis' ? 'T' : 'M', mobilite: 'E', equilibre: 'É', marche: 'M', tests: '?' }[s.type] || '');

function carteSeance(d, q, s, jr, ouvertParDefaut) {
  const j = lu(d, q), cle = `${d}|${q}`, ouvert = ui.ouvert[cle] ?? ouvertParDefaut;
  let html = `<details class="carte seance ${j.fait ? 'faite' : ''}" data-cle="${cle}" ${ouvert ? 'open' : ''}><summary class="seance-t"><span class="pastille">${icone(s)}</span>
    <div><h2>${h(s.titre)}</h2><div class="petit">${s.minutes} min · effort ${h(s.rpe)} sur 20</div></div>${j.fait ? '<span class="ok">Fait</span>' : '<span class="chevron">▾</span>'}</summary>`;
  html += `<div class="guide">${s.type !== 'force' ? `<div class="anim-carte">${animation(animSeance(s), 150)}</div>` : ''}
    <button class="btn plein grand-btn" data-act="guide" data-q="${q}">▶ Démarrer la séance guidée</button>
    <p class="petit centre">Minuteur, voix et écran qui reste allumé.</p>
    <button class="lien" data-act="court" data-q="${q}">${s.court ? 'Revenir à la séance complète' : 'Pas le temps ou fatigué ? Version 15 min'}</button></div>`;
  html += consignesCoeur(s);
  if (s.details) html += `<ol class="etapes">${s.details.map((x) => `<li>${h(x)}</li>`).join('')}</ol>`;
  if (s.type === 'force') html += blocForce(s, d, j, jr.allegee);
  if (s.type === 'tests') html += blocTests(j, q);
  if (s.mobilite) html += `<h3>Mobilité et étirements</h3><ul class="etapes">${s.mobilite.map((x) => `<li>${h(x)}</li>`).join('')}</ul>`;
  return html + finSeance(j, q, s) + '</details>';
}

function consignesCoeur(s) {
  const p = S.profil, l = [];
  if (p.fcMax) l.push(`Ne dépasse pas <b>${h(p.fcMax)} battements par minute</b> (limite fixée par ton cardiologue).`);
  if (p.betabloquant && (s.type === 'cardio' || s.type === 'tests')) l.push('Ton traitement ralentit le cœur : fie-toi à l\'effort ressenti plutôt qu\'à la montre.');
  if (s.parle) l.push(`Repère simple : ${h(s.parle)}.`);
  if (s.type === 'force' || s.type === 'equilibre') l.push('Souffle pendant l\'effort, inspire en revenant. <b>Ne bloque jamais ta respiration.</b>' + (s.type === 'force' ? ' Arrête chaque série 2 à 3 répétitions avant de ne plus pouvoir.' : ''));
  return l.length ? `<div class="coeur">${l.map((x) => `<p>${x}</p>`).join('')}</div>` : '';
}

function historiqueEx(id, avant) {
  return Object.keys(S.seances).filter((d) => d < avant && S.seances[d].matin?.ex?.[id]).sort().reverse()
    .map((d) => ({ ...S.seances[d].matin.ex[id], rpe: S.seances[d].matin.rpe, allegee: L.estAllegee(semDe(d)) }));
}

function blocForce(s, d, j, allegee) {
  let html = `<p class="petit"><b>Échauffement :</b> ${h(s.echauffement)}<br><b>Repos :</b> ${h(s.repos)}.</p>`;
  for (const e of s.exercices) {
    const ex = EXERCICES[e.id], log = j.ex?.[e.id] || {}, sets = log.sets || [];
    const cc = ex.kg ? L.conseilCharge(historiqueEx(e.id, d), allegee) : null;
    html += `<div class="exo"><details><summary><b>${h(ex.nom)}</b><span class="petit">${e.series} × ${h(e.reps)}</span></summary>
      <div class="exo-anim">${animation(e.id, 170)}</div><p class="petit centre">${h(ex.muscles)}</p>
      ${e.variante ? `<p class="variante">Pour démarrer : ${h(e.variante)}</p>` : ''}<ul>${ex.consignes.map((c) => `<li>${h(c)}</li>`).join('')}</ul></details>
      <div class="exo-l">${ex.kg ? `<label class="kg">kg <input inputmode="decimal" data-in="kg" data-q="matin" data-ex="${e.id}" value="${h(log.kg ?? cc?.propose ?? '')}" placeholder="?"></label>` : ''}
      <div class="sets">${Array.from({ length: e.series }, (_, i) => `<button class="set ${sets[i] ? 'on' : ''}" data-act="set" data-q="matin" data-ex="${e.id}" data-i="${i}" data-n="${e.series}">${i + 1}</button>`).join('')}</div></div>
      ${cc ? `<div class="petit conseil">${h(cc.txt)}</div>` : ex.kg ? '<div class="petit conseil">Choisis une charge avec laquelle tu pourrais faire encore 3 ou 4 répétitions.</div>' : ''}</div>`;
  }
  return html + `<p class="petit"><b>Retour au calme :</b> ${h(s.retour)}</p>`;
}

function blocTests(j, q) {
  const t = j.tests || {};
  return `<div class="grille2"><label>Distance en 6 min (m)<input inputmode="numeric" data-in="test" data-q="${q}" data-k="dist" value="${h(t.dist ?? '')}"></label>
    <label>Assis-debout en 30 s<input inputmode="numeric" data-in="test" data-q="${q}" data-k="chaise" value="${h(t.chaise ?? '')}"></label></div>`;
}

function finSeance(j, q, s) {
  const cardio = s.type === 'cardio' || s.type === 'marche';
  return `<div class="fin">${cardio ? `<div class="grille2"><label>Pouls moyen (si montre)<input inputmode="numeric" data-in="cardio" data-q="${q}" data-k="fc" value="${h(j.fc ?? '')}" placeholder="ex. 105"></label>
    <label>Distance (km)<input inputmode="decimal" data-in="cardio" data-q="${q}" data-k="km" value="${h(j.km ?? '')}" placeholder="ex. 2,5"></label></div>` : ''}<label>Effort ressenti sur la séance <select data-in="rpe" data-q="${q}"><option value="">choisir</option>
    ${[9, 10, 11, 12, 13, 14, 15, 16, 17].map((n) => `<option ${j.rpe == n ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
    <label>Note (optionnel)<input data-in="note" data-q="${q}" value="${h(j.note || '')}" placeholder="ex. genou un peu sensible"></label>
    <div class="boutons"><button class="btn ${j.fait ? 'sec' : ''}" data-act="fait" data-q="${q}">${j.fait ? 'Annuler « fait »' : 'Séance faite'}</button>
    <button class="btn danger" data-act="signe" data-q="${q}">J'ai ressenti un signe inquiétant</button></div>
    ${j.alerte ? `<div class="msg alerte">Signe noté. Arrête la séance. Si ça persiste ou en cas de douleur thoracique, appelle le 15. Parles-en à ton cardiologue avant la prochaine séance.</div>` : ''}</div>`;
}

function carteRepasResume(d) {
  const c = cible(), t = L.totaux(repasDu(d), carte());
  return `<div class="carte" data-act="tab" data-t="repas" role="button"><h3>Repas du jour</h3>${barre('Calories', t.kcal, c.kcal, 'kcal')}${barre('Protéines', t.prot, c.prot, 'g')}
    <div class="petit lien">Noter un repas ›</div></div>`;
}

// ---------- Écran Semaine ----------
function ecranSemaine() {
  const p = S.profil, w = ui.semaine ?? Math.max(0, semDe(AUJ())), debutSem = L.addDays(L.lundi(p.debut), w * 7);
  const ph = L.phaseDe(Math.min(w, 25)), c = cible(), map = carte();
  let html = `<div class="navdate"><button class="rond" data-act="sem" data-d="-1" ${w <= 0 ? 'disabled' : ''}>‹</button>
    <div><div class="navdate-t">Semaine ${w + 1}${w >= 26 ? ' (entretien)' : ' sur 26'}</div><div class="petit">du ${h(L.dateCourte(debutSem))} au ${h(L.dateCourte(L.addDays(debutSem, 6)))}</div></div>
    <button class="rond" data-act="sem" data-d="1">›</button></div>
    <div class="carte phase-c"><b>Phase ${ph.n} : ${h(ph.nom)}</b>${L.estAllegee(w) ? ' · semaine allégée (récupération)' : ''}<p>${h(ph.but)}</p></div>
    <div class="carte jours"><div class="petit entete-j"><span></span><span>${L.HEURE_MATIN}</span><span>${L.HEURE_SOIR}</span></div>`;
  let prevues = 0, faites = 0, minutes = 0, menusHtml = '';
  const jours = [];
  for (let j = 0; j < 7; j++) {
    const d = L.addDays(debutSem, j), s = L.seance(w, j, p), rep = repasDu(d);
    jours.push({ date: d, entrees: rep });
    const ligne = (q) => {
      const x = s[q];
      if (!x) return '<span class="jour-s repos">Repos</span>';
      prevues++;
      const fait = lu(d, q).fait;
      if (fait) { faites++; minutes += x.minutes; }
      const etat = fait ? 'fait' : d < AUJ() ? 'manque' : '';
      return `<span class="jour-s ${etat}"><b>${h(x.titre)}</b><small>${x.minutes} min${fait ? ' · fait' : ''}</small></span>`;
    };
    html += `<button class="jour ${d === AUJ() ? 'auj' : ''}" data-act="voirjour" data-d="${d}"><span class="jour-n">${L.JOURS[j].slice(0, 3)}<br><small>${L.parse(d).getDate()}</small></span>${ligne('matin')}${ligne('soir')}</button>`;
    const m = menusDu(d);
    menusHtml += `<div class="menu-j"><b>${L.JOURS[j].slice(0, 3)}.</b><span>${h(m.dej.nom)}</span><span>${h(m.din.nom)}</span></div>`;
  }
  html += `</div><div class="carte"><h3>Bilan de la semaine</h3><p>Séances faites : <b>${faites} sur ${prevues}</b> (${minutes} min)</p>`;
  const b = L.bilanSemaine(jours, c, map);
  html += b.joursRenseignes ? `<p class="petit">${b.joursRenseignes} jours de repas notés · moyenne ${fr(b.kcalMoy)} kcal et ${fr(b.protMoy)} g de protéines</p>${msgsHtml(b.msgs)}`
    : '<p class="petit">Aucun repas noté cette semaine.</p>';
  html += `</div><div class="carte"><h3>Menus de la semaine</h3><div class="petit entete-m"><span></span><span>Déjeuner</span><span>Dîner</span></div>${menusHtml}
    <p class="petit">Le détail et les quantités sont dans l'onglet Jour. « Autre idée » propose un autre menu.</p></div>`;
  html += `<div class="carte"><h3>Les 6 mois</h3>${L.PHASES.map((x) => `<div class="phase-l ${x.n === ph.n ? 'cur' : ''}"><b>Semaines ${x.de + 1} à ${x.a + 1} · ${h(x.nom)}</b><p class="petit">${h(x.but)}</p></div>`).join('')}
    <p class="petit">Chaque jour : 30 min vers ${L.HEURE_MATIN} (musculation, équilibre ou mobilité) et 20 à 60 min de cardio vers ${L.HEURE_SOIR}. Dimanche : promenade seulement. Une semaine sur quatre est allégée. Tests de forme en semaines 1, 13 et 26.</p></div>`;
  return html;
}

// ---------- Écran Repas ----------
function ecranRepas() {
  const d = ui.date, c = cible(), map = carte(), ent = repasDu(d);
  const r = L.conseilsJour(ent, c, map), t = L.totaux(ent, map);
  let html = navDate(d) + `<div class="carte">${barre('Calories', t.kcal, c.kcal, 'kcal')}${barre('Protéines', t.prot, c.prot, 'g')}
    ${barre('Fibres', t.fib, c.fib, 'g')}${barre('Sel', t.sel, c.sel, 'g', true)}${barre('Graisses saturées', t.ags, c.ags, 'g', true)}</div>`;
  html += `<div class="carte"><h3>Conseils</h3>${msgsHtml(r.msgs)}`;
  const ajout = r.msgs.find((m) => m.ajout?.length);
  if (ajout) html += `<div class="chips">${ajout.ajout.map((id) => `<button class="chip" data-act="ajoutrapide" data-id="${id}">+ ${h(map.get(id).nom)}</button>`).join('')}</div>`;
  if (r.swaps.length) {
    html += `<h3>Pour faire mieux</h3>` + r.swaps.map((s) => `<div class="swap"><div><b>${h(s.de)}</b> → <b>${h(s.vers)}</b><div class="petit">${h(s.raison)}${s.gain.kcal > 5 ? ` · ${fr(s.gain.kcal)} kcal de moins` : ''}</div></div>
      <button class="btn petit-btn" data-act="swap" data-i="${s.index}" data-v="${s.versId}">Remplacer</button></div>`).join('');
  }
  html += '</div>';
  const menus = menusDu(d);
  for (const [m, nom] of Object.entries(L.MOMENTS)) {
    const items = ent.map((e, i) => ({ e, i })).filter((x) => x.e.m === m);
    const k = L.totaux(items.map((x) => x.e), map).kcal;
    html += `<div class="carte moment"><div class="moment-t"><h3>${nom} <span class="petit">${L.HEURES[m]}</span></h3><span class="petit">${items.length ? fr(k) + ' kcal' : ''}</span></div>`;
    if (!items.length) html += `<div class="propose"><div class="petit">Menu proposé : <b>${h(menus[m].nom)}</b> (${fr(menus[m].totaux.kcal)} kcal)</div>
      <button class="btn petit-btn" data-act="ajoutmenu" data-m="${m}">Ajouter ce menu</button></div>`;
    for (const { e, i } of items) {
      const v = L.valeurs(e, map), a = map.get(e.a);
      html += `<div class="ligne"><div><b>${h(e.libre ? e.libre.nom : a?.nom || 'Aliment supprimé')}</b><div class="petit">${e.libre ? 'saisie libre' : fr(e.g) + ' g'} · ${fr(v.kcal)} kcal · ${fr(v.prot)} g prot.</div></div>
        <button class="rond petit-btn" data-act="supprentree" data-i="${i}" aria-label="Supprimer">✕</button></div>`;
    }
    html += `<button class="btn sec plein" data-act="ajouter" data-m="${m}">+ Ajouter</button></div>`;
  }
  html += `<div class="boutons"><button class="btn sec" data-act="copierhier">Copier les repas de la veille</button></div>`;
  return html;
}

function feuilleAjout() {
  const a = ui.ajout;
  if (!a) return '';
  const map = carte();
  let corps;
  if (a.choix) {
    const al = map.get(a.choix), g = a.g ?? al.portion, v = L.valeurs({ a: al.id, g }, map);
    corps = `<h2>${h(al.nom)}</h2><p class="petit">Portion type : ${h(al.portionNom)} (${fr(al.portion)} g)</p>
      <div class="chips">${[0.5, 1, 1.5, 2, 3].map((f) => `<button class="chip ${Math.abs(g - al.portion * f) < 0.5 ? 'on' : ''}" data-act="portion" data-g="${Math.round(al.portion * f)}">${f === 0.5 ? '½' : f === 1.5 ? '1½' : f}</button>`).join('')}</div>
      <label>Quantité en grammes<input inputmode="decimal" data-in="grammes" value="${fr(g)}"></label>
      <p id="apercu">${fr(v.kcal)} kcal · ${fr(v.prot)} g protéines · ${fr(v.sel, 1)} g sel</p>
      <div class="boutons"><button class="btn" data-act="valideajout">Ajouter</button><button class="btn sec" data-act="retour">Retour</button></div>`;
  } else if (a.mode === 'libre') {
    corps = `<h2>Saisie libre</h2><p class="petit">Pour un restaurant ou un plat inconnu : une estimation suffit.</p>
      <label>Nom<input id="l-nom" placeholder="ex. menu du midi"></label><div class="grille2"><label>Calories<input id="l-kcal" inputmode="numeric"></label><label>Protéines (g)<input id="l-prot" inputmode="numeric"></label></div>
      <div class="boutons"><button class="btn" data-act="validelibre">Ajouter</button><button class="btn sec" data-act="retour">Retour</button></div>`;
  } else if (a.mode === 'perso') {
    corps = `<h2>Nouvel aliment</h2><p class="petit">Recopie l'étiquette (valeurs pour 100 g).</p><label>Nom<input id="p-nom"></label>
      <div class="grille2">${[['kcal', 'Calories'], ['prot', 'Protéines'], ['gluc', 'Glucides'], ['lip', 'Lipides'], ['ags', 'dont saturés'], ['fib', 'Fibres'], ['sel', 'Sel'], ['portion', 'Portion habituelle (g)']]
        .map(([k, n]) => `<label>${n}<input id="p-${k}" inputmode="decimal"></label>`).join('')}</div>
      <div class="boutons"><button class="btn" data-act="valideperso">Enregistrer</button><button class="btn sec" data-act="retour">Retour</button></div>`;
  } else {
    corps = `<h2>${L.MOMENTS[a.moment]}</h2><input id="recherche" type="search" placeholder="Chercher un aliment" value="${h(a.q || '')}" autocomplete="off">
      <div id="resultats">${resultats(a.q || '')}</div>
      <div class="boutons"><button class="btn sec" data-act="mode" data-v="libre">Saisie libre</button><button class="btn sec" data-act="mode" data-v="perso">Créer un aliment</button></div>`;
  }
  return `<div class="voile" data-act="fermer"></div><div class="feuille"><button class="fermer rond" data-act="fermer" aria-label="Fermer">✕</button>${corps}</div>`;
}

function resultats(q) {
  const map = carte(), tous = [...map.values()];
  let liste;
  if (!q.trim()) liste = S.recents.map((id) => map.get(id)).filter(Boolean);
  else {
    const mots = norm(q).split(/\s+/).filter(Boolean);
    liste = tous.filter((a) => { const n = norm(a.nom + ' ' + (CATEGORIES[a.cat] || '')); return mots.every((m) => n.includes(m)); });
  }
  if (!liste.length) return q.trim() ? '<p class="petit">Rien trouvé. Utilise « Créer un aliment » ou « Saisie libre ».</p>' : '<p class="petit">Tape le début d\'un nom : pain, poulet, yaourt...</p>';
  return (q.trim() ? '' : '<p class="petit">Récents</p>') + liste.slice(0, 30).map((a) => `<button class="res" data-act="choisir" data-id="${a.id}"><span>${h(a.nom)}<small>${h(CATEGORIES[a.cat] || '')}</small></span><small>${fr(a.kcal)} kcal/100 g</small></button>`).join('');
}

function ajouterEntree(e) {
  (S.repas[ui.date] ||= []).push(e);
  if (e.a) S.recents = [e.a, ...S.recents.filter((x) => x !== e.a)].slice(0, 15);
  sauver();
}

// ---------- Écran Suivi ----------
function ecranSuivi() {
  const p = S.profil, pes = [...S.pesees].sort((a, b) => a.date.localeCompare(b.date)), act = poidsActuel();
  let html = carteActivite(act) + `<div class="carte"><h2>Poids</h2><div class="stats"><div><b>${fr(act, 1)}</b><small>kg actuel</small></div>
    <div><b>${fr(p.poids - act, 1)}</b><small>kg perdus</small></div><div><b>${fr(Math.max(0, act - p.objectif), 1)}</b><small>kg restants</small></div></div>
    ${graphique(pes)}<p class="petit">Une pesée par semaine suffit : le lundi matin, à jeun, après être passé aux toilettes. Avec la musculation, le tour de taille compte autant que la balance.</p>
    <div class="grille3"><label>Date<input type="date" id="pe-date" value="${AUJ()}"></label><label>Poids (kg)<input id="pe-kg" inputmode="decimal"></label><label>Tour de taille (cm)<input id="pe-tt" inputmode="decimal"></label></div>
    <button class="btn plein" data-act="pesee">Enregistrer la pesée</button>
    ${pes.length ? `<table class="tab"><tr><th>Date</th><th>Poids</th><th>Taille</th><th></th></tr>${pes.slice().reverse().map((x) => `<tr><td>${h(L.dateCourte(x.date))}</td><td>${fr(x.kg, 1)} kg</td><td>${x.tt ? fr(x.tt) + ' cm' : ''}</td><td><button class="lien" data-act="supprpesee" data-d="${h(x.date)}">suppr.</button></td></tr>`).join('')}</table>` : ''}</div>`;
  let faites = 0, prevues = 0;
  for (const j of Object.values(S.seances)) faites += !!j.matin?.fait + !!j.soir?.fait;
  for (let d = L.lundi(p.debut); d <= AUJ() && semDe(d) < 26; d = L.addDays(d, 1)) { const s = seanceDu(d); if (s.type === 'jour') prevues += 1 + !!s.soir; }
  html += `<div class="carte"><h2>Entraînement</h2><div class="stats"><div><b>${faites}</b><small>séances faites</small></div><div><b>${prevues}</b><small>prévues à ce jour</small></div>
    <div><b>${prevues ? Math.round((Math.min(faites, prevues) / prevues) * 100) : 0} %</b><small>régularité</small></div></div>`;
  const tests = Object.keys(S.seances).filter((d) => { const t = S.seances[d].matin?.tests; return t && (t.dist || t.chaise); }).sort();
  html += tests.length ? `<h3>Tests de forme</h3><table class="tab"><tr><th>Date</th><th>Marche 6 min</th><th>Assis-debout</th></tr>${tests.map((d) => { const t = S.seances[d].matin.tests; return `<tr><td>${h(L.dateCourte(d))}</td><td>${t.dist ? h(t.dist) + ' m' : ''}</td><td>${h(t.chaise ?? '')}</td></tr>`; }).join('')}</table>`
    : '<p class="petit">Les tests des semaines 1, 13 et 26 s\'afficheront ici pour voir les progrès.</p>';
  const charges = Object.keys(EXERCICES).filter((id) => EXERCICES[id].kg).map((id) => { const hst = historiqueEx(id, '9999'); return hst.length ? [id, hst.at(-1).kg, hst[0].kg] : null; }).filter(Boolean);
  if (charges.length) html += `<h3>Charges</h3><table class="tab"><tr><th>Exercice</th><th>Début</th><th>Actuel</th></tr>${charges.map(([id, a, b]) => `<tr><td>${h(EXERCICES[id].nom)}</td><td>${fr(a, 1)} kg</td><td>${fr(b, 1)} kg</td></tr>`).join('')}</table>`;
  return html + '</div>';
}

function graphique(pes) {
  const p = S.profil, W = 320, H = 150, m = 28;
  const debut = L.lundi(p.debut), fin = L.addDays(debut, 26 * 7);
  const pts = pes.map((x) => ({ x: L.diffDays(debut, x.date), y: x.kg }));
  const ys = [p.poids, p.objectif, ...pts.map((q) => q.y)];
  const ymin = Math.floor(Math.min(...ys) - 1), ymax = Math.ceil(Math.max(...ys) + 1);
  const xmin = Math.min(0, ...pts.map((q) => q.x)), xmax = Math.max(182, ...pts.map((q) => q.x));
  const X = (v) => m + ((v - xmin) / (xmax - xmin)) * (W - m - 8), Y = (v) => 8 + ((ymax - v) / (ymax - ymin)) * (H - m);
  const graduations = [ymin, Math.round((ymin + ymax) / 2), ymax];
  return `<svg class="graph" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe de poids">
    ${graduations.map((g) => `<line x1="${m}" x2="${W - 8}" y1="${Y(g)}" y2="${Y(g)}" class="grille"/><text x="${m - 4}" y="${Y(g) + 4}" text-anchor="end">${g}</text>`).join('')}
    <line x1="${X(0)}" y1="${Y(p.poids)}" x2="${X(182)}" y2="${Y(p.objectif)}" class="vise"/>
    ${pts.length > 1 ? `<polyline points="${pts.map((q) => `${X(q.x)},${Y(q.y)}`).join(' ')}" class="reel"/>` : ''}
    ${pts.map((q) => `<circle cx="${X(q.x)}" cy="${Y(q.y)}" r="3.5" class="pt"/>`).join('')}
    <text x="${m}" y="${H - 6}">${h(L.dateCourte(debut))}</text><text x="${W - 8}" y="${H - 6}" text-anchor="end">${h(L.dateCourte(fin))}</text></svg>
    <div class="legende petit"><span class="l-vise"></span>trajectoire visée <span class="l-reel"></span>tes pesées</div>`;
}

// ---------- Activité ----------
function carteActivite(poids) {
  const p = S.profil, faites = seancesFaites(), a = L.activite(faites, AUJ(), 8);
  let prevueSem = 0;
  for (let j = 0, d0 = L.lundi(AUJ()); j < 7; j++) { const d = L.addDays(d0, j), s = seanceDu(d); if (s.type === 'jour') prevueSem += s.minutes; }
  const W = 320, H = 120, max = Math.max(60, prevueSem, ...a.semaines.map((x) => x.minutes)), bw = (W - 20) / a.semaines.length;
  const barres = a.semaines.map((x, i) => {
    const bh = (x.minutes / max) * (H - 28), cur = i === a.semaines.length - 1;
    return `<rect class="${cur ? 'cur' : ''}" x="${10 + i * bw + 4}" y="${H - 16 - bh}" width="${bw - 8}" height="${Math.max(bh, 1)}" rx="3"/>
      <text x="${10 + i * bw + bw / 2}" y="${H - 3}" text-anchor="middle">${L.parse(x.lundi).getDate()}/${L.parse(x.lundi).getMonth() + 1}</text>
      ${x.minutes ? `<text x="${10 + i * bw + bw / 2}" y="${H - 20 - bh}" text-anchor="middle" class="val">${x.minutes}</text>` : ''}`;
  }).join('');
  const b = L.badges({ seances: a.seances, record: a.record, minutes: a.minutes, kgPerdus: p.poids - poids, tests: Object.values(S.seances).filter((j) => j.matin?.tests?.dist).length });
  return `<div class="carte"><h2>Activité</h2>
    <div class="stats"><div><b>${a.serie}</b><small>jour${a.serie > 1 ? 's' : ''} de suite</small></div><div><b>${fr(a.minutes / 60, 1)}</b><small>heures au total</small></div><div><b>${a.seances}</b><small>séances</small></div></div>
    <p class="petit">Cette semaine : <b>${a.semaines.at(-1).minutes} min</b> sur ${prevueSem} prévues. Record : ${a.record} jour${a.record > 1 ? 's' : ''} de suite.</p>
    <svg class="graph barres" viewBox="0 0 ${W} ${H}" role="img" aria-label="Minutes de sport par semaine">${barres}</svg>
    <p class="petit centre">Minutes de sport par semaine (8 dernières)</p>
    <h3>Badges</h3><div class="badges">${b.map((x) => `<div class="badge ${x.ok ? 'ok' : ''}"><span>${x.ok ? '★' : '☆'}</span><b>${h(x.nom)}</b><small>${h(x.desc)}</small></div>`).join('')}</div></div>`;
}

// ---------- Bibliothèque d'exercices ----------
const GROUPES = [
  ['Musculation avec haltères', ['squat', 'rowing', 'floorpress', 'rdl', 'fente', 'epaules', 'curl', 'triceps']],
  ['Au sol, sur le tapis', ['pont', 'deadbug', 'birddog']],
  ['Équilibre', ['equilibre', 'talonpointe', 'mollets']],
];
function ecranExercices() {
  let html = '<h2 class="titre-ecran">Exercices</h2><p class="petit">Touche un exercice pour voir le mouvement et les consignes.</p>';
  for (const [nom, ids] of GROUPES) {
    html += `<h3>${nom}</h3><div class="biblio">${ids.map((id) => `<button class="vignette" data-act="fiche" data-id="${id}">${animation(id, 120)}<b>${h(EXERCICES[id].nom)}</b><small>${h(EXERCICES[id].muscles)}</small></button>`).join('')}</div>`;
  }
  html += `<h3>Cardio</h3><div class="biblio">
    <div class="vignette">${animation('tapis', 120)}<b>Tapis de course</b><small>Marche rapide, pente progressive. Effort 11 à 14.</small></div>
    <div class="vignette">${animation('velo', 120)}<b>Vélo</b><small>60 à 80 tours par minute, résistance légère à modérée.</small></div></div>`;
  return html;
}
function feuilleFiche() {
  const ex = EXERCICES[ui.fiche];
  if (!ex) return '';
  return `<div class="voile" data-act="fermer"></div><div class="feuille"><button class="fermer rond" data-act="fermer" aria-label="Fermer">✕</button>
    <h2>${h(ex.nom)}</h2><div class="fiche-anim">${animation(ui.fiche, 260)}</div>
    <p><b>Muscles :</b> ${h(ex.muscles)}<br><b>Matériel :</b> ${h(ex.materiel)}</p>
    <h3>Comment faire</h3><ol class="etapes">${ex.consignes.map((c) => `<li>${h(c)}</li>`).join('')}</ol>
    <div class="coeur"><p>Souffle pendant l'effort, inspire en revenant. Ne bloque jamais ta respiration.</p></div>
    ${ex.facile ? `<p><b>Plus facile :</b> ${h(ex.facile)}</p>` : ''}${ex.plusDur ? `<p><b>Plus difficile (plus tard) :</b> ${h(ex.plusDur)}</p>` : ''}</div>`;
}

function telecharger(contenu, nom, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([contenu], { type }));
  a.download = nom; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- Écran Réglages ----------
function ecranReglages() {
  const p = S.profil, c = cible();
  const champ = (k, label, attrs = 'inputmode="decimal"') => `<label>${label}<input data-in="profil" data-k="${k}" ${attrs} value="${h(p[k] ?? '')}"></label>`;
  const coche = (k, label) => `<label class="coche"><input type="checkbox" data-in="profil" data-k="${k}" ${p[k] ? 'checked' : ''}><span>${label}</span></label>`;
  return `${!p.ok ? `<div class="carte accueil"><h2>Bienvenue</h2><p>Programme de 6 mois : haltères, tapis de course et vélo, plus un journal des repas qui conseille au fil de la journée.</p>
      <p>Si le cardiologue a donné une fréquence cardiaque à ne pas dépasser, indique-la dans la partie Cœur.</p>
      <p>Remplis ces quelques réglages, puis appuie sur « C'est parti ».</p></div>` : ''}
    <div class="carte"><h2>Profil</h2><div class="grille2">${champ('prenom', 'Prénom', '')}${champ('age', 'Âge', 'inputmode="numeric"')}${champ('taille', 'Taille (cm)', 'inputmode="numeric"')}
      ${champ('poids', 'Poids au départ (kg)')}${champ('objectif', 'Poids visé (kg)')}<label>Début du programme<input type="date" data-in="profil" data-k="debut" value="${h(p.debut)}"></label></div>
      ${!p.taille ? '<p class="msg info">Indique la taille pour des calories justes (1,75 m utilisé en attendant).</p>' : ''}</div>
    <div class="carte"><h2>Cœur</h2>
      ${coche('betabloquant', 'Je prends un traitement qui ralentit le cœur (bêta-bloquant...)')}
      ${champ('fcMax', 'Fréquence cardiaque à ne pas dépasser (donnée par le cardiologue)', 'inputmode="numeric" placeholder="ex. 120"')}
      ${coche('intervalles', 'Le cardiologue autorise un fractionné doux sur le vélo (à partir du 4e mois)')}
      ${champ('sel', 'Sel maximum par jour (g)')}</div>
    <div class="carte"><h2>Objectifs du jour</h2><p>${c.kcal} kcal · ${c.prot} g de protéines · ${c.fib} g de fibres · ${c.sel} g de sel max · ${c.ags} g de graisses saturées max</p>
      <p class="petit">Calcul : dépense estimée ${c.tdee} kcal moins 400, pour perdre environ 0,3 kg par semaine sans perdre de muscle. Les protéines (1,4 g par kg) sont à valider avec le médecin en cas de souci aux reins.</p>
      ${champ('kcalPerso', 'Calories imposées par un médecin ou diététicien (sinon laisser vide)', 'inputmode="numeric"')}</div>
    ${!p.ok ? '<button class="btn plein" data-act="go">C\'est parti</button>' : ''}
    <div class="carte"><h2>Rappels</h2><p class="petit">Ajoute à l'agenda du téléphone un rappel chaque jour à 11 h et à 17 h, pendant les 6 mois du programme (10 minutes avant).</p>
      <button class="btn sec" data-act="ics">Ajouter les rappels à mon agenda</button></div>
    <div class="carte"><h2>Sauvegarde</h2><p class="petit">Les données restent dans ce téléphone. Fais une sauvegarde de temps en temps, ou pour changer de téléphone.</p>
      <div class="boutons"><button class="btn sec" data-act="export">Sauvegarder (fichier)</button><label class="btn sec">Restaurer<input type="file" accept=".json,application/json" id="import" hidden></label></div>
      <button class="lien danger" data-act="raz">Tout effacer</button></div>
    <p class="petit pied">Ce programme ne remplace pas un avis médical. Valeurs nutritionnelles moyennes, à titre indicatif.</p>`;
}

// ---------- Rendu ----------
const ECRANS = { jour: ecranJour, semaine: ecranSemaine, exercices: ecranExercices, repas: ecranRepas, suivi: ecranSuivi, reglages: ecranReglages };
function rendu() {
  if (!S.profil.ok) ui.tab = 'reglages';
  $('#main').innerHTML = ECRANS[ui.tab]();
  $('#feuille').innerHTML = ui.fiche ? feuilleFiche() : feuilleAjout();
  document.querySelectorAll('nav button, #reglages').forEach((b) => b.classList.toggle('on', b.dataset.t === ui.tab));
  $('#reglages').hidden = !S.profil.ok;
  $('nav').hidden = !S.profil.ok;
  $('#titre').textContent = S.profil.prenom ? `Forme de ${S.profil.prenom}` : 'Ma forme';
  const r = $('#recherche');
  if (r && !rendu.focusFait) { r.focus(); rendu.focusFait = true; }
}

// ---------- Actions ----------
const ACT = {
  tab: (d) => { ui.tab = d.t; if (d.t === 'semaine') ui.semaine = null; window.scrollTo(0, 0); },
  date: (d) => { ui.date = L.addDays(ui.date, +d.d); },
  auj: () => { ui.date = AUJ(); },
  sem: (d) => { ui.semaine = Math.max(0, (ui.semaine ?? Math.max(0, semDe(AUJ()))) + +d.d); },
  voirjour: (d) => { ui.date = d.d; ui.tab = 'jour'; window.scrollTo(0, 0); },
  set: (d, t) => {
    const j = journal(ui.date, d.q), e = (j.ex[d.ex] ||= {}); e.sets ||= [];
    e.sets[+d.i] = !e.sets[+d.i]; e.sets.length = +d.n;
    e.sets = Array.from(e.sets, Boolean);
    if (e.kg == null) { const inp = document.querySelector(`input[data-ex="${d.ex}"]`); if (inp && num(inp.value)) e.kg = num(inp.value); }
    sauver();
    t.classList.toggle('on', e.sets[+d.i]);
    return false; // pas de rendu complet : garde les consignes ouvertes
  },
  fait: (d) => {
    const j = journal(ui.date, d.q); j.fait = !j.fait; sauver();
    if (j.fait) { toast('Bravo, séance enregistrée'); ui.ouvert[`${ui.date}|${d.q}`] = false; }
  },
  signe: (d) => { const j = journal(ui.date, d.q); j.alerte = true; ui.ouvert[`${ui.date}|${d.q}`] = true; sauver(); },
  guide: (d) => {
    const date = ui.date, q = d.q, s = seanceEff(date, q);
    lancerGuide({
      titre: s.titre, etapes: L.etapesSeance(s),
      kg: (ex) => (EXERCICES[ex].kg ? lu(date, q).ex?.[ex]?.kg ?? L.conseilCharge(historiqueEx(ex, date), seanceDu(date).allegee)?.propose ?? null : null),
      onSerie: (ex, i, kg) => {
        const e = (journal(date, q).ex[ex] ||= {}); e.sets ||= []; e.sets[i] = true; e.sets = Array.from(e.sets, Boolean);
        if (kg != null) e.kg = kg;
        sauver();
      },
      onFin: ({ minutes, rpe }) => {
        Object.assign(journal(date, q), { fait: true, duree: minutes, rpe });
        ui.ouvert[`${date}|${q}`] = false; sauver(); rendu(); toast('Bravo, séance enregistrée');
      },
      onAlerte: () => { journal(date, q).alerte = true; sauver(); },
    });
    return false;
  },
  court: (d) => { const j = journal(ui.date, d.q); j.court = !j.court; sauver(); },
  ics: () => telecharger(L.rappelsIcs(S.profil.debut), 'rappels-sport.ics', 'text/calendar'),
  ajoutmenu: (d) => {
    const menu = menusDu(ui.date)[d.m];
    (S.repas[ui.date] ||= []).push(...menu.items.map((i) => ({ a: i.a, g: i.g, m: d.m, menu: d.m })));
    sauver(); toast(`${L.MOMENTS[d.m]} noté`);
  },
  autremenu: (d) => { const c = (S.menuChoix[ui.date] ||= {}); c[d.m] = (c[d.m] || 0) + 1; sauver(); },
  ajouter: (d) => { ui.ajout = { moment: d.m, q: '' }; rendu.focusFait = false; },
  fermer: () => { ui.ajout = null; ui.fiche = null; },
  fiche: (d) => { ui.fiche = d.id; },
  retour: () => { ui.ajout = { moment: ui.ajout.moment, q: ui.ajout.q }; rendu.focusFait = false; },
  mode: (d) => { ui.ajout.mode = d.v; },
  choisir: (d) => { ui.ajout.choix = d.id; ui.ajout.g = null; },
  portion: (d) => { ui.ajout.g = +d.g; },
  valideajout: () => { const a = ui.ajout, al = carte().get(a.choix); ajouterEntree({ a: al.id, g: a.g ?? al.portion, m: a.moment }); ui.ajout = null; toast('Ajouté'); },
  ajoutrapide: (d) => { const al = carte().get(d.id); ajouterEntree({ a: al.id, g: al.portion, m: 'col' }); toast(`${al.nom} ajouté en collation`); },
  validelibre: () => {
    const nom = $('#l-nom').value.trim() || 'Repas', kcal = num($('#l-kcal').value);
    if (kcal == null) return toast('Indique au moins les calories');
    ajouterEntree({ libre: { nom, kcal, prot: num($('#l-prot').value) || 0 }, m: ui.ajout.moment }); ui.ajout = null;
  },
  valideperso: () => {
    const nom = $('#p-nom').value.trim(), v = (k) => num($('#p-' + k).value) || 0;
    if (!nom || !v('kcal')) return toast('Indique au moins le nom et les calories');
    const al = { id: 'p' + Date.now().toString(36), nom, kcal: v('kcal'), prot: v('prot'), gluc: v('gluc'), lip: v('lip'), ags: v('ags'), fib: v('fib'), sel: v('sel'), portion: v('portion') || 100, portionNom: 'portion' };
    S.perso.push(al); sauver(); ui.ajout = { moment: ui.ajout.moment, choix: al.id };
  },
  supprentree: (d) => { repasDu(ui.date).splice(+d.i, 1); sauver(); },
  swap: (d) => { const e = repasDu(ui.date)[+d.i]; if (e) { e.a = d.v; sauver(); toast('Remplacé'); } },
  copierhier: () => {
    const hier = repasDu(L.addDays(ui.date, -1));
    if (!hier.length) return toast('Rien de noté la veille');
    (S.repas[ui.date] ||= []).push(...structuredClone(hier)); sauver(); toast(`${hier.length} aliments copiés`);
  },
  pesee: () => {
    const date = $('#pe-date').value || AUJ(), kg = num($('#pe-kg').value), tt = num($('#pe-tt').value);
    if (!kg || kg < 30 || kg > 250) return toast('Poids non valide');
    S.pesees = S.pesees.filter((x) => x.date !== date).concat({ date, kg, tt }); sauver(); toast('Pesée enregistrée');
  },
  supprpesee: (d) => { S.pesees = S.pesees.filter((x) => x.date !== d.d); sauver(); },
  go: () => { S.profil.ok = true; sauver(); ui.tab = 'jour'; ui.date = AUJ(); },
  export: () => telecharger(JSON.stringify(S, null, 1), `ma-forme-${AUJ()}.json`, 'application/json'),
  raz: () => { if (confirm('Effacer toutes les données de ce téléphone ?') && confirm('Vraiment tout effacer ? Ce n\'est pas réversible.')) { S = structuredClone(DEFAUT); S.profil.debut = prochainLundi(); sauver(); } },
};

document.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-act]');
  if (!t || !ACT[t.dataset.act]) return;
  if (ACT[t.dataset.act](t.dataset, t) !== false) rendu();
});

document.addEventListener('input', (ev) => {
  const t = ev.target;
  if (t.id === 'recherche') { ui.ajout.q = t.value; $('#resultats').innerHTML = resultats(t.value); return; }
  if (t.dataset.in === 'grammes') {
    const g = num(t.value); if (g == null) return; ui.ajout.g = g;
    const v = L.valeurs({ a: ui.ajout.choix, g }, carte());
    $('#apercu').textContent = `${fr(v.kcal)} kcal · ${fr(v.prot)} g protéines · ${fr(v.sel, 1)} g sel`;
    document.querySelectorAll('.feuille .chip').forEach((c) => c.classList.toggle('on', Math.abs(+c.dataset.g - g) < 0.5));
  }
});

document.addEventListener('change', (ev) => {
  const t = ev.target, k = t.dataset.k;
  if (t.id === 'import') return importer(t.files[0]);
  switch (t.dataset.in) {
    case 'kg': { const e = (journal(ui.date, t.dataset.q).ex[t.dataset.ex] ||= {}); e.kg = num(t.value); break; }
    case 'rpe': journal(ui.date, t.dataset.q).rpe = num(t.value); break;
    case 'note': journal(ui.date, t.dataset.q).note = t.value.slice(0, 200); break;
    case 'test': (journal(ui.date, t.dataset.q).tests ||= {})[k] = num(t.value); break;
    case 'cardio': journal(ui.date, t.dataset.q)[k] = num(t.value); break;
    case 'profil':
      if (t.type === 'checkbox') S.profil[k] = t.checked;
      else if (t.type === 'date') { if (t.value) S.profil.debut = L.lundi(t.value); }
      else if (k === 'prenom') S.profil.prenom = t.value.trim();
      else S.profil[k] = num(t.value);
      break;
    default: return;
  }
  sauver();
  if (t.dataset.in === 'profil' || t.dataset.in === 'rpe') rendu();
});

// Mémorise les séances ouvertes ou fermées pour que le rendu les garde ainsi.
document.addEventListener('toggle', (ev) => { const c = ev.target.dataset?.cle; if (c) ui.ouvert[c] = ev.target.open; }, true);

async function importer(f) {
  if (!f) return;
  try {
    const d = JSON.parse(await f.text());
    if (!d.profil) throw new Error();
    if (!confirm('Remplacer les données de ce téléphone par celles du fichier ?')) return;
    S = nettoyer(d); sauver(); toast('Données restaurées'); rendu();
  } catch { toast('Fichier non reconnu'); }
}

// Revenir sur aujourd'hui si l'appli reste ouverte d'un jour à l'autre.
let dernierJour = AUJ();
document.addEventListener('visibilitychange', () => { if (!document.hidden && AUJ() !== dernierJour) { dernierJour = AUJ(); ui.date = dernierJour; rendu(); } });

document.addEventListener('lecteur-ferme', () => rendu());

rendu();
if ('serviceWorker' in navigator && location.protocol === 'https:') {
  // Nouvelle version publiée : recharger une fois pour l'afficher tout de suite.
  const avait = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (avait && !ui.ajout) location.reload(); });
  navigator.serviceWorker.register('sw.js');
}
