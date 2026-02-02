import { Download, Loader2 } from 'lucide-react'

interface HeaderProps {
    onExport?: () => void
    hasContent?: boolean
    isExporting?: boolean
}

// Pixel-art style monitor icon
function PixelMonitorIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            {/* Monitor frame */}
            <rect x="2" y="3" width="20" height="14" fill="#6366f1" />
            <rect x="3" y="4" width="18" height="12" fill="#1e1b4b" />
            {/* Screen content - pixel pattern */}
            <rect x="5" y="6" width="2" height="2" fill="#818cf8" />
            <rect x="8" y="6" width="6" height="2" fill="#818cf8" />
            <rect x="5" y="9" width="10" height="2" fill="#6366f1" />
            <rect x="5" y="12" width="8" height="2" fill="#4f46e5" />
            <rect x="16" y="6" width="3" height="3" fill="#f97316" />
            {/* Stand */}
            <rect x="10" y="17" width="4" height="2" fill="#6366f1" />
            <rect x="8" y="19" width="8" height="2" fill="#6366f1" />
        </svg>
    )
}

export default function Header({ onExport, hasContent = false, isExporting = false }: HeaderProps) {
    return (
        <header className="glass sticky top-0 z-50 border-b border-dark-600">
            <div className="flex items-center justify-between h-14 px-4">
                {/* Logo & Title - Left aligned */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-dark-700 border border-dark-500 flex items-center justify-center">
                        <PixelMonitorIcon />
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="text-base font-heading font-semibold text-white leading-tight">
                            macOS Screen Simulator
                        </h1>
                        <p className="text-xs text-gray-500">
                            Professional macOS mocks for Windows
                        </p>
                    </div>
                </div>

                {/* Primary Action - Download PNG */}
                <button
                    onClick={onExport}
                    disabled={!hasContent || isExporting}
                    className={`h-9 px-4 font-medium text-sm rounded-lg transition-all duration-200 flex items-center gap-2 ${hasContent && !isExporting
                        ? 'bg-accent hover:bg-accent-light text-white shadow-lg shadow-accent/25 cursor-pointer'
                        : 'bg-dark-700 border border-dark-500 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Capturing...</span>
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Download PNG</span>
                        </>
                    )}
                </button>
            </div>
        </header>
    )
}
