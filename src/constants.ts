export interface MacModel {
    id: string;
    label: string;
    width: number;
    height: number;
    depth?: number;
    scale: number; // For text/UI scaling (1 = default)
    dockItemSize: number; // Pixel size for dock icons
}

// Dimensions in inches are converted to a proportional pixel size for the UI.
export const MAC_MODELS: MacModel[] = [
    {
        id: 'macbook-air-13',
        label: 'MacBook Air 13"',
        width: 1200,
        height: 720,
        scale: 1,      // Standard
        dockItemSize: 48
    }
];

export interface CursorOption {
    id: string;
    label: string;
    value: string; // CSS cursor value
}

export const CURSOR_OPTIONS: CursorOption[] = [
    { id: 'default', label: 'Default', value: 'default' },
    { id: 'pointer', label: 'Hand', value: 'pointer' },
];

export const CORS_PROXY = 'https://corsproxy.io/?';
export const SCREENSHOT_API = 'https://api.microlink.io?url=';
