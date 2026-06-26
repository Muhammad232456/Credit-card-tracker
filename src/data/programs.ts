import type { PointsProgram } from '../types';

export const POINTS_PROGRAMS: PointsProgram[] = [
  // ── AIRLINE ────────────────────────────────────────────────────────────────
  { id: "aeroplan",           name: "Aeroplan",                        type: "airline",      alliance: "star",     defaultCpp: 1.5, excellentCpp: 2.0, isTransferable: false },
  { id: "avios",              name: "British Airways Avios",            type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.5, isTransferable: false, note: "Poolable with Iberia, Qatar, Finnair" },
  { id: "flying-blue",        name: "Flying Blue (AF/KLM)",             type: "airline",      alliance: "skyteam",  defaultCpp: 1.4, excellentCpp: 2.0, isTransferable: false },
  { id: "asia-miles",         name: "Cathay Pacific Asia Miles",        type: "airline",      alliance: "oneworld", defaultCpp: 1.2,                    isTransferable: false },
  { id: "aadvantage",         name: "American Airlines AAdvantage",     type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.0, isTransferable: false },
  { id: "skymiles",           name: "Delta SkyMiles",                   type: "airline",      alliance: "skyteam",  defaultCpp: 1.2, excellentCpp: 1.8, isTransferable: false },
  { id: "etihad-guest",       name: "Etihad Guest",                     type: "airline",      alliance: null,       defaultCpp: 1.3, excellentCpp: 2.0, isTransferable: false, note: "Amex MR transfers ending June 30, 2026" },
  { id: "westjet-dollars",    name: "WestJet Dollars",                  type: "airline",      alliance: null,       defaultCpp: 1.0, excellentCpp: 1.2, isTransferable: false },
  { id: "viporter",           name: "VIPorter Points",                  type: "airline",      alliance: null,       defaultCpp: 1.3, excellentCpp: 1.8, isTransferable: false },
  { id: "alaska-miles",       name: "Alaska Mileage Plan",              type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.2, isTransferable: false },
  { id: "united-mileageplus", name: "United MileagePlus",               type: "airline",      alliance: "star",     defaultCpp: 1.5, excellentCpp: 2.2, isTransferable: false },
  { id: "southwest-rr",       name: "Southwest Rapid Rewards",          type: "airline",      alliance: null,       defaultCpp: 1.5, excellentCpp: 1.8, isTransferable: false },
  { id: "turkish-miles",      name: "Turkish Airlines Miles&Smiles",    type: "airline",      alliance: "star",     defaultCpp: 1.5, excellentCpp: 2.5, isTransferable: false },
  { id: "singapore-krisflyer",name: "Singapore KrisFlyer",              type: "airline",      alliance: "star",     defaultCpp: 1.8, excellentCpp: 2.8, isTransferable: false },
  { id: "emirates-skywards",  name: "Emirates Skywards",                type: "airline",      alliance: null,       defaultCpp: 1.2, excellentCpp: 1.8, isTransferable: false },
  { id: "qatar-privilege",    name: "Qatar Privilege Club",             type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.2, isTransferable: false },
  { id: "lufthansa-miles",    name: "Lufthansa Miles & More",           type: "airline",      alliance: "star",     defaultCpp: 1.5, excellentCpp: 2.0, isTransferable: false },
  { id: "iberia-avios",       name: "Iberia Plus Avios",                type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 3.0, isTransferable: false, note: "Poolable with BA, Qatar, Finnair" },
  { id: "virgin-atlantic",    name: "Virgin Atlantic Flying Club",      type: "airline",      alliance: "skyteam",  defaultCpp: 1.8, excellentCpp: 2.5, isTransferable: false },
  { id: "jal-miles",          name: "Japan Airlines Mileage Bank",      type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.5, isTransferable: false },
  { id: "ana-miles",          name: "ANA Mileage Club",                 type: "airline",      alliance: "star",     defaultCpp: 2.0, excellentCpp: 3.0, isTransferable: false },
  // ── HOTEL ─────────────────────────────────────────────────────────────────
  { id: "marriott-bonvoy",    name: "Marriott Bonvoy",                  type: "hotel",                              defaultCpp: 0.9, excellentCpp: 1.4, isTransferable: false },
  { id: "hilton-honors",      name: "Hilton Honors",                    type: "hotel",                              defaultCpp: 0.5, excellentCpp: 0.8, isTransferable: false },
  { id: "hyatt",              name: "World of Hyatt",                   type: "hotel",                              defaultCpp: 1.7, excellentCpp: 2.5, isTransferable: false },
  { id: "ihg-rewards",        name: "IHG One Rewards",                  type: "hotel",                              defaultCpp: 0.5, excellentCpp: 0.8, isTransferable: false },
  { id: "wyndham-rewards",    name: "Wyndham Rewards",                  type: "hotel",                              defaultCpp: 0.7, excellentCpp: 1.1, isTransferable: false },
  { id: "choice-privileges",  name: "Choice Privileges",                type: "hotel",                              defaultCpp: 0.6, excellentCpp: 1.0, isTransferable: false },
  { id: "best-western",       name: "Best Western Rewards",             type: "hotel",                              defaultCpp: 0.6, excellentCpp: 1.0, isTransferable: false },
  { id: "accor-all",          name: "Accor Live Limitless (ALL)",       type: "hotel",                              defaultCpp: 0.7, excellentCpp: 1.2, isTransferable: false },
  // ── TRANSFERABLE ──────────────────────────────────────────────────────────
  { id: "amex-mr",            name: "Amex Membership Rewards",          type: "transferable",                       defaultCpp: 1.5, excellentCpp: 2.0, isTransferable: true,  note: "8 transfer partners in Canada" },
  { id: "rbc-avion",          name: "RBC Avion Rewards",                type: "transferable",                       defaultCpp: 1.0,                    isTransferable: true,  note: "4 airline partners (Elite tier only)" },
  // ── BANK ──────────────────────────────────────────────────────────────────
  { id: "scene-plus",         name: "Scene+",                           type: "bank",                               defaultCpp: 1.0,                    isTransferable: false, note: "Redeem via Scene+ Travel (Expedia)" },
  { id: "td-rewards",         name: "TD Rewards",                       type: "bank",                               defaultCpp: 0.7,                    isTransferable: false },
  { id: "bmo-rewards",        name: "BMO Rewards",                      type: "bank",                               defaultCpp: 0.7,                    isTransferable: false },
  { id: "nbc-rewards",        name: "National Bank à la carte Rewards", type: "bank",                               defaultCpp: 1.0,                    isTransferable: false },
  { id: "hsbc-rewards",       name: "HSBC Rewards",                     type: "bank",                               defaultCpp: 1.0,                    isTransferable: false },
  { id: "air-miles",          name: "Air Miles",                        type: "bank",                               defaultCpp: 10,                     isTransferable: false, note: "Dream reward value ~10¢/mile" },
  { id: "pc-optimum",         name: "PC Optimum",                       type: "bank",                               defaultCpp: 0.1,                    isTransferable: false, note: "10,000 pts = $10" },
  { id: "mbna-rewards",       name: "MBNA Rewards",                     type: "bank",                               defaultCpp: 1.0,                    isTransferable: false },
  { id: "capital-one-miles",  name: "Capital One Miles",                type: "bank",                               defaultCpp: 1.0,                    isTransferable: false },
  { id: "atb-rewards",        name: "ATB Rewards",                      type: "bank",                               defaultCpp: 1.0,                    isTransferable: false },
  { id: "meridian-rewards",   name: "Meridian Rewards",                 type: "bank",                               defaultCpp: 0.5,                    isTransferable: false },
];

export function getProgramById(id: string): PointsProgram | undefined {
  return POINTS_PROGRAMS.find(p => p.id === id);
}
