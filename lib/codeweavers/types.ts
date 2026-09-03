/**
 * The Codeweavers JSON Finance contract, as far as this site uses it.
 *
 * Written from live responses rather than from documentation: the fields below
 * were observed on real calls to the production endpoint, and the two that the
 * written spec did not mention — the top-level `RepresentativeExample` and
 * `FinanceOptions` — are here because the API actually returns them.
 *
 * Deliberately partial. The Quote object has fifty-odd fields covering salary
 * sacrifice, benefit-in-kind, part exchange and lease products that this
 * dealership does not sell. Typing what we read keeps the surface honest;
 * anything absent here is absent because nothing renders it.
 */

/** Conditional Sale, Personal Contract Purchase, and whatever else appears. */
export type ProductKey = "CS" | "PCP" | (string & {});

export type DepositType = "Amount" | "Percentage" | "AdvancePayments";

export interface CodeweaversParameters {
  Term: number;
  Deposit: number;
  DepositType: DepositType;
  AnnualMileage: number;
  AnnualMileageUnit: "Miles";
}

/**
 * A vehicle as Codeweavers wants it.
 *
 * `RegistrationDate` is REQUIRED even though the contract does not mark it so.
 * Omit it and the API answers 200 with an empty FinanceProductResults array and
 * no error at all — a silent failure that looks exactly like "no lender would
 * quote". Verified.
 *
 * The three VRM fields are genuinely optional and travel together or not at
 * all. Most of this dealership's stock is Japanese imports with no UK plate,
 * and quotes come back fine without them.
 */
export interface CodeweaversVehicle {
  CashPrice: number;
  Type: "Car";
  VehicleStatus: "Preowned" | "New" | "Preregistered" | "Demonstrator";
  CurrentMileage: number;
  CurrentMileageUnit: "Miles";
  RegistrationDate: string;
  RegistrationCountryCode: "GB";
  IdentifierType?: "VRM";
  Identifier?: string;
  RegistrationNumber?: string;
}

export interface CodeweaversVehicleRequest {
  /** Echoed back on the result. The only safe way to map results to vehicles. */
  Id: string;
  Vehicle: CodeweaversVehicle;
}

export interface CodeweaversRequest {
  Parameters: CodeweaversParameters;
  VehicleRequests: CodeweaversVehicleRequest[];
}

export interface CodeweaversFee {
  Amount: number;
  /** HTML-escaped by the API — "&#163;10.00". Decode before rendering. */
  DisplayText: string;
  FeeType: string;
  Profile: string;
}

export interface CodeweaversPayment {
  Amount: number;
  NumberOfPayments: number;
}

export interface CodeweaversQuoteActions {
  Apply?: string;
  Refinance?: string;
  RetailerApply?: string;
  TermsAndConditions?: string;
}

export interface CodeweaversQuote {
  RegularPayment: number;
  AllInclusiveRegularPayment: number;
  Term: number;
  Apr: number;
  RateOfInterest: number;
  CashPrice: number;
  Deposit: number;
  TotalDeposit: number;
  Balance: number;
  TotalAmountPayable: number;
  TotalChargeForCredit?: number;
  AmountOfCredit?: number;
  /** Balloon. Zero on Conditional Sale. */
  Residual: number;
  FinalPayment?: number;
  NumberOfRegularPayments: number;
  Payments?: CodeweaversPayment[];
  Fees?: CodeweaversFee[];
  /** Set on exactly one result per RESPONSE, not per vehicle. */
  IsRepresentativeExample?: boolean;
  QuoteReference?: string;
  QuoteLink?: string;
  QuoteActions?: CodeweaversQuoteActions;
  /** PCP only. */
  ContractMileage?: number;
  ExcessMileageRate?: number;
  AnnualMileage?: number;
}

export interface CodeweaversError {
  /** Safe to show a customer. */
  DealerMessage?: string;
  /** Internal only. Log it, never render it. */
  TechnicalMessage?: string;
  Code?: string;
}

export interface CodeweaversNotifications {
  Public?: Array<{ Message: string; Code?: string; Value?: unknown }>;
}

export interface CodeweaversProductResult {
  Key: ProductKey;
  HasError: boolean;
  Error?: CodeweaversError;
  Notifications?: CodeweaversNotifications;
  Quote?: CodeweaversQuote;
}

export interface CodeweaversVehicleResult {
  Id: string;
  FinanceProductResults?: CodeweaversProductResult[];
}

export interface CodeweaversResponse {
  VehicleResults?: CodeweaversVehicleResult[];
  /**
   * A whole product result, not a boolean — the API nominates one and returns
   * it here with a complete quote. Undocumented in the brief; observed live.
   */
  RepresentativeExample?: CodeweaversProductResult;
  /**
   * Term and mileage bounds. Returns all zeros on this account, so nothing is
   * driven from it — the control ranges are ours. Typed so that a future
   * account with real values is a change in one place, not a discovery.
   */
  FinanceOptions?: {
    DefaultAnnualMileage: number;
    DefaultTerm: number;
    Deposit: number;
    Terms: number[];
    AnnualMileages: number[];
    MinTerm: number;
    MaxTerm: number;
    MinMileage: number;
    MaxMileage: number;
  };
}

/* ------------------------------------------------------------------ */
/* Our own shape — what the rest of the site consumes                   */
/* ------------------------------------------------------------------ */

/**
 * One product that quoted successfully.
 *
 * Every number here came from the API. Nothing on this type is derived,
 * rounded up, or interpolated: a displayed finance figure the lender did not
 * produce is a false financial promotion, so the only arithmetic anywhere in
 * this feature is currency formatting to two places.
 */
export interface FinanceQuote {
  product: ProductKey;
  /** "Conditional Sale" / "Personal Contract Purchase" — for display. */
  productName: string;
  monthlyPayment: number;
  term: number;
  apr: number;
  rateOfInterest: number;
  cashPrice: number;
  deposit: number;
  totalAmountPayable: number;
  amountOfCredit: number | null;
  totalChargeForCredit: number | null;
  /** Balloon; null on products that have none. */
  finalPayment: number | null;
  numberOfPayments: number;
  /** Already entity-decoded. Safe to render as text. */
  fees: Array<{ amount: number; text: string; profile: string }>;
  /** Things the customer should read — an adjusted term, for instance. */
  notices: string[];
  applyUrl: string | null;
  termsUrl: string | null;
  quoteReference: string | null;
  contractMileage: number | null;
  excessMileageRate: number | null;
}

/** Every product for one vehicle. `quotes` is empty when none succeeded. */
export interface VehicleFinance {
  vehicleId: string;
  quotes: FinanceQuote[];
  /** The cheapest monthly payment, for the "from £x" on a card. */
  cheapest: FinanceQuote | null;
}

export interface FinanceParameters {
  deposit: number;
  depositType: DepositType;
  term: number;
  annualMileage: number;
}

/** The input this site holds about a car, before it becomes a request. */
export interface FinanceVehicleInput {
  id: string;
  price: number;
  mileage: number;
  /** Full ISO date. See registrationDate() for how it is derived. */
  registrationDate: string;
  /** Only when it is genuinely a UK plate. */
  vrm?: string;
}
