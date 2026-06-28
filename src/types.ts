export type Issuer =
  | "Amex" | "TD" | "CIBC" | "RBC" | "Scotiabank" | "BMO" | "National Bank" | "HSBC" | "Neo" | "MBNA"
  | "Canadian Tire" | "PC Financial" | "Rogers" | "Tangerine" | "Brim"
  | "Desjardins" | "Home Trust" | "Meridian" | "Capital One" | "Walmart"
  | "Simplii" | "ATB";

/** One supplementary card tier offered on a card (e.g. Supp Platinum $175, Supp Gold $0) */
export interface SupplementaryCardOption {
  name: string;
  fee: number;
  feeNote?: string;
  /** Human-readable perks the supplementary cardholder receives */
  perks?: string[];
}

/** A supplementary card actually added by the user */
export interface UserSupplementaryCard {
  id: string;
  holderName: string;
  optionIndex: number;  // index into CardTemplate.supplementaryCardOptions
  addedDate?: string;
}

/** Points/cash-back earning multiplier by spend category */
export interface EarningRate {
  category: string;           // e.g. "Dining & Drinks", "Groceries", "Travel", "Everything Else"
  multiplier: number;         // e.g. 5 for 5× points, 0.02 for 2% cash back
  unit: "points" | "percent"; // "points" = multiplier × points per dollar; "percent" = % cash back
  programId?: string;         // links to PointsProgram id for points cards
  note?: string;
}

/** Insurance coverage included with the card */
export interface InsuranceCoverage {
  type: string;           // e.g. "Out-of-Province Medical", "Trip Cancellation", "Car Rental"
  maxDays?: number;       // travel medical: max consecutive days
  maxCoverage?: string;   // e.g. "$2,000,000", "$1,500"
  ageLimit?: number;      // e.g. 65 for travel medical
  note?: string;
}

export interface BenefitTemplate {
  id: string;
  name: string;
  value: number;
  frequency: "annual" | "monthly" | "per-use";
  maxUses?: number;
  resetDate: "calendar-year" | "cardmember-year";
  condition?: string;
  category: "travel-credit" | "lounge" | "companion" | "free-night" | "status" | "insurance" | "bag" | "nexus" | "fx-savings" | "dining" | "delivery" | "fuel" | "subscription" | "data" | "other";
  note?: string;
  expiryWarning?: string;
}

export interface MonthlySpendProfile {
  groceries: number;
  dining: number;
  gas: number;
  transit: number;
  travel: number;
  entertainment: number;
  streaming: number;
  drugstore: number;
  other: number;
}

export interface CardTemplate {
  id: string;
  name: string;
  issuer: Issuer;
  network: "Visa" | "Mastercard" | "Amex";
  annualFee: number;
  annualFeeNote?: string;
  /** How the annual fee is billed. Defaults to "annual" when omitted. */
  feeFrequency?: "monthly" | "annual";
  /** True if the first year's annual fee is currently waived */
  firstYearFeeWaived?: boolean;
  /** Minimum personal income in CAD required for eligibility */
  minIncome?: number;
  lastVerified: string;
  benefits: BenefitTemplate[];
  supplementaryCardOptions?: SupplementaryCardOption[];
  earningRates?: EarningRate[];
  insurance?: InsuranceCoverage[];
}

export interface PointsProgram {
  id: string;
  name: string;
  type: "airline" | "hotel" | "transferable" | "bank";
  alliance?: "star" | "oneworld" | "skyteam" | null;
  defaultCpp: number;      // benchmark CPP — minimum to aim for
  excellentCpp?: number;   // threshold for an "excellent" redemption
  isTransferable: boolean;
  note?: string;           // general program note (transfer info, caveats)
  sweetSpots?: string;     // redemption tips shown in the evaluator
}

export interface TransferPartner {
  id: string;
  name: string;
  type: "airline" | "hotel" | "retail";
  alliance?: "star" | "oneworld" | "skyteam" | null;
  transfersFrom: TransferRoute[];
}

export interface TransferRoute {
  sourceProgram: string;
  ratio: [number, number];
  minimumTransfer: number;
  transferSpeed: string;
  notes?: string;
  expiryDate?: string;
}

export interface WelcomeBonusTier {
  label: string;                              // e.g. "35,000 Avion Points"
  type: 'approval' | 'spend' | 'anniversary'; // drives display logic
  spendRequired?: number;                     // only for type='spend'
  earned: boolean;
}

export interface WelcomeBonusProgress {
  tiers: WelcomeBonusTier[];
  spendSoFar: number;   // running total for the spend tier
  deadline?: string;    // deadline for the spend window
}

export interface UserCard {
  cardId: string;
  openedDate?: string;
  /** Manual renewal date override. If absent, auto-calculated from openedDate. */
  renewalDate?: string;
  status: "active" | "inactive";
  closedDate?: string;
  creditLimit?: number;
  /** Day of month the statement closes (1–31) */
  statementDay?: number;
  /** Days after statement close that payment is due (e.g., 21) */
  paymentDueDays?: number;
  /** Free-form note about a product change or downgrade */
  productChangeNote?: string;
  /** ISO date of the most recent product change */
  productChangeDate?: string;
  benefitUsage: Record<string, number>;
  supplementaryCards?: UserSupplementaryCard[];
  welcomeBonus?: WelcomeBonusProgress;
}

export interface PointsBalance {
  programId: string;
  balance: number;
  lastUpdated: string;
  cppOverride?: number;
}

export interface BonusCache {
  type: "welcome" | "transfer";
  key: string;
  data: unknown;
  checkedAt: string;
  expiresAt: string;
}

export interface UserSettings {
  displayCurrency: "CAD";
  showValueEstimates: boolean;
  /** Annual foreign currency spend in CAD — used to calculate FX fee savings */
  annualFxSpend?: number;
  /** Monthly spend profile for the spend optimizer */
  monthlySpend?: Partial<MonthlySpendProfile>;
}

export interface UserData {
  version: number;
  trackingYear: number;
  cards: UserCard[];
  pointsBalances: PointsBalance[];
  bonusCache: BonusCache[];
  settings: UserSettings;
}

export interface WelcomeBonusResult {
  bonus_summary: string;
  spend_requirement: string;
  timeframe: string;
  expiry_date: string | null;
  source_url: string;
}

export interface TransferBonusResult {
  partner_name: string;
  bonus_percentage: number | null;
  expiry_date: string | null;
  details: string;
}
