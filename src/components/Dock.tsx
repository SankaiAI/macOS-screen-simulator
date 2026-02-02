interface DockProps {
    className?: string
    itemSize?: number
}

// macOS app icons from PuruVJ/macos-web repository
const ICON_BASE = 'https://raw.githubusercontent.com/PuruVJ/macos-web/main/public/app-icons'

const dockApps = [
    { name: 'Finder', img: `${ICON_BASE}/finder/256.png`, active: false },
    { name: 'Safari', img: `${ICON_BASE}/safari/256.png`, active: true },
    { name: 'Messages', img: `${ICON_BASE}/messages/256.png`, active: false },
    { name: 'Mail', img: `${ICON_BASE}/mail/256.png`, active: false },
    { name: 'Photos', img: `${ICON_BASE}/photos/256.png`, active: false },
    { name: 'Music', img: `${ICON_BASE}/music/256.png`, active: false },
    { name: 'App Store', img: `${ICON_BASE}/appstore/256.png`, active: false },
    { name: 'System Settings', img: `${ICON_BASE}/system-preferences/256.png`, active: false },
]

// Downloads folder SVG icon (macOS-style stacked folder)
const DownloadsIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
            <linearGradient id="folderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6cb5f9" />
                <stop offset="100%" stopColor="#2a8af6" />
            </linearGradient>
        </defs>
        {/* Stack effect - back folders */}
        <rect x="12" y="8" width="70" height="50" rx="4" fill="#7ab8f5" opacity="0.6" transform="rotate(-3 47 33)" />
        <rect x="14" y="12" width="70" height="50" rx="4" fill="#8fc4f7" opacity="0.8" transform="rotate(-1.5 49 37)" />
        {/* Main folder */}
        <rect x="15" y="20" width="70" height="55" rx="6" fill="url(#folderGrad)" />
        <path d="M15 26 L15 25 Q15 20 20 20 L38 20 L42 25 L80 25 Q85 25 85 30 L85 26 Q85 21 80 21 L42 21 L38 16 L20 16 Q15 16 15 21 Z" fill="#63a4ee" />
        {/* Download arrow */}
        <path d="M50 40 L50 58 M42 52 L50 60 L58 52" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </svg>
)

// Trash can SVG icon (macOS-style)
const TrashIcon = () => (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
        <defs>
            <linearGradient id="trashGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#aeaeb2" />
                <stop offset="100%" stopColor="#8e8e93" />
            </linearGradient>
        </defs>
        {/* Trash can body */}
        <path d="M25 30 L30 85 Q31 90 36 90 L64 90 Q69 90 70 85 L75 30 Z" fill="url(#trashGrad)" />
        {/* Lid */}
        <rect x="20" y="22" width="60" height="8" rx="2" fill="#8e8e93" />
        {/* Handle */}
        <rect x="38" y="15" width="24" height="7" rx="2" fill="#8e8e93" />
        {/* Lines on trash */}
        <line x1="38" y1="40" x2="40" y2="78" stroke="#6d6d72" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="40" x2="50" y2="78" stroke="#6d6d72" strokeWidth="3" strokeLinecap="round" />
        <line x1="62" y1="40" x2="60" y2="78" stroke="#6d6d72" strokeWidth="3" strokeLinecap="round" />
    </svg>
)

export default function Dock({ className = '', itemSize = 48 }: DockProps) {
    return (
        <div className={`flex items-end justify-center pb-2 ${className}`}>
            <div className="flex items-end gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-2xl rounded-2xl border border-white/30 shadow-lg" style={{ height: 'auto' }}>
                {dockApps.map((app, index) => (
                    <div key={index} className="group relative">
                        {/* App icon */}
                        <div
                            className="rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ease-out group-hover:scale-125 group-hover:-translate-y-3"
                            style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
                            title={app.name}
                        >
                            <img
                                src={app.img}
                                alt={app.name}
                                className="w-full h-full object-contain drop-shadow-md"
                            />
                        </div>

                        {/* Active indicator dot */}
                        {app.active && (
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white/80 rounded-full" />
                        )}

                        {/* Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800/90 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                            {app.name}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800/90" />
                        </div>
                    </div>
                ))}

                {/* Separator */}
                <div className="w-px bg-white/30 mx-1 mb-1" style={{ height: `${itemSize * 0.8}px` }} />

                {/* Downloads */}
                <div className="group relative">
                    <div
                        className="rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ease-out group-hover:scale-125 group-hover:-translate-y-3"
                        style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
                        title="Downloads"
                    >
                        <DownloadsIcon />
                    </div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800/90 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                        Downloads
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800/90" />
                    </div>
                </div>

                {/* Trash */}
                <div className="group relative">
                    <div
                        className="rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ease-out group-hover:scale-125 group-hover:-translate-y-3"
                        style={{ width: `${itemSize}px`, height: `${itemSize}px` }}
                        title="Trash"
                    >
                        <TrashIcon />
                    </div>
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-800/90 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg z-50">
                        Trash
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800/90" />
                    </div>
                </div>
            </div>
        </div>
    )
}
