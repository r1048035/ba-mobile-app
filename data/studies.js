const studies = [
  // Dataset-sectie: campus Botaniek
  { id: 'bot-gezondheidszorg', title: 'Gezondheidszorg', campus: 'Botaniek', degree: '1ste graad', finality: 'Doorstroom', summary: 'Praktische en theoretische basis in gezondheidszorg.' },
  { id: 'bot-chemie', title: 'Chemie', campus: 'Botaniek', degree: '2de graad', finality: 'Doorstroom', summary: 'Chemie met labo-ervaring en theoretische diepgang.' },
  { id: 'bot-verpleegvoorb', title: 'Verpleegkunde‑voorbereiding', campus: 'Botaniek', degree: '2de graad', finality: 'Doorstroom', summary: 'Voorbereiding op verpleegkundige opleidingen.' },
  { id: 'bot-psychologie', title: 'Psychologie‑voorbereiding', campus: 'Botaniek', degree: '2de graad', finality: 'Doorstroom', summary: 'Fundamenten van psychologie en gedrag.' },
  { id: 'bot-wetenschappen', title: 'Wetenschappen (diverse finaliteiten)', campus: 'Botaniek', degree: '2de/3de graad', finality: 'Mix', summary: 'Brede wetenschappelijke richting met keuzefinaliteiten.' },
  { id: 'bot-doorstroom-grad-verpleeg', title: 'Doorstroom naar graduaat verpleegkunde', campus: 'Botaniek', degree: 'Postsecundair', finality: 'Doorstroom', summary: 'Traject richting graduaat verpleegkunde.' },

  // Dataset-sectie: campus Caputsteen
  { id: 'cap-freinet', title: 'Freinet‑methode (diverse richtingen)', campus: 'Caputsteen', degree: 'Alle', finality: 'Mix', summary: 'Onderwijs via de Freinet‑methode in meerdere richtingen.' },
  { id: 'cap-kunst', title: 'Kunstzinnige richtingen', campus: 'Caputsteen', degree: 'Alle', finality: 'Mix', summary: 'Beeldende en uitvoerende kunsten.' },
  { id: 'cap-creatief', title: 'Creatieve projecten', campus: 'Caputsteen', degree: 'Alle', finality: 'Mix', summary: 'Projectwerk met creatieve insteek.' },
  { id: 'cap-doorstroom-aso', title: 'Doorstroomrichtingen (ASO‑profiel)', campus: 'Caputsteen', degree: '2de/3de graad', finality: 'Doorstroom', summary: 'ASO‑doorstroomprofielen met brede academische basis.' },

  // Dataset-sectie: campus De Beemden
  { id: 'beem-ov1', title: 'OV1 – Arbeidsgerichte vorming', campus: 'De Beemden', degree: 'BuSO', finality: 'Arbeidsmarkt', summary: 'Praktische arbeidsgerichte vorming.' },
  { id: 'beem-ov2', title: 'OV2 – Arbeidsmatige activiteiten', campus: 'De Beemden', degree: 'BuSO', finality: 'Arbeidsmarkt', summary: 'Arbeidsmatige activiteiten en vaardigheden.' },
  { id: 'beem-ov3', title: 'OV3 – Algemene + sociale vorming', campus: 'De Beemden', degree: 'BuSO', finality: 'Arbeidsmarkt', summary: 'Combinatie van algemene en beroepsvorming.' },
  { id: 'beem-ov4', title: 'OV4 – Type 9 (ASS)', campus: 'De Beemden', degree: 'BuSO', finality: 'Aanpassing', summary: 'Type 9 ondersteuning voor leerlingen met ASS.' },

  // Dataset-sectie: campus Basisverpleegkunde
  { id: 'bv-graduaat', title: 'Graduaat Basisverpleegkunde (Mechelen)', campus: 'Basisverpleegkunde', degree: 'Graduaat', finality: 'Doorstroom', summary: 'Graduaat opleiding locatie Mechelen.' },
  { id: 'bv-graduaat-jette', title: 'Graduaat Basisverpleegkunde (Jette)', campus: 'Basisverpleegkunde', degree: 'Graduaat', finality: 'Doorstroom', summary: 'Graduaat opleiding locatie Jette.' },

  // Dataset-sectie: campus Nekkerspoel
  { id: 'nek-duaal', title: 'Duaal leren', campus: 'Nekkerspoel', degree: 'Duaal', finality: 'Arbeidsmarkt', summary: 'Combinatie van werkplek en school.' },
  { id: 'nek-horeca', title: 'Horeca (didactisch restaurant)', campus: 'Nekkerspoel', degree: 'Praktijk', finality: 'Arbeidsmarkt', summary: 'Praktijkgericht horecaonderwijs in didactisch restaurant.' },
  { id: 'nek-kapper', title: 'Kappersopleiding (didactisch kapsalon)', campus: 'Nekkerspoel', degree: 'Praktijk', finality: 'Arbeidsmarkt', summary: 'Kappersopleiding met praktijk in schoolkapsalon.' },

  // Dataset-sectie: campus Pitzemburg
  { id: 'pitz-asis', title: 'Academische doorstroomrichtingen', campus: 'Pitzemburg', degree: 'ASO', finality: 'Doorstroom', summary: 'Voorbereiding voor academische vervolgstudies.' },
  { id: 'pitz-economie', title: 'Economie', campus: 'Pitzemburg', degree: 'ASO', finality: 'Doorstroom', summary: 'Economie en bedrijfskunde.' },
  { id: 'pitz-talen', title: 'Moderne talen', campus: 'Pitzemburg', degree: 'ASO', finality: 'Doorstroom', summary: 'Talen en communicatie met onderzoeksfocus.' },
  { id: 'pitz-wetenschap', title: 'Wetenschappen', campus: 'Pitzemburg', degree: 'ASO', finality: 'Doorstroom', summary: 'Wetenschappen met onderzoek & reflectie.' },

  // Dataset-sectie: campus Stassart
  { id: 'stass-welzijn', title: 'Welzijn', campus: 'Stassart', degree: '3de graad', finality: 'Arbeidsmarkt', summary: 'Richtingen gericht op welzijn en zorg.' },
  { id: 'stass-zorg', title: 'Zorg', campus: 'Stassart', degree: '3de graad', finality: 'Arbeidsmarkt', summary: 'Praktische zorgopleidingen en stages.' },
  { id: 'stass-restaurant', title: 'Restaurant‑keuken', campus: 'Stassart', degree: 'Praktijk', finality: 'Arbeidsmarkt', summary: 'Keuken en horeca met stageplaatsen.' },

  // Dataset-sectie: campus Zandpoort
  { id: 'zand-it', title: 'IT', campus: 'Zandpoort', degree: '3de graad', finality: 'Arbeidsmarkt', summary: 'Informatica, programmeren en netwerken.' },
  { id: 'zand-economie', title: 'Economie & organisatie', campus: 'Zandpoort', degree: '3de graad', finality: 'Arbeidsmarkt', summary: 'Economie met focus op ondernemen.' },
  { id: 'zand-taal', title: 'Taal & cultuur', campus: 'Zandpoort', degree: 'ASO', finality: 'Doorstroom', summary: 'Talen en culturele studies.' },
  { id: 'zand-seminaries', title: 'Seminaries: IT, Business & Communication', campus: 'Zandpoort', degree: 'ASO/3de', finality: 'Mix', summary: 'Extra seminaries rond IT en business.' },
];

export default studies;
