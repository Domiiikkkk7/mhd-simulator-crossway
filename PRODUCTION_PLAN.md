// ============================================
// MHD SIMULÁTOR – PRODUKČNÍ PLÁN + HERNI ENGINE
// ============================================

// Tento soubor obsahuje nejdůležitější plán rozšíření a připravený základ pro další vývoj.
// Slouží jako dokumentace pro projekt a dále se z něj může vygenerovat finální patch.

const productionPlan = {
  phase1: {
    name: 'Základní simulátor jízdy',
    done: true,
    features: [
      'Canvas rendering a městská mapa',
      'Bus pohyb, akcelerace, brzda a rotace',
      'Zastávky a základní nástup/výstup cestujících',
      'Semafory a penalizace za červenou',
      'AI ostatní vozidla',
      'HUD a statistiky',
      'Mise a skóre',
      'Rozšířený vozový park Karosa + Iveco'
    ]
  },
  phase2: {
    name: 'Rozšířená mapa a realismus',
    done: false,
    features: [
      'Širší město s více trasami, směry a provozní sítí',
      'Víc zastávek a výchozí/koncová stanoviště',
      'Pravidelný provoz MHD podle linky',
      'Semafory na hlavních křižovatkách a zpoždění',
      'Rozdělení do center / sídliště / nádraží / obchodní zóna',
      'Vce vrstvy prostředí – budovy, park, silnice, zastávky'
    ]
  },
  phase3: {
    name: 'Vozový park a typy autobusů',
    done: false,
    features: [
      'Karosa B 732.1661',
      'Karosa B 732.40',
      'Karosa B 731.1653',
      'Karosa B 732.1660',
      'Karosa B 732.1662',
      'Karosa B 731.1663',
      'Karosa B 732.1670',
      'Karosa B 941.1930',
      'Karosa C 744.24 / B 741.1910',
      'Karosa B 831',
      'Karosa B 731.1669',
      'Karosa B 731.1659',
      'Karosa B 932.1672',
      'Karosa B 932.1678',
      'Karosa B 931.1675',
      'Karosa B 932.1680',
      'Iveco Crossway 12M',
      'Iveco E-way 12M',
      'Iveco E-way 9,5M',
      'Iveco Crossway LE CITY 12M ELEC',
      'Iveco Crossway LE CITY 13M ELEC'
    ]
  },
  phase4: {
    name: 'Zvuky a audio vrstva',
    done: false,
    features: [
      'Klakson',
      'Zvuk dveří',
      'Varování a úrovně rizika',
      'Pozadí městského provozu / MHD',
      'Zvuk při zastavení na zastávce',
      'Vypnutí zvuku / nastavení hlasitosti'
    ]
  },
  phase5: {
    name: 'Mise, úkoly a srovnání výkonu',
    done: false,
    features: [
      'Mise typu: projed určitou trasu',
      'Mise typu: vezmi X cestujících',
      'Mise typu: vyhnout se penalizacím',
      'Mise typu: splň časový limit',
      'Historie výsledků a nejlepší skóre',
      'Porovnání výkonu s ostatními jízdami',
      'Tabulka nejlepšího řidiče'
    ]
  },
  phase6: {
    name: 'Realističtější provoz MHD',
    done: false,
    features: [
      'Jízdní řády',
      'Linkové rozvrhy a stanice',
      'Cestující čekající na zastávce',
      'Přestupování mezi linkami',
      'Provoz v špičce a mimo špičku',
      'Stavy provozu – dobrý / zpoždění / havárie'
    ]
  }
};

const engineSpec = {
  renderer: 'Canvas 2D',
  setup: {
    resizableCanvas: true,
    hud: 'vlevo + pravá panel informační vrstva',
    controls: ['WASD / šipky', 'Space pro dveře', 'K pro klakson', 'P pro pauzu', 'M pro novou misi']
  },
  gameplay: {
    movement: 'Pohyb autobusu po mapě, rotace a směr jízdy',
    stops: 'Nástup a výstup cestujících podle proximity a otevřených dveří',
    traffic: 'Semafory, kolize, penalizace, bez-pečnost',
    missions: 'Různé scénáře a odměny za splnění',
    rating: 'Skóre, penalizace, čas, přepraveni cestující'
  },
  recommendedNextPatch: {
    title: 'Patch 2: Rozšíření města a vozového parku',
    tasks: [
      'Rozšířit mapu na 3x větší město s více trasami a křižovatkami',
      'Přidat více variant zastávek a přestupních bodů',
      'Upravit semafory tak, aby reagovaly na vzdálenost a třídu silnice',
      'Přidat hlasitost a mini audio systém',
      'Přidat další modely Karosa a nové jejich vlastnosti',
      'Zavést systém úloh a historie skóre',
      'Zlepšit nástup/výstup cestujících s logikou nástupních zon',
      'Přidat režim “reálný městský řidič” s výzvami'
    ]
  }
};

module.exports = {
  productionPlan,
  engineSpec
};
