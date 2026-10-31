// Petites animations SVG : un personnage qui passe en boucle d'une position A à une position B.
// Articulations : h tête, n cou, b bassin, e/m coude/main (1 = côté visible, 2 = côté caché),
// g/p genou/pied. Vue de profil, sol à y = 92.

const DEBOUT = { h: [60, 16], n: [60, 25], b: [60, 55], e1: [61, 40], m1: [61, 54], g1: [61, 73], p1: [61, 92], g2: [59, 73], p2: [59, 92] };
const pose = (base, x) => ({ ...base, ...x });

const POSES = {
  squat: {
    a: pose(DEBOUT, { e1: [66, 36], m1: [66, 29] }),
    b: pose(DEBOUT, { h: [67, 37], n: [64, 45], b: [48, 68], e1: [70, 54], m1: [71, 47], g1: [67, 71], p1: [61, 92], g2: [65, 71], p2: [59, 92] }),
    halteres: true,
  },
  rowing: {
    a: { h: [84, 42], n: [76, 46], b: [46, 53], e1: [75, 58], m1: [75, 70], e2: [81, 58], m2: [83, 70], g1: [42, 73], p1: [38, 92], g2: [52, 72], p2: [53, 92] },
    b: { h: [84, 42], n: [76, 46], b: [46, 53], e1: [63, 44], m1: [68, 56], e2: [81, 58], m2: [83, 70], g1: [42, 73], p1: [38, 92], g2: [52, 72], p2: [53, 92] },
    halteres: 1, chaise: [72, 70],
  },
  floorpress: {
    a: { h: [20, 82], n: [29, 85], b: [58, 85], e1: [36, 89], m1: [37, 76], g1: [72, 68], p1: [82, 90], g2: [70, 68], p2: [80, 90] },
    b: { h: [20, 82], n: [29, 85], b: [58, 85], e1: [32, 69], m1: [32, 55], g1: [72, 68], p1: [82, 90], g2: [70, 68], p2: [80, 90] },
    halteres: true, tapis: true,
  },
  pont: {
    a: { h: [20, 84], n: [29, 87], b: [58, 88], e1: [42, 90], m1: [54, 90], g1: [72, 70], p1: [80, 90] },
    b: { h: [20, 84], n: [29, 87], b: [58, 70], e1: [42, 90], m1: [54, 90], g1: [74, 66], p1: [80, 90] },
    tapis: true,
  },
  mollets: {
    a: pose(DEBOUT, { e1: [70, 38], m1: [79, 33] }),
    b: pose(DEBOUT, { h: [60, 11], n: [60, 20], b: [60, 50], e1: [70, 34], m1: [79, 31], g1: [61, 69], p1: [62, 88], g2: [59, 69], p2: [60, 88] }),
    mur: 82,
  },
  deadbug: {
    a: { h: [20, 84], n: [29, 87], b: [58, 87], e1: [30, 74], m1: [30, 61], g1: [60, 69], p1: [74, 69] },
    b: { h: [20, 84], n: [29, 87], b: [58, 87], e1: [30, 74], m1: [30, 61], e2: [19, 80], m2: [8, 77], g1: [60, 69], p1: [74, 69], g2: [74, 82], p2: [90, 84] },
    tapis: true,
  },
  rdl: {
    a: pose(DEBOUT, { e1: [60, 40], m1: [61, 55], g1: [62, 73], g2: [60, 73] }),
    b: { h: [84, 37], n: [76, 42], b: [52, 56], e1: [76, 55], m1: [76, 69], g1: [57, 74], p1: [59, 92], g2: [55, 74], p2: [57, 92] },
    halteres: true,
  },
  fente: {
    a: pose(DEBOUT, { e1: [60, 40], m1: [61, 54] }),
    b: { h: [58, 29], n: [58, 38], b: [58, 66], e1: [59, 52], m1: [60, 65], g1: [71, 72], p1: [72, 92], g2: [49, 85], p2: [37, 92] },
    halteres: 1,
  },
  epaules: {
    a: { h: [58, 22], n: [58, 31], b: [58, 62], e1: [67, 40], m1: [67, 30], g1: [75, 62], p1: [75, 92] },
    b: { h: [58, 22], n: [58, 31], b: [58, 62], e1: [63, 20], m1: [63, 9], g1: [75, 62], p1: [75, 92] },
    halteres: true, chaise: [44, 62, 'assise'],
  },
  curl: {
    a: pose(DEBOUT, { e1: [61, 41], m1: [62, 56] }),
    b: pose(DEBOUT, { e1: [61, 41], m1: [70, 33] }),
    halteres: true,
  },
  triceps: {
    a: { h: [84, 42], n: [76, 46], b: [48, 55], e1: [62, 50], m1: [63, 62], e2: [81, 58], m2: [83, 70], g1: [46, 74], p1: [44, 92], g2: [54, 73], p2: [55, 92] },
    b: { h: [84, 42], n: [76, 46], b: [48, 55], e1: [62, 50], m1: [49, 47], e2: [81, 58], m2: [83, 70], g1: [46, 74], p1: [44, 92], g2: [54, 73], p2: [55, 92] },
    halteres: 1, chaise: [72, 70],
  },
  birddog: {
    a: { h: [80, 59], n: [72, 64], b: [46, 66], e1: [72, 77], m1: [72, 89], g1: [46, 89], p1: [30, 90] },
    b: { h: [80, 59], n: [72, 64], b: [46, 66], e1: [72, 77], m1: [72, 89], e2: [86, 60], m2: [100, 57], g1: [46, 89], p1: [30, 90], g2: [31, 66], p2: [15, 65] },
    tapis: true,
  },
  equilibre: {
    a: pose(DEBOUT, { e1: [70, 38], m1: [79, 33] }),
    b: pose(DEBOUT, { e1: [70, 38], m1: [79, 33], g2: [66, 68], p2: [57, 77] }),
    mur: 82,
  },
  talonpointe: {
    a: pose(DEBOUT, { e1: [70, 30], m1: [80, 32], e2: [50, 30], m2: [40, 32], g1: [63, 73], p1: [66, 92], g2: [58, 73], p2: [55, 92] }),
    b: pose(DEBOUT, { e1: [70, 30], m1: [80, 32], e2: [50, 30], m2: [40, 32], g1: [58, 73], p1: [55, 92], g2: [63, 73], p2: [66, 92] }),
  },
  tapis: {
    a: pose(DEBOUT, { h: [62, 14], n: [61, 23], b: [60, 52], e1: [55, 37], m1: [52, 49], e2: [66, 37], m2: [71, 46], g1: [67, 70], p1: [72, 87], g2: [55, 71], p2: [49, 87] }),
    b: pose(DEBOUT, { h: [62, 14], n: [61, 23], b: [60, 52], e1: [66, 37], m1: [71, 46], e2: [55, 37], m2: [52, 49], g1: [55, 71], p1: [49, 87], g2: [67, 70], p2: [72, 87] }),
    machine: 'tapis', duree: 1.1,
  },
  velo: {
    a: { h: [70, 20], n: [65, 28], b: [50, 52], e1: [72, 39], m1: [80, 42], g1: [66, 54], p1: [60, 74], g2: [62, 62], p2: [64, 84] },
    b: { h: [70, 20], n: [65, 28], b: [50, 52], e1: [72, 39], m1: [80, 42], g1: [62, 62], p1: [64, 84], g2: [66, 54], p2: [60, 74] },
    machine: 'velo', duree: 1.2,
  },
  etirement: {
    a: pose(DEBOUT, { e1: [68, 30], m1: [72, 18], e2: [52, 30], m2: [48, 18] }),
    b: pose(DEBOUT, { h: [62, 17], e1: [68, 24], m1: [64, 8], e2: [54, 24], m2: [58, 8] }),
  },
};

