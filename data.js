// Données de référence : aliments (valeurs moyennes pour 100 g, ordre de grandeur des tables
// CIQUAL), substitutions conseillées, exercices.

// [id, nom, catégorie, kcal, protéines, glucides, lipides, AG saturés, fibres, sel, portion g, libellé portion]
const A = [
  // Pains, céréales, féculents
  ['baguette', 'Pain baguette', 'pain', 270, 9, 55, 1.2, 0.3, 2.7, 1.3, 50, '1/5 de baguette'],
  ['paincomplet', 'Pain complet ou aux céréales', 'pain', 240, 9, 44, 2, 0.4, 7, 1.1, 40, '1 tranche épaisse'],
  ['painmie', 'Pain de mie complet', 'pain', 250, 9, 43, 4, 0.6, 6, 1.1, 25, '1 tranche'],
  ['biscotte', 'Biscotte', 'pain', 400, 11, 73, 6, 1, 4, 1.2, 9, '1 biscotte'],
  ['avoine', "Flocons d'avoine", 'feculent', 370, 13, 59, 7, 1.3, 10, 0, 40, '4 c. à soupe'],
  ['muesli', 'Muesli sans sucre ajouté', 'feculent', 360, 10, 60, 6, 1, 8, 0.1, 45, '1 bol'],
  ['cornflakes', 'Céréales type corn flakes', 'sucre', 380, 7, 84, 0.9, 0.2, 3, 1.1, 30, '1 bol'],
  ['rizblanc', 'Riz blanc cuit', 'feculent', 130, 2.7, 28, 0.3, 0.1, 0.4, 0, 150, '1 assiette'],
  ['rizcomplet', 'Riz complet cuit', 'feculent', 140, 3, 28, 1, 0.2, 1.8, 0, 150, '1 assiette'],
  ['pates', 'Pâtes cuites', 'feculent', 150, 5, 30, 0.9, 0.2, 1.8, 0, 180, '1 assiette'],
  ['patescompletes', 'Pâtes complètes cuites', 'feculent', 145, 5.5, 27, 1, 0.2, 4, 0, 180, '1 assiette'],
  ['pdt', 'Pommes de terre vapeur', 'feculent', 80, 2, 17, 0.1, 0, 1.8, 0, 200, '3 moyennes'],
  ['frites', 'Frites', 'snack', 280, 3.4, 35, 14, 1.5, 3, 0.5, 150, '1 portion'],
  ['puree', 'Purée maison', 'feculent', 85, 2, 13, 3, 1.8, 1.3, 0.5, 200, '1 assiette'],
  ['patatedouce', 'Patate douce cuite', 'feculent', 86, 1.6, 18, 0.1, 0, 3, 0.1, 200, '1 moyenne'],
  ['quinoa', 'Quinoa cuit', 'feculent', 120, 4.4, 21, 1.9, 0.2, 2.8, 0, 150, '1 assiette'],
  ['semoule', 'Semoule cuite', 'feculent', 112, 3.8, 23, 0.2, 0, 1.4, 0, 150, '1 assiette'],
  // Légumineuses
  ['lentilles', 'Lentilles cuites', 'legumineuse', 116, 9, 17, 0.6, 0.1, 8, 0, 200, '1 assiette'],
  ['poischiches', 'Pois chiches cuits', 'legumineuse', 140, 8, 19, 2.6, 0.3, 7.6, 0.1, 150, '1 portion'],
  ['haricotsrouges', 'Haricots rouges cuits', 'legumineuse', 115, 8.5, 14, 0.5, 0.1, 8, 0.1, 150, '1 portion'],
  ['haricotsblancs', 'Haricots blancs cuits', 'legumineuse', 110, 7, 15, 0.6, 0.1, 9, 0.1, 150, '1 portion'],
  ['tofu', 'Tofu nature', 'legumineuse', 120, 12.5, 1.5, 7.5, 1.2, 1, 0, 100, '1 portion'],
  // Laitiers
  ['lait', 'Lait demi-écrémé', 'laitier', 46, 3.3, 4.8, 1.6, 1, 0, 0.1, 200, '1 grand verre ou bol'],
  ['yaourt', 'Yaourt nature', 'laitier', 57, 4.2, 5.4, 1.5, 1, 0, 0.1, 125, '1 pot'],
  ['skyr', 'Skyr nature', 'laitier', 60, 10.5, 4, 0.2, 0.1, 0, 0.1, 150, '1 pot'],
  ['fb0', 'Fromage blanc 0 %', 'laitier', 47, 7.5, 4, 0.2, 0.1, 0, 0.1, 100, '1 petit bol'],
  ['fb3', 'Fromage blanc 3 %', 'laitier', 75, 7, 4, 3, 2, 0, 0.1, 100, '1 petit bol'],
  ['grec', 'Yaourt à la grecque', 'laitier', 115, 4.5, 4, 9, 6, 0, 0.1, 125, '1 pot'],
  ['emmental', 'Emmental', 'fromage', 380, 28, 0, 29, 18, 0, 0.7, 30, '1 portion'],
  ['comte', 'Comté', 'fromage', 410, 27, 0, 34, 21, 0, 0.8, 30, '1 portion'],
  ['camembert', 'Camembert', 'fromage', 264, 20, 0.5, 20, 13, 0, 1.5, 30, '1/8 de camembert'],
  ['chevre', 'Fromage de chèvre (bûche)', 'fromage', 300, 20, 1, 24, 16, 0, 1.3, 30, '1 rondelle épaisse'],
  ['mozza', 'Mozzarella', 'fromage', 240, 18, 1, 18, 12, 0, 0.5, 60, '1/2 boule'],
  ['feta', 'Feta', 'fromage', 270, 15, 1, 22, 15, 0, 2.8, 30, '1 portion'],
  ['beurre', 'Beurre', 'matgrasse', 745, 0.7, 0.6, 82, 54, 0, 0.1, 10, '1 noix'],
  ['creme', 'Crème fraîche épaisse 30 %', 'matgrasse', 290, 2.4, 3, 30, 20, 0, 0.1, 20, '1 c. à soupe'],
  ['cremelegere', 'Crème légère 15 %', 'matgrasse', 160, 2.7, 4, 15, 10, 0, 0.1, 20, '1 c. à soupe'],
  // Œufs, viandes
  ['oeuf', 'Œuf', 'oeuf', 140, 12.5, 0.7, 9.8, 2.8, 0, 0.35, 50, '1 œuf'],
  ['poulet', 'Blanc de poulet cuit', 'viande', 140, 29, 0, 2.5, 0.7, 0, 0.2, 120, '1 filet'],
  ['cuissepoulet', 'Cuisse de poulet rôtie avec peau', 'viande', 220, 25, 0, 13, 3.8, 0, 0.3, 150, '1 cuisse'],
  ['dinde', 'Escalope de dinde cuite', 'viande', 135, 29, 0, 2, 0.6, 0, 0.2, 120, '1 escalope'],
  ['steak5', 'Steak haché 5 % cuit', 'viande', 150, 26, 0, 5, 2.2, 0, 0.2, 100, '1 steak'],
  ['steak15', 'Steak haché 15 % cuit', 'viande', 230, 24, 0, 15, 6.5, 0, 0.2, 100, '1 steak'],
  ['rumsteck', 'Rumsteck ou bavette grillé', 'viande', 160, 29, 0, 5, 2, 0, 0.15, 130, '1 pièce'],
  ['roti', 'Rôti de porc cuit', 'viande', 180, 28, 0, 7.5, 2.7, 0, 0.3, 120, '2 tranches'],
  ['cotepore', 'Côte de porc grillée', 'viande', 230, 27, 0, 13.5, 5, 0, 0.2, 130, '1 côte'],
  ['agneau', "Gigot d'agneau rôti", 'viande', 230, 26, 0, 14, 6.5, 0, 0.2, 120, '2 tranches'],
  ['jambon', 'Jambon blanc découenné', 'viande', 110, 20, 1, 3, 1, 0, 1.9, 40, '1 tranche'],
  ['jamboncru', 'Jambon cru', 'charcuterie', 240, 27, 0.5, 15, 5, 0, 5.5, 20, '1 tranche'],
  ['saucisson', 'Saucisson sec', 'charcuterie', 420, 25, 2, 34, 12.5, 0, 4.7, 30, '6 rondelles'],
  ['lardons', 'Lardons fumés', 'charcuterie', 260, 16, 0.5, 22, 8, 0, 2.6, 50, '1 poignée'],
  ['saucisse', 'Saucisse de Toulouse cuite', 'charcuterie', 290, 17, 1, 24, 9, 0, 1.8, 100, '1 saucisse'],
  ['pate', 'Pâté, terrine, rillettes', 'charcuterie', 330, 14, 2, 30, 11, 0, 1.6, 40, '1 portion'],
  // Poissons
  ['saumon', 'Saumon cuit', 'poissongras', 200, 23, 0, 12, 2.3, 0, 0.15, 130, '1 pavé'],
  ['saumonfume', 'Saumon fumé', 'poissongras', 180, 22, 0, 10, 2, 0, 3, 40, '1 tranche'],
  ['sardines', "Sardines à l'huile égouttées", 'poissongras', 210, 24, 0, 13, 3, 0, 0.9, 85, '1 boîte'],
  ['maquereau', 'Maquereau (filets en conserve)', 'poissongras', 190, 18, 2, 12, 3, 0, 1, 90, '1 boîte'],
  ['cabillaud', 'Cabillaud ou colin cuit', 'poisson', 90, 20, 0, 0.8, 0.2, 0, 0.2, 150, '1 filet'],
  ['thon', 'Thon au naturel (conserve)', 'poisson', 115, 26, 0, 1, 0.3, 0, 0.9, 100, '1 petite boîte'],
  ['crevettes', 'Crevettes cuites', 'poisson', 95, 21, 0, 1, 0.2, 0, 1.8, 100, '1 portion'],
  ['poissonpane', 'Poisson pané', 'snack', 210, 13, 18, 9.5, 1, 1, 0.9, 100, '2 pièces'],
  // Légumes
  ['legumes', 'Légumes verts cuits (moyenne)', 'legume', 30, 2, 4, 0.3, 0.05, 3, 0.05, 200, '1 assiette'],
  ['haricotsverts', 'Haricots verts cuits', 'legume', 28, 2, 3.5, 0.2, 0, 3.2, 0, 200, '1 assiette'],
  ['brocoli', 'Brocoli cuit', 'legume', 30, 2.5, 3, 0.4, 0.1, 2.5, 0, 200, '1 assiette'],
  ['courgette', 'Courgettes cuites', 'legume', 18, 1.2, 2.5, 0.2, 0, 1.2, 0, 200, '1 assiette'],
  ['ratatouille', 'Ratatouille', 'legume', 75, 1.3, 6, 4.5, 0.6, 2, 0.4, 200, '1 assiette'],
  ['carottes', 'Carottes râpées', 'legume', 36, 0.8, 7, 0.3, 0, 2.8, 0.1, 100, '1 ramequin'],
  ['salade', 'Salade verte', 'legume', 15, 1.3, 1.5, 0.2, 0, 1.5, 0, 50, '1 bol'],
  ['tomate', 'Tomate', 'legume', 20, 0.9, 3, 0.3, 0.05, 1.2, 0, 120, '1 tomate'],
  ['concombre', 'Concombre', 'legume', 13, 0.7, 2, 0.1, 0, 0.6, 0, 100, '1/3 de concombre'],
  ['avocat', 'Avocat', 'legume', 170, 1.9, 2, 16, 2.5, 4.5, 0, 75, '1/2 avocat'],
  ['soupe', 'Soupe de légumes maison', 'legume', 35, 1, 5, 1.2, 0.3, 1.5, 0.5, 250, '1 bol'],
  // Fruits
  ['pomme', 'Pomme', 'fruit', 53, 0.3, 11.6, 0.2, 0, 2, 0, 150, '1 pomme'],
  ['banane', 'Banane', 'fruit', 90, 1.1, 20, 0.3, 0.1, 2, 0, 120, '1 banane'],
  ['orange', 'Orange', 'fruit', 45, 0.9, 9, 0.2, 0, 2, 0, 150, '1 orange'],
  ['kiwi', 'Kiwi', 'fruit', 58, 1, 11, 0.6, 0, 3, 0, 80, '1 kiwi'],
  ['fruitsrouges', 'Fruits rouges', 'fruit', 40, 1, 6, 0.5, 0, 4, 0, 125, '1 barquette'],
  ['raisin', 'Raisin', 'fruit', 70, 0.6, 16, 0.2, 0, 1, 0, 125, '1 grappe'],
  ['compote', 'Compote sans sucre ajouté', 'fruit', 55, 0.3, 12, 0.2, 0, 1.6, 0, 100, '1 pot'],
  ['jusorange', "Jus d'orange", 'boisson', 45, 0.7, 9.6, 0.2, 0, 0.4, 0, 200, '1 verre'],
  // Matières grasses, oléagineux
  ['huileolive', "Huile d'olive", 'matgrasse', 900, 0, 0, 100, 15, 0, 0, 10, '1 c. à soupe'],
  ['huilecolza', 'Huile de colza', 'matgrasse', 900, 0, 0, 100, 7.5, 0, 0, 10, '1 c. à soupe'],
  ['margarine', 'Margarine oméga 3 (60 %)', 'matgrasse', 540, 0.2, 0.5, 60, 15, 0, 0.8, 10, '1 noix'],
  ['vinaigrette', 'Vinaigrette maison', 'matgrasse', 470, 0.3, 1, 50, 7, 0, 1.5, 15, '1 c. à soupe'],
  ['mayo', 'Mayonnaise', 'matgrasse', 700, 1.3, 1.5, 76, 6, 0, 1.2, 15, '1 c. à soupe'],
  ['amandes', 'Amandes non salées', 'oleagineux', 630, 25, 7, 53, 4, 12, 0, 25, '1 poignée'],
  ['noix', 'Noix', 'oleagineux', 700, 15, 7, 68, 6, 6.7, 0, 20, '1 poignée'],
  ['cacahuete', 'Beurre de cacahuète', 'oleagineux', 610, 25, 13, 50, 9, 7, 0.9, 15, '1 c. à soupe'],
  // Sucré, grignotage
  ['chocnoir', 'Chocolat noir 70 %', 'sucre', 580, 8, 33, 42, 25, 11, 0, 20, '2 carrés'],
  ['choclait', 'Chocolat au lait', 'sucre', 545, 7, 56, 31, 19, 2, 0.2, 20, '2 carrés'],
  ['biscuits', 'Biscuits secs', 'sucre', 450, 7.5, 74, 12, 7, 2.5, 0.8, 25, '3 biscuits'],
  ['croissant', 'Croissant', 'sucre', 420, 8, 45, 22, 14, 2, 1, 55, '1 croissant'],
  ['painchoc', 'Pain au chocolat', 'sucre', 420, 7.5, 46, 22, 13, 2.5, 0.8, 65, '1 pain au chocolat'],
  ['confiture', 'Confiture', 'sucre', 250, 0.5, 60, 0.1, 0, 1, 0, 20, '1 c. à soupe'],
  ['miel', 'Miel', 'sucre', 320, 0.4, 80, 0, 0, 0, 0, 15, '1 c. à soupe'],
  ['sucre', 'Sucre', 'sucre', 400, 0, 100, 0, 0, 0, 0, 5, '1 morceau'],
  ['gateau', 'Gâteau, pâtisserie (moyenne)', 'sucre', 380, 5, 45, 19, 11, 1.5, 0.4, 100, '1 part'],
  ['glace', 'Glace', 'sucre', 210, 3.5, 25, 10, 7, 0.5, 0.1, 100, '2 boules'],
  ['chips', 'Chips', 'snack', 540, 6, 50, 34, 3, 4, 1.2, 30, '1 petit paquet'],
  // Plats
  ['pizza', 'Pizza', 'plat', 250, 11, 28, 10, 4.5, 2, 1.3, 200, '1/2 pizza'],
  ['quiche', 'Quiche lorraine', 'plat', 280, 9, 18, 19, 9, 1, 1, 150, '1 part'],
  ['sandwich', 'Sandwich jambon-beurre', 'plat', 260, 12, 32, 9, 5, 1.8, 1.7, 220, '1 sandwich'],
  ['couscous', 'Couscous (plat complet)', 'plat', 140, 8, 15, 5, 1.6, 2, 0.6, 350, '1 assiette'],
  ['lasagnes', 'Lasagnes bolognaise', 'plat', 150, 7.5, 13, 7.5, 3.5, 1, 0.7, 300, '1 part'],
  ['hachis', 'Hachis parmentier', 'plat', 130, 7, 10, 7, 3.5, 1, 0.6, 300, '1 assiette'],
  ['choucroute', 'Choucroute garnie', 'plat', 140, 7, 4, 10, 3.5, 2, 1.6, 400, '1 assiette'],
  ['blanquette', 'Blanquette de veau', 'plat', 120, 11, 4, 6.5, 3, 0.5, 0.6, 300, '1 assiette'],
  ['saladecomposee', 'Salade composée (thon, œuf, légumes)', 'plat', 120, 7, 5, 8, 1.4, 1.7, 0.6, 300, '1 assiette'],
  // Boissons
  ['vin', 'Vin', 'alcool', 83, 0, 0.3, 0, 0, 0, 0, 125, '1 verre'],
  ['biere', 'Bière', 'alcool', 42, 0.4, 3, 0, 0, 0, 0, 250, '1 demi'],
  ['soda', 'Soda sucré', 'boisson', 42, 0, 10.6, 0, 0, 0, 0, 330, '1 canette'],
  ['sodazero', 'Soda zéro', 'boisson', 0.3, 0, 0, 0, 0, 0, 0, 330, '1 canette'],
  ['cafe', 'Café ou thé sans sucre', 'boisson', 1, 0.1, 0, 0, 0, 0, 0, 150, '1 tasse'],
];

