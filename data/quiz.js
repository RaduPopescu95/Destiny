export const firstQuestions = [
  {
    id: 1,
    text: "Care este zodia ta?",
    options: [
      "Berbec",
      "Taur",
      "Gemeni",
      "Rac",
      "Leu",
      "Fecioară",
      "Balanță",
      "Scorpion",
      "Săgetător",
      "Capricorn",
      "Vărsător",
      "Pești",
    ],
    type: "single",
    next: 2,
    matchRequired: true,
    compatibility: true,
  },
  {
    id: 2,
    text: "Care este data ta de naștere? (Format: ZZ/LL/AAAA)",
    type: "input",
    placeholder: "dd/MM/yyyy",
    validation: {
      type: "date",
      format: "dd/MM/yyyy",
    },
    next: 3,
    matchRequired: true,
    compatibility: true,

  },
  {
    id: 3,
    text: "Ce tip de relație cauți?",
    options: [
      "Relație de lungă durată",
      "Relație casual",
      "Prietenie"
    ],
    type: "single",
    next: null,
    matchRequired: true,
    compatibility: true,
  },
];

export const questionsSet1 = [];
export const questionsSet2 = [];
export const questionsSet3 = [];
