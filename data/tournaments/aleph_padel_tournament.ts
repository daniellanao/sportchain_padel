/**
 * Aleph Padel Tournament — Swiss format (dummy / preview data).
 * Team and player names are fictional variants of the original list.
 */

/** Must match `slug` in `data/tournaments.ts` for this event */
export const ALEPH_TOURNAMENT_SLUG = "aleph_padel_tournament_march_26";

/** One row in the standings table */
export type AlephStandingRow = {
  rank: number;
  teamName: string;
  /** Two players, display format */
  players: string;
  /** Per-round column (empty until you fill Swiss points) */
  r1: string;
  r2: string;
  r3: string;
  r4: string;
  mp: number;
  w: number;
  l: number;
  gw: number;
  gl: number;
  diff: number;
  /** Match wins (same meaning as Swiss “wins” column in your sheet) */
  wins: number;
};

/** One completed match */
export type AlephMatch = {
  team1: { name: string; players: string };
  score1: number;
  score2: number;
  team2: { name: string; players: string };
};

export type AlephRound = {
  round: number;
  label: string;
  matches: AlephMatch[];
};

/**
 * Standings after recorded rounds (R1–R4 reserved; round cells empty until set).
 * Stats match your source table.
 */
export const ALEPH_STANDINGS: AlephStandingRow[] = [
  {
    rank: 1,
    teamName: "Reyes del Norte",
    players: "Iván Delgado / Rafa Mendoza",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    mp: 3,
    w: 3,
    l: 0,
    gw: 18,
    gl: 6,
    diff: 12,
    wins: 3,
  },
  {
    rank: 2,
    teamName: "Code Breakers",
    players: "Alexei Morozov / Daniil Petrov",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    mp: 3,
    w: 2,
    l: 1,
    gw: 16,
    gl: 8,
    diff: 8,
    wins: 2,
  },
  {
    rank: 3,
    teamName: "Headstrong",
    players: "Camila Ferreira / Luca Romano",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    mp: 3,
    w: 2,
    l: 1,
    gw: 14,
    gl: 10,
    diff: 4,
    wins: 2,
  },
  {
    rank: 4,
    teamName: "Los Cardenales",
    players: "Carlos Herrera / Felipe Montes",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    mp: 3,
    w: 2,
    l: 1,
    gw: 14,
    gl: 11,
    diff: 3,
    wins: 2,
  },
  {
    rank: 5,
    teamName: "Solar Kids",
    players: "Bárbara Gómez / Pau Prats",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    mp: 3,
    w: 1,
    l: 2,
    gw: 10,
    gl: 13,
    diff: -3,
    wins: 1,
  },
  {
    rank: 6,
    teamName: "The Table",
    players: "Marco Bellini / Tomás Cruz",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    mp: 3,
    w: 1,
    l: 2,
    gw: 9,
    gl: 17,
    diff: -8,
    wins: 1,
  },
  {
    rank: 7,
    teamName: "Ritmo Court",
    players: "Álvaro Méndez / Seba Ortiz",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    mp: 3,
    w: 1,
    l: 2,
    gw: 9,
    gl: 17,
    diff: -8,
    wins: 1,
  },
  {
    rank: 8,
    teamName: "Ice Pack",
    players: "Stefan Milic / Kaan Deniz",
    r1: "",
    r2: "",
    r3: "",
    r4: "",
    mp: 3,
    w: 0,
    l: 3,
    gw: 10,
    gl: 18,
    diff: -8,
    wins: 0,
  },
];

/**
 * Match results by round (scores = games won per side in that match).
 * Team names match {@link ALEPH_STANDINGS}.
 */
export const ALEPH_MATCHES_BY_ROUND: AlephRound[] = [
  {
    round: 1,
    label: "Round 1",
    matches: [
      {
        team1: { name: "Headstrong", players: "Camila Ferreira / Luca Romano" },
        score1: 6,
        score2: 2,
        team2: { name: "Solar Kids", players: "Bárbara Gómez / Pau Prats" },
      },
      {
        team1: { name: "Los Cardenales", players: "Carlos Herrera / Felipe Montes" },
        score1: 6,
        score2: 2,
        team2: { name: "Ritmo Court", players: "Álvaro Méndez / Seba Ortiz" },
      },
      {
        team1: { name: "Code Breakers", players: "Alexei Morozov / Daniil Petrov" },
        score1: 4,
        score2: 6,
        team2: { name: "Reyes del Norte", players: "Iván Delgado / Rafa Mendoza" },
      },
      {
        team1: { name: "Ice Pack", players: "Stefan Milic / Kaan Deniz" },
        score1: 5,
        score2: 6,
        team2: { name: "The Table", players: "Marco Bellini / Tomás Cruz" },
      },
    ],
  },
  {
    round: 2,
    label: "Round 2",
    matches: [
      {
        team1: { name: "Los Cardenales", players: "Carlos Herrera / Felipe Montes" },
        score1: 2,
        score2: 6,
        team2: { name: "Headstrong", players: "Camila Ferreira / Luca Romano" },
      },
      {
        team1: { name: "Reyes del Norte", players: "Iván Delgado / Rafa Mendoza" },
        score1: 6,
        score2: 0,
        team2: { name: "The Table", players: "Marco Bellini / Tomás Cruz" },
      },
      {
        team1: { name: "Code Breakers", players: "Alexei Morozov / Daniil Petrov" },
        score1: 6,
        score2: 0,
        team2: { name: "Ice Pack", players: "Stefan Milic / Kaan Deniz" },
      },
      {
        team1: { name: "Solar Kids", players: "Bárbara Gómez / Pau Prats" },
        score1: 6,
        score2: 1,
        team2: { name: "Ritmo Court", players: "Álvaro Méndez / Seba Ortiz" },
      },
    ],
  },
  {
    round: 3,
    label: "Round 3",
    matches: [
      {
        team1: { name: "Headstrong", players: "Camila Ferreira / Luca Romano" },
        score1: 2,
        score2: 6,
        team2: { name: "Reyes del Norte", players: "Iván Delgado / Rafa Mendoza" },
      },
      {
        team1: { name: "Code Breakers", players: "Alexei Morozov / Daniil Petrov" },
        score1: 6,
        score2: 2,
        team2: { name: "Solar Kids", players: "Bárbara Gómez / Pau Prats" },
      },
      {
        team1: { name: "Los Cardenales", players: "Carlos Herrera / Felipe Montes" },
        score1: 6,
        score2: 3,
        team2: { name: "The Table", players: "Marco Bellini / Tomás Cruz" },
      },
      {
        team1: { name: "Ice Pack", players: "Stefan Milic / Kaan Deniz" },
        score1: 5,
        score2: 6,
        team2: { name: "Ritmo Court", players: "Álvaro Méndez / Seba Ortiz" },
      },
    ],
  },
];

/** Flat list of all matches (optional helper) */
export const ALEPH_MATCHES_ALL: AlephMatch[] = ALEPH_MATCHES_BY_ROUND.flatMap((r) =>
  r.matches.map((m) => m),
);
