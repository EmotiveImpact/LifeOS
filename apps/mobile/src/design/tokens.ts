/**
 * life design tokens: the TypeScript mirror of DESIGN.md §3–§7.
 * Colours exist in exactly two places: here and `src/global.css`. Keep them in sync.
 */

export const palette = {
  /** v4: dark-first. Hairline depth via `line`; one signal colour (ember). */
  dark: {
    canvas: '#08090A',
    surface: '#141517',
    surface2: '#1B1C1F',
    surface3: '#26272B',
    line: 'rgba(255,255,255,0.07)',
    line2: 'rgba(255,255,255,0.11)',
    ink: '#F7F8F8',
    ink2: '#8A8F98',
    inkQuiet: '#62666D',
    ember: '#FF6B3D',
    emberText: '#FF7A50',
    emberTint: 'rgba(255,107,61,0.14)',
    gain: '#3DD68C',
    gainTint: 'rgba(61,214,140,0.13)',
    paper: '#F7F8F8',
    scrim: 'rgba(8,9,10,0.55)',
    shadow: 'rgba(0,0,0,0)',
    dockBg: '#141517',
  },
  light: {
    canvas: '#F7F7F8',
    surface: '#FFFFFF',
    surface2: '#F3F3F5',
    surface3: '#E6E6EA',
    line: 'rgba(13,14,16,0.08)',
    line2: 'rgba(13,14,16,0.13)',
    ink: '#0D0E10',
    ink2: '#5C6068',
    inkQuiet: '#8B8F97',
    ember: '#E5532B',
    emberText: '#C2410C',
    emberTint: 'rgba(229,83,43,0.10)',
    gain: '#0B7A55',
    gainTint: 'rgba(11,122,85,0.10)',
    paper: '#F7F8F8',
    scrim: 'rgba(8,9,10,0.55)',
    shadow: 'rgba(13,14,16,0.12)',
    dockBg: '#FFFFFF',
  },
} as const;

export type Scheme = keyof typeof palette;
export type Palette = { [K in keyof (typeof palette)['dark']]: string };

/** Paper-white text and its quieter tones, for anything placed on an atmosphere. */
export const onAtmosphere = {
  text: '#F4F3EE',
  text2: 'rgba(244,243,238,0.72)',
  quiet: 'rgba(244,243,238,0.50)',
  glass: 'rgba(244,243,238,0.16)',
  tickEmpty: 'rgba(244,243,238,0.22)',
  tickFilled: 'rgba(244,243,238,0.80)',
} as const;

export const imageScrims = {
  cover: ['rgba(8,9,10,0.4)', 'rgba(8,9,10,0)', 'rgba(8,9,10,0.1)', 'rgba(8,9,10,0.9)'] as const,
  coverLocations: [0, .24, .5, .86] as const,
};

/** v4 area colours: used only for 6px dots, filing chips and one glow per screen. */
export const areaColors = {
  dark: { you: '#9AA4AE', home: '#D6A47E', work: '#8FA2FF', money: '#3DD68C', health: '#FF7EB0', goal: '#FF6B3D' },
  light: { you: '#5D6B78', home: '#A0704C', work: '#4C5FD5', money: '#0B7A55', health: '#C2457A', goal: '#E5532B' },
} as const;
export type Area = keyof (typeof areaColors)['dark'];

export type Domain = 'money' | 'health' | 'admin' | 'growth' | 'calm';

/** DESIGN.md §3.3: gradient stops from top to the fade. The final stop is replaced by `canvas`. */
export const atmospheres: Record<Domain, { stops: string[]; tint: { light: string; dark: string } }> = {
  money: { stops: ['#0B2A26', '#0A1F1C', '#0E0E11'], tint: { light: 'rgba(11,42,38,0.10)', dark: 'rgba(47,211,159,0.10)' } },
  health: { stops: ['#6E5F55', '#3D332E', '#1A1716'], tint: { light: 'rgba(110,95,85,0.16)', dark: 'rgba(160,135,118,0.18)' } },
  admin: { stops: ['#6F7D86', '#8D9AA3', '#B6ADA2'], tint: { light: 'rgba(141,154,163,0.22)', dark: 'rgba(141,154,163,0.16)' } },
  growth: { stops: ['#B8330F', '#5A1708', '#120806'], tint: { light: 'rgba(255,74,28,0.14)', dark: 'rgba(255,74,28,0.18)' } },
  calm: { stops: ['#1B1A2E', '#121220', '#0E0E11'], tint: { light: 'rgba(60,58,100,0.12)', dark: 'rgba(120,118,180,0.14)' } },
};

