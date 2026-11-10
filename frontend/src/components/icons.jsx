const Icon = ({ size = 18, className = "", children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {children}
  </svg>
);

const FILE = "M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z";
const FOLDER = "M4 20h16a2 2 0 002-2V8a2 2 0 00-2-2h-7.93a2 2 0 01-1.66-.9l-.82-1.2A2 2 0 007.93 3H4a2 2 0 00-2 2v13a2 2 0 002 2z";

export const FolderIcon = (p) => <Icon {...p}><path d={FOLDER} /></Icon>;
export const FolderOpenIcon = (p) => <Icon {...p}><path d="M6 14l1.5-2.9A2 2 0 019.24 10H20a2 2 0 011.94 2.5l-1.54 6a2 2 0 01-1.95 1.5H4a2 2 0 01-2-2V5a2 2 0 012-2h3.9a2 2 0 011.69.9l.81 1.2a2 2 0 001.67.9H18a2 2 0 012 2v2" /></Icon>;
export const FileIcon = (p) => <Icon {...p}><path d={FILE} /><path d="M14 2v6h6" /></Icon>;
export const FilePlusIcon = (p) => <Icon {...p}><path d={FILE} /><path d="M14 2v6h6M12 18v-6M9 15h6" /></Icon>;
export const FolderPlusIcon = (p) => <Icon {...p}><path d={FOLDER} /><path d="M12 10v6M9 13h6" /></Icon>;
export const FilesIcon = (p) => <Icon {...p}><rect x="8" y="8" width="14" height="14" rx="2" /><path d="M4 16a2 2 0 01-2-2V4a2 2 0 012-2h10a2 2 0 012 2" /></Icon>;
export const BotIcon = (p) => <Icon {...p}><path d="M12 8V4H8" /><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></Icon>;
export const SquareTerminalIcon = (p) => <Icon {...p}><path d="M7 11l2-2-2-2M11 13h4" /><rect x="3" y="3" width="18" height="18" rx="2" /></Icon>;
export const CodeIcon = (p) => <Icon {...p}><path d="M16 18l6-6-6-6M8 6l-6 6 6 6" /></Icon>;
export const EyeIcon = (p) => <Icon {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>;
export const XIcon = (p) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12" /></Icon>;
export const SendIcon = (p) => <Icon {...p}><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></Icon>;
export const RefreshIcon = (p) => <Icon {...p}><path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16M8 16H3v5" /></Icon>;
export const TrashIcon = (p) => <Icon {...p}><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" /></Icon>;
export const AlertIcon = (p) => <Icon {...p}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" /></Icon>;
export const OutputIcon = (p) => <Icon {...p}><path d={FILE} /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></Icon>;
export const ChevronRight = (p) => <Icon {...p}><path d="M9 6l6 6-6 6" /></Icon>;
export const ChevronDown = (p) => <Icon {...p}><path d="M6 9l6 6 6-6" /></Icon>;
export const CircleIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="9" /></Icon>;
export const SparkIcon = (p) => <Icon {...p}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" /></Icon>;
export const SunIcon = (p) => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Icon>;
export const MoonIcon = (p) => <Icon {...p}><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></Icon>;

export function KilnLogo({ className = "h-8 w-8" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} role="img" aria-label="Kiln logo">
      <rect width="32" height="32" rx="9" fill="#0E1F22" />
      <path d="M12 9l-6 7 6 7M20 9l6 7-6 7" fill="none" stroke="#2BB5A6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 10c2 2.5 3 4 3 6a3 3 0 11-6 0c0-1 .4-1.8 1.2-2.6.2 1 .8 1.4 1.3 1.4-.2-1.8.1-3.4.5-4.8z" fill="#FF9F43" />
    </svg>
  );
}
