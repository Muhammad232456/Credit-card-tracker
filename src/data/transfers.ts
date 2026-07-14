import type { TransferPartner } from '../types';

export const TRANSFER_PARTNERS: TransferPartner[] = [
  {
    id: "aeroplan",
    name: "Air Canada Aeroplan",
    type: "airline",
    alliance: "star",
    transfersFrom: [
      {
        sourceProgram: "amex-mr",
        ratio: [1, 1],
        minimumTransfer: 1000,
        transferSpeed: "Instant–24h",
        notes: "Best partner for most Canadians",
      },
    ],
  },
  {
    id: "avios",
    name: "British Airways Avios",
    type: "airline",
    alliance: "oneworld",
    transfersFrom: [
      {
        sourceProgram: "amex-mr",
        ratio: [1, 1],
        minimumTransfer: 1000,
        transferSpeed: "Instant–24h",
        notes: "Also usable on Iberia, Qatar, Finnair via Avios pooling",
      },
      {
        sourceProgram: "rbc-avion",
        ratio: [1, 1],
        minimumTransfer: 10000,
        transferSpeed: "Days (not instant)",
        notes: "~30% bonus annually. Elite tier only.",
      },
    ],
  },
  {
    id: "flying-blue",
    name: "Air France/KLM Flying Blue",
    type: "airline",
    alliance: "skyteam",
    transfersFrom: [
      {
        sourceProgram: "amex-mr",
        ratio: [1, 1],
        minimumTransfer: 1000,
        transferSpeed: "Instant–24h",
        notes: "Ratio improved early 2026. Good for Europe via Promo Rewards",
      },
    ],
  },
  {
    id: "asia-miles",
    name: "Cathay Pacific Asia Miles",
    type: "airline",
    alliance: "oneworld",
    transfersFrom: [
      {
        sourceProgram: "amex-mr",
        ratio: [1, 1],
        minimumTransfer: 1000,
        transferSpeed: "Instant–24h",
        notes: "Best for Asia-Pacific",
      },
      {
        sourceProgram: "rbc-avion",
        ratio: [1, 1],
        minimumTransfer: 10000,
        transferSpeed: "Days",
        notes: "Elite tier only",
      },
    ],
  },
  {
    id: "skymiles",
    name: "Delta SkyMiles",
    type: "airline",
    alliance: "skyteam",
    transfersFrom: [
      {
        sourceProgram: "amex-mr",
        ratio: [4, 3],
        minimumTransfer: 1000,
        transferSpeed: "Instant–24h",
        notes: "1,000 MR = 750 SkyMiles. Lower value - useful for domestic US or last-minute Delta flights",
      },
    ],
  },
  {
    id: "etihad-guest",
    name: "Etihad Guest",
    type: "airline",
    alliance: null,
    transfersFrom: [],
  },
  {
    id: "hilton-honors",
    name: "Hilton Honors",
    type: "hotel",
    transfersFrom: [
      {
        sourceProgram: "amex-mr",
        ratio: [1, 2],
        minimumTransfer: 1000,
        transferSpeed: "1–2 days",
        notes: "Hilton points ~0.5cpp, so effective MR value is low",
      },
    ],
  },
  {
    id: "marriott-bonvoy",
    name: "Marriott Bonvoy",
    type: "hotel",
    transfersFrom: [
      {
        sourceProgram: "amex-mr",
        ratio: [1, 1.2],
        minimumTransfer: 1000,
        transferSpeed: "Up to 3 weeks",
        notes: "Bonvoy points ~0.7–0.8cpp. Slow transfers",
      },
    ],
  },
  {
    id: "singapore-krisflyer",
    name: "Singapore KrisFlyer",
    type: "airline",
    alliance: "star",
    transfersFrom: [
      {
        sourceProgram: "marriott-bonvoy",
        ratio: [3, 1],
        minimumTransfer: 10000,
        transferSpeed: "Days",
        notes: "60,000 Bonvoy = 25,000 KrisFlyer (includes 5k bonus). Indirect from Amex MR: MR → Bonvoy (1:1.2) → KrisFlyer.",
      },
    ],
  },
  {
    id: "aadvantage",
    name: "American Airlines AAdvantage",
    type: "airline",
    alliance: "oneworld",
    transfersFrom: [
      {
        sourceProgram: "rbc-avion",
        ratio: [10, 7],
        minimumTransfer: 10000,
        transferSpeed: "Days",
        notes: "Weak ratio BUT only way to earn AAdvantage in Canada. Elite tier only.",
      },
    ],
  },
  {
    id: "westjet-dollars",
    name: "WestJet Dollars",
    type: "airline",
    alliance: null,
    transfersFrom: [
      {
        sourceProgram: "rbc-avion",
        ratio: [1, 1],
        minimumTransfer: 10000,
        transferSpeed: "Days",
        notes: "Available on Elite AND Premium tiers",
      },
    ],
  },
];
