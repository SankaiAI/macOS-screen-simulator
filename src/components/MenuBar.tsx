import { useState, useEffect } from 'react'

interface MenuBarProps {
    appName?: string
    scale?: number
}

export default function MenuBar({ appName = 'Safari', scale = 1 }: MenuBarProps) {
    const [time, setTime] = useState(new Date())

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        })
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        })
    }

    // Base values
    const baseHeight = 28 // h-7 equivalent
    const baseFontSize = 13 // text-[13px]

    const height = Math.round(baseHeight * scale)
    const fontSize = Math.round(baseFontSize * scale)

    return (
        <div
            className="shrink-0 bg-black/30 backdrop-blur-xl flex items-center justify-between px-4 text-white/90 font-medium select-none transition-all duration-300"
            style={{
                height: `${height}px`,
                fontSize: `${fontSize}px`
            }}
        >
            {/* Left side - Apple logo and app menu */}
            <div className="flex items-center gap-5">
                {/* Apple Logo */}
                <span className="cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors flex items-center">
                    <svg
                        style={{ width: `${Math.round(13 * scale)}px`, height: `${Math.round(16 * scale)}px` }}
                        viewBox="0 0 170 170"
                        fill="currentColor"
                    >
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58 0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742 3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378 0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915 0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239 7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22 17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85 5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071 12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311 11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.083.17 2.166.17 3.24z" />
                    </svg>
                </span>

                {/* App Name (bold) */}
                <span className="font-semibold cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors">
                    {appName}
                </span>

                {/* Menu items */}
                <div className="flex items-center gap-4">
                    {['File', 'Edit', 'View', 'History', 'Bookmarks', 'Window', 'Help'].map((item) => (
                        <span
                            key={item}
                            className="cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* Right side - Status icons and time */}
            <div className="flex items-center gap-3">
                {/* Status icons */}
                <div className="flex items-center gap-2" style={{ fontSize: `${Math.round(14 * scale)}px` }}>
                    <span className="cursor-pointer hover:bg-white/10 px-1 py-0.5 rounded transition-colors">
                        <svg style={{ width: `${Math.round(16 * scale)}px`, height: `${Math.round(16 * scale)}px` }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0-1.5a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z" />
                        </svg>
                    </span>
                    <span className="cursor-pointer hover:bg-white/10 px-1 py-0.5 rounded transition-colors">
                        <svg style={{ width: `${Math.round(16 * scale)}px`, height: `${Math.round(16 * scale)}px` }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7.07 7.07 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                        </svg>
                    </span>
                    <span className="cursor-pointer hover:bg-white/10 px-1 py-0.5 rounded transition-colors">
                        <svg style={{ width: `${Math.round(16 * scale)}px`, height: `${Math.round(16 * scale)}px` }} fill="currentColor" viewBox="0 0 24 24">
                            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
                        </svg>
                    </span>
                </div>

                {/* Date and Time */}
                <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-1.5 py-0.5 rounded transition-colors">
                    <span>{formatDate(time)}</span>
                    <span>{formatTime(time)}</span>
                </div>
            </div>
        </div>
    )
}
