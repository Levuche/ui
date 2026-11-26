import type { SVGProps } from 'react';

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  size?: number;
  /** Accessible name. Leave out when text next to the icon names it. */
  title?: string;
};

function Svg({
  size = 24,
  title,
  children,
  ...props
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...(title
        ? { role: 'img', 'aria-label': title }
        : { 'aria-hidden': true, focusable: false })}
      {...props}
    >
      {children}
    </svg>
  );
}

/* Icons for a creator's page: 24 px, 2 px stroke, currentColor. */
export const ShareIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12M7 8l5-5 5 5" />
    <path d="M5 13v6h14v-6" />
  </Svg>
);
export const QrCodeIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
    <path d="M14 14h3v3h-3zM20 14v7M14 20h3" />
  </Svg>
);
export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-7-6.2-7-12a7 7 0 0114 0c0 5.8-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.5" />
  </Svg>
);
export const ForkIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="6" cy="5" r="2" />
    <circle cx="18" cy="5" r="2" />
    <circle cx="12" cy="19" r="2" />
    <path d="M6 7v2a3 3 0 003 3h6a3 3 0 003-3V7M12 12v5" />
  </Svg>
);
export const CodeIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16" />
  </Svg>
);
export const EmailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </Svg>
);
export const ChatIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 5h16v11H9l-5 4z" />
    <path d="M8 9.5h8M8 12.5h5" />
  </Svg>
);
export const SendIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 3L3 10.5l7 2.5 2.5 7z" />
    <path d="M10 13l11-10" />
  </Svg>
);
export const LockIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 018 0v3" />
  </Svg>
);
export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12l5 5 9-10" />
  </Svg>
);
/** Points the way the text reads; flip it in right-to-left text. */
export const ArrowRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Svg>
);
export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 10l5 5 5-5" />
  </Svg>
);
export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
);
export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);
export const PauseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5v14M15 5v14" />
  </Svg>
);
export const SoundOnIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
  </Svg>
);
export const SoundOffIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9v6h4l5 4V5L8 9H4z" />
    <path d="M17 9.5l5 5M22 9.5l-5 5" />
  </Svg>
);
export const ArrowsHorizontalIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
  </Svg>
);
export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 005.6 0l3-3a4 4 0 00-5.6-5.6l-1 1" />
    <path d="M14 10a4 4 0 00-5.6 0l-3 3a4 4 0 005.6 5.6l1-1" />
  </Svg>
);
export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </Svg>
);

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);
export const TicketIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
    <path d="M14 6v12" strokeDasharray="2 2" />
  </Svg>
);
export const ClockIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Svg>
);
export const StarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9z" />
  </Svg>
);
export const CopyIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 012-2h10" />
  </Svg>
);
export const DownloadIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12M7 10l5 5 5-5" />
    <path d="M5 19h14" />
  </Svg>
);
export const HeartIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.4-9.2-8.6A5 5 0 0112 6a5 5 0 019.2 5.4C19 15.6 12 20 12 20z" />
  </Svg>
);

/** The loading arc used inside busy buttons. Always decorative. */
/* For links and media on a creator's page. */
export const PlayIcon = (p: IconProps) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l11-6.5a1 1 0 0 0 0-1.72l-11-6.5A1 1 0 0 0 8 5.5z" />
  </Svg>
);
export const VideoIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="M10 9.5v5l4.5-2.5z" />
  </Svg>
);
export const CameraIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </Svg>
);
export const GlobeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </Svg>
);
export const AppIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="6" y="2" width="12" height="20" rx="3" />
    <path d="M11 18h2" />
  </Svg>
);

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden
      focusable={false}
      className="animate-spin motion-reduce:animate-none"
    >
      <path d="M12 3a9 9 0 109 9" strokeLinecap="round" />
    </svg>
  );
}