export const ALIMENTS = A.map(([id, nom, cat, kcal, prot, gluc, lip, ags, fib, sel, portion, portionNom]) =>
  ({ id, nom, cat, kcal, prot, gluc, lip, ags, fib, sel, portion, portionNom }));

// Aliments riches en protéines et bons pour le cœur, proposés quand il en manque.
export const IDEES_PROTEINES = ['skyr', 'fb0', 'poulet', 'thon', 'oeuf', 'cabillaud', 'saumon', 'lentilles', 'dinde', 'sardines', 'tofu', 'amandes'];
export const IDEES_FIBRES = ['legumes', 'lentilles', 'pomme', 'paincomplet', 'avoine', 'fruitsrouges', 'poischiches', 'soupe'];

// Remplacements conseillés : de -> vers, avec la raison.
export const SWAPS = {
  baguette: ['paincomplet', 'plus de fibres, rassasie mieux'],
  pates: ['patescompletes', 'plus de fibres'],
  rizblanc: ['rizcomplet', 'plus de fibres'],
  cornflakes: ['avoine', 'moins de sucre et de sel, plus de fibres'],
  beurre: ['margarine', 'beaucoup moins de graisses saturées'],
  creme: ['cremelegere', 'deux fois moins de graisses saturées'],
  steak15: ['steak5', 'moins de gras, autant de protéines'],
  saucisson: ['jambon', 'moins de sel et de graisses saturées'],
  jamboncru: ['jambon', 'trois fois moins de sel'],
  lardons: ['jambon', 'moins de sel et de gras'],
  saucisse: ['poulet', 'moins de gras, plus de protéines'],
  pate: ['jambon', 'moins de gras'],
  cotepore: ['roti', 'moins de gras'],
  agneau: ['rumsteck', 'moins de graisses saturées'],
  cuissepoulet: ['poulet', 'sans la peau, bien moins gras'],
  frites: ['pdt', 'quatre fois moins de calories'],
  chips: ['amandes', 'bonnes graisses et pas de sel (en plus petite quantité)'],
  croissant: ['paincomplet', 'moins de graisses saturées'],
  painchoc: ['paincomplet', 'moins de graisses saturées'],
  biscuits: ['pomme', 'moins de sucre, plus de fibres'],
  gateau: ['fruitsrouges', 'beaucoup moins de sucre et de gras'],
  choclait: ['chocnoir', 'moins de sucre'],
  soda: ['sodazero', 'pas de sucre'],
  jusorange: ['orange', 'le fruit entier garde les fibres'],
  poissonpane: ['cabillaud', 'sans friture'],
  mayo: ['vinaigrette', 'moins de calories, meilleures graisses avec une huile de colza'],
  grec: ['skyr', 'deux fois plus de protéines, sans gras'],
  fb3: ['fb0', 'mêmes protéines, sans gras'],
  comte: ['mozza', 'moins de graisses saturées'],
  emmental: ['mozza', 'moins de graisses saturées'],
  feta: ['mozza', 'cinq fois moins de sel'],
  quiche: ['saladecomposee', 'moitié moins de calories'],
  pizza: ['saladecomposee', 'moitié moins de calories et de sel'],
  sandwich: ['saladecomposee', 'moins de sel et de calories'],
};

