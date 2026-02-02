import {
    Layout,
    Video,
    Mic,
    MousePointer,
    Trash2,
    Palette,
    Square,
    Volume2,
    Play,
    Pause
} from 'lucide-react'
import { MAC_MODELS, type MacModel, CURSOR_OPTIONS } from '../constants'
import type { WallpaperType } from '../App'

interface SidebarProps {
    wallpaper: WallpaperType
    onWallpaperChange: (wallpaper: WallpaperType) => void
    onExport: () => void
    isExporting: boolean
    showDock: boolean
    setShowDock: (show: boolean) => void
    showMenuBar: boolean
    setShowMenuBar: (show: boolean) => void

    // Recording props
    onRecordingStart: () => void
    onRecordingStop: () => void
    isRecording: boolean
    isPaused: boolean
    onTogglePause: () => void
    recordingTime: number
    includeSystemAudio: boolean
    setIncludeSystemAudio: (include: boolean) => void
    includeMicAudio: boolean
    setIncludeMicAudio: (include: boolean) => void
    showWebcam: boolean
    onToggleWebcam: () => void

    // Device Size
    selectedModel?: MacModel
    onSelectModel?: (model: MacModel) => void

    // Cursor
    cursorStyle?: string
    onCursorChange?: (style: string) => void
    cursorSize?: number
    onCursorSizeChange?: (size: number) => void

    // Content
    hasContent?: boolean
    onClear?: () => void
    isInteracting?: boolean
    setIsInteracting?: (isInteracting: boolean) => void
}

