import { useState, useRef, useCallback, useEffect } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import MacOSDesktop from './components/MacOSDesktop'

import { MAC_MODELS, type MacModel, CURSOR_OPTIONS } from './constants'

export type WallpaperType = 'sequoia' | 'sonoma' | 'monterey' | 'ventura' | 'big-sur' | 'abstract-dark' | 'abstract-light'


function App() {
    const [websiteUrl, setWebsiteUrl] = useState<string>('')
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [wallpaper, setWallpaper] = useState<WallpaperType>('sequoia')
    const [isExporting, setIsExporting] = useState(false)
    const [showDock, setShowDock] = useState(true)
    const [showMenuBar, setShowMenuBar] = useState(true)
    const [selectedModel, setSelectedModel] = useState<MacModel>(MAC_MODELS[0])
    const [cursorStyle, setCursorStyle] = useState<string>(CURSOR_OPTIONS[0].value)
    const [cursorSize, setCursorSize] = useState<number>(1)
    const [isInteracting, setIsInteracting] = useState(false)
    const desktopRef = useRef<HTMLDivElement>(null)

    // Screen recording state
    const [isRecording, setIsRecording] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [includeSystemAudio, setIncludeSystemAudio] = useState(false)
    const [includeMicAudio, setIncludeMicAudio] = useState(false)
    const [showWebcam, setShowWebcam] = useState(false)
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const recordedChunksRef = useRef<Blob[]>([])
    const streamRef = useRef<MediaStream | null>(null)
    const timerRef = useRef<number | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const micStreamRef = useRef<MediaStream | null>(null)

    const handleUrlChange = (url: string) => {
        setWebsiteUrl(url)
        setUploadedImage(null)
    }

    const handleImageUpload = (imageData: string) => {
        setUploadedImage(imageData)
    }

    const stopWebcam = useCallback(() => {
        if (webcamStream) {
            webcamStream.getTracks().forEach(track => track.stop())
            setWebcamStream(null)
        }
        setShowWebcam(false)
    }, [webcamStream])

    const handleToggleWebcam = async () => {
        if (showWebcam) {
            stopWebcam()
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: "user"
                    }
                })
                setWebcamStream(stream)
                setShowWebcam(true)
            } catch (err) {
                console.error("Error accessing webcam:", err)
                alert("Could not access webcam. Please check permissions.")
            }
        }
    }

    const handleClear = () => {
        setWebsiteUrl('')
        setUploadedImage(null)
    }

    const handleExport = async () => {
        if (!desktopRef.current) return

        setIsExporting(true)

        try {
            // Get the desktop element's position on screen
            const rect = desktopRef.current.getBoundingClientRect()

            // Use Screen Capture API to take a real screenshot
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: 'browser',
                },
                preferCurrentTab: true,
            } as DisplayMediaStreamOptions)

            // Get the video track
            const track = stream.getVideoTracks()[0]

            // Create an ImageCapture to grab a frame
            const imageCapture = new ImageCapture(track)
            const bitmap = await imageCapture.grabFrame()

            // Stop the stream immediately after capture
            stream.getTracks().forEach(t => t.stop())

            // Calculate scale factor based on actual captured dimensions vs window size
            const scaleX = bitmap.width / window.innerWidth
            const scaleY = bitmap.height / window.innerHeight

            // Calculate the crop region in captured image coordinates
            const cropX = rect.left * scaleX
            const cropY = rect.top * scaleY
            const cropWidth = rect.width * scaleX
            const cropHeight = rect.height * scaleY

            // Create canvas with the cropped dimensions
            const canvas = document.createElement('canvas')
            canvas.width = cropWidth
            canvas.height = cropHeight

            const ctx = canvas.getContext('2d')
            if (!ctx) throw new Error('Could not get canvas context')

            // Draw the cropped region (the macOS desktop area)
            ctx.drawImage(
                bitmap,
                cropX,      // Source X
                cropY,      // Source Y
                cropWidth,  // Source Width
                cropHeight, // Source Height
                0,          // Dest X
                0,          // Dest Y
                cropWidth,  // Dest Width
                cropHeight  // Dest Height
            )

            // Download the screenshot
            const dataUrl = canvas.toDataURL('image/png', 1.0)
            const link = document.createElement('a')
            link.download = `macos-screenshot-${Date.now()}.png`
            link.href = dataUrl
            link.click()
        } catch (error) {
            console.error('Export failed:', error)
            if (error instanceof Error && error.name === 'NotAllowedError') {
                // User cancelled the screen share dialog
                console.log('User cancelled screen capture')
            } else {
                alert(`Screenshot capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        } finally {
            setIsExporting(false)
        }
    }

    // Cleanup function for recording resources
    const cleanupRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(track => track.stop())
            micStreamRef.current = null
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close()
            audioContextRef.current = null
        }
        // Don't stop webcam here, let user toggle it manually or handle it in useEffect
        mediaRecorderRef.current = null
        recordedChunksRef.current = []
    }, [])

    // Handle stream ending externally (user stops sharing via browser UI)
    useEffect(() => {
        return () => {
            cleanupRecording()
            if (webcamStream) {
                webcamStream.getTracks().forEach(track => track.stop())
            }
        }
    }, [cleanupRecording, webcamStream])

    const handleStartRecording = async () => {
        if (!desktopRef.current) {
            alert('Desktop element not found')
            return
        }

        try {
            // Reset state
            recordedChunksRef.current = []
            setRecordingTime(0)
            setIsPaused(false)

            // 1. Get display stream (with optional system audio)
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: { displaySurface: 'browser' },
                audio: includeSystemAudio,
                preferCurrentTab: true,
            } as DisplayMediaStreamOptions)

            streamRef.current = displayStream

            // 2. Set up canvas-based cropping to capture only the macOS desktop area
            const videoTrack = displayStream.getVideoTracks()[0]

            // Create video element to receive the stream
            const videoElement = document.createElement('video')
            videoElement.srcObject = displayStream
            videoElement.muted = true
            videoElement.playsInline = true

            // Wait for video metadata to load to get accurate dimensions
            await new Promise<void>((resolve) => {
                videoElement.onloadedmetadata = () => resolve()
                videoElement.play()
            })

            // Use actual video dimensions for accurate scaling
            const captureWidth = videoElement.videoWidth
            const captureHeight = videoElement.videoHeight

            // Check if user selected browser tab vs entire screen
            // If capture is much larger than viewport, they likely selected entire screen
            const viewportRatio = window.innerWidth / window.innerHeight
            const captureRatio = captureWidth / captureHeight
            const ratioDiff = Math.abs(viewportRatio - captureRatio)

            if (ratioDiff > 0.1 || captureWidth > window.innerWidth * 2) {
                console.warn('Capture dimensions suggest entire screen was selected instead of browser tab')
                console.warn('For best results, select "Chrome Tab" or the specific browser tab when prompted')
            }

            // Record initial stable dimensions
            const initialViewportWidth = window.innerWidth
            const initialDesktopRect = desktopRef.current.getBoundingClientRect()

            // Calculate base scale factor relative to initial capture
            const baseScaleX = captureWidth / initialViewportWidth

            // Resolution Capping logic - Upgraded to 4K
            const MAX_WIDTH = 3840
            const nominalWidth = initialDesktopRect.width * baseScaleX
            const nominalHeight = initialDesktopRect.height * baseScaleX
            let renderWidth = Math.round(nominalWidth)
            let renderHeight = Math.round(nominalHeight)
            let internalScale = 1

            if (renderWidth > MAX_WIDTH) {
                internalScale = MAX_WIDTH / renderWidth
                renderWidth = MAX_WIDTH
                renderHeight = Math.round(renderHeight * internalScale)
            }

            // Create canvas for cropped output
            const canvas = document.createElement('canvas')
            canvas.width = renderWidth
            canvas.height = renderHeight
            const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })
            if (!ctx) throw new Error('Could not get canvas context')

            // Use high smoothing quality for professional 4K output
            ctx.imageSmoothingEnabled = true
            ctx.imageSmoothingQuality = 'high'

            // Animation loop with dynamic crop updating
            let animationId: number
            let lastDrawTime = 0
            const fpsInterval = 1000 / 30 // 30 FPS target

            const drawFrame = (time: number) => {
                const elapsed = time - lastDrawTime

                if (elapsed > fpsInterval) {
                    lastDrawTime = time - (elapsed % fpsInterval)

                    if (ctx && videoElement.readyState >= 2 && desktopRef.current) {
                        // Current dimensions - use the most direct measurements
                        const viewportW = window.innerWidth
                        const viewportH = window.innerHeight
                        const desktopRect = desktopRef.current.getBoundingClientRect()

                        // Current capture stream dimensions
                        const videoW = videoElement.videoWidth
                        const videoH = videoElement.videoHeight

                        // Use a single scale factor based on width for maximum stability
                        const vScale = videoW / viewportW

                        // AUTO-CALIBRATION: Detect browser UI offsets (like permission bars)
                        // This measures the gap between the viewport and the actual video stream
                        const expectedH = viewportH * vScale
                        const diffH = videoH - expectedH
                        // Use a 5px threshold to ignore minor rounding differences
                        const verticalOffset = Math.max(0, diffH > 5 ? diffH : 0)

                        // Source coordinates in the video stream
                        // sx: relative to viewport start
                        // sy: relative to viewport start, plus the browser's UI offset (if any)
                        const sx = Math.max(0, Math.round(desktopRect.left * vScale))
                        const sy = Math.max(0, Math.round(desktopRect.top * vScale) + Math.round(verticalOffset))

                        // sw/sh: the width/height of the desktop mock itself
                        const sw = Math.min(videoW - sx, Math.round(desktopRect.width * vScale))
                        const sh = Math.min(videoH - sy, Math.round(desktopRect.height * vScale))

                        // Draw with high quality but stable mapping
                        ctx.drawImage(
                            videoElement,
                            sx, sy, sw, sh,
                            0, 0, renderWidth, renderHeight
                        )
                    }
                }
                animationId = requestAnimationFrame(drawFrame)
            }
            animationId = requestAnimationFrame(drawFrame)

            // Get stream from canvas (30 fps)
            const canvasStream = canvas.captureStream(30)

            // Verify we're capturing the right area
            console.log('Canvas size:', canvas.width, 'x', canvas.height)
            console.log('Canvas stream tracks:', canvasStream.getVideoTracks().length)

            // Handle user stopping share via browser UI
            videoTrack.onended = () => {
                cancelAnimationFrame(animationId)
                videoElement.pause()
                videoElement.srcObject = null
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop()
                }
            }

            // Store cleanup for animation frame
            const originalCleanup = cleanupRecording
            const enhancedCleanup = () => {
                cancelAnimationFrame(animationId)
                videoElement.pause()
                videoElement.srcObject = null
                originalCleanup()
            }

            // 3. Build the final stream with optional audio mixing
            let finalStream = canvasStream

            if (includeMicAudio || (includeSystemAudio && displayStream.getAudioTracks().length > 0)) {
                const audioContext = new AudioContext()
                audioContextRef.current = audioContext
                const destination = audioContext.createMediaStreamDestination()

                // Add system audio if present
                if (includeSystemAudio && displayStream.getAudioTracks().length > 0) {
                    const systemSource = audioContext.createMediaStreamSource(
                        new MediaStream([displayStream.getAudioTracks()[0]])
                    )
                    systemSource.connect(destination)
                }

                // Add mic audio if enabled
                if (includeMicAudio) {
                    try {
                        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
                        micStreamRef.current = micStream
                        const micSource = audioContext.createMediaStreamSource(micStream)
                        micSource.connect(destination)
                    } catch (micError) {
                        console.warn('Microphone access denied, continuing without mic:', micError)
                    }
                }

                // Combine canvas video with mixed audio
                finalStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...destination.stream.getAudioTracks()
                ])
            }

            // 4. Determine supported mime type
            const mimeTypes = [
                'video/webm;codecs=vp9',
                'video/webm;codecs=vp8',
                'video/webm',
                'video/mp4'
            ]
            let selectedMimeType = ''
            for (const mimeType of mimeTypes) {
                if (MediaRecorder.isTypeSupported(mimeType)) {
                    selectedMimeType = mimeType
                    break
                }
            }

            if (!selectedMimeType) {
                throw new Error('No supported video format found')
            }

            // 5. Create and configure MediaRecorder
            const mediaRecorder = new MediaRecorder(finalStream, {
                mimeType: selectedMimeType,
                videoBitsPerSecond: 50000000 // 50 Mbps for high-quality 4K
            })
            mediaRecorderRef.current = mediaRecorder

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    recordedChunksRef.current.push(e.data)
                }
            }

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, {
                    type: selectedMimeType.split(';')[0]
                })
                const url = URL.createObjectURL(blob)

                // Trigger download
                const link = document.createElement('a')
                link.download = `macos-recording-${Date.now()}.webm`
                link.href = url
                link.click()

                // Cleanup
                URL.revokeObjectURL(url)
                enhancedCleanup()
                setIsRecording(false)
                setIsPaused(false)
                setRecordingTime(0)
            }

            // 6. Start recording
            mediaRecorder.start(1000) // Collect data every second
            setIsRecording(true)

            // 7. Start timer
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)

        } catch (error) {
            console.error('Recording failed:', error)
            cleanupRecording()
            setIsRecording(false)

            if (error instanceof Error && error.name === 'NotAllowedError') {
                console.log('User cancelled screen capture')
            } else {
                alert(`Recording failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }
    }

    const handleStopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            // Stop timer first
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            // Stop recording - onstop handler will handle cleanup and download
            mediaRecorderRef.current.stop()
        }
    }, [])

    const handlePauseRecording = useCallback(() => {
        if (!mediaRecorderRef.current) return

        if (isPaused) {
            // Resume
            mediaRecorderRef.current.resume()
            // Resume timer
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)
            setIsPaused(false)
        } else {
            // Pause
            mediaRecorderRef.current.pause()
            // Pause timer
            if (timerRef.current) {
                clearInterval(timerRef.current)
                timerRef.current = null
            }
            setIsPaused(true)
        }
    }, [isPaused])

    const hasContent = !!websiteUrl || !!uploadedImage

    return (
        <div className="h-screen bg-dark-900 flex flex-col overflow-hidden">
            <Header
                onExport={handleExport}
                hasContent={hasContent}
                isExporting={isExporting}
            />
            <main className="flex-1 flex overflow-hidden min-h-0">
                <Sidebar
                    wallpaper={wallpaper}
                    onWallpaperChange={setWallpaper}
                    onExport={handleExport}
                    isExporting={isExporting}
                    showDock={showDock}
                    setShowDock={setShowDock}
                    showMenuBar={showMenuBar}
                    setShowMenuBar={setShowMenuBar}
                    isRecording={isRecording}
                    isPaused={isPaused}
                    recordingTime={recordingTime}
                    onRecordingStart={handleStartRecording}
                    onRecordingStop={handleStopRecording}
                    onTogglePause={handlePauseRecording}
                    includeSystemAudio={includeSystemAudio}
                    setIncludeSystemAudio={setIncludeSystemAudio}
                    includeMicAudio={includeMicAudio}
                    setIncludeMicAudio={setIncludeMicAudio}
                    showWebcam={showWebcam}
                    onToggleWebcam={handleToggleWebcam}
                    selectedModel={selectedModel}
                    onSelectModel={setSelectedModel}
                    cursorStyle={cursorStyle}
                    onCursorChange={setCursorStyle}
                    cursorSize={cursorSize}
                    onCursorSizeChange={setCursorSize}
                    hasContent={hasContent}
                    onClear={handleClear}
                    isInteracting={isInteracting}
                    setIsInteracting={setIsInteracting}
                />
                <div className="flex-1 p-4">
                    <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-dark-600">
                        <MacOSDesktop
                            url={websiteUrl}
                            uploadedImage={uploadedImage}
                            wallpaper={wallpaper}
                            onUrlChange={handleUrlChange}
                            onImageUpload={handleImageUpload}
                            desktopRef={desktopRef}
                            showDock={showDock}
                            showMenuBar={showMenuBar}
                            selectedModel={selectedModel}
                            cursorStyle={cursorStyle}
                            cursorSize={cursorSize}
                            isInteracting={isInteracting}
                            setIsInteracting={setIsInteracting}
                            isRecording={isRecording}
                            showWebcam={showWebcam}
                            webcamStream={webcamStream}
                        />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default App
