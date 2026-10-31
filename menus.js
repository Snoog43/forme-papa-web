// Menus types, façon méditerranéenne (poisson, légumineuses, huile d'olive ou de colza, peu de sel).
// Chaque aliment : [id, grammes, ajustable]. Les aliments ajustables (féculents, pain) sont
// recalculés pour que la journée tombe sur l'objectif de calories.
export const MENUS = {
  pdj: [
    { nom: 'Porridge au lait, skyr et fruits rouges', items: [['avoine', 50, 1], ['lait', 200], ['skyr', 150], ['fruitsrouges', 125]] },
    { nom: 'Tartines, œufs et orange', items: [['paincomplet', 80, 1], ['margarine', 10], ['oeuf', 100], ['orange', 150], ['cafe', 150]] },
    { nom: 'Skyr, muesli, banane et amandes', items: [['skyr', 150], ['muesli', 45, 1], ['banane', 120], ['amandes', 15]] },
    { nom: 'Tartines, fromage blanc et kiwi', items: [['paincomplet', 80, 1], ['fb0', 150], ['confiture', 20], ['kiwi', 80], ['noix', 10]] },
    { nom: 'Flocons d\'avoine, skyr, pomme et noix', items: [['avoine', 50, 1], ['skyr', 150], ['pomme', 150], ['noix', 15]] },
    { nom: 'Petit-déjeuner salé : jambon, œuf, tomate', items: [['paincomplet', 60, 1], ['jambon', 40], ['oeuf', 50], ['tomate', 120], ['skyr', 150], ['kiwi', 80]] },
    { nom: 'Fromage blanc, avoine, fruits rouges et miel', items: [['fb0', 200], ['avoine', 50, 1], ['fruitsrouges', 125], ['miel', 10], ['lait', 150]] },
  ],
  col: [
    { nom: 'Banane et yaourt', items: [['banane', 120], ['yaourt', 125]] },
    { nom: 'Pomme et amandes', items: [['pomme', 150], ['amandes', 20]] },
    { nom: 'Skyr et kiwi', items: [['skyr', 150], ['kiwi', 80]] },
    { nom: 'Tartine et chocolat noir', items: [['paincomplet', 40, 1], ['chocnoir', 10], ['lait', 150]] },
    { nom: 'Fromage blanc et compote', items: [['fb0', 150], ['compote', 100]] },
  ],
  dej: [
    { nom: 'Poulet, riz complet, haricots verts', items: [['poulet', 130], ['rizcomplet', 150, 1], ['haricotsverts', 200], ['huileolive', 10], ['pomme', 150]] },
    { nom: 'Salade de lentilles, œufs et crudités', items: [['lentilles', 200, 1], ['oeuf', 100], ['carottes', 100], ['salade', 50], ['vinaigrette', 15], ['yaourt', 125]] },
    { nom: 'Cabillaud, pommes de terre, brocoli', items: [['cabillaud', 150], ['pdt', 250, 1], ['brocoli', 200], ['huileolive', 10], ['skyr', 150]] },
    { nom: 'Steak haché 5 %, pâtes complètes, courgettes', items: [['steak5', 120], ['patescompletes', 180, 1], ['courgette', 200], ['huileolive', 10], ['kiwi', 80]] },
    { nom: 'Dinde, quinoa, ratatouille', items: [['dinde', 130], ['quinoa', 150, 1], ['ratatouille', 200], ['yaourt', 125]] },
    { nom: 'Salade de thon, pommes de terre, haricots verts', items: [['thon', 100], ['pdt', 200, 1], ['tomate', 120], ['haricotsverts', 150], ['vinaigrette', 15], ['pomme', 150]] },
    { nom: 'Poulet, semoule et légumes', items: [['poulet', 130], ['semoule', 150, 1], ['legumes', 200], ['huileolive', 10], ['fb0', 100]] },
    { nom: 'Saumon, riz complet, légumes verts', items: [['saumon', 130], ['rizcomplet', 150, 1], ['legumes', 200], ['yaourt', 125]] },
    { nom: 'Rôti de porc, patate douce, haricots verts', items: [['roti', 120], ['patatedouce', 200, 1], ['haricotsverts', 200], ['huileolive', 10], ['orange', 150]] },
    { nom: 'Couscous maison : pois chiches, poulet, légumes', items: [['poischiches', 150], ['poulet', 100], ['semoule', 120, 1], ['courgette', 200], ['huileolive', 10], ['kiwi', 80]] },
    { nom: 'Rumsteck, pommes de terre, salade', items: [['rumsteck', 130], ['pdt', 250, 1], ['salade', 50], ['vinaigrette', 15], ['fruitsrouges', 125]] },
    { nom: 'Omelette, pommes de terre, salade', items: [['oeuf', 150], ['pdt', 200, 1], ['salade', 50], ['vinaigrette', 15], ['skyr', 150]] },
    { nom: 'Tofu sauté, riz complet, légumes', items: [['tofu', 150], ['rizcomplet', 150, 1], ['legumes', 200], ['huileolive', 10], ['skyr', 150], ['pomme', 150]] },
    { nom: 'Dinde, pâtes complètes, brocoli', items: [['dinde', 130], ['patescompletes', 180, 1], ['brocoli', 200], ['huileolive', 10], ['fb0', 100]] },
  ],
  din: [
    { nom: 'Soupe de légumes, œufs, tartine', items: [['soupe', 300], ['oeuf', 100], ['paincomplet', 60, 1], ['fb0', 100], ['pomme', 150]] },
    { nom: 'Sardines, pommes de terre, salade', items: [['sardines', 85], ['pdt', 200, 1], ['salade', 50], ['vinaigrette', 10], ['compote', 100]] },
    { nom: 'Maquereau, tartines et crudités', items: [['maquereau', 90], ['paincomplet', 60, 1], ['tomate', 120], ['concombre', 100], ['yaourt', 125], ['fruitsrouges', 125]] },
    { nom: 'Omelette aux courgettes', items: [['oeuf', 100], ['courgette', 200], ['huileolive', 5], ['paincomplet', 50, 1], ['skyr', 150], ['compote', 100]] },
    { nom: 'Cabillaud, riz, légumes', items: [['cabillaud', 150], ['rizblanc', 120, 1], ['legumes', 200], ['huileolive', 10], ['yaourt', 125]] },
    { nom: 'Haricots blancs, poulet et légumes', items: [['haricotsblancs', 150, 1], ['poulet', 80], ['legumes', 200], ['huileolive', 5], ['fb0', 150], ['pomme', 150]] },
    { nom: 'Saumon, quinoa, brocoli', items: [['saumon', 130], ['quinoa', 120, 1], ['brocoli', 200], ['huileolive', 5], ['yaourt', 125]] },
    { nom: 'Velouté et poulet froid', items: [['soupe', 300], ['poulet', 120], ['paincomplet', 50, 1], ['yaourt', 125], ['orange', 150]] },
    { nom: 'Dhal de lentilles aux légumes', items: [['lentilles', 200, 1], ['legumes', 200], ['huilecolza', 10], ['skyr', 150], ['compote', 100]] },
    { nom: 'Pâtes complètes au thon et tomate', items: [['thon', 100], ['patescompletes', 150, 1], ['tomate', 120], ['huileolive', 10], ['yaourt', 125]] },
    { nom: 'Crevettes sautées, riz complet, légumes', items: [['crevettes', 100], ['rizcomplet', 120, 1], ['legumes', 200], ['huileolive', 10], ['fb0', 100]] },
    { nom: 'Soupe, mozzarella et tomates', items: [['soupe', 300], ['mozza', 60], ['tomate', 120], ['paincomplet', 50, 1], ['skyr', 150], ['pomme', 150]] },
    { nom: 'Dinde, patate douce, haricots verts', items: [['dinde', 120], ['patatedouce', 200, 1], ['haricotsverts', 200], ['huileolive', 10]] },
    { nom: 'Tofu, quinoa, ratatouille', items: [['tofu', 120], ['quinoa', 120, 1], ['ratatouille', 200], ['fb0', 150]] },
  ],
};

// Part des calories de la journée pour chaque repas.
export const PARTS = { pdj: 0.23, dej: 0.36, col: 0.09, din: 0.32 };
