import type { ReactElement } from 'react';

interface IconProps {
  className?: string;
}

const base = { viewBox: '0 0 24 24', fill: 'none' as const, xmlns: 'http://www.w3.org/2000/svg' };

export function WalletMark({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 9.5H22" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 14.5H10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function DashboardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function CardsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="2" y="5" width="20" height="14" rx="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2 9.5H22" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function PointsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 12l7-7 4 4 7-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 2h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OptimizeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

export function RedeemIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function SettingsIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M19.4 13a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V19.5a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1-1.55 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.55-1H4.5a2 2 0 110-4h.09a1.7 1.7 0 001.55-1 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H10a1.7 1.7 0 001-1.55V4.5a2 2 0 114 0v.09a1.7 1.7 0 001 1.55 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V10a1.7 1.7 0 001.55 1h.09a2 2 0 110 4h-.09a1.7 1.7 0 00-1.55 1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 9v4M12 16.5v.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M10.3 4.5l-8 14A1.5 1.5 0 003.6 21h16.8a1.5 1.5 0 001.3-2.5l-8-14a1.5 1.5 0 00-2.6 0z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function LoungeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 18l3-9 2 5 2-7 2 6 2-4 3 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function TravelCreditIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M12 3l2.6 5.8L21 9.5l-4.5 4.2L17.6 21 12 17.6 6.4 21l1.1-7.3L3 9.5l6.4-.7z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l7 3.2v5.3c0 4.6-3 8.6-7 9.5-4-.9-7-4.9-7-9.5V6.2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function CompanionIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="8.5" cy="8" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16" cy="8.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 19c0-3.3 2.5-5.5 5.5-5.5S14 15.7 14 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.5 13.8c2.8.2 4.9 2.2 4.9 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function HotelIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 21V6.5L12 3l8 3.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4 21h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function StatusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2l2.2 6.8H21l-5.6 4.1 2.1 6.9L12 15.7l-5.5 4.1 2.1-6.9L3 8.8h6.8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function BagIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function NexusIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.5h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 13.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function FxIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="15" cy="15" r="5.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function DiningIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 3v7a2 2 0 002 2v9M7 3v7M9 3v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 3c-1.5 0-2.5 2-2.5 5s1 5 2.5 5v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DeliveryIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="9" width="18" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 13h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9V6.5A1.5 1.5 0 019.5 5h5A1.5 1.5 0 0116 6.5V9" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function FuelIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4" y="4" width="10" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 9h2.5a1.5 1.5 0 011.5 1.5V15a1.5 1.5 0 003 0v-4l-2.5-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function SubscriptionIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 15a8 8 0 0114.9-4M20 9a8 8 0 01-14.9 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 4v5h5M20 20v-5h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DataIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 4a6.5 6.5 0 016.5 6.5c0 3.6-6.5 9.5-6.5 9.5s-6.5-5.9-6.5-9.5A6.5 6.5 0 019 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="9" cy="10.2" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function MessageIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5h16v11H8l-4 4z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function DotIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.5h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2m2 0v13a2 2 0 01-2 2H9a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ClipboardIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="8.5" y="2.5" width="7" height="3.5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 12h7M8.5 16h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="9" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 13h18" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9v12" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9c-1-3-3-4.5-4.5-3.5S6.5 9 12 9zM12 9c1-3 3-4.5 4.5-3.5S17.5 9 12 9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function DollarCircleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7v10M14.5 9.3c0-1-1-1.8-2.5-1.8s-2.5.8-2.5 1.8.9 1.5 2.5 1.9c1.6.4 2.5.9 2.5 1.9s-1 1.9-2.5 1.9-2.5-.8-2.5-1.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function LightbulbIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 18h6M10 21h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 3a6.5 6.5 0 00-3.5 12c.6.4 1 1.1 1 1.9V18h5v-1.1c0-.8.4-1.5 1-1.9A6.5 6.5 0 0012 3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function RocketIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2c2.5 2 4 5.5 4 9 0 2-1 4-2 5.5l-2 2.5-2-2.5c-1-1.5-2-3.5-2-5.5 0-3.5 1.5-7 4-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 16l-2.5 1.5V21L9 19M15 16l2.5 1.5V21L15 19" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function ThumbsUpIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M7 11v9H4v-9zM7 11l3.5-7c1 0 2 .8 2 2v3.5H17a1.6 1.6 0 011.5 2.2l-2 5.3a1.6 1.6 0 01-1.5 1H9a2 2 0 01-2-2v-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function CartIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 4h2l2.2 11.2A2 2 0 009.2 17h7.6a2 2 0 002-1.6L20.5 8H6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20.5" r="1.3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="20.5" r="1.3" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function FilmIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 4v16M17 4v16M3 9h4M17 9h4M3 15h4M17 15h4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function TvIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 21h8M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PillIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.5" y="9" width="17" height="7" rx="3.5" transform="rotate(-40 12 12.5)" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 9.5l4 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function ShoppingBagIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M6 8h12l1 12.5a1.5 1.5 0 01-1.5 1.5H6.5A1.5 1.5 0 015 20.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 8V6a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function SubwayIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="5" y="3" width="14" height="14" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="13" r="1" fill="currentColor" />
      <circle cx="15.5" cy="13" r="1" fill="currentColor" />
      <path d="M7 21l2-3M17 21l-2-3M5 17h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlaneIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M2 16l7-2v-4.5L3 7V5l6 1.5V4a2 2 0 014 0v2.5L19 5v2l-6 2.5V14l7 2v2l-7-1.5V19l2.5 1.5V22L12 21l-3.5 1.5V21L11 19v-2.5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BagPersonalIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="7" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 21c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export const CATEGORY_ICON_COMPONENTS: Record<string, (props: IconProps) => ReactElement> = {
  'travel-credit': TravelCreditIcon,
  lounge: LoungeIcon,
  companion: CompanionIcon,
  'free-night': HotelIcon,
  status: StatusIcon,
  insurance: ShieldIcon,
  bag: BagIcon,
  nexus: NexusIcon,
  'fx-savings': FxIcon,
  dining: DiningIcon,
  delivery: DeliveryIcon,
  fuel: FuelIcon,
  subscription: SubscriptionIcon,
  data: DataIcon,
  other: DotIcon,
};

export const SPEND_CAT_ICON_COMPONENTS: Record<string, (props: IconProps) => ReactElement> = {
  groceries: CartIcon,
  dining: DiningIcon,
  gas: FuelIcon,
  transit: SubwayIcon,
  travel: PlaneIcon,
  entertainment: FilmIcon,
  streaming: TvIcon,
  drugstore: PillIcon,
  other: ShoppingBagIcon,
};
