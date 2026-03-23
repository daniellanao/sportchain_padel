/**
 * Dummy ELO-style leaderboard data (32 players).
 * Points are in the 800–1600 range; list is sorted by points (desc).
 */

export type RankingPlayer = {
  id: string;
  firstName: string;
  lastName: string;
  matchesPlayed: number;
  /** ELO-style rating */
  points: number;
};

export const RANKING_PLAYERS: RankingPlayer[] = [
  { id: "1", firstName: "Carlos", lastName: "Ruiz", matchesPlayed: 48, points: 1592 },
  { id: "2", firstName: "Lucía", lastName: "Fernández", matchesPlayed: 52, points: 1578 },
  { id: "3", firstName: "Miguel", lastName: "Torres", matchesPlayed: 41, points: 1565 },
  { id: "4", firstName: "Elena", lastName: "Vega", matchesPlayed: 63, points: 1548 },
  { id: "5", firstName: "Javier", lastName: "Moreno", matchesPlayed: 37, points: 1531 },
  { id: "6", firstName: "Paula", lastName: "Sánchez", matchesPlayed: 55, points: 1516 },
  { id: "7", firstName: "Andrés", lastName: "Delgado", matchesPlayed: 44, points: 1502 },
  { id: "8", firstName: "Natalia", lastName: "Ortega", matchesPlayed: 29, points: 1487 },
  { id: "9", firstName: "Sergio", lastName: "Ibáñez", matchesPlayed: 58, points: 1473 },
  { id: "10", firstName: "Cristina", lastName: "Navarro", matchesPlayed: 46, points: 1459 },
  { id: "11", firstName: "Daniel", lastName: "Herrera", matchesPlayed: 33, points: 1444 },
  { id: "12", firstName: "Marta", lastName: "Campos", matchesPlayed: 61, points: 1428 },
  { id: "13", firstName: "Álvaro", lastName: "Ramos", matchesPlayed: 39, points: 1412 },
  { id: "14", firstName: "Irene", lastName: "Gil", matchesPlayed: 50, points: 1396 },
  { id: "15", firstName: "Pablo", lastName: "Castro", matchesPlayed: 27, points: 1381 },
  { id: "16", firstName: "Sofía", lastName: "Méndez", matchesPlayed: 54, points: 1365 },
  { id: "17", firstName: "Roberto", lastName: "Aguilar", matchesPlayed: 42, points: 1348 },
  { id: "18", firstName: "Andrea", lastName: "Peña", matchesPlayed: 35, points: 1332 },
  { id: "19", firstName: "Hugo", lastName: "Fuentes", matchesPlayed: 47, points: 1315 },
  { id: "20", firstName: "Valeria", lastName: "Romero", matchesPlayed: 59, points: 1298 },
  { id: "21", firstName: "Iván", lastName: "Serrano", matchesPlayed: 31, points: 1281 },
  { id: "22", firstName: "Claudia", lastName: "Rojas", matchesPlayed: 45, points: 1264 },
  { id: "23", firstName: "Marc", lastName: "Vidal", matchesPlayed: 38, points: 1247 },
  { id: "24", firstName: "Laura", lastName: "Paredes", matchesPlayed: 56, points: 1229 },
  { id: "25", firstName: "Diego", lastName: "León", matchesPlayed: 24, points: 1211 },
  { id: "26", firstName: "Beatriz", lastName: "Molina", matchesPlayed: 49, points: 1193 },
  { id: "27", firstName: "Adrián", lastName: "Suárez", matchesPlayed: 41, points: 1174 },
  { id: "28", firstName: "Marina", lastName: "Blanco", matchesPlayed: 36, points: 1155 },
  { id: "29", firstName: "Gonzalo", lastName: "Prieto", matchesPlayed: 53, points: 1136 },
  { id: "30", firstName: "Noelia", lastName: "Cortés", matchesPlayed: 28, points: 1116 },
  { id: "31", firstName: "Óscar", lastName: "Núñez", matchesPlayed: 44, points: 1095 },
  { id: "32", firstName: "Raquel", lastName: "Estévez", matchesPlayed: 40, points: 800 },
].sort((a, b) => b.points - a.points);

export function getRankingPlayerById(id: string): RankingPlayer | undefined {
  return RANKING_PLAYERS.find((p) => p.id === id);
}
