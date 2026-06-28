import type { PointsProgram } from '../types';

export const POINTS_PROGRAMS: PointsProgram[] = [
  // ── AIRLINE ────────────────────────────────────────────────────────────────
  { id: "aeroplan",           name: "Aeroplan",                        type: "airline",      alliance: "star",     defaultCpp: 1.5, excellentCpp: 2.0, isTransferable: false,
    sweetSpots: "Sweet spots: business class to Europe/Asia via Star Alliance partners; partner awards (ANA, Swiss, Lufthansa) often beat cash prices." },

  { id: "avios",              name: "British Airways Avios",            type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.5, isTransferable: false,
    note: "Poolable with Iberia, Qatar, Finnair",
    sweetSpots: "Best for short-haul & partner flights priced on distance zones. Excellent for AA domestic US or QR Qsuites if priced low." },

  { id: "flying-blue",        name: "Flying Blue (AF/KLM)",             type: "airline",      alliance: "skyteam",  defaultCpp: 1.4, excellentCpp: 2.0, isTransferable: false,
    sweetSpots: "Monthly Promo Rewards cut select routes 25–50%. Best for transatlantic business class on Air France/KLM." },

  { id: "asia-miles",         name: "Cathay Pacific Asia Miles",        type: "airline",      alliance: "oneworld", defaultCpp: 1.2,                    isTransferable: false,
    sweetSpots: "Best for Cathay Pacific business/first class to Asia. Partner awards on AA and BA can also yield good value." },

  { id: "aadvantage",         name: "American Airlines AAdvantage",     type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.0, isTransferable: false,
    sweetSpots: "No fuel surcharges on partner awards. Best for Etihad, Qatar, and JAL business class booked via AAdvantage miles." },

  { id: "skymiles",           name: "Delta SkyMiles",                   type: "airline",      alliance: "skyteam",  defaultCpp: 1.2, excellentCpp: 1.8, isTransferable: false,
    sweetSpots: "Dynamic pricing makes value unpredictable. Best used for last-minute Delta flights or Virgin Atlantic Upper Class bookings." },

  { id: "etihad-guest",       name: "Etihad Guest",                     type: "airline",      alliance: null,       defaultCpp: 1.3, excellentCpp: 2.0, isTransferable: false,
    note: "Amex MR transfers ending June 30, 2026",
    sweetSpots: "Business class sweet spots on Etihad and partner awards. Transfer before June 30, 2026 — Amex MR partnership ending." },

  { id: "westjet-dollars",    name: "WestJet Dollars",                  type: "airline",      alliance: null,       defaultCpp: 1.0, excellentCpp: 1.2, isTransferable: false,
    sweetSpots: "Essentially cash-equivalent (1 WestJet $ = $1 CAD). Best value on WestJet Premium fares where cash prices are high." },

  { id: "viporter",           name: "VIPorter Points",                  type: "airline",      alliance: null,       defaultCpp: 1.3, excellentCpp: 1.8, isTransferable: false,
    sweetSpots: "Best on transcontinental routes (YYZ–YVR) and Premium cabin upgrades. Value drops significantly on short regional hops." },

  { id: "alaska-miles",       name: "Alaska Mileage Plan",              type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.2, isTransferable: false,
    sweetSpots: "Exceptional sweet spots: Cathay First, Emirates First, and Japan Airlines First via partner awards. No fuel surcharges." },

  { id: "united-mileageplus", name: "United MileagePlus",               type: "airline",      alliance: "star",     defaultCpp: 1.5, excellentCpp: 2.2, isTransferable: false,
    sweetSpots: "Best for Star Alliance partner awards (ANA, Singapore, Lufthansa). Saver awards on United itself also offer solid value." },

  { id: "southwest-rr",       name: "Southwest Rapid Rewards",          type: "airline",      alliance: null,       defaultCpp: 1.5, excellentCpp: 1.8, isTransferable: false,
    sweetSpots: "Fixed value tied to cash fares — no sweet spots, no blackouts. Best used on high-demand routes where cash prices spike." },

  { id: "turkish-miles",      name: "Turkish Airlines Miles&Smiles",    type: "airline",      alliance: "star",     defaultCpp: 1.5, excellentCpp: 2.5, isTransferable: false,
    sweetSpots: "Incredible sweet spots for Star Alliance business class (United Polaris, ANA, Lufthansa) at low zone-based pricing. One of the best programs globally." },

  { id: "singapore-krisflyer",name: "Singapore KrisFlyer",              type: "airline",      alliance: "star",     defaultCpp: 1.8, excellentCpp: 2.8, isTransferable: false,
    sweetSpots: "Top-tier for Singapore Suites & Business class. Star Alliance partner sweet spots also available. Points expire — stay active." },

  { id: "emirates-skywards",  name: "Emirates Skywards",                type: "airline",      alliance: null,       defaultCpp: 1.2, excellentCpp: 1.8, isTransferable: false,
    sweetSpots: "Best on Emirates Business and First class (A380 bar, ice system). Economy redemptions typically offer poor value." },

  { id: "qatar-privilege",    name: "Qatar Privilege Club",             type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.2, isTransferable: false,
    sweetSpots: "Qsuites business class is world-class. Strong for oneworld partner awards. Avios poolable with BA, Iberia, Finnair." },

  { id: "lufthansa-miles",    name: "Lufthansa Miles & More",           type: "airline",      alliance: "star",     defaultCpp: 1.5, excellentCpp: 2.0, isTransferable: false,
    sweetSpots: "Best for Lufthansa First and Business class to Europe. Partner awards on Star Alliance also bookable. High fuel surcharges on some routes." },

  { id: "iberia-avios",       name: "Iberia Plus Avios",                type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 3.0, isTransferable: false,
    note: "Poolable with BA, Qatar, Finnair",
    sweetSpots: "Best kept secret: transatlantic business class to Madrid from 34k Avios one-way. Distance-based pricing rewards long-haul redemptions." },

  { id: "virgin-atlantic",    name: "Virgin Atlantic Flying Club",      type: "airline",      alliance: "skyteam",  defaultCpp: 1.8, excellentCpp: 2.5, isTransferable: false,
    sweetSpots: "Outstanding for ANA First/Business class to Japan and Delta One Suites — often 50%+ fewer miles than other programs." },

  { id: "jal-miles",          name: "Japan Airlines Mileage Bank",      type: "airline",      alliance: "oneworld", defaultCpp: 1.5, excellentCpp: 2.5, isTransferable: false,
    sweetSpots: "Best for JAL First and Business class to Japan/Asia. oneworld partner awards (AA, BA, Finnair) also bookable at good rates." },

  { id: "ana-miles",          name: "ANA Mileage Club",                 type: "airline",      alliance: "star",     defaultCpp: 2.0, excellentCpp: 3.0, isTransferable: false,
    sweetSpots: "Legendary for ANA The Room business class and First class. Round-the-world awards and Star Alliance partner bookings at superb rates." },

  // ── HOTEL ─────────────────────────────────────────────────────────────────
  { id: "marriott-bonvoy",    name: "Marriott Bonvoy",                  type: "hotel",                              defaultCpp: 0.9, excellentCpp: 1.4, isTransferable: false,
    sweetSpots: "Best at premium & luxury properties (Ritz-Carlton, St. Regis) during off-peak. 5th night free on award stays adds ~20% effective value." },

  { id: "hilton-honors",      name: "Hilton Honors",                    type: "hotel",                              defaultCpp: 0.5, excellentCpp: 0.8, isTransferable: false,
    sweetSpots: "5th night free on standard awards. Best value at premium resorts (Maldives, Caribbean) where cash rates exceed $500+/night." },

  { id: "hyatt",              name: "World of Hyatt",                   type: "hotel",                              defaultCpp: 1.7, excellentCpp: 2.5, isTransferable: false,
    sweetSpots: "Best value in hotel loyalty. Park Hyatt and Alila properties often 20k–30k pts/night vs $400–600+ cash. Globalist status adds lounge, upgrades, and breakfast." },

  { id: "ihg-rewards",        name: "IHG One Rewards",                  type: "hotel",                              defaultCpp: 0.5, excellentCpp: 0.8, isTransferable: false,
    sweetSpots: "Points + Cash bookings and PointBreaks rates offer best CPP. InterContinental and Kimpton properties give the best returns." },

  { id: "wyndham-rewards",    name: "Wyndham Rewards",                  type: "hotel",                              defaultCpp: 0.7, excellentCpp: 1.1, isTransferable: false,
    sweetSpots: "Simple fixed-rate redemptions (7.5k–30k pts/night). Best for road trips at mid-tier properties where cash rates are high." },

  { id: "choice-privileges",  name: "Choice Privileges",                type: "hotel",                              defaultCpp: 0.6, excellentCpp: 1.0, isTransferable: false,
    sweetSpots: "Best redeemed at Preferred Hotels & Resorts — luxury properties bookable for 35k–60k pts where cash rates run $400–800+/night." },

  { id: "best-western",       name: "Best Western Rewards",             type: "hotel",                              defaultCpp: 0.6, excellentCpp: 1.0, isTransferable: false,
    sweetSpots: "Best at BW Premier Collection and BW Signature Collection properties. Consistent, no-blackout redemptions for budget-to-mid-range travel." },

  { id: "accor-all",          name: "Accor Live Limitless (ALL)",       type: "hotel",                              defaultCpp: 0.7, excellentCpp: 1.2, isTransferable: false,
    sweetSpots: "Best for European properties (Sofitel, Fairmont, MGallery). Points can also be redeemed for experiences, dining, and partner benefits." },

  // ── TRANSFERABLE ──────────────────────────────────────────────────────────
  { id: "amex-mr",            name: "Amex Membership Rewards",          type: "transferable",                       defaultCpp: 1.5, excellentCpp: 2.0, isTransferable: true,
    note: "8 transfer partners in Canada",
    sweetSpots: "Transfer to Aeroplan for best Canadian value. Canada-specific partners: Aeroplan, Flying Blue, Delta SkyMiles, Etihad Guest (ending June 2026), Marriott Bonvoy, and 3 others." },

  { id: "rbc-avion",          name: "RBC Avion Rewards",                type: "transferable",                       defaultCpp: 1.0,                    isTransferable: true,
    note: "4 airline partners (Elite tier only)",
    sweetSpots: "Transfer at 1:1 to British Airways Avios or Cathay Asia Miles for best value. Overlaps with Amex MR on these two — save your MR for exclusive partners like Aeroplan." },

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
