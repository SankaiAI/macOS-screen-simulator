import { useRef, useEffect, useState, useCallback } from 'react'
import { Canvas, Image as FabricImage, FabricObject } from 'fabric'
import { Download, ImagePlus } from 'lucide-react'
import type { DeviceType, BackgroundType } from '../App'

interface CanvasEditorProps {
    uploadedImage: string | null
    device: DeviceType
    background: BackgroundType
    onImageUpload: (imageDataUrl: string) => void
}

// Device frame dimensions (aspect ratios based on real MacBooks)
const deviceConfigs = {
    'macbook-pro': {
        name: 'MacBook Pro',
        width: 1200,
        height: 780,
        screenX: 120,
        screenY: 45,
        screenWidth: 960,
        screenHeight: 600,
        bezelRadius: 12,
    },
    'macbook-air': {
        name: 'MacBook Air',
        width: 1200,
        height: 750,
        screenX: 130,
        screenY: 40,
        screenWidth: 940,
        screenHeight: 588,
        bezelRadius: 10,
    },
}

export default function CanvasEditor({
    uploadedImage,
    device,
    background,
    onImageUpload,
}: CanvasEditorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fabricRef = useRef<Canvas | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    const config = deviceConfigs[device]

    // Initialize Fabric canvas
    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = new Canvas(canvasRef.current, {
            width: config.width,
            height: config.height,
            backgroundColor: 'transparent',
            selection: true,
        })

        fabricRef.current = canvas
        renderFrame(canvas)

        return () => {
            canvas.dispose()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [device])

    // Render the MacBook frame
    const renderFrame = useCallback((canvas: Canvas) => {
        // Clear existing objects except the user image
        const userImage = canvas.getObjects().find((obj: FabricObject) => obj.data?.type === 'userImage')
        canvas.clear()

        // Draw MacBook body (dark grey aluminum look)
        const body = new FabricObject()
        body.set({
            left: 0,
            top: 0,
            width: config.width,
            height: config.height,
            selectable: false,
            evented: false,
        })

        // Re-add user image if it existed
        if (userImage) {
            canvas.add(userImage)
            canvas.bringObjectToFront(userImage)
        }

        canvas.renderAll()
    }, [config])

    // Handle uploaded image
    useEffect(() => {
        if (!fabricRef.current || !uploadedImage) return

        const canvas = fabricRef.current

        // Remove existing user image
        const existingImage = canvas.getObjects().find((obj: FabricObject) => obj.data?.type === 'userImage')
        if (existingImage) {
            canvas.remove(existingImage)
        }

        // Load new image
        FabricImage.fromURL(uploadedImage).then((img) => {
            // Scale image to fit screen area while maintaining aspect ratio
            const scaleX = config.screenWidth / (img.width || 1)
            const scaleY = config.screenHeight / (img.height || 1)
            const scale = Math.min(scaleX, scaleY)

            img.set({
                left: config.screenX + (config.screenWidth - (img.width || 0) * scale) / 2,
                top: config.screenY + (config.screenHeight - (img.height || 0) * scale) / 2,
                scaleX: scale,
                scaleY: scale,
                selectable: true,
                hasControls: true,
                hasBorders: true,
                cornerColor: '#2563EB',
                cornerStyle: 'circle',
                cornerSize: 10,
                transparentCorners: false,
                borderColor: '#2563EB',
                borderScaleFactor: 2,
                data: { type: 'userImage' },
            })

            // Clip to screen area
            img.clipPath = new FabricObject({
                left: config.screenX,
                top: config.screenY,
                width: config.screenWidth,
                height: config.screenHeight,
                absolutePositioned: true,
            })

            canvas.add(img)
            canvas.setActiveObject(img)
            canvas.renderAll()
        })
    }, [uploadedImage, config])

    // Handle drag and drop
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

        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const result = event.target?.result as string
                onImageUpload(result)
            }
            reader.readAsDataURL(file)
        }
    }

    // Export canvas as PNG
    const handleExport = async () => {
        if (!fabricRef.current) return
        setIsExporting(true)

        try {
            // Create a temporary canvas for export with background
            const exportCanvas = document.createElement('canvas')
            const exportCtx = exportCanvas.getContext('2d')!
            exportCanvas.width = config.width
            exportCanvas.height = config.height

            // Draw background
            if (background !== 'transparent') {
                const bgGradients: Record<string, CanvasGradient | string> = {
                    'gradient-blue': (() => {
                        const grad = exportCtx.createLinearGradient(0, 0, config.width, config.height)
                        grad.addColorStop(0, '#667eea')
                        grad.addColorStop(1, '#764ba2')
                        return grad
                    })(),
                    'gradient-sunset': (() => {
                        const grad = exportCtx.createLinearGradient(0, 0, config.width, config.height)
                        grad.addColorStop(0, '#f093fb')
                        grad.addColorStop(1, '#f5576c')
                        return grad
                    })(),
                    'gradient-ocean': (() => {
                        const grad = exportCtx.createLinearGradient(0, 0, config.width, config.height)
                        grad.addColorStop(0, '#4facfe')
                        grad.addColorStop(1, '#00f2fe')
                        return grad
                    })(),
                    'gradient-forest': (() => {
                        const grad = exportCtx.createLinearGradient(0, 0, config.width, config.height)
                        grad.addColorStop(0, '#11998e')
                        grad.addColorStop(1, '#38ef7d')
                        return grad
                    })(),
                    'gradient-midnight': (() => {
                        const grad = exportCtx.createLinearGradient(0, 0, config.width, config.height)
                        grad.addColorStop(0, '#0f0c29')
                        grad.addColorStop(0.5, '#302b63')
                        grad.addColorStop(1, '#24243e')
                        return grad
                    })(),
                    'gradient-mesh': (() => {
                        const grad = exportCtx.createLinearGradient(0, 0, config.width, config.height)
                        grad.addColorStop(0, '#4facfe')
                        grad.addColorStop(0.3, '#764ba2')
                        grad.addColorStop(0.6, '#667eea')
                        grad.addColorStop(1, '#f093fb')
                        return grad
                    })(),
                    'solid-dark': '#18181b',
                    'solid-light': '#f4f4f5',
                }

                exportCtx.fillStyle = bgGradients[background] || '#18181b'
                exportCtx.fillRect(0, 0, config.width, config.height)
            }

            // Draw the MacBook frame
            drawMacBookFrame(exportCtx, config)

            // Draw the screen content from Fabric canvas
            const userImage = fabricRef.current.getObjects().find((obj: FabricObject) => obj.data?.type === 'userImage')
            if (userImage && uploadedImage) {
                // Create clip path for screen area
                exportCtx.save()
                exportCtx.beginPath()
                exportCtx.roundRect(config.screenX, config.screenY, config.screenWidth, config.screenHeight, config.bezelRadius)
                exportCtx.clip()

                // Draw user image
                const img = new window.Image()
                img.src = uploadedImage
                await new Promise((resolve) => {
                    img.onload = resolve
                })

                const scaleX = userImage.scaleX || 1
                const scaleY = userImage.scaleY || 1
                const left = userImage.left || 0
                const top = userImage.top || 0

                exportCtx.drawImage(
                    img,
                    left,
                    top,
                    (img.width || 1) * scaleX,
                    (img.height || 1) * scaleY
                )
                exportCtx.restore()
            }

            // Download the image
            const dataUrl = exportCanvas.toDataURL('image/png', 1.0)
            const link = document.createElement('a')
            link.download = `macbook-mockup-${Date.now()}.png`
            link.href = dataUrl
            link.click()
        } finally {
            setIsExporting(false)
        }
    }

    // Draw MacBook frame on a 2D context
    const drawMacBookFrame = (ctx: CanvasRenderingContext2D, cfg: typeof config) => {
        // Main body (aluminum color)
        ctx.fillStyle = '#2d2d2d'
        ctx.beginPath()
        ctx.roundRect(0, 0, cfg.width, cfg.height - 20, 16)
        ctx.fill()

        // Screen bezel (black)
        ctx.fillStyle = '#0a0a0a'
        ctx.beginPath()
        ctx.roundRect(cfg.screenX - 20, cfg.screenY - 20, cfg.screenWidth + 40, cfg.screenHeight + 40, cfg.bezelRadius + 8)
        ctx.fill()

        // Screen area (default dark grey if no image)
        ctx.fillStyle = '#1a1a1a'
        ctx.beginPath()
        ctx.roundRect(cfg.screenX, cfg.screenY, cfg.screenWidth, cfg.screenHeight, cfg.bezelRadius)
        ctx.fill()

        // Camera notch (for MacBook Pro style)
        if (device === 'macbook-pro') {
            ctx.fillStyle = '#0a0a0a'
            ctx.beginPath()
            ctx.roundRect(cfg.width / 2 - 60, cfg.screenY - 2, 120, 24, [0, 0, 8, 8])
            ctx.fill()

            // Camera dot
            ctx.fillStyle = '#1a1a1a'
            ctx.beginPath()
            ctx.arc(cfg.width / 2, cfg.screenY + 10, 4, 0, Math.PI * 2)
            ctx.fill()
        }

        // Bottom hinge/base
        ctx.fillStyle = '#1f1f1f'
        ctx.beginPath()
        ctx.roundRect(50, cfg.height - 25, cfg.width - 100, 25, [0, 0, 12, 12])
        ctx.fill()

        // Trackpad indent
        ctx.fillStyle = '#252525'
        ctx.beginPath()
        ctx.roundRect(cfg.width / 2 - 150, cfg.height - 22, 300, 18, 4)
        ctx.fill()

        // Subtle edge highlights
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(1, 1, cfg.width - 2, cfg.height - 22, 16)
        ctx.stroke()
    }

    // Get background class
    const getBackgroundClass = () => {
        switch (background) {
            case 'gradient-blue':
                return 'gradient-blue'
            case 'gradient-sunset':
                return 'gradient-sunset'
            case 'gradient-ocean':
                return 'gradient-ocean'
            case 'gradient-forest':
                return 'gradient-forest'
            case 'gradient-midnight':
                return 'gradient-midnight'
            case 'gradient-mesh':
                return 'gradient-mesh'
            case 'solid-dark':
                return 'bg-zinc-900'
            case 'solid-light':
                return 'bg-zinc-100'
            default:
                return 'bg-transparent'
        }
    }

    return (
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Canvas Container */}
            <div
                ref={containerRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 flex items-center justify-center rounded-2xl transition-all duration-300 relative overflow-hidden ${getBackgroundClass()} ${isDragging ? 'ring-4 ring-primary ring-opacity-50' : ''
                    }`}
            >
                {/* Drop overlay */}
                {isDragging && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-none">
                        <div className="bg-dark-800/90 px-8 py-6 rounded-2xl border-2 border-dashed border-primary flex items-center gap-4">
                            <ImagePlus className="w-8 h-8 text-primary" />
                            <span className="text-xl font-heading text-white">Drop your screenshot here</span>
                        </div>
                    </div>
                )}

                {/* MacBook Frame Preview */}
                <div className="relative w-full h-full flex items-center justify-center p-8">
                    {/* SVG MacBook Frame */}
                    <svg
                        viewBox={`0 0 ${config.width} ${config.height}`}
                        className="w-auto h-full max-w-full drop-shadow-2xl"
                        style={{ maxHeight: 'calc(100% - 2rem)' }}
                    >
                        {/* Main body */}
                        <rect
                            x="0"
                            y="0"
                            width={config.width}
                            height={config.height - 20}
                            rx="16"
                            fill="#2d2d2d"
                        />

                        {/* Screen bezel */}
                        <rect
                            x={config.screenX - 20}
                            y={config.screenY - 20}
                            width={config.screenWidth + 40}
                            height={config.screenHeight + 40}
                            rx={config.bezelRadius + 8}
                            fill="#0a0a0a"
                        />

                        {/* Screen area */}
                        <rect
                            x={config.screenX}
                            y={config.screenY}
                            width={config.screenWidth}
                            height={config.screenHeight}
                            rx={config.bezelRadius}
                            fill="#1a1a1a"
                        />

                        {/* Camera notch for Pro */}
                        {device === 'macbook-pro' && (
                            <>
                                <rect
                                    x={config.width / 2 - 60}
                                    y={config.screenY - 2}
                                    width="120"
                                    height="24"
                                    rx="8"
                                    fill="#0a0a0a"
                                />
                                <circle
                                    cx={config.width / 2}
                                    cy={config.screenY + 10}
                                    r="4"
                                    fill="#1a1a1a"
                                />
                            </>
                        )}

                        {/* Bottom hinge */}
                        <rect
                            x="50"
                            y={config.height - 25}
                            width={config.width - 100}
                            height="25"
                            rx="12"
                            fill="#1f1f1f"
                        />

                        {/* Trackpad */}
                        <rect
                            x={config.width / 2 - 150}
                            y={config.height - 22}
                            width="300"
                            height="18"
                            rx="4"
                            fill="#252525"
                        />

                        {/* Screen content (user image) */}
                        {uploadedImage && (
                            <foreignObject
                                x={config.screenX}
                                y={config.screenY}
                                width={config.screenWidth}
                                height={config.screenHeight}
                            >
                                <div
                                    className="w-full h-full overflow-hidden"
                                    style={{ borderRadius: config.bezelRadius }}
                                >
                                    <img
                                        src={uploadedImage}
                                        alt="Screenshot"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </foreignObject>
                        )}

                        {/* Empty state */}
                        {!uploadedImage && (
                            <foreignObject
                                x={config.screenX}
                                y={config.screenY}
                                width={config.screenWidth}
                                height={config.screenHeight}
                            >
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center text-gray-500">
                                        <ImagePlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-lg">Upload a screenshot</p>
                                        <p className="text-sm opacity-75">or drag and drop</p>
                                    </div>
                                </div>
                            </foreignObject>
                        )}
                    </svg>
                </div>

                {/* Hidden Fabric canvas for manipulation */}
                <canvas
                    ref={canvasRef}
                    className="hidden"
                />
            </div>

            {/* Export Button */}
            <div className="mt-4 flex justify-center">
                <button
                    onClick={handleExport}
                    disabled={!uploadedImage || isExporting}
                    className={`px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer ${uploadedImage && !isExporting
                        ? 'bg-accent hover:bg-accent-light text-white shadow-lg shadow-accent/25'
                        : 'bg-dark-600 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    <Download className="w-5 h-5" />
                    {isExporting ? 'Exporting...' : 'Download PNG'}
                </button>
            </div>
        </div>
    )
}