export const CATEGORIES = {
  pain: 'Pain', feculent: 'Féculents', legumineuse: 'Légumineuses', laitier: 'Laitages', fromage: 'Fromages',
  matgrasse: 'Matières grasses', oeuf: 'Œufs', viande: 'Viandes', charcuterie: 'Charcuterie', poisson: 'Poissons',
  poissongras: 'Poissons gras', legume: 'Légumes', fruit: 'Fruits', oleagineux: 'Fruits secs', sucre: 'Sucré',
  snack: 'Grignotage, friture', plat: 'Plats', boisson: 'Boissons', alcool: 'Alcool', perso: 'Mes aliments',
};

// Exercices. kg : avec haltères. Les consignes cardiaques sont rappelées à chaque séance.
export const EXERCICES = {
  squat: {
    nom: 'Squat gobelet', kg: true, facile: 'Assis-debout sur une chaise',
    consignes: ['Haltère tenu contre la poitrine, pieds largeur d\'épaules.', 'Descendre comme pour s\'asseoir, dos droit, genoux dans l\'axe des pieds.', 'Remonter en poussant dans les talons.'],
  },
  rowing: {
    nom: 'Rowing un bras', kg: true,
    consignes: ['Une main et un genou sur une chaise ou un banc, dos plat.', 'Tirer l\'haltère vers la hanche, coude près du corps.', 'Redescendre lentement. Faire les deux côtés.'],
  },
  floorpress: {
    nom: 'Développé couché au sol', kg: true,
    consignes: ['Allongé sur le tapis, genoux pliés, un haltère dans chaque main.', 'Coudes au sol, pousser les haltères vers le plafond.', 'Redescendre jusqu\'à ce que les coudes touchent le tapis.'],
  },
  pont: {
    nom: 'Pont fessier', kg: false,
    consignes: ['Allongé sur le dos, genoux pliés, pieds à plat.', 'Monter le bassin en serrant les fessiers, sans creuser le dos.', 'Plus tard : poser un haltère sur le bassin.'],
  },
  mollets: {
    nom: 'Montées sur pointes', kg: false,
    consignes: ['Debout, une main contre un mur pour l\'équilibre.', 'Monter sur la pointe des pieds, tenir 1 seconde, redescendre lentement.'],
  },
  deadbug: {
    nom: 'Dead bug (gainage au sol)', kg: false, reps: '8 par côté',
    consignes: ['Sur le dos, bras tendus vers le plafond, genoux pliés à 90°.', 'Allonger un bras et la jambe opposée sans décoller le bas du dos.', 'Respirer normalement pendant tout le mouvement.'],
  },
  rdl: {
    nom: 'Soulevé de terre jambes semi-tendues', kg: true,
    consignes: ['Debout, haltères devant les cuisses, genoux légèrement fléchis.', 'Pencher le buste en reculant les fesses, dos bien droit.', 'Descendre jusqu\'aux genoux ou mi-tibias puis remonter.'],
  },
  fente: {
    nom: 'Fente arrière avec appui', kg: true, facile: 'Sans haltère, une main sur une chaise', reps: '10 par jambe',
    consignes: ['Une main sur une chaise, l\'autre tient un haltère.', 'Reculer une jambe et descendre le genou vers le sol.', 'Revenir en poussant sur la jambe avant.'],
  },
  epaules: {
    nom: 'Développé épaules assis', kg: true,
    consignes: ['Assis, dos contre un dossier, haltères à hauteur des épaules.', 'Pousser vers le haut sans cambrer.', 'Charge légère : ce mouvement fait monter la tension plus vite.'],
  },
  curl: {
    nom: 'Curl biceps', kg: true,
    consignes: ['Debout ou assis, bras le long du corps.', 'Plier les coudes pour monter les haltères, coudes fixes.', 'Redescendre lentement.'],
  },
  triceps: {
    nom: 'Extension triceps penché', kg: true,
    consignes: ['Penché en avant, une main sur une chaise, coude collé au corps.', 'Tendre le bras vers l\'arrière, puis revenir.', 'Faire les deux côtés.'],
  },
  birddog: {
    nom: 'Bird-dog', kg: false, reps: '8 par côté',
    consignes: ['À quatre pattes sur le tapis.', 'Tendre un bras devant et la jambe opposée derrière, tenir 2 secondes.', 'Revenir et changer de côté. Respirer normalement.'],
  },
};

