interface TrafficLightsProps {
    onClose?: () => void
    onMinimize?: () => void
    onZoom?: () => void
    className?: string
}

export default function TrafficLights({
    onClose,
    onMinimize,
    onZoom,
    className = '',
}: TrafficLightsProps) {
    return (
        <div className={`flex items-center gap-2 group ${className}`}>
            {/* Close button - Red */}
            <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-[#ed6a5f] border border-[#e24b41] flex items-center justify-center cursor-pointer hover:brightness-95 transition-all"
                title="Close"
            >
                <svg
                    className="w-2 h-2 text-[#460804] opacity-0 group-hover:opacity-100 transition-opacity"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                >
                    <path d="M3.5 3.5l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
            </button>

            {/* Minimize button - Yellow */}
            <button
                onClick={onMinimize}
                className="w-3 h-3 rounded-full bg-[#f6be50] border border-[#e1a73e] flex items-center justify-center cursor-pointer hover:brightness-95 transition-all"
                title="Minimize"
            >
                <svg
                    className="w-2 h-2 text-[#90591d] opacity-0 group-hover:opacity-100 transition-opacity"
                    viewBox="0 0 12 12"
                    fill="currentColor"
                >
                    <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                </svg>
            </button>

            {/* Zoom button - Green */}
            <button
                onClick={onZoom}
                className="w-3 h-3 rounded-full bg-[#61c555] border border-[#2dac2f] flex items-center justify-center cursor-pointer hover:brightness-95 transition-all"
                title="Zoom"
            >
                <svg
                    className="w-2 h-2 text-[#2a6218] opacity-0 group-hover:opacity-100 transition-opacity"
                    viewBox="0 0 12 12"
                    fill="none"
                >
                    {/* Diagonal arrows for fullscreen */}
                    <path d="M2 4V2h2M10 4V2H8M2 8v2h2M10 8v2H8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
        </div>
    )
}