// Animation à utiliser pour une séance qui n'a pas d'exercice précis.
export const ANIM_SEANCE = { cardio: 'tapis', equilibre: 'equilibre', mobilite: 'etirement', marche: 'tapis', tests: 'tapis', repos: 'etirement' };

const complet = (p) => ({ ...p, e2: p.e2 || p.e1, m2: p.m2 || p.m1, g2: p.g2 || p.g1, p2: p.p2 || p.p1 });

export function animation(id, taille = 120) {
  const P = POSES[id];
  if (!P) return '';
  const a = complet(P.a), b = complet(P.b), dur = `${P.duree || 3}s`;
  const anim = (attr, va, vb) => va === vb ? '' : `<animate attributeName="${attr}" values="${va};${vb};${va}" dur="${dur}" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1;.45 0 .55 1"/>`;
  const ligne = (j1, j2, cls, decal = [0, 0, 0, 0]) => {
    const A = [a[j1][0] + decal[0], a[j1][1] + decal[1], a[j2][0] + decal[2], a[j2][1] + decal[3]];
    const B = [b[j1][0] + decal[0], b[j1][1] + decal[1], b[j2][0] + decal[2], b[j2][1] + decal[3]];
    return `<line class="${cls}" x1="${A[0]}" y1="${A[1]}" x2="${A[2]}" y2="${A[3]}">${anim('x1', A[0], B[0])}${anim('y1', A[1], B[1])}${anim('x2', A[2], B[2])}${anim('y2', A[3], B[3])}</line>`;
  };
  const haltere = (j, cls) => `<line class="haltere ${cls}" x1="${a[j][0] - 4}" y1="${a[j][1]}" x2="${a[j][0] + 4}" y2="${a[j][1]}">${anim('x1', a[j][0] - 4, b[j][0] - 4)}${anim('y1', a[j][1], b[j][1])}${anim('x2', a[j][0] + 4, b[j][0] + 4)}${anim('y2', a[j][1], b[j][1])}</line>`;
  let decor = '<line class="sol" x1="4" y1="92.5" x2="116" y2="92.5"/>';
  if (P.tapis) decor += '<rect class="tapis-sol" x="6" y="91" width="100" height="3" rx="1.5"/>';
  if (P.mur) decor += `<line class="decor" x1="${P.mur}" y1="10" x2="${P.mur}" y2="92"/>`;
  if (P.chaise) {
    const [x, y, assise] = P.chaise;
    decor += assise
      ? `<path class="decor" d="M${x} ${y - 32} V${y} H${x + 22} M${x + 3} ${y} V92 M${x + 20} ${y} V92"/>`
      : `<path class="decor" d="M${x} ${y} H${x + 24} M${x + 3} ${y} V92 M${x + 21} ${y} V92 M${x + 24} ${y} V${y - 26}"/>`;
  }
  if (P.machine === 'tapis') decor += '<path class="decor" d="M30 88 H96 L100 92 H28 Z M92 88 L98 40 H104"/>';
  if (P.machine === 'velo') decor += '<path class="decor" d="M46 54 H56 M51 54 L62 79 L82 44 M78 42 H86 M62 79 L56 92 M62 79 L70 92 M50 92 H76"/><circle class="decor" cx="62" cy="79" r="11"/>';
  const halteres = P.halteres ? (P.halteres === 1 ? haltere('m1', 'avant') : haltere('m2', 'arriere') + haltere('m1', 'avant')) : '';
  return `<svg class="anim" viewBox="0 0 120 100" width="${taille}" height="${taille * 0.83}" role="img" aria-label="Animation du mouvement">${decor}
    <g class="corps arriere">${ligne('n', 'e2', 'm')}${ligne('e2', 'm2', 'm')}${ligne('b', 'g2', 'j')}${ligne('g2', 'p2', 'j')}</g>
    <g class="corps">${ligne('n', 'b', 't')}${ligne('b', 'g1', 'j')}${ligne('g1', 'p1', 'j')}${ligne('n', 'e1', 'm')}${ligne('e1', 'm1', 'm')}
    <circle class="tete" r="6.5" cx="${a.h[0]}" cy="${a.h[1]}">${anim('cx', a.h[0], b.h[0])}${anim('cy', a.h[1], b.h[1])}</circle></g>${halteres}</svg>`;
}

export const ANIMATIONS = Object.keys(POSES);