// Fiches complètes pour la bibliothèque : muscles travaillés, matériel, version plus difficile.
const FICHES = {
  squat: ['Cuisses, fessiers', 'Haltère', 'Descendre plus lentement (3 secondes) ou prendre un haltère plus lourd.'],
  rowing: ['Dos, arrière des épaules, biceps', 'Haltère, chaise', 'Marquer une pause d\'une seconde en haut.'],
  floorpress: ['Pectoraux, triceps, épaules', 'Haltères, tapis', 'Descendre en 3 secondes.'],
  pont: ['Fessiers, arrière des cuisses, bas du dos', 'Tapis', 'Haltère posé sur le bassin, ou un pied décollé.'],
  mollets: ['Mollets, chevilles', 'Mur', 'Sur une seule jambe, ou sur le bord d\'une marche.'],
  deadbug: ['Abdominaux profonds', 'Tapis', 'Tendre la jambe plus près du sol, toujours sans creuser le dos.'],
  rdl: ['Arrière des cuisses, fessiers, dos', 'Haltères', 'Descendre plus bas en gardant le dos parfaitement droit.'],
  fente: ['Cuisses, fessiers, équilibre', 'Haltère, chaise', 'Sans appui sur la chaise, un haltère dans chaque main.'],
  epaules: ['Épaules, triceps', 'Haltères, chaise', 'Un bras après l\'autre, en gardant le dos collé au dossier.'],
  curl: ['Biceps, avant-bras', 'Haltères', 'Descendre en 3 secondes.'],
  triceps: ['Triceps (arrière du bras)', 'Haltère, chaise', 'Tenir le bras tendu 1 seconde.'],
  birddog: ['Dos, abdominaux, équilibre', 'Tapis', 'Tenir 5 secondes en position tendue.'],
};
for (const [id, [muscles, materiel, plusDur]] of Object.entries(FICHES)) Object.assign(EXERCICES[id], { muscles, materiel, plusDur });

