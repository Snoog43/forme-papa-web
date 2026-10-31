// Logique pure (sans interface) : dates, programme de 26 semaines, objectifs et conseils alimentaires.
import { MENUS, PARTS } from './menus.js';
import { ALIMENTS, SWAPS, IDEES_PROTEINES, IDEES_FIBRES, EXERCICES, SEANCE_A, SEANCE_B, MOBILITE } from './data.js';

// ---------- Dates (chaînes AAAA-MM-JJ, heure locale) ----------
export const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
export const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
export const dow = (s) => (parse(s).getDay() + 6) % 7; // 0 = lundi
export const lundi = (s) => addDays(s, -dow(s));
export const diffDays = (a, b) => {
  const [y1, m1, d1] = a.split('-').map(Number), [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
};
export const semaineIndex = (debut, date) => Math.floor(diffDays(lundi(debut), date) / 7);
export const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
export const dateLongue = (s) => { const d = parse(s); return `${JOURS[dow(s)]} ${d.getDate()} ${MOIS[d.getMonth()]}`; };
const MOIS_C = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
export const dateCourte = (s) => { const d = parse(s); return `${d.getDate()} ${MOIS_C[d.getMonth()]}`; };

// ---------- Programme ----------
// Chaque jour : une séance vers 11 h (30 min) et une vers 17 h (30 à 60 min).
export const NB_SEMAINES = 26;
export const HEURE_MATIN = '11 h', HEURE_SOIR = '17 h';
export const PHASES = [
  { n: 1, nom: 'Reprise', de: 0, a: 3, but: 'Habituer le cœur et les muscles en douceur. Charges très légères, apprendre les mouvements.' },
  { n: 2, nom: 'Construction', de: 4, a: 11, but: 'Trois séances de force par semaine, plus de séries. Le cardio de 17 h s\'allonge.' },
  { n: 3, nom: 'Renforcement', de: 12, a: 19, but: 'Charges un peu plus lourdes, cardio plus long, pente sur le tapis.' },
  { n: 4, nom: 'Consolidation', de: 20, a: 25, but: 'Garder le niveau atteint et installer l\'habitude pour la suite.' },
];
// Durée de la séance de 17 h (échauffement et retour au calme compris), semaine par semaine.
const SOIR_MIN = [20, 25, 25, 20, 30, 30, 35, 25, 35, 40, 40, 30, 40, 45, 45, 35, 45, 50, 50, 35, 50, 50, 55, 40, 55, 45];
const SEMAINES_TESTS = [0, 12, 25];

export const phaseDe = (w) => PHASES.find((p) => w >= p.de && w <= p.a) || PHASES[3];
export const estAllegee = (w) => w < 25 && (w + 1) % 4 === 0;

const rpeCardio = { 1: '11 à 12', 2: '12 à 13', 3: '12 à 14', 4: '12 à 14' };
const parleCardio = { 1: 'tu peux parler en phrases complètes', 2: 'tu peux parler, en phrases un peu plus courtes', 3: 'tu peux encore parler, mais tu ne pourrais pas chanter', 4: 'tu peux encore parler, mais tu ne pourrais pas chanter' };
const penteTapis = { 1: '0 à 1 %', 2: '1 à 3 %', 3: '2 à 5 %', 4: '2 à 6 %' };

function seriesForce(w) {
  const p = phaseDe(w).n;
  let s = p === 1 ? (w < 2 ? 1 : 2) : p === 2 ? (w < 8 ? 2 : 3) : 3;
  if (estAllegee(w)) s = Math.max(1, s - 1);
  return s;
}

function seanceForce(w, lettre) {
  const p = phaseDe(w).n;
  const reps = p === 1 ? '12 à 15' : p === 2 ? '12' : '10 à 12';
  const series = seriesForce(w);
  const ids = lettre === 'A' ? SEANCE_A : SEANCE_B;
  return {
    type: 'force',
    titre: `Renforcement ${lettre}`,
    minutes: series === 1 ? 20 : series === 2 ? 25 : 30,
    rpe: p === 1 ? '11 à 12' : '11 à 13',
    echauffement: '5 min de vélo ou de tapis très facile, puis 10 mouvements à vide du premier exercice.',
    retour: '3 min de marche lente et quelques étirements doux.',
    repos: series === 3 ? '60 s entre les séries, en alternant un exercice du haut et un du bas du corps' : '60 à 90 s entre les séries',
    exercices: ids.map((id) => ({
      id, series, reps: EXERCICES[id].reps || reps,
      variante: p === 1 && EXERCICES[id].facile ? EXERCICES[id].facile : null,
    })),
  };
}

function seanceEquilibre(w) {
  const p = phaseDe(w).n, s = estAllegee(w) || p === 1 ? 2 : 3;
  return {
    type: 'equilibre', titre: 'Équilibre et gainage doux', minutes: 30, rpe: '10 à 12',
    details: [
      '5 min de marche sur le tapis pour s\'échauffer.',
      `Équilibre sur un pied, une main près d'un mur : ${s} × 20 s par pied${p >= 3 ? ' (essaie sans la main, ou sur un coussin)' : ''}.`,
      'Marche talon-pointe en ligne droite : 3 allers-retours dans le couloir.',
      `Pont fessier : ${s} × 12.`,
      `Bird-dog : ${s} × 8 par côté.`,
      `Dead bug : ${s} × 8 par côté.`,
      `Montées sur pointes : ${s} × 15.`,
      'Finir par les mouvements de mobilité ci-dessous et 2 min de respiration lente, assis.',
    ],
    mobilite: MOBILITE,
  };
}

function seanceCardio(w, machine, profil) {
  const ph = phaseDe(w).n;
  const min = SOIR_MIN[w];
  const s = { type: 'cardio', machine, rpe: rpeCardio[ph], parle: parleCardio[ph] };
  if (machine === 'tapis') {
    Object.assign(s, {
      titre: 'Marche sur tapis', minutes: min,
      details: [`5 min d'échauffement très tranquille.`, `${min - 10} min de marche rapide, pente ${penteTapis[ph]}.`, '5 min de retour au calme en ralentissant progressivement.'],
    });
  } else if (machine === 'velo') {
    const fractionne = profil.intervalles && ph >= 3 && !estAllegee(w);
    if (fractionne) {
      const n = Math.max(3, Math.min(8, Math.floor((min - 15) / 4)));
      Object.assign(s, {
        titre: 'Vélo fractionné doux', minutes: 15 + n * 4, rpe: '11 puis 14',
        details: ['10 min d\'échauffement progressif.', `${n} fois : 2 min un peu soutenu (effort 14), puis 2 min facile (effort 11).`, '5 min de retour au calme, sans s\'arrêter d\'un coup.'],
      });
    } else {
      Object.assign(s, {
        titre: 'Vélo', minutes: min,
        details: ['5 min d\'échauffement, résistance minimale.', `${min - 10} min régulières, 60 à 80 tours par minute.`, '5 min de retour au calme en baissant la résistance.'],
      });
    }
  } else {
    const m = Math.min(60, min + 10);
    Object.assign(s, {
      titre: 'Marche longue', minutes: m,
      details: [`${m} min de marche, dehors si possible, sinon sur le tapis.`, 'Commencer et finir tranquillement.'],
    });
  }
  return s;
}

const TESTS = (w) => ({
  type: 'tests', titre: w === 0 ? 'Tests de départ' : w === 25 ? 'Tests de fin' : 'Tests de mi-parcours', minutes: 30, rpe: '13 maximum',
  details: ['10 min de marche facile pour s\'échauffer.', 'Test 1 : marche 6 min sur le tapis, pente 0 %, à l\'allure la plus rapide possible en restant à l\'aise (tu dois pouvoir parler). Note la distance.', 'Test 2 : assis-debout sur une chaise, bras croisés, pendant 30 s. Note le nombre.', '5 min de marche tranquille pour finir.'],
});

const MOBILITE_SEANCE = { type: 'mobilite', titre: 'Mobilité et étirements', minutes: 30, rpe: '9 à 11', details: ['10 min de vélo très facile.', 'Les mouvements de mobilité ci-dessous, 2 tours.', 'Équilibre sur un pied près d\'un mur : 3 × 20 s par pied.'], mobilite: MOBILITE };
const PROMENADE = { type: 'marche', titre: 'Promenade tranquille', minutes: 30, rpe: '9 à 11', details: ['30 min de marche détendue, dehors si possible.'] };

// Journée d'entraînement. w : semaine (0 = première), j : jour (0 = lundi). profil : { intervalles }.
// Renvoie { matin, soir, ... } ; soir vaut null le dimanche (repos).
export function seance(w, j, profil = {}) {
  if (w < 0) return { type: 'avant', titre: 'Le programme n\'a pas commencé' };
  const fin = w >= NB_SEMAINES;
  const wp = fin ? 24 : w; // après les 26 semaines : semaine d'entretien
  const ph = phaseDe(wp);
  const tests = !fin && SEMAINES_TESTS.includes(w) && j === 5;
  const matin = [
    () => seanceForce(wp, 'A'),
    () => seanceEquilibre(wp),
    () => seanceForce(wp, 'B'),
    () => seanceEquilibre(wp),
    () => (ph.n === 1 ? seanceEquilibre(wp) : seanceForce(wp, wp % 2 === 0 ? 'A' : 'B')),
    () => (tests ? TESTS(w) : MOBILITE_SEANCE),
    () => PROMENADE,
  ][j]();
  const soir = [
    () => seanceCardio(wp, 'tapis', profil),
    () => seanceCardio(wp, 'velo', profil),
    () => seanceCardio(wp, 'tapis', profil),
    () => seanceCardio(wp, 'velo', profil),
    () => seanceCardio(wp, 'tapis', profil),
    () => (tests ? { ...PROMENADE, titre: 'Marche tranquille', details: ['30 min de marche détendue après les tests du matin.'] } : seanceCardio(wp, 'marche', profil)),
    () => null,
  ][j]();
  return { type: 'jour', matin, soir, minutes: matin.minutes + (soir?.minutes || 0), semaine: w + 1, phase: ph, allegee: !fin && estAllegee(w), entretien: fin };
}

export const semaine = (w, profil) => JOURS.map((_, j) => seance(w, j, profil));

// Conseil de charge à partir des séances passées pour un exercice (du plus récent au plus ancien).
export function conseilCharge(historique, allegeeMaintenant = false) {
  const last = historique.find((h) => h.kg > 0);
  if (!last) return null;
  const toutFait = last.sets && last.sets.length > 0 && last.sets.every(Boolean);
  const facile = last.rpe == null || last.rpe <= 13;
  if (allegeeMaintenant) return { dernier: last.kg, propose: last.kg, txt: `Semaine allégée : garde ${fmtKg(last.kg)} kg, comme la dernière fois.` };
  if (toutFait && facile && !last.allegee) {
    const pas = last.kg < 10 ? 1 : 2;
    return { dernier: last.kg, propose: last.kg + pas, txt: `Dernière fois ${fmtKg(last.kg)} kg, tout réussi : tu peux essayer ${fmtKg(last.kg + pas)} kg.` };
  }
  return { dernier: last.kg, propose: last.kg, txt: `Dernière fois ${fmtKg(last.kg)} kg : garde la même charge.` };
}
const fmtKg = (x) => String(Math.round(x * 10) / 10).replace('.', ',');

// ---------- Alimentation ----------
export const MOMENTS = { pdj: 'Petit-déjeuner', dej: 'Déjeuner', col: 'Collation', din: 'Dîner' };
export const HEURES = { pdj: '8 h', dej: '12 h 30', col: '16 h', din: '19 h 30' };
const CLES = ['kcal', 'prot', 'gluc', 'lip', 'ags', 'fib', 'sel'];

export function indexAliments(perso = []) {
  const m = new Map();
  for (const a of ALIMENTS) m.set(a.id, a);
  for (const a of perso) m.set(a.id, { ...a, cat: 'perso' });
  return m;
}

export function cibles(profil, poids) {
  const kg = poids || profil.poids || 90;
  const taille = profil.taille || 175;
  const bmr = 10 * kg + 6.25 * taille - 5 * (profil.age || 56) + (profil.sexe === 'F' ? -161 : 5);
  const tdee = bmr * 1.45;
  const kcal = profil.kcalPerso || Math.max(1500, Math.round((tdee - 400) / 50) * 50);
  const prot = Math.round(kg * 1.4);
  const lip = Math.round((kcal * 0.3) / 9);
  return {
    kcal, prot, lip,
    gluc: Math.round((kcal - prot * 4 - lip * 9) / 4),
    ags: Math.round((kcal * 0.1) / 9),
    fib: 30,
    sel: profil.sel || 5,
    bmr: Math.round(bmr), tdee: Math.round(tdee),
  };
}

export function valeurs(e, map) {
  if (e.libre) return { kcal: +e.libre.kcal || 0, prot: +e.libre.prot || 0, gluc: 0, lip: 0, ags: 0, fib: 0, sel: 0 };
  const a = map.get(e.a);
  const v = {};
  for (const k of CLES) v[k] = a ? (a[k] * e.g) / 100 : 0;
  return v;
}

export function totaux(entrees, map) {
  const t = Object.fromEntries(CLES.map((k) => [k, 0]));
  for (const e of entrees) { const v = valeurs(e, map); for (const k of CLES) t[k] += v[k]; }
  return t;
}

const nomDe = (e, map) => (e.libre ? e.libre.nom : map.get(e.a)?.nom || '?').toLowerCase();
const r0 = Math.round;
const r1 = (x) => String(Math.round(x * 10) / 10).replace('.', ',');

// Conseils pour la journée : messages, remplacements possibles et idées d'aliments.
export function conseilsJour(entrees, cible, map) {
  const msgs = [];
  if (!entrees.length) {
    msgs.push({ niv: 'info', txt: 'Note ce que tu manges au fil de la journée : les conseils s\'affichent ici.' });
    return { msgs, swaps: [] };
  }
  const t = totaux(entrees, map);
  const reste = cible.kcal - t.kcal;
  const complete = entrees.some((e) => e.m === 'din');
  const parEntree = entrees.map((e, i) => ({ e, i, v: valeurs(e, map) }));
  const top = (k, n) => [...parEntree].sort((a, b) => b.v[k] - a.v[k]).slice(0, n).filter((x) => x.v[k] > 0);

  // Calories
  if (reste < -100) {
    const gros = top('kcal', 1)[0];
    msgs.push({ niv: 'alerte', txt: `Tu dépasses de ${r0(-reste)} kcal. Le plus calorique aujourd'hui : ${nomDe(gros.e, map)} (${r0(gros.v.kcal)} kcal).` });
  } else if (complete && reste > 400) {
    msgs.push({ niv: 'info', txt: `Il reste ${r0(reste)} kcal : manger trop peu fait perdre du muscle. Une collation protéinée est bienvenue.` });
  } else if (complete) {
    msgs.push({ niv: 'ok', txt: `Calories dans l'objectif (${r0(t.kcal)} sur ${cible.kcal} kcal).` });
  } else {
    msgs.push({ niv: 'info', txt: `Il reste ${r0(reste)} kcal pour la journée.` });
  }

  // Protéines
  const manque = cible.prot - t.prot;
  if (manque > 10) {
    const budget = Math.max(reste, 150);
    const idees = IDEES_PROTEINES.map((id) => map.get(id))
      .map((a) => ({ a, p: (a.prot * a.portion) / 100, k: (a.kcal * a.portion) / 100 }))
      .filter((x) => x.k <= budget)
      .sort((x, y) => y.p / y.k - x.p / x.k)
      .slice(0, 3);
    const liste = idees.map((x) => `${x.a.nom.toLowerCase()} ${x.a.portion} g (+${r0(x.p)} g, ${r0(x.k)} kcal)`).join(' ; ');
    msgs.push({ niv: complete ? 'alerte' : 'info', txt: `Il manque ${r0(manque)} g de protéines pour garder et refaire du muscle.${liste ? ' Idées : ' + liste + '.' : ''}`, ajout: idees.map((x) => x.a.id) });
  } else {
    msgs.push({ niv: 'ok', txt: `Protéines : ${r0(t.prot)} g sur ${cible.prot} g, bien.` });
  }

  // Sel et graisses saturées (le cœur)
  if (t.sel > cible.sel) {
    const s = top('sel', 2).map((x) => `${nomDe(x.e, map)} (${r1(x.v.sel)} g)`).join(', ');
    msgs.push({ niv: 'alerte', txt: `Sel : ${r1(t.sel)} g, au-dessus de ${cible.sel} g. Principales sources : ${s}.` });
  }
  if (t.ags > cible.ags) {
    const s = top('ags', 2).map((x) => nomDe(x.e, map)).join(', ');
    msgs.push({ niv: 'alerte', txt: `Graisses saturées : ${r0(t.ags)} g pour ${cible.ags} g max. Elles viennent surtout de : ${s}.` });
  }
  if (complete && t.fib < 25) {
    const idees = IDEES_FIBRES.slice(0, 4).map((id) => map.get(id).nom.toLowerCase()).join(', ');
    msgs.push({ niv: 'info', txt: `Fibres : ${r0(t.fib)} g sur 30 g. Pour demain : ${idees}.` });
  }
  const pdj = parEntree.filter((x) => x.e.m === 'pdj');
  if (pdj.length && pdj.reduce((s, x) => s + x.v.prot, 0) < 15) {
    msgs.push({ niv: 'info', txt: 'Petit-déjeuner pauvre en protéines : un skyr, un fromage blanc ou un œuf aide à tenir jusqu\'à midi.' });
  }

  // Remplacements : un par aliment remplaçable, les plus utiles d'abord.
  const swaps = [];
  for (const { e, i, v } of parEntree) {
    const sw = !e.libre && SWAPS[e.a];
    if (!sw || !map.get(sw[0])) continue;
    const nv = valeurs({ a: sw[0], g: e.g }, map);
    const gain = { kcal: v.kcal - nv.kcal, ags: v.ags - nv.ags, sel: v.sel - nv.sel, fib: nv.fib - v.fib };
    const score = gain.kcal / 50 + gain.ags + gain.sel * 3 + gain.fib / 2;
    if (score > 0.5) swaps.push({ index: i, de: map.get(e.a).nom, vers: map.get(sw[0]).nom, versId: sw[0], raison: sw[1], gain, score });
  }
  swaps.sort((a, b) => b.score - a.score);
  return { msgs, swaps: swaps.slice(0, 3), totaux: t };
}

// Bilan alimentaire d'une semaine. jours : [{ date, entrees }]
export function bilanSemaine(jours, cible, map) {
  const remplis = jours.filter((j) => j.entrees.length);
  const b = { joursRenseignes: remplis.length, kcalMoy: 0, protMoy: 0, selMoy: 0, joursKcalOk: 0, joursProtOk: 0, poisson: 0, poissonGras: 0, legumineuses: 0, charcuterie: 0, alcool: 0, msgs: [] };
  if (!remplis.length) return b;
  for (const j of remplis) {
    const t = totaux(j.entrees, map);
    b.kcalMoy += t.kcal / remplis.length; b.protMoy += t.prot / remplis.length; b.selMoy += t.sel / remplis.length;
    if (Math.abs(t.kcal - cible.kcal) <= cible.kcal * 0.1) b.joursKcalOk++;
    if (t.prot >= cible.prot * 0.9) b.joursProtOk++;
    for (const e of j.entrees) {
      const a = !e.libre && map.get(e.a);
      if (!a) continue;
      if (a.cat === 'poisson' || a.cat === 'poissongras') b.poisson++;
      if (a.cat === 'poissongras') b.poissonGras++;
      if (a.cat === 'legumineuse') b.legumineuses++;
      if (a.cat === 'charcuterie') b.charcuterie++;
      if (a.cat === 'alcool') b.alcool += e.g / a.portion;
    }
  }
  const m = b.msgs;
  m.push(b.joursKcalOk >= remplis.length * 0.7
    ? { niv: 'ok', txt: `Calories dans l'objectif ${b.joursKcalOk} jours sur ${remplis.length}.` }
    : { niv: 'info', txt: `Calories dans l'objectif ${b.joursKcalOk} jours sur ${remplis.length} (moyenne ${r0(b.kcalMoy)} kcal pour ${cible.kcal}).` });
  m.push(b.joursProtOk >= remplis.length * 0.7
    ? { niv: 'ok', txt: `Protéines suffisantes ${b.joursProtOk} jours sur ${remplis.length}.` }
    : { niv: 'alerte', txt: `Protéines suffisantes seulement ${b.joursProtOk} jours sur ${remplis.length} : c'est ce qui permet de reprendre du muscle.` });
  m.push(b.poisson >= 2 && b.poissonGras >= 1
    ? { niv: 'ok', txt: `Poisson ${b.poisson} fois dont ${b.poissonGras} gras : parfait pour le cœur.` }
    : { niv: 'info', txt: `Poisson ${b.poisson} fois cette semaine. Viser 2 fois, dont 1 poisson gras (saumon, sardines, maquereau).` });
  if (b.legumineuses < 2) m.push({ niv: 'info', txt: 'Légumineuses (lentilles, pois chiches, haricots) : viser 2 fois par semaine.' });
  if (b.charcuterie > 2) m.push({ niv: 'alerte', txt: `Charcuterie ${b.charcuterie} fois : c'est beaucoup de sel et de gras, viser 2 fois maximum.` });
  if (b.selMoy > cible.sel) m.push({ niv: 'alerte', txt: `Sel en moyenne ${r1(b.selMoy)} g par jour pour ${cible.sel} g max.` });
  if (b.alcool > 0) m.push({ niv: b.alcool > 7 ? 'alerte' : 'info', txt: `Alcool : ${r1(b.alcool)} verres sur la semaine. À voir avec le cardiologue, le moins est le mieux.` });
  return b;
}

// Perte de poids attendue : de poidsDepart à objectif sur 26 semaines (ligne droite).
export function poidsVise(profil, w) {
  const dep = profil.poids || 90, obj = profil.objectif || dep - 5;
  return dep + ((obj - dep) * Math.min(Math.max(w, 0), NB_SEMAINES)) / NB_SEMAINES;
}

// ---------- Menus du jour ----------
// Menu proposé pour un repas : rotation selon la date, décalée par « autre idée » (choix).
export function menuRepas(date, moment, cible, map, choix = 0) {
  const liste = MENUS[moment];
  const jour = Math.round(Date.UTC(...date.split('-').map((x, i) => (i === 1 ? x - 1 : +x))) / 86400000);
  const m = liste[(((jour + choix) % liste.length) + liste.length) % liste.length];
  const vise = cible.kcal * PARTS[moment];
  const kcalDe = (id, g) => (map.get(id).kcal * g) / 100;
  const fixe = m.items.filter((x) => !x[2]).reduce((s, [id, g]) => s + kcalDe(id, g), 0);
  const souple = m.items.filter((x) => x[2]).reduce((s, [id, g]) => s + kcalDe(id, g), 0);
  const f = souple ? Math.min(2, Math.max(0.5, (vise - fixe) / souple)) : 1;
  const items = m.items.map(([id, g, aj]) => ({ a: id, g: aj ? Math.max(10, Math.round((g * f) / 10) * 10) : g }));
  return { nom: m.nom, items, totaux: totaux(items, map) };
}

// Menus des 4 repas, puis correction sur la journée pour tomber sur l'objectif de calories.
export function menuJour(date, cible, map, choix = {}) {
  const menus = Object.fromEntries(Object.keys(MOMENTS).map((m) => [m, menuRepas(date, m, cible, map, choix[m] || 0)]));
  const flex = (m) => m.items.filter((i) => isFlex(m.nom, i.a));
  const tot = Object.values(menus).reduce((s, m) => s + m.totaux.kcal, 0);
  const kFlex = Object.values(menus).reduce((s, m) => s + flex(m).reduce((t, i) => t + (map.get(i.a).kcal * i.g) / 100, 0), 0);
  if (kFlex > 0) {
    const f = Math.min(1.6, Math.max(0.7, 1 + (cible.kcal - tot) / kFlex));
    for (const m of Object.values(menus)) {
      for (const i of flex(m)) i.g = Math.max(10, Math.round((i.g * f) / 10) * 10);
      m.totaux = totaux(m.items, map);
    }
  }
  return menus;
}

// Vrai si l'aliment est la partie ajustable du menu nommé.
function isFlex(nom, id) {
  for (const liste of Object.values(MENUS)) for (const m of liste) if (m.nom === nom) return m.items.some((i) => i[0] === id && i[2]);
  return false;
}

// ---------- Séance guidée ----------
// Découpe une séance en étapes : chrono (minuté, enchaîne seul), serie (l'utilisateur valide),
// repos (minuté), etape (consigne, l'utilisateur passe à la suite).
const ANIM_DE = [[/équilibre/i, 'equilibre'], [/talon-pointe/i, 'talonpointe'], [/pont/i, 'pont'], [/bird-dog/i, 'birddog'], [/dead bug/i, 'deadbug'], [/pointes/i, 'mollets'], [/vélo/i, 'velo'], [/tapis|marche/i, 'tapis']];
const animDe = (texte, defaut = 'etirement') => (ANIM_DE.find(([re]) => re.test(texte)) || [null, defaut])[1];

export function etapesSeance(s) {
  const E = [];
  if (s.type === 'force') {
    E.push({ type: 'chrono', titre: 'Échauffement', texte: s.echauffement, duree: 300, anim: 'velo' });
    const repos = s.exercices[0]?.series === 3 ? 60 : 75;
    s.exercices.forEach((e, k) => {
      for (let i = 0; i < e.series; i++) {
        E.push({ type: 'serie', ex: e.id, titre: EXERCICES[e.id].nom, serie: i + 1, nb: e.series, reps: e.reps, anim: e.id, variante: e.variante });
        const dernier = k === s.exercices.length - 1 && i === e.series - 1;
        if (!dernier) {
          const suivant = i + 1 < e.series ? e.id : s.exercices[k + 1].id;
          E.push({ type: 'repos', titre: 'Repos', texte: `Ensuite : ${EXERCICES[suivant].nom}`, duree: repos, anim: suivant });
        }
      }
    });
    E.push({ type: 'chrono', titre: 'Retour au calme', texte: s.retour, duree: 180, anim: 'etirement' });
  } else if (s.type === 'cardio') {
    const anim = s.machine === 'velo' ? 'velo' : 'tapis';
    const [ech, ...reste] = s.details;
    if (s.titre.includes('fractionné')) {
      const n = Number((reste[0].match(/^(\d+) fois/) || [])[1]) || 4;
      E.push({ type: 'chrono', titre: 'Échauffement', texte: ech, duree: 600, anim });
      for (let i = 1; i <= n; i++) {
        E.push({ type: 'chrono', titre: `Soutenu ${i} sur ${n}`, texte: 'Un peu soutenu : effort 14 sur 20. Tu dois encore pouvoir dire quelques mots.', duree: 120, anim });
        E.push({ type: 'chrono', titre: `Facile ${i} sur ${n}`, texte: 'Facile : effort 11. Récupère en respirant calmement.', duree: 120, anim });
      }
      E.push({ type: 'chrono', titre: 'Retour au calme', texte: reste[1], duree: 300, anim });
    } else if (s.details.length >= 3) {
      const ech2 = Number((ech.match(/^(\d+) min/) || [])[1]) || 5;
      const fin = Number((reste[1].match(/^(\d+) min/) || [])[1]) || 5;
      E.push({ type: 'chrono', titre: 'Échauffement', texte: ech, duree: ech2 * 60, anim });
      E.push({ type: 'chrono', titre: s.titre, texte: reste[0] + (s.parle ? ` Repère : ${s.parle}.` : ''), duree: (s.minutes - ech2 - fin) * 60, anim, rappelMilieu: true });
      E.push({ type: 'chrono', titre: 'Retour au calme', texte: reste[1], duree: fin * 60, anim });
    } else {
      E.push({ type: 'chrono', titre: s.titre, texte: s.details.join(' '), duree: s.minutes * 60, anim, rappelMilieu: true });
    }
  } else if (s.type === 'tests') {
    E.push({ type: 'chrono', titre: 'Échauffement', texte: s.details[0], duree: 600, anim: 'tapis' });
    E.push({ type: 'chrono', titre: 'Test de marche 6 min', texte: s.details[1], duree: 360, anim: 'tapis' });
    E.push({ type: 'chrono', titre: 'Test assis-debout 30 s', texte: s.details[2], duree: 30, anim: 'squat' });
    E.push({ type: 'chrono', titre: 'Retour au calme', texte: s.details[3], duree: 300, anim: 'tapis' });
  } else if (s.type === 'marche') {
    E.push({ type: 'chrono', titre: s.titre, texte: s.details.join(' '), duree: s.minutes * 60, anim: 'tapis' });
  } else {
    for (const d of s.details) {
      const m = d.match(/^(\d+) min/);
      E.push(m ? { type: 'chrono', titre: d.split(/[.:]/)[0], texte: d, duree: +m[1] * 60, anim: animDe(d, 'tapis') }
        : { type: 'etape', titre: d.split(/ : |, /)[0].replace(/\.$/, ''), texte: d, anim: animDe(d) });
    }
    for (const d of s.mobilite || []) E.push({ type: 'etape', titre: d.split(' : ')[0], texte: d, anim: 'etirement' });
  }
  return E;
}

// Version 15 minutes d'une séance, pour les jours sans temps ou sans énergie.
export function raccourcir(s) {
  if (!s) return s;
  const c = { ...s, minutes: 15, court: true };
  if (s.type === 'force') {
    c.exercices = s.exercices.slice(0, 4).map((e) => ({ ...e, series: Math.min(e.series, 2) }));
  } else if (s.type === 'cardio') {
    c.titre = s.titre.replace(' fractionné doux', '');
    c.details = ['3 min d\'échauffement tranquille.', `10 min de ${s.machine === 'velo' ? 'vélo' : 'marche'} régulière.`, '2 min de retour au calme.'];
    c.rpe = '11 à 13';
  } else if (s.details) {
    c.details = s.details.slice(0, 4);
    if (s.mobilite) c.mobilite = s.mobilite.slice(0, 3);
  }
  return c;
}

// ---------- Activité ----------
// faites : [{ date, minutes }], une entrée par séance faite. Minutes par semaine, série de jours, totaux.
export function activite(faites, aujourdhui, nbSemaines = 8) {
  const jours = new Map();
  for (const f of faites) jours.set(f.date, (jours.get(f.date) || 0) + f.minutes);
  const lun = lundi(aujourdhui);
  const semaines = [];
  for (let k = nbSemaines - 1; k >= 0; k--) {
    const d0 = addDays(lun, -7 * k);
    let m = 0;
    for (let j = 0; j < 7; j++) m += jours.get(addDays(d0, j)) || 0;
    semaines.push({ lundi: d0, minutes: m });
  }
  let serie = 0;
  for (let d = jours.has(aujourdhui) ? aujourdhui : addDays(aujourdhui, -1); jours.has(d); d = addDays(d, -1)) serie++;
  let record = 0, cur = 0, prev = null;
  for (const d of [...jours.keys()].sort()) { cur = prev && diffDays(prev, d) === 1 ? cur + 1 : 1; record = Math.max(record, cur); prev = d; }
  return { semaines, serie, record, seances: faites.length, minutes: faites.reduce((s, f) => s + f.minutes, 0), jours: jours.size };
}

export function badges({ seances, record, minutes, kgPerdus, tests }) {
  return [
    { nom: 'Premier pas', desc: 'Première séance faite', ok: seances >= 1 },
    { nom: 'Lancé', desc: '10 séances', ok: seances >= 10 },
    { nom: 'Régulier', desc: '50 séances', ok: seances >= 50 },
    { nom: 'Pilier', desc: '150 séances', ok: seances >= 150 },
    { nom: 'Une semaine', desc: '7 jours de suite', ok: record >= 7 },
    { nom: 'Un mois', desc: '30 jours de suite', ok: record >= 30 },
    { nom: '10 heures', desc: '10 h de sport au total', ok: minutes >= 600 },
    { nom: '50 heures', desc: '50 h de sport au total', ok: minutes >= 3000 },
    { nom: 'Premier kilo', desc: '1 kg perdu', ok: kgPerdus >= 1 },
    { nom: 'Trois kilos', desc: '3 kg perdus', ok: kgPerdus >= 3 },
    { nom: 'Objectif', desc: 'Poids visé atteint', ok: kgPerdus >= 5 },
    { nom: 'Bilan', desc: 'Tests de forme faits', ok: tests >= 1 },
  ];
}

// ---------- Rappels agenda (.ics) ----------
export function rappelsIcs(debut, nbJours = 182) {
  const d = debut.replace(/-/g, '');
  const ev = (uid, h, duree, titre) => ['BEGIN:VEVENT', `UID:${uid}-${d}@ma-forme`, `DTSTAMP:${d}T000000Z`, `DTSTART:${d}T${h}00`, `DURATION:PT${duree}M`,
    `RRULE:FREQ=DAILY;COUNT=${nbJours}`, `SUMMARY:${titre}`, 'DESCRIPTION:Ouvre l\'appli Ma forme pour la séance du jour.',
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${titre}`, 'TRIGGER:-PT10M', 'END:VALARM', 'END:VEVENT'];
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Ma forme//FR', 'CALSCALE:GREGORIAN',
    ...ev('matin', '1100', 30, 'Sport : séance de 11 h'), ...ev('soir', '1700', 45, 'Sport : séance de 17 h'), 'END:VCALENDAR'].join('\r\n');
}