const wallpapers: { id: WallpaperType; name: string; preview: string }[] = [
    { id: 'sequoia', name: 'Sequoia', preview: 'bg-gradient-to-br from-orange-600 via-red-500 to-purple-700' },
    { id: 'sonoma', name: 'Sonoma', preview: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400' },
    { id: 'monterey', name: 'Monterey', preview: 'bg-gradient-to-br from-purple-900 via-blue-800 to-cyan-600' },
    { id: 'ventura', name: 'Ventura', preview: 'bg-gradient-to-br from-orange-500 via-yellow-400 to-teal-500' },
    { id: 'big-sur', name: 'Big Sur', preview: 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500' },
    { id: 'abstract-dark', name: 'Dark', preview: 'bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900' },
    { id: 'abstract-light', name: 'Light', preview: 'bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100' },
]

// Format seconds to MM:SS
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

export default function Sidebar({
    wallpaper,
    onWallpaperChange,
    showDock = true,
    setShowDock,
    showMenuBar = true,
    setShowMenuBar,
    isRecording = false,
    isPaused = false,
    recordingTime = 0,
    onRecordingStart,
    onRecordingStop,
    onTogglePause,
    includeSystemAudio = false,
    setIncludeSystemAudio,
    includeMicAudio = false,
    setIncludeMicAudio,
    showWebcam = false,
    onToggleWebcam,
    selectedModel,
    onSelectModel,
    cursorStyle,
    onCursorChange,
    cursorSize,
    onCursorSizeChange,
    hasContent,
    onClear,
    isInteracting = false,
    setIsInteracting,
}: SidebarProps) {
    return (
        <aside className="w-64 shrink-0 glass border-r border-dark-600 p-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-transparent">
            {/* Device Size Selection */}
            <section>
                <h2 className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5" />
                    Device Size
                </h2>
                <div className="grid grid-cols-2 gap-2">
                    {MAC_MODELS.map((model) => (
                        <button
                            key={model.id}
                            onClick={() => onSelectModel?.(model)}
                            className={`px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200 border text-center cursor-pointer ${selectedModel?.id === model.id
                                ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                                : 'bg-dark-600 border-transparent text-gray-400 hover:bg-dark-500'
                                }`}
                        >
                            {model.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Mouse Cursor Selection */}
            <section>
                <h2 className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.1">
                    <MousePointer className="w-3.5 h-3.5" />
                    Mouse Cursor
                </h2>
                <div className="grid grid-cols-2 gap-2">
                    {CURSOR_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => onCursorChange?.(option.value)}
                            className={`px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200 border text-center cursor-pointer ${cursorStyle === option.value
                                ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                                : 'bg-dark-600 border-transparent text-gray-400 hover:bg-dark-500'
                                }`}
                            style={{ cursor: option.value }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                {/* Cursor Size Slider */}
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-gray-500">Size</span>
                        <span className="text-[10px] font-mono text-gray-400">{cursorSize?.toFixed(1)}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="3"
                        step="0.1"
                        value={cursorSize || 1}
                        onChange={(e) => onCursorSizeChange?.(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                </div>
            </section>

            {/* Layout Options */}
            <section>
                <h2 className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5" />
                    Layout
                </h2>
                <button
                    onClick={() => setShowDock?.(!showDock)}
                    className={`w-full py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border ${showDock
                        ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                        : 'bg-dark-600 border-transparent text-gray-400 hover:bg-dark-500'
                        }`}
                >
                    <div className={`w-3 h-3 rounded-sm border ${showDock ? 'bg-current border-current' : 'border-current'}`} />
                    {showDock ? 'Dock Visible' : 'Dock Hidden'}
                </button>
                <button
                    onClick={() => setShowMenuBar?.(!showMenuBar)}
                    className={`w-full mt-2 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border ${showMenuBar
                        ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                        : 'bg-dark-600 border-transparent text-gray-400 hover:bg-dark-500'
                        }`}
                >
                    <div className={`w-3 h-3 rounded-sm border ${showMenuBar ? 'bg-current border-current border-t-2' : 'border-current border-t-2'}`} />
                    {showMenuBar ? 'Menu Bar Visible' : 'Menu Bar Hidden'}
                </button>

                <button
                    onClick={() => setIsInteracting?.(!isInteracting)}
                    className={`w-full mt-2 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border ${isInteracting
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-dark-600 border-transparent text-gray-400 hover:bg-dark-500'
                        }`}
                >
                    <MousePointer className="w-3.5 h-3.5" />
                    {isInteracting ? 'Interactive Mode' : 'Screenshot Mode'}
                </button>
            </section>

            {/* Wallpaper Selection */}
            <section>
                <h2 className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5" />
                    Wallpaper
                </h2>
                <div className="grid grid-cols-4 gap-1.5">
                    {wallpapers.map((wp) => (
                        <button
                            key={wp.id}
                            onClick={() => onWallpaperChange?.(wp.id)}
                            title={wp.name}
                            className={`aspect-square rounded-md transition-all duration-200 cursor-pointer ${wp.preview} ${wallpaper === wp.id
                                ? 'ring-2 ring-primary ring-offset-1 ring-offset-dark-800 scale-105'
                                : 'hover:scale-105 opacity-80 hover:opacity-100'
                                }`}
                        >
                            <span className="sr-only">{wp.name}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Screen Recording */}
            <section>
                <h2 className="text-xs font-heading font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" />
                    Screen Recording
                </h2>

                {!isRecording ? (
                    <>
                        {/* Audio toggles - only shown before recording */}
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => setIncludeSystemAudio?.(!includeSystemAudio)}
                                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border ${includeSystemAudio
                                    ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                                    : 'bg-dark-600 border-transparent text-gray-400 hover:bg-dark-500'
                                    }`}
                                title="Include system/tab audio"
                            >
                                <Volume2 className="w-3 h-3" />
                                System
                            </button>
                            <button
                                onClick={() => setIncludeMicAudio?.(!includeMicAudio)}
                                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border ${includeMicAudio
                                    ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                                    : 'bg-dark-600 border-transparent text-gray-400 hover:bg-dark-500'
                                    }`}
                                title="Include microphone audio"
                            >
                                <Mic className="w-3 h-3" />
                                Mic
                            </button>
                            <button
                                onClick={onToggleWebcam}
                                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer border ${showWebcam
                                    ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                                    : 'bg-dark-600 border-transparent text-gray-400 hover:bg-dark-500'
                                    }`}
                                title="Show webcam bubble"
                            >
                                <Video className="w-3 h-3" />
                                Camera
                            </button>
                        </div>

                        {/* Start Recording button */}
                        <button
                            onClick={onRecordingStart}
                            className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <div className="w-3 h-3 rounded-full bg-white" />
                            Start Recording
                        </button>
                    </>
                ) : (
                    <>
                        {/* Recording indicator and time */}
                        <div className="flex items-center justify-center gap-2 mb-2 py-2 bg-dark-700 rounded-lg">
                            <div className={`w-2.5 h-2.5 rounded-full bg-red-500 ${!isPaused ? 'animate-pulse' : ''}`} />
                            <span className="text-white text-sm font-mono">
                                {isPaused ? 'Paused' : 'Recording'} {formatTime(recordingTime)}
                            </span>
                        </div>

                        {/* Recording controls */}
                        <div className="flex gap-2">
                            <button
                                onClick={onTogglePause}
                                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer ${isPaused
                                    ? 'bg-green-600 hover:bg-green-500 text-white'
                                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                                    }`}
                            >
                                {isPaused ? (
                                    <>
                                        <Play className="w-3.5 h-3.5" />
                                        Resume
                                    </>
                                ) : (
                                    <>
                                        <Pause className="w-3.5 h-3.5" />
                                        Pause
                                    </>
                                )}
                            </button>
                            <button
                                onClick={onRecordingStop}
                                className="flex-1 py-2 px-3 bg-dark-600 hover:bg-dark-500 text-white text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Square className="w-3.5 h-3.5 fill-current" />
                                Stop
                            </button>
                        </div>
                    </>
                )}
            </section>

            {/* Actions */}
            {hasContent && (
                <section>
                    <button
                        onClick={onClear}
                        className="w-full py-1.5 px-3 bg-dark-600 hover:bg-dark-500 text-gray-300 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Clear
                    </button>
                </section>
            )}

        </aside>
    )
}