// Exercices sans série chiffrée, présents dans la bibliothèque et la séance guidée.
Object.assign(EXERCICES, {
  equilibre: {
    nom: 'Équilibre sur un pied', kg: false, muscles: 'Chevilles, hanches, équilibre', materiel: 'Mur', plusDur: 'Sans la main, puis les yeux fermés quelques secondes.',
    consignes: ['Debout près d\'un mur, une main posée dessus.', 'Lever un pied et tenir 20 secondes, regard droit devant.', 'Changer de pied.'],
  },
  talonpointe: {
    nom: 'Marche talon-pointe', kg: false, muscles: 'Équilibre, coordination', materiel: 'Couloir', plusDur: 'Marcher en arrière, ou en tournant la tête.',
    consignes: ['Marcher en ligne droite en posant le talon juste devant la pointe de l\'autre pied.', 'Bras écartés pour l\'équilibre, près d\'un mur.'],
  },
});

export const SEANCE_A = ['squat', 'rowing', 'floorpress', 'pont', 'mollets', 'deadbug'];
export const SEANCE_B = ['rdl', 'fente', 'epaules', 'curl', 'triceps', 'birddog'];

export const MOBILITE = [
  'Rotations des épaules : 10 vers l\'avant, 10 vers l\'arrière',
  'Étirement du mollet contre un mur : 30 s par jambe',
  'Étirement de l\'arrière des cuisses, assis sur le tapis : 30 s',
  'Chat-vache à quatre pattes : 10 fois lentement',
  'Étirement des pectoraux dans un encadrement de porte : 30 s',
  'Rotation du buste assis : 5 par côté',
];

export const SIGNES_ALERTE = [
  'Douleur, serrement ou oppression dans la poitrine, le bras, la mâchoire ou le dos',
  'Essoufflement inhabituel, qui ne passe pas en ralentissant',
  'Vertiges, malaise, vision trouble',
  'Palpitations ou cœur irrégulier',
  'Sueurs froides, nausée',
];
