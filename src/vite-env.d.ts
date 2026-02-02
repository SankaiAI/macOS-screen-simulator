/// <reference types="vite/client" />

// Screen Capture API types
interface DisplayMediaStreamOptions extends MediaStreamConstraints {
    preferCurrentTab?: boolean
}

interface ImageCapture {
    grabFrame(): Promise<ImageBitmap>
}

declare const ImageCapture: {
    prototype: ImageCapture
    new(track: MediaStreamTrack): ImageCapture
}
