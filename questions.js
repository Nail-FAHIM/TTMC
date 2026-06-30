// =============================================================
//  TTMC - Tu Te Mets Combien ?  -  Banque de questions  (v2)
//  4 catégories : Scolaire / Plaisir / Mature / Improbable
//  + thèmes niches  + pool FINALE ("N'hésite pas à gagner")
//  + cartes DEBUT ("Hésite pas à débuter")
//
//  Échelle de difficulté :
//   1-2  : tout le monde sait
//   3-4  : la plupart des gens
//   5-6  : il faut un minimum d'intérêt pour le thème
//   7-8  : niveau passionné / amateur éclairé
//   9-10 : niveau expert, faut VRAIMENT s'y connaître
// =============================================================

const QUESTIONS = {

  // ===========================================================
  //  SCOLAIRE
  // ===========================================================
  "Scolaire": [
    {
      theme: "Les capitales du monde",
      q: {
        1:  { q: "Capitale de la France ?", a: "Paris" },
        2:  { q: "Capitale de l'Italie ?", a: "Rome" },
        3:  { q: "Capitale du Japon ?", a: "Tokyo" },
        4:  { q: "Capitale du Canada ?", a: "Ottawa" },
        5:  { q: "Capitale de l'Australie ?", a: "Canberra" },
        6:  { q: "Capitale de la Turquie ?", a: "Ankara" },
        7:  { q: "Capitale du Kazakhstan ?", a: "Astana" },
        8:  { q: "Capitale du Bhoutan ?", a: "Thimphou" },
        9:  { q: "Capitale du Suriname ?", a: "Paramaribo" },
        10: { q: "Capitale des Kiribati ?", a: "Tarawa-Sud (South Tarawa)" }
      }
    },
    {
      theme: "Histoire de France",
      q: {
        1:  { q: "Année de la prise de la Bastille ?", a: "1789" },
        2:  { q: "Roi surnommé le Roi-Soleil ?", a: "Louis XIV" },
        3:  { q: "Empereur français vaincu à Waterloo ?", a: "Napoléon Ier" },
        4:  { q: "Qui appelle à la Résistance le 18 juin 1940 ?", a: "Charles de Gaulle" },
        5:  { q: "Roi ayant signé l'Édit de Nantes en 1598 ?", a: "Henri IV" },
        6:  { q: "Ministre de Louis XIII fondateur de l'Académie française ?", a: "Richelieu" },
        7:  { q: "Quelle dynastie règne avant les Capétiens à partir de 751 ?", a: "Les Carolingiens" },
        8:  { q: "En quelle année le roi Jean II le Bon est-il fait prisonnier à Poitiers ?", a: "1356" },
        9:  { q: "Quel traité de 1259 règle les possessions anglaises en France sous Saint Louis ?", a: "Le traité de Paris" },
        10: { q: "Quel maire du palais gagne la bataille de Poitiers (Tours) en 732 ?", a: "Charles Martel" }
      }
    },
    {
      theme: "Le corps humain",
      q: {
        1:  { q: "Quel organe pompe le sang ?", a: "Le cœur" },
        2:  { q: "Plus grand organe du corps humain ?", a: "La peau" },
        3:  { q: "Combien d'os dans le corps adulte ?", a: "206" },
        4:  { q: "Quel organe produit l'insuline ?", a: "Le pancréas" },
        5:  { q: "Plus petit os du corps humain ?", a: "L'étrier" },
        6:  { q: "Os de la cuisse ?", a: "Le fémur" },
        7:  { q: "Quelle partie du cerveau régule l'équilibre et la coordination ?", a: "Le cervelet" },
        8:  { q: "Combien de chromosomes possède une cellule humaine normale ?", a: "46 (23 paires)" },
        9:  { q: "Quel nerf crânien est le plus long et innerve de nombreux organes ?", a: "Le nerf vague (pneumogastrique)" },
        10: { q: "Comment s'appellent les cellules osseuses qui détruisent le tissu osseux ?", a: "Les ostéoclastes" }
      }
    },
    {
      theme: "Le système solaire",
      q: {
        1:  { q: "Quelle est la planète rouge ?", a: "Mars" },
        2:  { q: "Plus grosse planète du système solaire ?", a: "Jupiter" },
        3:  { q: "Planète la plus proche du Soleil ?", a: "Mercure" },
        4:  { q: "Planète connue pour ses anneaux ?", a: "Saturne" },
        5:  { q: "Planète la plus éloignée du Soleil ?", a: "Neptune" },
        6:  { q: "Quelle galaxie abrite notre système solaire ?", a: "La Voie lactée" },
        7:  { q: "Quelle est la plus grosse lune de Jupiter (et du système solaire) ?", a: "Ganymède" },
        8:  { q: "Comment s'appelle la zone de petits corps glacés au-delà de Neptune ?", a: "La ceinture de Kuiper" },
        9:  { q: "Quelle lune de Saturne possède des lacs de méthane liquide ?", a: "Titan" },
        10: { q: "Quel astronome a établi les trois lois du mouvement des planètes ?", a: "Johannes Kepler" }
      }
    },
    {
      theme: "Histoire du monde",
      q: {
        1:  { q: "Quelle civilisation a bâti les pyramides de Gizeh ?", a: "Les Égyptiens" },
        2:  { q: "Année où Colomb atteint l'Amérique ?", a: "1492" },
        3:  { q: "Premier homme sur la Lune ?", a: "Neil Armstrong" },
        4:  { q: "Quel empereur mongol fonde le plus grand empire continu ?", a: "Gengis Khan" },
        5:  { q: "Année du début de la Révolution russe ?", a: "1917" },
        6:  { q: "Quels traités de 1648 mettent fin à la guerre de Trente Ans ?", a: "Les traités de Westphalie" },
        7:  { q: "Quelle ville byzantine tombe en 1453 face aux Ottomans ?", a: "Constantinople" },
        8:  { q: "Quelle bataille de 1571 stoppe l'expansion navale ottomane en Méditerranée ?", a: "La bataille de Lépante" },
        9:  { q: "Quel roi assyrien a fondé la grande bibliothèque de Ninive ?", a: "Assurbanipal" },
        10: { q: "Quel traité de 1494 partage le Nouveau Monde entre l'Espagne et le Portugal ?", a: "Le traité de Tordesillas" }
      }
    },
    {
      theme: "Français & littérature",
      q: {
        1:  { q: "Qui a écrit 'Les Misérables' ?", a: "Victor Hugo" },
        2:  { q: "Qui a écrit 'Le Petit Prince' ?", a: "Saint-Exupéry" },
        3:  { q: "Qui a écrit 'À la recherche du temps perdu' ?", a: "Marcel Proust" },
        4:  { q: "Poète auteur des 'Fleurs du mal' ?", a: "Baudelaire" },
        5:  { q: "Comment appelle-t-on une figure de style qui exagère ?", a: "L'hyperbole" },
        6:  { q: "Qui a écrit la pièce 'Le Cid' ?", a: "Pierre Corneille" },
        7:  { q: "Quel mouvement littéraire revendique Zola avec 'Germinal' ?", a: "Le naturalisme" },
        8:  { q: "Comment appelle-t-on un vers de douze syllabes ?", a: "Un alexandrin" },
        9:  { q: "Quel écrivain a cofondé l'OuLiPo avec Raymond Queneau ?", a: "François Le Lionnais" },
        10: { q: "Comment appelle-t-on la reprise d'un mot en fin et début de vers successifs ?", a: "L'anadiplose" }
      }
    },
    // ---- niche ----
    {
      theme: "Le tableau périodique (niche)",
      q: {
        1:  { q: "Quel gaz respirons-nous pour vivre ?", a: "L'oxygène" },
        2:  { q: "Symbole chimique de l'eau ?", a: "H2O" },
        3:  { q: "Quel métal précieux a pour symbole 'Au' ?", a: "L'or" },
        4:  { q: "Quel gaz fait flotter les ballons et rend la voix aiguë ?", a: "L'hélium" },
        5:  { q: "Symbole chimique du sodium ?", a: "Na" },
        6:  { q: "Quel est l'élément le plus léger du tableau ?", a: "L'hydrogène" },
        7:  { q: "Quel élément a pour symbole 'W' ?", a: "Le tungstène" },
        8:  { q: "Quel scientifique a conçu la première version du tableau périodique ?", a: "Dmitri Mendeleïev" },
        9:  { q: "Quel élément liquide à température ambiante a pour symbole 'Hg' ?", a: "Le mercure" },
        10: { q: "Quel élément 118, le plus lourd connu, porte le nom d'un physicien russe ?", a: "L'oganesson" }
      }
    },
    {
      theme: "Étymologie & racines (niche)",
      q: {
        1:  { q: "De quelles langues anciennes vient surtout le vocabulaire scientifique ?", a: "Le grec et le latin" },
        2:  { q: "Que signifie le préfixe 'bio-' ?", a: "La vie" },
        3:  { q: "Que signifie 'aqua' en latin ?", a: "L'eau" },
        4:  { q: "Que veut dire le préfixe 'géo-' ?", a: "La Terre" },
        5:  { q: "Que signifie 'philo' dans 'philosophie' ?", a: "Aimer / l'amour" },
        6:  { q: "Que veut dire la racine grecque 'chronos' ?", a: "Le temps" },
        7:  { q: "Que signifie le suffixe '-cide' (homicide, pesticide) ?", a: "Tuer" },
        8:  { q: "De quel mot latin vient 'salaire' ?", a: "Sal (le sel)" },
        9:  { q: "Que signifie la racine grecque 'pathos' (sympathie, pathologie) ?", a: "La souffrance / l'émotion" },
        10: { q: "Le mot 'utopie' vient du grec : que signifie littéralement le 'ou' initial ?", a: "Non / sans (le 'non-lieu')" }
      }
    }
  ],

  // ===========================================================
  //  PLAISIR
  // ===========================================================
  "Plaisir": [
    {
      theme: "Football",
      q: {
        1:  { q: "Combien de joueurs par équipe sur le terrain ?", a: "11" },
        2:  { q: "Pays vainqueur de la Coupe du monde 2018 ?", a: "La France" },
        3:  { q: "Joueur surnommé 'la Pulga' ?", a: "Lionel Messi" },
        4:  { q: "Pays vainqueur de la Coupe du monde 2022 ?", a: "L'Argentine" },
        5:  { q: "Club détenant le record de Ligues des Champions ?", a: "Le Real Madrid" },
        6:  { q: "Qui a marqué la 'Main de Dieu' en 1986 ?", a: "Diego Maradona" },
        7:  { q: "Quel club allemand est surnommé le BVB ?", a: "Le Borussia Dortmund" },
        8:  { q: "Quel joueur détient le record de buts en une année civile (2012) ?", a: "Lionel Messi (91 buts)" },
        9:  { q: "Quel gardien soviétique reste le seul à avoir gagné le Ballon d'Or ?", a: "Lev Yachine" },
        10: { q: "Quel club uruguayen a remporté la première Coupe intercontinentale en 1960 ?", a: "Peñarol" }
      }
    },
    {
      theme: "Jeux vidéo",
      q: {
        1:  { q: "Plombier moustachu mascotte de Nintendo ?", a: "Mario" },
        2:  { q: "Jeu où l'on construit tout avec des cubes ?", a: "Minecraft" },
        3:  { q: "Hérisson bleu de SEGA ?", a: "Sonic" },
        4:  { q: "FPS tactique d'Ubisoft en 5v5 avec des opérateurs ?", a: "Rainbow Six Siege" },
        5:  { q: "Studio derrière 'The Witcher 3' ?", a: "CD Projekt Red" },
        6:  { q: "Jeu vidéo le plus vendu de tous les temps ?", a: "Minecraft" },
        7:  { q: "Quel opérateur de R6 Siege ouvre les murs renforcés avec ses charges thermiques ?", a: "Thermite (ou Hibana/Maverick)" },
        8:  { q: "Quel studio japonais a créé la série 'Dark Souls' ?", a: "FromSoftware" },
        9:  { q: "Quel jeu d'arcade de 1971 est le premier commercialisé de l'histoire ?", a: "Computer Space" },
        10: { q: "Quel programmeur a codé les moteurs de 'Doom' et 'Quake' chez id Software ?", a: "John Carmack" }
      }
    },
    {
      theme: "Cuisine et recettes",
      q: {
        1:  { q: "De quel pays vient la pizza ?", a: "L'Italie" },
        2:  { q: "Quel fromage italien dur met-on sur les pâtes ?", a: "Le parmesan" },
        3:  { q: "Sauce italienne basilic/pignons/parmesan ?", a: "Le pesto" },
        4:  { q: "Ingrédient secret d'une vraie carbonara (pas de crème) ?", a: "Le jaune d'œuf" },
        5:  { q: "Comment appelle-t-on un œuf cuit lentement à basse température ?", a: "L'œuf parfait / basse température" },
        6:  { q: "Quelle 'sauce mère' se fait avec un roux blanc et du lait ?", a: "La béchamel" },
        7:  { q: "Comment appelle-t-on une sauce chaude liée par jaunes et beurre (type hollandaise) ?", a: "Une sauce émulsionnée" },
        8:  { q: "Qu'est-ce qui fait gonfler un soufflé ?", a: "Les blancs en neige (l'air)" },
        9:  { q: "Quelle réaction chimique donne le goût grillé d'une viande saisie ?", a: "La réaction de Maillard" },
        10: { q: "Quelle technique japonaise abat un poisson par le système nerveux pour la qualité de la chair ?", a: "L'ikejime" }
      }
    },
    {
      theme: "Séries TV",
      q: {
        1:  { q: "Série d'amis autour du Central Perk à New York ?", a: "Friends" },
        2:  { q: "Série du braquage en combinaisons rouges ?", a: "La Casa de Papel" },
        3:  { q: "Prof de chimie devenu baron de la drogue ?", a: "Breaking Bad (Walter White)" },
        4:  { q: "Série coréenne du jeu mortel pour de l'argent ?", a: "Squid Game" },
        5:  { q: "Mini-série HBO sur la catastrophe de 1986 ?", a: "Chernobyl" },
        6:  { q: "Spin-off centré sur l'avocat Saul Goodman ?", a: "Better Call Saul" },
        7:  { q: "Quelle série suit l'agence pub de Don Draper dans les sixties ?", a: "Mad Men" },
        8:  { q: "Quel showrunner est derrière 'The Wire' ?", a: "David Simon" },
        9:  { q: "Quelle série danoise sur le pouvoir a popularisé le 'Nordic noir' politique ?", a: "Borgen" },
        10: { q: "Quelle série de 1990 de David Lynch demande 'Qui a tué Laura Palmer ?' ?", a: "Twin Peaks" }
      }
    },
    {
      theme: "Musique pop / rock",
      q: {
        1:  { q: "Surnom de Michael Jackson ?", a: "Le King of Pop" },
        2:  { q: "Groupe de Liverpool : John, Paul, George, Ringo ?", a: "Les Beatles" },
        3:  { q: "Groupe de 'Bohemian Rhapsody' ?", a: "Queen" },
        4:  { q: "Album de Taylor Swift nommé d'après une année ?", a: "1989" },
        5:  { q: "Rappeur de 'good kid, m.A.A.d city' ?", a: "Kendrick Lamar" },
        6:  { q: "Groupe de 'The Dark Side of the Moon' ?", a: "Pink Floyd" },
        7:  { q: "Quel producteur a façonné le 'Wall of Sound' dans les années 60 ?", a: "Phil Spector" },
        8:  { q: "Quel album des Beach Boys de 1966 a révolutionné la production pop ?", a: "Pet Sounds" },
        9:  { q: "Quel producteur est surnommé le 'cinquième Beatle' pour son travail en studio ?", a: "George Martin" },
        10: { q: "Quel groupe allemand pionnier de l'électronique a sorti 'Autobahn' en 1974 ?", a: "Kraftwerk" }
      }
    },
    {
      theme: "Cinéma grand public",
      q: {
        1:  { q: "Archéologue au chapeau et au fouet ?", a: "Indiana Jones" },
        2:  { q: "Sorcier à lunettes étudiant à Poudlard ?", a: "Harry Potter" },
        3:  { q: "Film de James Cameron qui coule un paquebot en 1997 ?", a: "Titanic" },
        4:  { q: "Film où DiCaprio entre dans les rêves ?", a: "Inception" },
        5:  { q: "Film de Bong Joon-ho, Oscar 2020 ?", a: "Parasite" },
        6:  { q: "Film le plus rentable de tous les temps au box-office ?", a: "Avatar" },
        7:  { q: "Quel acteur a joué le Joker et obtenu un Oscar posthume ?", a: "Heath Ledger" },
        8:  { q: "Quel long-métrage d'animation de Disney est le premier de l'histoire (1937) ?", a: "Blanche-Neige et les Sept Nains" },
        9:  { q: "Quel chef opérateur a gagné 3 Oscars d'affilée (Gravity, Birdman, Revenant) ?", a: "Emmanuel Lubezki" },
        10: { q: "Quel film de 1927 est considéré comme le premier 'parlant' ?", a: "Le Chanteur de jazz" }
      }
    },
    // ---- niche ----
    {
      theme: "Manga & anime (niche)",
      q: {
        1:  { q: "Quel ninja blond rêve de devenir Hokage ?", a: "Naruto" },
        2:  { q: "Quel pirate au chapeau de paille cherche le One Piece ?", a: "Luffy" },
        3:  { q: "Comment appelle-t-on l'animation japonaise ?", a: "L'anime / les animés" },
        4:  { q: "Quel manga oppose des humains à des géants mangeurs d'hommes ?", a: "L'Attaque des Titans" },
        5:  { q: "Quel mangaka a créé 'Dragon Ball' ?", a: "Akira Toriyama" },
        6:  { q: "Quel studio a réalisé 'Le Voyage de Chihiro' ?", a: "Le studio Ghibli" },
        7:  { q: "Quel réalisateur a cofondé Ghibli avec Miyazaki ?", a: "Isao Takahata" },
        8:  { q: "Quel manga parle d'un carnet qui tue ceux dont on écrit le nom ?", a: "Death Note" },
        9:  { q: "Quel mangaka des années 80 est l'auteur d''Akira' ?", a: "Katsuhiro Otomo" },
        10: { q: "Dans quel célèbre magazine de prépublication paraît 'One Piece' ?", a: "Le Weekly Shōnen Jump" }
      }
    },
    {
      theme: "Échecs (niche)",
      q: {
        1:  { q: "Combien de cases compte un échiquier ?", a: "64" },
        2:  { q: "Quelle pièce se déplace en 'L' ?", a: "Le cavalier" },
        3:  { q: "Comment gagne-t-on une partie d'échecs ?", a: "Par échec et mat" },
        4:  { q: "Quelle est la pièce la plus puissante ?", a: "La dame (la reine)" },
        5:  { q: "Comment appelle-t-on le coup spécial roi + tour ?", a: "Le roque" },
        6:  { q: "Quel prodige norvégien fut champion du monde de 2013 à 2023 ?", a: "Magnus Carlsen" },
        7:  { q: "Comment appelle-t-on une partie nulle (par pat ou répétition) ?", a: "Une nulle / remise" },
        8:  { q: "Quel champion américain a battu Spassky en 1972 ?", a: "Bobby Fischer" },
        9:  { q: "Quel ordinateur d'IBM a battu Kasparov en 1997 ?", a: "Deep Blue" },
        10: { q: "Comment appelle-t-on l'ouverture 1.e4 c5 ?", a: "La défense sicilienne" }
      }
    }
  ],

  // ===========================================================
  //  MATURE
  // ===========================================================
  "Mature": [
    {
      theme: "Cinéma culte",
      q: {
        1:  { q: "Film de 'Que la Force soit avec toi' ?", a: "Star Wars" },
        2:  { q: "Réalisateur connu pour ses caméos dans ses thrillers ?", a: "Alfred Hitchcock" },
        3:  { q: "Film de Coppola sur la famille Corleone ?", a: "Le Parrain" },
        4:  { q: "Acteur de Travis Bickle dans 'Taxi Driver' ?", a: "Robert De Niro" },
        5:  { q: "Film de 1941 d'Orson Welles souvent cité comme le meilleur ?", a: "Citizen Kane" },
        6:  { q: "Cinéaste japonais des 'Sept Samouraïs' ?", a: "Akira Kurosawa" },
        7:  { q: "Quel film de Tarkovski de 1979 se déroule dans la 'Zone' ?", a: "Stalker" },
        8:  { q: "Quel réalisateur hongrois a tourné 'Sátántangó', film de plus de 7 heures ?", a: "Béla Tarr" },
        9:  { q: "Quel chef opérateur fétiche de Bergman a signé la lumière de ses films ?", a: "Sven Nykvist" },
        10: { q: "Quel film de 1929 de Buñuel et Dalí s'ouvre sur un œil tranché ?", a: "Un chien andalou" }
      }
    },
    {
      theme: "Histoire de l'art",
      q: {
        1:  { q: "Qui a peint la Joconde ?", a: "Léonard de Vinci" },
        2:  { q: "Peintre néerlandais qui s'est coupé l'oreille ?", a: "Vincent van Gogh" },
        3:  { q: "Qui a peint le plafond de la chapelle Sixtine ?", a: "Michel-Ange" },
        4:  { q: "Mouvement de Monet, Renoir et Degas ?", a: "L'impressionnisme" },
        5:  { q: "Sculpteur du 'Penseur' ?", a: "Auguste Rodin" },
        6:  { q: "Peintre de 'Las Meninas' ?", a: "Diego Vélasquez" },
        7:  { q: "Quelle technique de fondu Léonard de Vinci a-t-il perfectionnée ?", a: "Le sfumato" },
        8:  { q: "Quel mouvement russe d'avant-garde compte Malevitch et son 'Carré noir' ?", a: "Le suprématisme" },
        9:  { q: "Quel peintre flamand du XVe a peint 'Les Époux Arnolfini' ?", a: "Jan van Eyck" },
        10: { q: "Comment nomme-t-on la technique de Caravage opposant violemment ombre et lumière ?", a: "Le clair-obscur (ténébrisme)" }
      }
    },
    {
      theme: "Géopolitique",
      q: {
        1:  { q: "Combien de membres permanents au Conseil de sécurité de l'ONU ?", a: "5" },
        2:  { q: "Pays ayant quitté l'UE en 2020 ?", a: "Le Royaume-Uni" },
        3:  { q: "Ville accueillant le siège de l'UE ?", a: "Bruxelles" },
        4:  { q: "Pays le plus peuplé du monde en 2024 ?", a: "L'Inde" },
        5:  { q: "Plus petit État du monde ?", a: "Le Vatican" },
        6:  { q: "Détroit séparant l'Europe de l'Asie à Istanbul ?", a: "Le Bosphore" },
        7:  { q: "Quelle organisation regroupe les grands pays pétroliers exportateurs ?", a: "L'OPEP" },
        8:  { q: "Quel territoire himalayen est divisé entre l'Inde, le Pakistan et la Chine ?", a: "Le Cachemire" },
        9:  { q: "Quel pays africain est entièrement enclavé dans l'Afrique du Sud ?", a: "Le Lesotho" },
        10: { q: "Quel accord secret de 1916 a partagé le Moyen-Orient entre France et Royaume-Uni ?", a: "Les accords Sykes-Picot" }
      }
    },
    {
      theme: "Mythologie",
      q: {
        1:  { q: "Roi des dieux grecs ?", a: "Zeus" },
        2:  { q: "Demi-dieu grec aux douze travaux ?", a: "Héraclès (Hercule)" },
        3:  { q: "Dieu nordique au marteau Mjölnir ?", a: "Thor" },
        4:  { q: "Personnage condamné à pousser un rocher éternellement ?", a: "Sisyphe" },
        5:  { q: "Dieu égyptien à tête de chacal de la momification ?", a: "Anubis" },
        6:  { q: "Fleuve des Enfers que traversent les morts ?", a: "Le Styx" },
        7:  { q: "Quel titan a volé le feu aux dieux pour les hommes ?", a: "Prométhée" },
        8:  { q: "Quel chien à trois têtes garde l'entrée des Enfers grecs ?", a: "Cerbère" },
        9:  { q: "Comment s'appelle le serpent géant qui entoure le monde dans le mythe nordique ?", a: "Jörmungandr" },
        10: { q: "Dans la mythologie mésopotamienne, quel roi-héros cherche l'immortalité ?", a: "Gilgamesh" }
      }
    },
    {
      theme: "Vins et gastronomie",
      q: {
        1:  { q: "De quel fruit fait-on le vin ?", a: "Le raisin" },
        2:  { q: "Région française du champagne ?", a: "La Champagne" },
        3:  { q: "Spécialiste du vin au restaurant ?", a: "Le sommelier" },
        4:  { q: "Cépage rouge phare de Bordeaux avec le Merlot ?", a: "Le Cabernet Sauvignon" },
        5:  { q: "Cépage blanc du Sancerre ?", a: "Le Sauvignon blanc" },
        6:  { q: "Appellation bourguignonne mythique et hors de prix ?", a: "La Romanée-Conti" },
        7:  { q: "Quel cépage unique compose un Chablis ?", a: "Le Chardonnay" },
        8:  { q: "Comment appelle-t-on le fait de transvaser un vin pour l'aérer ?", a: "Le carafage / décantation" },
        9:  { q: "Quel champignon de 'pourriture noble' donne les Sauternes ?", a: "Le Botrytis cinerea" },
        10: { q: "Comment nomme-t-on les terroirs délimités classés de Bourgogne (Grand Cru, etc.) ?", a: "Les climats" }
      }
    },
    {
      theme: "Inventions et sciences",
      q: {
        1:  { q: "Scientifique de E = mc² ?", a: "Albert Einstein" },
        2:  { q: "Scientifique ayant découvert le radium ?", a: "Marie Curie" },
        3:  { q: "Savant ayant découvert la pénicilline ?", a: "Alexander Fleming" },
        4:  { q: "Métal liquide à température ambiante ?", a: "Le mercure" },
        5:  { q: "Physicien de la gravitation universelle (la pomme) ?", a: "Isaac Newton" },
        6:  { q: "Physicien du principe d'incertitude ?", a: "Werner Heisenberg" },
        7:  { q: "Quel duo a décrit la double hélice de l'ADN en 1953 ?", a: "Watson et Crick" },
        8:  { q: "Quelle scientifique a contribué à l'ADN par cristallographie (cliché 51) ?", a: "Rosalind Franklin" },
        9:  { q: "Quel mathématicien a posé les bases de l'informatique et cassé Enigma ?", a: "Alan Turing" },
        10: { q: "Quel physicien autrichien a imaginé un paradoxe avec un chat dans une boîte ?", a: "Erwin Schrödinger" }
      }
    },
    // ---- niche ----
    {
      theme: "Philosophie (niche)",
      q: {
        1:  { q: "Quel philosophe grec a bu la ciguë, maître de Platon ?", a: "Socrate" },
        2:  { q: "Qui a écrit 'Je pense donc je suis' ?", a: "Descartes" },
        3:  { q: "Quel philosophe allemand a écrit 'Ainsi parlait Zarathoustra' ?", a: "Nietzsche" },
        4:  { q: "Quel courant prône le bonheur par le plaisir mesuré (d'après Épicure) ?", a: "L'épicurisme" },
        5:  { q: "Quel philosophe a écrit 'L'Être et le Néant' ?", a: "Jean-Paul Sartre" },
        6:  { q: "Quel penseur a écrit 'Du contrat social' en 1762 ?", a: "Jean-Jacques Rousseau" },
        7:  { q: "Quel philosophe a écrit la 'Critique de la raison pure' ?", a: "Emmanuel Kant" },
        8:  { q: "Chez Hegel, thèse et antithèse débouchent sur quoi ?", a: "La synthèse (dialectique)" },
        9:  { q: "Quel philosophe danois est considéré comme le père de l'existentialisme ?", a: "Søren Kierkegaard" },
        10: { q: "Quel philosophe autrichien a écrit le 'Tractatus logico-philosophicus' ?", a: "Ludwig Wittgenstein" }
      }
    },
    {
      theme: "Jazz (niche)",
      q: {
        1:  { q: "Quel instrument à anche est emblématique du jazz ?", a: "Le saxophone" },
        2:  { q: "Quel trompettiste a chanté 'What a Wonderful World' ?", a: "Louis Armstrong" },
        3:  { q: "Quelle ville américaine est le berceau du jazz ?", a: "La Nouvelle-Orléans" },
        4:  { q: "Quel album de Miles Davis de 1959 est le jazz le plus vendu ?", a: "Kind of Blue" },
        5:  { q: "Quel style de jazz rapide est associé à Charlie Parker ?", a: "Le bebop" },
        6:  { q: "Quel pianiste excentrique a composé 'Round Midnight' ?", a: "Thelonious Monk" },
        7:  { q: "Quel saxophoniste a enregistré 'A Love Supreme' ?", a: "John Coltrane" },
        8:  { q: "Quelle chanteuse surnommée 'Lady Day' a chanté 'Strange Fruit' ?", a: "Billie Holiday" },
        9:  { q: "Quel contrebassiste et compositeur a signé 'Mingus Ah Um' ?", a: "Charles Mingus" },
        10: { q: "Quel saxophoniste a sorti l'album fondateur du free jazz, justement nommé 'Free Jazz' (1960) ?", a: "Ornette Coleman" }
      }
    }
  ],

  // ===========================================================
  //  IMPROBABLE
  // ===========================================================
  "Improbable": [
    {
      theme: "Les chats",
      q: {
        1:  { q: "Quel son fait un chat content ?", a: "Il ronronne" },
        2:  { q: "Comment appelle-t-on un bébé chat ?", a: "Un chaton" },
        3:  { q: "Combien d'heures par jour dort un chat environ ?", a: "Environ 15-16 h" },
        4:  { q: "Comment appelle-t-on les moustaches du chat ?", a: "Les vibrisses" },
        5:  { q: "Quelle race de chat est sans poils ?", a: "Le Sphynx" },
        6:  { q: "Pourquoi le chat ne sent-il pas le goût sucré ?", a: "Il n'a pas de récepteurs au sucré" },
        7:  { q: "Combien de griffes possède un chat sur une patte avant ?", a: "5" },
        8:  { q: "Quelle race de chat domestique est reconnue comme la plus grande ?", a: "Le Maine Coon" },
        9:  { q: "Comment appelle-t-on le repli de peau qui pend sous le ventre du chat ?", a: "La poche primordiale" },
        10: { q: "Quel organe situé dans le palais permet au chat de 'goûter' les odeurs (flehmen) ?", a: "L'organe de Jacobson (voméronasal)" }
      }
    },
    {
      theme: "Records du monde",
      q: {
        1:  { q: "Plus grand animal de tous les temps ?", a: "La baleine bleue" },
        2:  { q: "Plus haute montagne du monde ?", a: "L'Everest" },
        3:  { q: "Bâtiment le plus haut du monde ?", a: "Le Burj Khalifa" },
        4:  { q: "Endroit le plus profond des océans ?", a: "La fosse des Mariannes" },
        5:  { q: "Désert le plus froid du monde ?", a: "L'Antarctique" },
        6:  { q: "Quel champignon de l'Oregon est l'organisme vivant le plus grand ?", a: "L'Armillaria" },
        7:  { q: "Quelle créature minuscule peut être biologiquement immortelle ?", a: "La méduse Turritopsis dohrnii" },
        8:  { q: "Quel est l'endroit habité le plus sec du monde ?", a: "Le désert d'Atacama" },
        9:  { q: "Comment s'appelle l'arbre vivant le plus vieux du monde (pin Bristlecone) ?", a: "Mathusalem (Methuselah)" },
        10: { q: "Quelle station détient le record de la température la plus basse mesurée sur Terre ?", a: "La station Vostok (Antarctique)" }
      }
    },
    {
      theme: "Animaux étranges",
      q: {
        1:  { q: "Quel animal change de couleur pour se camoufler ?", a: "Le caméléon" },
        2:  { q: "Quel mammifère pond des œufs avec un bec de canard ?", a: "L'ornithorynque" },
        3:  { q: "Combien de cœurs a une pieuvre ?", a: "3" },
        4:  { q: "De quelle couleur est le sang d'une pieuvre ?", a: "Bleu" },
        5:  { q: "Quel poisson change de sexe au cours de sa vie (comme Nemo) ?", a: "Le poisson-clown" },
        6:  { q: "Quel animal survit dans le vide spatial et à des conditions extrêmes ?", a: "Le tardigrade" },
        7:  { q: "Quel mammifère fouisseur africain ne ressent quasiment pas la douleur et vieillit très peu ?", a: "Le rat-taupe nu" },
        8:  { q: "Quel crustacé frappe assez fort pour briser une vitre d'aquarium ?", a: "La crevette-mante (squille)" },
        9:  { q: "Quel oiseau de Nouvelle-Guinée est l'un des rares connus pour être toxique au toucher ?", a: "Le pitohui" },
        10: { q: "Quel ver marin prédateur géant est surnommé 'ver Bobbit' ?", a: "L'Eunice aphroditois" }
      }
    },
    {
      theme: "Aliments bizarres",
      q: {
        1:  { q: "Quel aliment ne périme (quasiment) jamais ?", a: "Le miel" },
        2:  { q: "Quel fruit asiatique pue au point d'être interdit dans le métro ?", a: "Le durian" },
        3:  { q: "Quel poisson japonais peut être mortel s'il est mal préparé ?", a: "Le fugu" },
        4:  { q: "Quel café est issu d'excréments de civette ?", a: "Le kopi luwak" },
        5:  { q: "Quel requin fermenté est un plat islandais ?", a: "Le hákarl" },
        6:  { q: "Quelle est l'épice la plus chère du monde au poids ?", a: "Le safran" },
        7:  { q: "Quel fromage sarde contient des asticots vivants (interdit) ?", a: "Le casu marzu" },
        8:  { q: "Quel œuf de cane à embryon, fermenté, est mangé aux Philippines ?", a: "Le balut" },
        9:  { q: "Quel petit oiseau était jadis mangé entier sous une serviette en France (aujourd'hui interdit) ?", a: "L'ortolan" },
        10: { q: "Quelle racine tropicale doit être détoxifiée car, crue, elle libère du cyanure ?", a: "Le manioc amer" }
      }
    },
    {
      theme: "Expressions françaises",
      q: {
        1:  { q: "Que veut dire 'tomber dans les pommes' ?", a: "S'évanouir" },
        2:  { q: "Que veut dire 'poser un lapin' ?", a: "Ne pas venir à un rendez-vous" },
        3:  { q: "Que veut dire 'avoir un poil dans la main' ?", a: "Être très paresseux" },
        4:  { q: "Que veut dire 'donner sa langue au chat' ?", a: "Renoncer à deviner" },
        5:  { q: "Que signifie 'l'habit ne fait pas le moine' ?", a: "Ne pas se fier aux apparences" },
        6:  { q: "Que veut dire 'rouler quelqu'un dans la farine' ?", a: "Le tromper / l'arnaquer" },
        7:  { q: "Que signifie 'payer en monnaie de singe' ?", a: "Payer avec des promesses / du vent" },
        8:  { q: "Que désigne à l'origine 'un travail de Romain' ?", a: "Un travail long et colossal" },
        9:  { q: "L'expression 'ne pas être dans son assiette' vient du sens ancien de 'assiette' : lequel ?", a: "La position / la posture (équilibre)" },
        10: { q: "Que signifiait à l'origine 'tirer les marrons du feu' (fable de La Fontaine) ?", a: "Agir/prendre des risques au profit d'un autre" }
      }
    },
    {
      theme: "Le sommeil et les rêves",
      q: {
        1:  { q: "Comment appelle-t-on un mauvais rêve ?", a: "Un cauchemar" },
        2:  { q: "Comment appelle-t-on le fait de marcher en dormant ?", a: "Le somnambulisme" },
        3:  { q: "Quelle hormone favorise l'endormissement la nuit ?", a: "La mélatonine" },
        4:  { q: "Comment appelle-t-on un rêve où on sait qu'on rêve ?", a: "Un rêve lucide" },
        5:  { q: "Quelle phase de sommeil est associée aux rêves intenses ?", a: "Le sommeil paradoxal (REM)" },
        6:  { q: "Comment appelle-t-on l'incapacité à bouger au réveil ?", a: "La paralysie du sommeil" },
        7:  { q: "Quel trouble provoque des endormissements soudains en journée ?", a: "La narcolepsie" },
        8:  { q: "Comment appelle-t-on la secousse musculaire au moment de s'endormir ?", a: "Le sursaut hypnique" },
        9:  { q: "Quelle structure du cerveau règle notre horloge biologique (rythme circadien) ?", a: "Le noyau suprachiasmatique" },
        10: { q: "Comment nomme-t-on les hallucinations qui surviennent juste à l'endormissement ?", a: "Les hallucinations hypnagogiques" }
      }
    },
    // ---- niche ----
    {
      theme: "Cryptozoologie (niche)",
      q: {
        1:  { q: "Quel monstre vivrait dans un lac écossais ?", a: "Le monstre du Loch Ness" },
        2:  { q: "Quel primate géant vivrait dans les forêts d'Amérique du Nord ?", a: "Le Bigfoot (Sasquatch)" },
        3:  { q: "Quel 'homme des neiges' vivrait dans l'Himalaya ?", a: "Le Yéti" },
        4:  { q: "Quelle créature s'attaquerait au bétail en Amérique latine (suceur de chèvres) ?", a: "Le Chupacabra" },
        5:  { q: "Comment appelle-t-on l'étude des animaux 'cachés' ou non prouvés ?", a: "La cryptozoologie" },
        6:  { q: "Quelle créature ailée hanterait la Virginie-Occidentale ?", a: "Le Mothman" },
        7:  { q: "Quel surnom porte le monstre du Loch Ness ?", a: "Nessie" },
        8:  { q: "Quel marsupial australien, qu'on croyait éteint, est parfois 'aperçu' (tigre de Tasmanie) ?", a: "Le thylacine" },
        9:  { q: "Quel poisson préhistorique 'fossile vivant' a été redécouvert vivant en 1938 ?", a: "Le cœlacanthe" },
        10: { q: "Quel cryptide congolais, sorte de dinosaure, serait caché dans les marais ?", a: "Le Mokélé-mbembé" }
      }
    },
    {
      theme: "Drapeaux & vexillologie (niche)",
      q: {
        1:  { q: "Quelles sont les trois couleurs du drapeau français ?", a: "Bleu, blanc, rouge" },
        2:  { q: "Quel pays a une feuille d'érable rouge sur son drapeau ?", a: "Le Canada" },
        3:  { q: "Quel pays a un soleil rouge sur fond blanc ?", a: "Le Japon" },
        4:  { q: "Comment appelle-t-on l'étude des drapeaux ?", a: "La vexillologie" },
        5:  { q: "Quel pays a un cèdre vert au centre de son drapeau ?", a: "Le Liban" },
        6:  { q: "Quel est le seul pays au drapeau non rectangulaire ?", a: "Le Népal" },
        7:  { q: "Quel pays a un dragon sur son drapeau national ?", a: "Le Bhoutan" },
        8:  { q: "Quel pays africain a une mitraillette (AK-47) sur son drapeau ?", a: "Le Mozambique" },
        9:  { q: "Le drapeau de Monaco est quasi identique à celui de quel pays asiatique ?", a: "L'Indonésie" },
        10: { q: "Le drapeau de la Pologne est l'inverse de celui de quel pays (blanc/rouge vs rouge/blanc) ?", a: "L'Indonésie / Monaco" }
      }
    }
  ]
};

