import posthog from 'posthog-js';

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

export function initAnalytics() {
  if (KEY) {
    posthog.init(KEY, {
      api_host: 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: true,
      session_recording: {
        maskAllInputs: false,
        maskInputOptions: { password: true },
      },
    });
  }
}

// Cards
export function trackCardAdded(cardId: string, cardName: string, issuer: string) {
  if (!KEY) return;
  posthog.capture('card_added', { cardId, cardName, issuer });
}
export function trackCardRemoved(cardId: string, cardName: string, issuer: string) {
  if (!KEY) return;
  posthog.capture('card_removed', { cardId, cardName, issuer });
}
export function trackCardDetailViewed(cardId: string, cardName: string, issuer: string) {
  if (!KEY) return;
  posthog.capture('card_detail_viewed', { cardId, cardName, issuer });
}
export function trackBenefitMarked(cardId: string, benefitId: string, benefitName: string, count: number) {
  if (!KEY) return;
  posthog.capture('benefit_marked', { cardId, benefitId, benefitName, count });
}
export function trackAddCardFlowStarted() {
  if (!KEY) return;
  posthog.capture('add_card_flow_started');
}

// Points
export function trackProgramAdded(programId: string, programName: string, initialBalance: number) {
  if (!KEY) return;
  posthog.capture('program_added', { programId, programName, initialBalance });
}
export function trackProgramRemoved(programId: string, programName: string) {
  if (!KEY) return;
  posthog.capture('program_removed', { programId, programName });
}
export function trackBalanceUpdated(programId: string, newBalance: number) {
  if (!KEY) return;
  posthog.capture('balance_updated', { programId, newBalance });
}

// Redemption
export function trackRedemptionEvaluated(programId: string, cpp: number, rating: string, cashPrice: number, points: number) {
  if (!KEY) return;
  posthog.capture('redemption_evaluated', { programId, cpp, rating, cashPrice, points });
}

// Transfers
export function trackTransferSourceViewed(sourceProgram: string) {
  if (!KEY) return;
  posthog.capture('transfer_source_viewed', { sourceProgram });
}

// Existing
export function trackApplyClick(cardId: string, cardName: string, issuer: string, source: string) {
  if (!KEY) return;
  posthog.capture('apply_click', { cardId, cardName, issuer, source });
}
export function trackTabView(tab: string) {
  if (!KEY) return;
  posthog.capture('tab_view', { tab });
}
export function trackEvent(event: string, props?: Record<string, unknown>) {
  if (!KEY) return;
  posthog.capture(event, props);
}

// Person properties — call after data changes to keep profile up to date
export function updatePersonProperties(props: Record<string, unknown>) {
  if (!KEY) return;
  posthog.setPersonPropertiesForFlags(props);
  posthog.capture('$set', { $set: props });
}
