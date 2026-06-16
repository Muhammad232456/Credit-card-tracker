import type { PointsProgram } from '../types';

export const POINTS_PROGRAMS: PointsProgram[] = [
  // Airline
  { id: "aeroplan", name: "Aeroplan", type: "airline", alliance: "star", defaultCpp: 1.8, isTransferable: false },
  { id: "avios", name: "British Airways Avios", type: "airline", alliance: "oneworld", defaultCpp: 1.5, isTransferable: false, note: "Poolable with Iberia, Aer Lingus, Qatar, Finnair" },
  { id: "flying-blue", name: "Flying Blue (AF/KLM)", type: "airline", alliance: "skyteam", defaultCpp: 1.5, isTransferable: false },
  { id: "asia-miles", name: "Cathay Pacific Asia Miles", type: "airline", alliance: "oneworld", defaultCpp: 1.2, isTransferable: false },
  { id: "aadvantage", name: "American Airlines AAdvantage", type: "airline", alliance: "oneworld", defaultCpp: 1.4, isTransferable: false },
  { id: "skymiles", name: "Delta SkyMiles", type: "airline", alliance: "skyteam", defaultCpp: 1.2, isTransferable: false },
  { id: "etihad-guest", name: "Etihad Guest", type: "airline", alliance: null, defaultCpp: 1.3, isTransferable: false, note: "Amex MR transfers ending June 30, 2026" },
  { id: "westjet-dollars", name: "WestJet Dollars", type: "airline", alliance: null, defaultCpp: 1.0, isTransferable: false },
  { id: "viporter", name: "VIPorter Points", type: "airline", alliance: null, defaultCpp: 1.2, isTransferable: false },
  { id: "alaska-miles", name: "Alaska Mileage Plan", type: "airline", alliance: "oneworld", defaultCpp: 1.5, isTransferable: false },
  // Hotel
  { id: "marriott-bonvoy", name: "Marriott Bonvoy", type: "hotel", defaultCpp: 0.8, isTransferable: false },
  { id: "hilton-honors", name: "Hilton Honors", type: "hotel", defaultCpp: 0.5, isTransferable: false },
  // Transferable
  { id: "amex-mr", name: "Amex Membership Rewards", type: "transferable", defaultCpp: 1.5, isTransferable: true, note: "8 transfer partners in Canada (fewer than US)" },
  { id: "rbc-avion", name: "RBC Avion Rewards", type: "transferable", defaultCpp: 1.0, isTransferable: true, note: "4 airline partners (Elite tier only)" },
  // Bank-only
  { id: "scene-plus", name: "Scene+", type: "bank", defaultCpp: 1.0, isTransferable: false, note: "Redeem via Scene+ Travel (Expedia), no airline transfers" },
  { id: "td-rewards", name: "TD Rewards", type: "bank", defaultCpp: 0.7, isTransferable: false },
  { id: "bmo-rewards", name: "BMO Rewards", type: "bank", defaultCpp: 0.7, isTransferable: false },
  { id: "nbc-rewards", name: "National Bank à la carte Rewards", type: "bank", defaultCpp: 1.0, isTransferable: false },
  { id: "hsbc-rewards", name: "HSBC Rewards", type: "bank", defaultCpp: 1.0, isTransferable: false },
  { id: "air-miles", name: "Air Miles", type: "bank", defaultCpp: 10, isTransferable: false, note: "Dream reward value ~10¢/mile" },
  { id: "pc-optimum", name: "PC Optimum", type: "bank", defaultCpp: 0.1, isTransferable: false, note: "10,000 pts = $10" },
  { id: "mbna-rewards", name: "MBNA Rewards", type: "bank", defaultCpp: 1.0, isTransferable: false },
  { id: "capital-one-miles", name: "Capital One Miles", type: "bank", defaultCpp: 1.0, isTransferable: false },
  { id: "atb-rewards", name: "ATB Rewards", type: "bank", defaultCpp: 1.0, isTransferable: false },
  { id: "meridian-rewards", name: "Meridian Rewards", type: "bank", defaultCpp: 0.5, isTransferable: false },
];

export function getProgramById(id: string): PointsProgram | undefined {
  return POINTS_PROGRAMS.find(p => p.id === id);
}
