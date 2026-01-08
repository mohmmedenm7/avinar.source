// Effects Library - 50+ Professional Video Effects
export interface Effect {
    id: string;
    name: string;
    category: string;
    icon: string;
    description: string;
    params: EffectParam[];
    apply: (clip: any, params: any) => any;
}

export interface EffectParam {
    name: string;
    type: 'slider' | 'color' | 'select' | 'toggle';
    min?: number;
    max?: number;
    default: any;
    options?: string[];
}

export const EFFECTS_LIBRARY: Effect[] = [
    // ========== COLOR & GRADING ==========
    {
        id: 'cinematic_lut',
        name: 'Cinematic LUT',
        category: 'Color & Grading',
        icon: '🎬',
        description: 'Professional cinematic color grading',
        params: [
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 80 },
            { name: 'style', type: 'select', default: 'teal-orange', options: ['teal-orange', 'vintage', 'modern', 'noir'] }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, cinematicLut: params.intensity, lutStyle: params.style }
        })
    },
    {
        id: 'vintage_film',
        name: 'Vintage Film',
        category: 'Color & Grading',
        icon: '📽️',
        description: 'Classic film look with grain',
        params: [
            { name: 'grain', type: 'slider', min: 0, max: 100, default: 40 },
            { name: 'fade', type: 'slider', min: 0, max: 100, default: 30 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, vintageGrain: params.grain, vintageFade: params.fade }
        })
    },
    {
        id: 'black_white',
        name: 'Black & White',
        category: 'Color & Grading',
        icon: '⚫',
        description: 'Monochrome conversion',
        params: [
            { name: 'contrast', type: 'slider', min: 0, max: 100, default: 50 },
            { name: 'tint', type: 'color', default: '#000000' }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, saturation: -100, contrast: params.contrast, tint: params.tint }
        })
    },
    {
        id: 'sepia_tone',
        name: 'Sepia Tone',
        category: 'Color & Grading',
        icon: '🟤',
        description: 'Warm sepia effect',
        params: [
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 70 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, sepia: params.intensity }
        })
    },
    {
        id: 'color_pop',
        name: 'Color Pop',
        category: 'Color & Grading',
        icon: '🌈',
        description: 'Vibrant color enhancement',
        params: [
            { name: 'vibrance', type: 'slider', min: 0, max: 200, default: 150 },
            { name: 'saturation', type: 'slider', min: 0, max: 200, default: 120 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, saturation: params.saturation, vibrance: params.vibrance }
        })
    },

    // ========== BLUR & FOCUS ==========
    {
        id: 'gaussian_blur',
        name: 'Gaussian Blur',
        category: 'Blur & Focus',
        icon: '🌫️',
        description: 'Smooth blur effect',
        params: [
            { name: 'amount', type: 'slider', min: 0, max: 50, default: 10 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, blur: params.amount }
        })
    },
    {
        id: 'motion_blur',
        name: 'Motion Blur',
        category: 'Blur & Focus',
        icon: '💨',
        description: 'Directional motion blur',
        params: [
            { name: 'angle', type: 'slider', min: 0, max: 360, default: 0 },
            { name: 'distance', type: 'slider', min: 0, max: 100, default: 20 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, motionBlur: params.distance, motionAngle: params.angle }
        })
    },
    {
        id: 'radial_blur',
        name: 'Radial Blur',
        category: 'Blur & Focus',
        icon: '🎯',
        description: 'Zoom blur effect',
        params: [
            { name: 'strength', type: 'slider', min: 0, max: 100, default: 30 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, radialBlur: params.strength }
        })
    },
    {
        id: 'tilt_shift',
        name: 'Tilt Shift',
        category: 'Blur & Focus',
        icon: '🏙️',
        description: 'Miniature effect',
        params: [
            { name: 'focus_size', type: 'slider', min: 0, max: 100, default: 30 },
            { name: 'blur_amount', type: 'slider', min: 0, max: 50, default: 25 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, tiltShift: params.blur_amount, focusSize: params.focus_size }
        })
    },

    // ========== DISTORTION & TRANSFORM ==========
    {
        id: 'fisheye',
        name: 'Fisheye',
        category: 'Distortion',
        icon: '🐟',
        description: 'Fisheye lens distortion',
        params: [
            { name: 'strength', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, fisheye: params.strength }
        })
    },
    {
        id: 'lens_distortion',
        name: 'Lens Distortion',
        category: 'Distortion',
        icon: '🔍',
        description: 'Barrel/Pincushion distortion',
        params: [
            { name: 'amount', type: 'slider', min: -100, max: 100, default: 0 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, lensDistortion: params.amount }
        })
    },
    {
        id: 'wave_distort',
        name: 'Wave Distortion',
        category: 'Distortion',
        icon: '🌊',
        description: 'Wavy distortion effect',
        params: [
            { name: 'amplitude', type: 'slider', min: 0, max: 50, default: 10 },
            { name: 'frequency', type: 'slider', min: 0, max: 20, default: 5 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, waveAmplitude: params.amplitude, waveFrequency: params.frequency }
        })
    },
    {
        id: 'mirror',
        name: 'Mirror',
        category: 'Distortion',
        icon: '🪞',
        description: 'Mirror reflection effect',
        params: [
            { name: 'axis', type: 'select', default: 'horizontal', options: ['horizontal', 'vertical', 'both'] }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, mirror: params.axis }
        })
    },

    // ========== LIGHT & GLOW ==========
    {
        id: 'lens_flare',
        name: 'Lens Flare',
        category: 'Light & Glow',
        icon: '✨',
        description: 'Realistic lens flare',
        params: [
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 60 },
            { name: 'position_x', type: 'slider', min: 0, max: 100, default: 50 },
            { name: 'position_y', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, lensFlare: params.intensity, flareX: params.position_x, flareY: params.position_y }
        })
    },
    {
        id: 'glow',
        name: 'Glow',
        category: 'Light & Glow',
        icon: '💫',
        description: 'Soft glow effect',
        params: [
            { name: 'radius', type: 'slider', min: 0, max: 50, default: 15 },
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, glow: params.intensity, glowRadius: params.radius }
        })
    },
    {
        id: 'light_rays',
        name: 'Light Rays',
        category: 'Light & Glow',
        icon: '☀️',
        description: 'God rays effect',
        params: [
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 40 },
            { name: 'angle', type: 'slider', min: 0, max: 360, default: 45 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, lightRays: params.intensity, raysAngle: params.angle }
        })
    },
    {
        id: 'bloom',
        name: 'Bloom',
        category: 'Light & Glow',
        icon: '🌟',
        description: 'Bright area bloom',
        params: [
            { name: 'threshold', type: 'slider', min: 0, max: 100, default: 70 },
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, bloom: params.intensity, bloomThreshold: params.threshold }
        })
    },

    // ========== STYLIZE ==========
    {
        id: 'oil_painting',
        name: 'Oil Painting',
        category: 'Stylize',
        icon: '🎨',
        description: 'Oil painting effect',
        params: [
            { name: 'brush_size', type: 'slider', min: 1, max: 20, default: 5 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, oilPainting: params.brush_size }
        })
    },
    {
        id: 'cartoon',
        name: 'Cartoon',
        category: 'Stylize',
        icon: '🖼️',
        description: 'Cartoon/comic effect',
        params: [
            { name: 'edge_strength', type: 'slider', min: 0, max: 100, default: 60 },
            { name: 'color_levels', type: 'slider', min: 2, max: 10, default: 5 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, cartoon: params.edge_strength, colorLevels: params.color_levels }
        })
    },
    {
        id: 'sketch',
        name: 'Sketch',
        category: 'Stylize',
        icon: '✏️',
        description: 'Pencil sketch effect',
        params: [
            { name: 'detail', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, sketch: params.detail }
        })
    },
    {
        id: 'posterize',
        name: 'Posterize',
        category: 'Stylize',
        icon: '🖨️',
        description: 'Reduce color levels',
        params: [
            { name: 'levels', type: 'slider', min: 2, max: 20, default: 6 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, posterize: params.levels }
        })
    },
    {
        id: 'pixelate',
        name: 'Pixelate',
        category: 'Stylize',
        icon: '🟦',
        description: 'Pixel mosaic effect',
        params: [
            { name: 'size', type: 'slider', min: 1, max: 50, default: 10 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, pixelate: params.size }
        })
    },
    {
        id: 'halftone',
        name: 'Halftone',
        category: 'Stylize',
        icon: '⚫',
        description: 'Newspaper print effect',
        params: [
            { name: 'dot_size', type: 'slider', min: 1, max: 20, default: 5 },
            { name: 'angle', type: 'slider', min: 0, max: 360, default: 45 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, halftone: params.dot_size, halftoneAngle: params.angle }
        })
    },

    // ========== NOISE & GRAIN ==========
    {
        id: 'film_grain',
        name: 'Film Grain',
        category: 'Noise & Grain',
        icon: '📹',
        description: 'Authentic film grain',
        params: [
            { name: 'amount', type: 'slider', min: 0, max: 100, default: 30 },
            { name: 'size', type: 'slider', min: 1, max: 10, default: 3 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, filmGrain: params.amount, grainSize: params.size }
        })
    },
    {
        id: 'noise',
        name: 'Noise',
        category: 'Noise & Grain',
        icon: '📺',
        description: 'Digital noise effect',
        params: [
            { name: 'amount', type: 'slider', min: 0, max: 100, default: 20 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, noise: params.amount }
        })
    },
    {
        id: 'vhs_glitch',
        name: 'VHS Glitch',
        category: 'Noise & Grain',
        icon: '📼',
        description: 'VHS tape distortion',
        params: [
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 50 },
            { name: 'tracking', type: 'slider', min: 0, max: 100, default: 30 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, vhsGlitch: params.intensity, vhsTracking: params.tracking }
        })
    },

    // ========== SHARPEN & DETAIL ==========
    {
        id: 'sharpen',
        name: 'Sharpen',
        category: 'Sharpen & Detail',
        icon: '🔪',
        description: 'Enhance sharpness',
        params: [
            { name: 'amount', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, sharpen: params.amount }
        })
    },
    {
        id: 'unsharp_mask',
        name: 'Unsharp Mask',
        category: 'Sharpen & Detail',
        icon: '🎭',
        description: 'Professional sharpening',
        params: [
            { name: 'amount', type: 'slider', min: 0, max: 100, default: 60 },
            { name: 'radius', type: 'slider', min: 0, max: 10, default: 2 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, unsharpMask: params.amount, unsharpRadius: params.radius }
        })
    },
    {
        id: 'clarity',
        name: 'Clarity',
        category: 'Sharpen & Detail',
        icon: '💎',
        description: 'Enhance mid-tone contrast',
        params: [
            { name: 'amount', type: 'slider', min: 0, max: 100, default: 40 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, clarity: params.amount }
        })
    },

    // ========== EDGE & DETECTION ==========
    {
        id: 'edge_detect',
        name: 'Edge Detect',
        category: 'Edge & Detection',
        icon: '📐',
        description: 'Highlight edges',
        params: [
            { name: 'threshold', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, edgeDetect: params.threshold }
        })
    },
    {
        id: 'emboss',
        name: 'Emboss',
        category: 'Edge & Detection',
        icon: '⛰️',
        description: '3D embossed effect',
        params: [
            { name: 'angle', type: 'slider', min: 0, max: 360, default: 135 },
            { name: 'height', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, emboss: params.height, embossAngle: params.angle }
        })
    },

    // ========== CHANNEL & COLOR ==========
    {
        id: 'rgb_split',
        name: 'RGB Split',
        category: 'Channel Effects',
        icon: '🔴🟢🔵',
        description: 'Chromatic aberration',
        params: [
            { name: 'offset', type: 'slider', min: 0, max: 50, default: 10 },
            { name: 'angle', type: 'slider', min: 0, max: 360, default: 0 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, rgbSplit: params.offset, splitAngle: params.angle }
        })
    },
    {
        id: 'channel_mixer',
        name: 'Channel Mixer',
        category: 'Channel Effects',
        icon: '🎛️',
        description: 'Mix RGB channels',
        params: [
            { name: 'red', type: 'slider', min: 0, max: 200, default: 100 },
            { name: 'green', type: 'slider', min: 0, max: 200, default: 100 },
            { name: 'blue', type: 'slider', min: 0, max: 200, default: 100 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, redChannel: params.red, greenChannel: params.green, blueChannel: params.blue }
        })
    },
    {
        id: 'duotone',
        name: 'Duotone',
        category: 'Channel Effects',
        icon: '🎨',
        description: 'Two-color gradient map',
        params: [
            { name: 'color1', type: 'color', default: '#000000' },
            { name: 'color2', type: 'color', default: '#ffffff' }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, duotoneColor1: params.color1, duotoneColor2: params.color2 }
        })
    },

    // ========== TIME & MOTION ==========
    {
        id: 'echo',
        name: 'Echo',
        category: 'Time Effects',
        icon: '👥',
        description: 'Motion echo/trail',
        params: [
            { name: 'delay', type: 'slider', min: 0, max: 100, default: 30 },
            { name: 'decay', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, echo: params.delay, echoDecay: params.decay }
        })
    },
    {
        id: 'strobe',
        name: 'Strobe',
        category: 'Time Effects',
        icon: '⚡',
        description: 'Strobe light effect',
        params: [
            { name: 'frequency', type: 'slider', min: 1, max: 30, default: 10 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, strobe: params.frequency }
        })
    },

    // ========== WEATHER & NATURE ==========
    {
        id: 'rain',
        name: 'Rain',
        category: 'Weather',
        icon: '🌧️',
        description: 'Rain overlay effect',
        params: [
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 50 },
            { name: 'speed', type: 'slider', min: 0, max: 100, default: 60 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, rain: params.intensity, rainSpeed: params.speed }
        })
    },
    {
        id: 'snow',
        name: 'Snow',
        category: 'Weather',
        icon: '❄️',
        description: 'Snow overlay effect',
        params: [
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 50 },
            { name: 'size', type: 'slider', min: 1, max: 10, default: 3 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, snow: params.intensity, snowSize: params.size }
        })
    },
    {
        id: 'fog',
        name: 'Fog',
        category: 'Weather',
        icon: '🌫️',
        description: 'Fog/mist overlay',
        params: [
            { name: 'density', type: 'slider', min: 0, max: 100, default: 40 },
            { name: 'color', type: 'color', default: '#cccccc' }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, fog: params.density, fogColor: params.color }
        })
    },

    // ========== SCREEN & OVERLAY ==========
    {
        id: 'screen_damage',
        name: 'Screen Damage',
        category: 'Screen Effects',
        icon: '💔',
        description: 'Broken screen effect',
        params: [
            { name: 'amount', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, screenDamage: params.amount }
        })
    },
    {
        id: 'scanlines',
        name: 'Scanlines',
        category: 'Screen Effects',
        icon: '📟',
        description: 'CRT scanlines',
        params: [
            { name: 'intensity', type: 'slider', min: 0, max: 100, default: 30 },
            { name: 'spacing', type: 'slider', min: 1, max: 10, default: 2 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, scanlines: params.intensity, scanlineSpacing: params.spacing }
        })
    },
    {
        id: 'crt_monitor',
        name: 'CRT Monitor',
        category: 'Screen Effects',
        icon: '🖥️',
        description: 'Old monitor effect',
        params: [
            { name: 'curvature', type: 'slider', min: 0, max: 100, default: 40 },
            { name: 'vignette', type: 'slider', min: 0, max: 100, default: 50 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, crtCurvature: params.curvature, crtVignette: params.vignette }
        })
    },

    // ========== ARTISTIC ==========
    {
        id: 'watercolor',
        name: 'Watercolor',
        category: 'Artistic',
        icon: '🖌️',
        description: 'Watercolor painting',
        params: [
            { name: 'wetness', type: 'slider', min: 0, max: 100, default: 60 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, watercolor: params.wetness }
        })
    },
    {
        id: 'mosaic',
        name: 'Mosaic',
        category: 'Artistic',
        icon: '🧩',
        description: 'Tile mosaic effect',
        params: [
            { name: 'tile_size', type: 'slider', min: 5, max: 100, default: 20 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, mosaic: params.tile_size }
        })
    },
    {
        id: 'kaleidoscope',
        name: 'Kaleidoscope',
        category: 'Artistic',
        icon: '🔮',
        description: 'Kaleidoscope mirror',
        params: [
            { name: 'segments', type: 'slider', min: 3, max: 12, default: 6 },
            { name: 'rotation', type: 'slider', min: 0, max: 360, default: 0 }
        ],
        apply: (clip, params) => ({
            ...clip,
            filters: { ...clip.filters, kaleidoscope: params.segments, kaleRotation: params.rotation }
        })
    }
];

// Group effects by category
export const EFFECT_CATEGORIES = [
    'Color & Grading',
    'Blur & Focus',
    'Distortion',
    'Light & Glow',
    'Stylize',
    'Noise & Grain',
    'Sharpen & Detail',
    'Edge & Detection',
    'Channel Effects',
    'Time Effects',
    'Weather',
    'Screen Effects',
    'Artistic'
];

export const getEffectsByCategory = (category: string): Effect[] => {
    return EFFECTS_LIBRARY.filter(effect => effect.category === category);
};

export const getEffectById = (id: string): Effect | undefined => {
    return EFFECTS_LIBRARY.find(effect => effect.id === id);
};

export const searchEffects = (query: string): Effect[] => {
    const lowerQuery = query.toLowerCase();
    return EFFECTS_LIBRARY.filter(effect =>
        effect.name.toLowerCase().includes(lowerQuery) ||
        effect.description.toLowerCase().includes(lowerQuery) ||
        effect.category.toLowerCase().includes(lowerQuery)
    );
};
