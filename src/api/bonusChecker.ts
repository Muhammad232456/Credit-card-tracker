import type { WelcomeBonusResult, TransferBonusResult } from '../types';

const API_URL = 'https://api.anthropic.com/v1/messages';

function getApiKey(): string {
  return (import.meta as unknown as { env: Record<string, string> }).env.VITE_ANTHROPIC_API_KEY ?? '';
}

export async function fetchWelcomeBonus(
  cardName: string,
  issuer: string
): Promise<WelcomeBonusResult> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `What is the current welcome bonus for the ${cardName} by ${issuer} in Canada as of today? Return ONLY a JSON object: { "bonus_summary": string, "spend_requirement": string, "timeframe": string, "expiry_date": string|null, "source_url": string }. No other text.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = (data.content as Array<{ type: string; text?: string }>)
    .map(i => (i.type === 'text' ? i.text : ''))
    .filter(Boolean)
    .join('\n');
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as WelcomeBonusResult;
}

export async function fetchTransferBonuses(
  sourceProgram: 'amex-mr' | 'rbc-avion'
): Promise<TransferBonusResult[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('VITE_ANTHROPIC_API_KEY not set');

  const names: Record<string, string> = {
    'amex-mr': 'American Express Membership Rewards Canada',
    'rbc-avion': 'RBC Avion Rewards',
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `Are there any active transfer bonus promotions for ${names[sourceProgram]} in Canada right now? Check Frugal Flyer, Prince of Travel, and Frequent Miler. Return ONLY a JSON array: [{ "partner_name": string, "bonus_percentage": number|null, "expiry_date": string|null, "details": string }]. Empty array [] if none. No other text.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = (data.content as Array<{ type: string; text?: string }>)
    .map(i => (i.type === 'text' ? i.text : ''))
    .filter(Boolean)
    .join('\n');
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as TransferBonusResult[];
}
