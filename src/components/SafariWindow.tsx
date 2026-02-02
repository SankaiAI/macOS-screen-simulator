import { useState, useRef, useEffect, useCallback } from 'react'
import TrafficLights from './TrafficLights'
import { Globe, Lock, ChevronLeft, ChevronRight, RotateCcw, Share, Plus, Shield, Camera, Info, ExternalLink } from 'lucide-react'
import type { MacModel } from '../constants'
import { CORS_PROXY, SCREENSHOT_API } from '../constants'

interface SafariWindowProps {
    url: string
    uploadedImage: string | null
    onUrlChange: (url: string) => void
    onImageUpload?: (imageData: string) => void
    windowRef?: React.RefObject<HTMLDivElement>
    selectedModel?: MacModel
    onResizeHover?: (isHovering: boolean) => void
    isInteracting?: boolean
    setIsInteracting?: (isInteracting: boolean) => void
    onInteractionHover?: (isHovering: boolean) => void
}

export default function SafariWindow({
    url,
    uploadedImage,
    onUrlChange,
    onImageUpload,
    windowRef,
    selectedModel,
    onResizeHover,
    isInteracting = false,
    setIsInteracting,
    onInteractionHover,
}: SafariWindowProps) {
    const [inputUrl, setInputUrl] = useState(url)
    const [isLoading, setIsLoading] = useState(false)
    const [isZoomed, setIsZoomed] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [isProxyEnabled, setIsProxyEnabled] = useState(false)
    const [isFetchingScreenshot, setIsFetchingScreenshot] = useState(false)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        setInputUrl(url)
        if (url) {
            setIsLoading(true)
        }
    }, [url])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        let processedUrl = inputUrl.trim()
        if (processedUrl && !processedUrl.startsWith('http')) {
            processedUrl = 'https://' + processedUrl
        }
        onUrlChange(processedUrl)
    }

    const handleIframeLoad = () => {
        setIsLoading(false)
    }

    const handleRefresh = () => {
        if (iframeRef.current && url) {
            setIsLoading(true)
            const proxyUrl = isProxyEnabled ? `${CORS_PROXY}${url}` : url
            iframeRef.current.src = proxyUrl
        }
    }

    const handleFetchScreenshot = async () => {
        if (!url) return
        setIsFetchingScreenshot(true)
        try {
            const apiCall = `${SCREENSHOT_API}${encodeURIComponent(url)}&screenshot=true&embed=screenshot.url`
            const response = await fetch(apiCall)
            const data = await response.json()
            if (data.data?.screenshot?.url) {
                onImageUpload?.(data.data.screenshot.url)
            } else {
                throw new Error('Failed to fetch screenshot')
            }
        } catch (error) {
            console.error('Screenshot fetch failed:', error)
            alert('Failed to fetch high-res screenshot. Please try uploading manually.')
        } finally {
            setIsFetchingScreenshot(false)
        }
    }

    const handlePaste = useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items
        if (!items) return

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile()
                if (blob) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                        const result = event.target?.result as string
                        onImageUpload?.(result)
                    }
                    reader.readAsDataURL(blob)
                }
            }
        }
    }, [onImageUpload])

    useEffect(() => {
        window.addEventListener('paste', handlePaste)
        return () => window.removeEventListener('paste', handlePaste)
    }, [handlePaste])

    const [windowSize, setWindowSize] = useState({ width: 900, height: 500 })
    const [isResizing, setIsResizing] = useState(false)
    const activeResizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number; direction: string } | null>(null)
    const toolbarHeight = 48 // h-12 = 48px

    useEffect(() => {
        if (selectedModel && !uploadedImage) {
            setWindowSize({
                width: selectedModel.width,
                height: selectedModel.height
            })
        }
    }, [selectedModel, uploadedImage])

    // Auto-resize window to fit uploaded image
    useEffect(() => {
        if (!uploadedImage) return

        const img = new Image()
        img.onload = () => {
            const imgWidth = img.naturalWidth
            const imgHeight = img.naturalHeight

            // Calculate max dimensions (same constraints as resize handles)
            const maxWidth = window.innerWidth - 400
            const maxHeight = window.innerHeight - 200

            // Calculate scaled dimensions to fit within max while preserving aspect ratio
            let newWidth = imgWidth
            let newHeight = imgHeight + toolbarHeight

            // Scale down if too wide
            if (newWidth > maxWidth) {
                const scale = maxWidth / newWidth
                newWidth = maxWidth
                newHeight = imgHeight * scale + toolbarHeight
            }

            // Scale down if too tall
            if (newHeight > maxHeight) {
                const scale = (maxHeight - toolbarHeight) / (newHeight - toolbarHeight)
                newHeight = maxHeight
                newWidth = newWidth * scale
            }

            // Ensure minimum size
            newWidth = Math.max(400, newWidth)
            newHeight = Math.max(300, newHeight)

            setWindowSize({ width: newWidth, height: newHeight })
        }
        img.src = uploadedImage
    }, [uploadedImage])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!activeResizeRef.current) return

            const deltaX = e.clientX - activeResizeRef.current.startX
            const deltaY = e.clientY - activeResizeRef.current.startY

            let newWidth = activeResizeRef.current.startWidth
            let newHeight = activeResizeRef.current.startHeight

            if (activeResizeRef.current.direction.includes('e')) newWidth += deltaX
            if (activeResizeRef.current.direction.includes('w')) newWidth -= deltaX
            if (activeResizeRef.current.direction.includes('s')) newHeight += deltaY
            if (activeResizeRef.current.direction.includes('n')) newHeight -= deltaY

            setWindowSize({
                width: Math.max(800, newWidth),
                height: Math.max(600, newHeight)
            })
        }

        const handleMouseUp = () => {
            activeResizeRef.current = null
            setIsResizing(false)
            document.body.style.cursor = 'default'
        }

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing, windowSize])

    const startResize = (e: React.MouseEvent, direction: string) => {
        e.preventDefault()
        e.stopPropagation()
        activeResizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: windowSize.width,
            startHeight: windowSize.height,
            direction
        }
        setIsResizing(true)
        document.body.style.cursor = direction === 'e' || direction === 'w' ? 'ew-resize' : 'ns-resize'
    }

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files.length > 0) {
            const file = files[0]
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const result = event.target?.result as string
                    onImageUpload?.(result)
                }
                reader.readAsDataURL(file)
            }
        }
    }

    return (
        <div
            ref={windowRef}
            className={`flex flex-col bg-white/80 backdrop-blur-xl shadow-2xl overflow-hidden border-gray-200/50 group ${isZoomed ? 'absolute inset-0 z-10 border-0' : 'relative rounded-xl border'}`}
            style={isZoomed ? {
                transition: 'all 0.3s ease-in-out',
            } : {
                width: `${windowSize.width}px`,
                height: `${windowSize.height}px`,
                maxWidth: '100%',
                maxHeight: 'calc(100% - 40px)',
                transition: isResizing ? 'none' : 'all 0.3s ease-in-out',
            }}
        >
            {/* Resize Handles - Only visible when not zoomed */}
            {!isZoomed && (
                <>
                    {/* Top Handle */}
                    <div
                        className="absolute top-0 left-0 right-0 h-2 cursor-n-resize z-50 hover:bg-blue-500/10 transition-colors"
                        onMouseDown={(e) => startResize(e, 'n')}
                        onMouseEnter={() => onResizeHover?.(true)}
                        onMouseLeave={() => onResizeHover?.(false)}
                    />
                    {/* Right Handle */}
                    <div
                        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize z-50 hover:bg-blue-500/10 transition-colors"
                        onMouseDown={(e) => startResize(e, 'e')}
                        onMouseEnter={() => onResizeHover?.(true)}
                        onMouseLeave={() => onResizeHover?.(false)}
                    />
                    {/* Left Handle */}
                    <div
                        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize z-50 hover:bg-blue-500/10 transition-colors"
                        onMouseDown={(e) => startResize(e, 'w')}
                        onMouseEnter={() => onResizeHover?.(true)}
                        onMouseLeave={() => onResizeHover?.(false)}
                    />
                    {/* Bottom Handle */}
                    <div
                        className="absolute bottom-0 left-0 right-0 h-2 cursor-s-resize z-50 hover:bg-blue-500/10 transition-colors"
                        onMouseDown={(e) => startResize(e, 's')}
                        onMouseEnter={() => onResizeHover?.(true)}
                        onMouseLeave={() => onResizeHover?.(false)}
                    />
                    {/* Bottom-Right Handle */}
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 hover:bg-blue-500/10 transition-colors rounded-tl"
                        onMouseDown={(e) => startResize(e, 'se')}
                        onMouseEnter={() => onResizeHover?.(true)}
                        onMouseLeave={() => onResizeHover?.(false)}
                    />
                </>
            )}
            {/* Safari Toolbar */}
            <div className="h-12 bg-gradient-to-b from-gray-100 to-gray-200 flex items-center px-3 gap-3 border-b border-gray-300/50">
                {/* Traffic Lights */}
                <TrafficLights className="mr-2" onZoom={() => setIsZoomed(!isZoomed)} />

                {/* Navigation buttons */}
                <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-black/5 text-gray-400 cursor-pointer transition-colors">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-black/5 text-gray-400 cursor-pointer transition-colors">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                {/* URL Bar */}
                <form onSubmit={handleSubmit} className="flex-1 max-w-2xl mx-auto group/url">
                    <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1.5 border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {url ? (
                                <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            ) : (
                                <Globe className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            )}
                            <input
                                type="text"
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                placeholder="Search or enter website name"
                                className="flex-1 bg-transparent text-sm text-gray-700 text-center placeholder-gray-400 outline-none w-full"
                            />
                        </div>

                        <div className="flex items-center gap-1 ml-2 border-l border-gray-200 pl-2">
                            <button
                                type="button"
                                onClick={() => setIsProxyEnabled(!isProxyEnabled)}
                                className={`p-1.5 rounded-md transition-all flex items-center justify-center ${isProxyEnabled ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-400 hover:bg-black/5'}`}
                                title={isProxyEnabled ? "Enhanced Compatibility: ON" : "Standard Mode (Click to enable Proxy)"}
                            >
                                <Shield className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleFetchScreenshot}
                                disabled={isFetchingScreenshot || !url}
                                className={`p-1.5 rounded-md transition-all flex items-center justify-center ${isFetchingScreenshot ? 'animate-pulse text-blue-500 bg-blue-50' : 'text-gray-400 hover:bg-black/5 disabled:opacity-30'}`}
                                title="Fetch High-Res Screenshot"
                            >
                                <Camera className="w-3.5 h-3.5" />
                            </button>
                            {isLoading && (
                                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-1" />
                            )}
                        </div>
                    </div>
                </form>

                {/* Right side buttons */}
                <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-black/5 text-gray-500 cursor-pointer transition-colors">
                        <Share className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 rounded hover:bg-black/5 text-gray-500 cursor-pointer transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleRefresh}
                        className="p-1.5 rounded hover:bg-black/5 text-gray-500 cursor-pointer transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div
                className="flex-1 bg-white relative overflow-hidden"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onMouseEnter={() => onInteractionHover?.(true)}
                onMouseLeave={() => onInteractionHover?.(false)}
            >
                {/* Interaction Overlay - blocking iframe when in Screenshot mode */}
                {!isInteracting && !uploadedImage && url && (
                    <div
                        className="absolute inset-0 z-10 cursor-none"
                        onClick={() => setIsInteracting?.(true)}
                        title="Click to interact"
                    />
                )}

                {/* Drag & Paste hint */}
                {!isInteracting && !uploadedImage && url && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[11px] font-medium flex items-center gap-2 shadow-lg border border-white/10">
                            <Info className="w-3 h-3" />
                            <span>Click to interact or <b>Ctrl+V</b> to paste screenshot</span>
                        </div>
                    </div>
                )}

                {/* Drag overlay */}
                {isDragging && (
                    <div className="absolute inset-0 bg-blue-500/20 border-2 border-dashed border-blue-500 z-50 flex items-center justify-center">
                        <div className="text-blue-600 font-medium text-lg">
                            Drop image here
                        </div>
                    </div>
                )}

                {/* Show uploaded image if available (takes priority) */}
                {uploadedImage && (
                    <img
                        src={uploadedImage}
                        alt="Screenshot"
                        className="w-full h-full object-contain"
                    />
                )}

                {/* Show live iframe for scrolling/interaction */}
                {url && !uploadedImage && (
                    <>
                        <iframe
                            ref={iframeRef}
                            src={isProxyEnabled ? `${CORS_PROXY}${url}` : url}
                            className="w-full h-full border-0"
                            onLoad={handleIframeLoad}
                            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                            title="Website preview"
                        />
                        {/* Overlay help for potential blank pages */}
                        {!isInteracting && isLoading && (
                            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-6 text-center z-30">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                    <Globe className="w-6 h-6 text-gray-300" />
                                </div>
                                <h4 className="text-gray-700 font-medium mb-2">Connecting to website...</h4>
                                <p className="text-gray-400 text-xs max-w-xs mb-6">
                                    If this takes a while, the site might be blocking embedding for security.
                                </p>
                                <div className="flex gap-3">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Open in New Tab
                                    </a>
                                    <button
                                        onClick={() => setIsProxyEnabled(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        <Shield className="w-4 h-4" />
                                        Try Proxy
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Empty state */}
                {!url && !uploadedImage && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
                        <div className="text-center px-6">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-500 shadow-sm border border-blue-100">
                                <Globe className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Start by adding content
                            </h3>
                            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
                                Enter a URL to preview a live website, or simply drop a screenshot image directly into this window.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
                                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                        <Shield className="w-4 h-4" />
                                        <span className="font-medium text-xs">Enhanced Compatibility</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                        Use the shield icon if a website refuses to load (like Google or Github). It bypasses some security blocks.
                                    </p>
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                        <Camera className="w-4 h-4" />
                                        <span className="font-medium text-xs">High-Res Fetch</span>
                                    </div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">
                                        Click the camera icon to fetch a pixel-perfect snapshot of any website for your design.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
                                <Info className="w-3.5 h-3.5" />
                                <span className="text-[10px]">Note: Interactive features may not work on all proxied sites.</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