export const fonts = {
  /** v4: Inter only. Display sizes use the same family with tighter tracking. */
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  mono: 'JetBrainsMono_400Regular',
} as const;

/** DESIGN.md §4 type scale. */
export const type = {
  /** Numbers: tabular figures + negative tracking (DESIGN.md §25). */
  numeralXl: { fontFamily: fonts.sansSemibold, fontSize: 56, lineHeight: 58, letterSpacing: -2.5, fontVariant: ['tabular-nums'] as ('tabular-nums')[] },
  numeralL: { fontFamily: fonts.sansSemibold, fontSize: 32, lineHeight: 36, letterSpacing: -1.1, fontVariant: ['tabular-nums'] as ('tabular-nums')[] },
  /** Board v17 quick-lesson tax-code picture. Not a general display size. */
  diagramCode: { fontFamily: fonts.sansSemibold, fontSize: 44, lineHeight: 48, letterSpacing: -1.32, fontVariant: ['tabular-nums'] as ('tabular-nums')[] },
  welcome: { fontFamily: fonts.sansSemibold, fontSize: 46, lineHeight: 48, letterSpacing: -2.07 },
  welcomeStatement: { fontFamily: fonts.sansMedium, fontSize: 21, lineHeight: 28, letterSpacing: -0.35 },
  titleSerif: { fontFamily: fonts.sansSemibold, fontSize: 30, lineHeight: 34, letterSpacing: -0.9 },
  statement: { fontFamily: fonts.sansMedium, fontSize: 24, lineHeight: 31, letterSpacing: -0.53 },
  headline: { fontFamily: fonts.sansSemibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.4 },
  title: { fontFamily: fonts.sansSemibold, fontSize: 16, lineHeight: 21, letterSpacing: -0.22 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, letterSpacing: -0.12 },
  callout: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18, letterSpacing: -0.04 },
  mono: { fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 16, letterSpacing: 0 },
  unit: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 16, letterSpacing: 0 },
  micro: { fontFamily: fonts.sansSemibold, fontSize: 11, lineHeight: 13, letterSpacing: 0.1 },
} as const;

export type TypeStyle = keyof typeof type;

export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 48, gutter: 20, cardPad: 20, cardGap: 12, section: 32 } as const;

/** v4: tighter, more precise. Buttons are 14pt slabs; pills only for tags/chips. */
export const radius = { xs: 7, sm: 10, md: 12, lg: 20, xl: 28, button: 14, full: 999 } as const;

export const touch = { min: 44 } as const;

/** Floating elements only (dock, FAB, sheet, front of a peek stack). Flat cards never cast shadow. */
export const floatShadow = (color: string) => ({
  shadowColor: color === 'rgba(0,0,0,0)' ? '#000' : '#141417',
  shadowOpacity: color === 'rgba(0,0,0,0)' ? 0 : 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 12 },
  elevation: color === 'rgba(0,0,0,0)' ? 0 : 8,
});

/** Cards: no borders (DESIGN §47); a soft shadow gives depth. Stronger in dark, where it reads less. */
export const cardShadow = (scheme: 'light' | 'dark') => ({
  shadowColor: '#000',
  shadowOpacity: scheme === 'dark' ? 0.35 : 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
  elevation: scheme === 'dark' ? 4 : 2,
});

/** DESIGN.md §7 motion. */
export const springs = {
  snappy: { damping: 20, stiffness: 260, mass: 1 },
  smooth: { damping: 26, stiffness: 170, mass: 1 },
  sheet: { damping: 30, stiffness: 200, mass: 1 },
} as const;

export const durations = { quick: 160, item: 240, stagger: 40, roll: 600, wordStagger: 30 } as const;

/**
 * Duration-based springs (MOTION.md §2). Same feel on iOS and Android via Reanimated 4.
 * Use these for new work; `springs` above stays for existing components.
 * Adapted from the Feynman app's ui/motion.ts.
 */
export const motion = {
  smooth: { duration: 550, dampingRatio: 0.85 },
  snappy: { duration: 350, dampingRatio: 0.9 },
  bouncy: { duration: 600, dampingRatio: 0.7 },
  imageEnter: { duration: 900, dampingRatio: 1 },
  imageDrift: { duration: 24000, dampingRatio: 1 },
  imageFade: { duration: 400, dampingRatio: 1 },
  /** riseIn: opacity 0→1, translateY 14→0, scale 0.98→1 over 420ms. */
  rise: { duration: 420, fromY: 14, fromScale: 0.98 },
  /** Gap between items that enter one after another. */
  stagger: 60,
} as const;