// ===========================================================
//  POOL FINALE  -  "N'hésite pas à gagner"
//  Posées UNIQUEMENT pour valider la victoire une fois la
//  dernière case atteinte. Niveau corsé mais fun.
// ===========================================================
const QUESTIONS_FINALE = [
  { q: "Cite 3 des 7 merveilles du monde antique.", a: "Pyramide de Khéops, jardins de Babylone, phare d'Alexandrie, colosse de Rhodes, temple d'Artémis, statue de Zeus, mausolée d'Halicarnasse (3 suffisent)" },
  { q: "Quel est le seul nombre premier pair ?", a: "2" },
  { q: "Dans quel pays se trouve la cité antique de Petra ?", a: "La Jordanie" },
  { q: "Quel est l'élément chimique le plus abondant dans l'univers ?", a: "L'hydrogène" },
  { q: "Quelle est la capitale de l'Australie (PAS Sydney) ?", a: "Canberra" },
  { q: "Quel compositeur, devenu sourd, a écrit la 9e symphonie ?", a: "Beethoven" },
  { q: "Quel détroit sépare le Maroc de l'Espagne ?", a: "Le détroit de Gibraltar" },
  { q: "Cite les 3 états classiques de la matière.", a: "Solide, liquide, gazeux" },
  { q: "Quel philosophe a écrit 'Du contrat social' ?", a: "Jean-Jacques Rousseau" },
  { q: "Quelle planète abrite Olympus Mons, plus haute montagne du système solaire ?", a: "Mars" },
  { q: "Quel pays a inventé le papier, la boussole et la poudre à canon ?", a: "La Chine" },
  { q: "Quelle est la langue officielle du Brésil ?", a: "Le portugais" },
  { q: "Quel artiste a peint 'La Nuit étoilée' ?", a: "Vincent van Gogh" },
  { q: "Quel océan est le plus grand et le plus profond du monde ?", a: "L'océan Pacifique" },
  { q: "Quel mathématicien grec a donné son nom au théorème du triangle rectangle ?", a: "Pythagore" },
  { q: "Quelle est la monnaie du Japon ?", a: "Le yen" },
  { q: "Quel réalisateur a fait 'Pulp Fiction' et 'Kill Bill' ?", a: "Quentin Tarantino" },
  { q: "Quel empereur français est mort en exil à Sainte-Hélène ?", a: "Napoléon Ier" },
  { q: "Cite 3 des couleurs de l'arc-en-ciel.", a: "Rouge, orange, jaune, vert, bleu, indigo, violet (3 suffisent)" },
  { q: "Quel gaz, de formule CO2, est un gaz à effet de serre majeur ?", a: "Le dioxyde de carbone" },
  { q: "Combien de joueurs compose une équipe de basket sur le terrain ?", a: "5" },
  { q: "Quel scientifique a énoncé la loi de la gravitation universelle ?", a: "Isaac Newton" },
  { q: "Quel fleuve traverse Le Caire et l'Égypte ?", a: "Le Nil" },
  { q: "Quel peintre espagnol a cofondé le cubisme ?", a: "Pablo Picasso" }
];

// ===========================================================
//  CARTES DEBUT  -  "Hésite pas à débuter"
//  Tirée en début de partie pour désigner l'équipe qui commence.
// ===========================================================
const QUESTIONS_DEBUT = [
  "L'équipe dont un membre a la pointure la plus grande commence.",
  "L'équipe avec la personne la plus jeune commence.",
  "L'équipe avec la personne réveillée le plus tôt ce matin commence.",
  "L'équipe dont un membre a le prénom le plus long (en lettres) commence.",
  "L'équipe avec la personne dont l'anniversaire est le plus proche commence.",
  "L'équipe dont un membre a bu le plus de cafés aujourd'hui commence.",
  "L'équipe avec la personne aux cheveux les plus longs commence.",
  "L'équipe dont un membre habite le plus loin d'ici commence.",
  "L'équipe qui a trouvé son nom d'équipe le plus vite commence.",
  "L'équipe avec la personne née le plus au sud commence."
];

// Expose en global
if (typeof window !== "undefined") {
  window.QUESTIONS = QUESTIONS;
  window.QUESTIONS_FINALE = QUESTIONS_FINALE;
  window.QUESTIONS_DEBUT = QUESTIONS_DEBUT;
}
