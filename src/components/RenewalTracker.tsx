import { getCardById } from '../data/cards';
import type { UserData } from '../types';

interface Props {
  data: UserData;
  onSelectCard: (cardId: string) => void;
}

export default function RenewalTracker({ data, onSelectCard }: Props) {
  const cardsWithRenewal = data.cards
    .map(uc => {
      const template = getCardById(uc.cardId);
      if (!template) return null;
      const days = uc.renewalDate
        ? Math.ceil((new Date(uc.renewalDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      return { userCard: uc, template, days };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a!.days === null && b!.days === null) return 0;
      if (a!.days === null) return 1;
      if (b!.days === null) return -1;
      return a!.days - b!.days;
    }) as Array<{ userCard: (typeof data.cards)[0]; template: ReturnType<typeof getCardById> & object; days: number | null }>;

  const noRenewalDate = data.cards.filter(uc => !uc.renewalDate);

  if (data.cards.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-ink">Upcoming Renewals</h3>
      <div className="space-y-2">
        {cardsWithRenewal.map(({ userCard, template, days }) => {
          if (!template) return null;
          const statusColor = days === null ? 'border-line bg-surface' :
            days < 30 ? 'border-rust bg-rust-bg' :
            days < 60 ? 'border-amber bg-amber-bg' :
            'border-forest bg-forest-bg';

          const badge = days === null ? null :
            days < 30 ? `🔴 ${days}d` :
            days < 60 ? `🟡 ${days}d` :
            `🟢 ${days}d`;

          return (
            <button
              key={userCard.cardId}
              onClick={() => onSelectCard(userCard.cardId)}
              className={`w-full text-left border rounded-xl p-3 flex items-center justify-between hover:shadow-sm transition-shadow ${statusColor}`}
            >
              <div>
                <p className="font-medium text-ink text-sm">{template.name}</p>
                <p className="text-xs text-ink-soft">
                  {userCard.renewalDate
                    ? `Renews ${new Date(userCard.renewalDate).toLocaleDateString('en-CA')}`
                    : 'No renewal date set'}
                </p>
              </div>
              {badge && <span className="font-mono text-sm font-bold text-ink">{badge}</span>}
              {!days && days !== 0 && <span className="text-xs text-ink-soft">Set date →</span>}
            </button>
          );
        })}
      </div>
      {noRenewalDate.length > 0 && (
        <p className="text-xs text-ink-soft">
          {noRenewalDate.length} card{noRenewalDate.length !== 1 ? 's' : ''} missing renewal date — tap to set.
        </p>
      )}
    </div>
  );
}
