import posthog from 'posthog-js';

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

export function initAnalytics() {
  if (KEY) {
    posthog.init(KEY, {
      api_host: 'https://eu.i.posthog.com',
      person_profiles: 'identified_only',
      capture_pageview: false, // we fire tab views manually
    });
  }
}

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
