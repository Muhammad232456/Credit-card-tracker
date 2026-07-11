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

export function DotIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
  );
}

export const CATEGORY_ICON_COMPONENTS: Record<string, (props: IconProps) => JSX.Element> = {
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
