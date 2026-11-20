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
    /** V26 inverse surface (the decision drawer): `ink` is the fill, `canvas` the text. */
    inverse2: 'rgba(8,9,10,0.6)',
    inverseFill: 'rgba(8,9,10,0.08)',
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
    inverse2: 'rgba(247,248,248,0.6)',
    inverseFill: 'rgba(247,248,248,0.1)',
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

/** V26 area tints: the soft colour behind a chart card (`TintCard`). Quiet backgrounds, never alerts. Board `--t-*`. */
export const tint = {
  dark: { you: 'rgba(154,164,174,0.16)', home: 'rgba(214,164,126,0.16)', work: 'rgba(143,162,255,0.16)', money: 'rgba(61,214,140,0.14)', health: 'rgba(255,126,176,0.15)', goal: 'rgba(255,107,61,0.14)' },
  light: { you: 'rgba(93,107,120,0.10)', home: 'rgba(160,112,76,0.13)', work: 'rgba(76,95,213,0.10)', money: 'rgba(11,122,85,0.10)', health: 'rgba(194,69,122,0.10)', goal: 'rgba(229,83,43,0.10)' },
} as const satisfies Record<'dark' | 'light', Record<Area, string>>;

/**
 * V26 colours for things placed on a photograph (board `--on-photo`, `--on-photo2`, `--photo-fill`).
 * `ink` is the dark text on a paper button or chip that sits on a photo. `shade` darkens the feeling
 * field's photograph under its dots (board `--panel`); it is a full-bleed scrim, never a side panel.
 */
export const photo = {
  onPhoto: '#F4F3EE',
  onPhoto2: 'rgba(244,243,238,0.72)',
  fill: 'rgba(244,243,238,0.16)',
  ink: '#0D0E10',
  shade: 'rgba(8,9,10,0.46)',
} as const;

/** V26 photo scrims, solid gradients only (no blur). `fade`: the Welcome treatment. `card`: photo cards. `deck`: today's move cards. */
export const photoScrims = {
  fade: { colors: ['rgba(8,9,10,0.25)', 'rgba(8,9,10,0)', 'rgba(8,9,10,0.2)', 'rgba(8,9,10,0.88)'] as const, locations: [0, 0.3, 0.55, 1] as const },
  card: { colors: ['rgba(8,9,10,0.18)', 'rgba(8,9,10,0)', 'rgba(8,9,10,0.8)'] as const, locations: [0, 0.34, 1] as const },
  deck: { colors: ['rgba(8,9,10,0)', 'rgba(8,9,10,0.84)'] as const, locations: [0.4, 1] as const },
};

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
  /** V26: the two-tone briefing. Medium weight; bright words in `ink`, the rest in `ink2` (use `TwoTone size="display"`). */
  display: { fontFamily: fonts.sansMedium, fontSize: 34, lineHeight: 39, letterSpacing: -1.1 },
  welcome: { fontFamily: fonts.sansSemibold, fontSize: 46, lineHeight: 48, letterSpacing: -2.07 },
  welcomeStatement: { fontFamily: fonts.sansMedium, fontSize: 21, lineHeight: 28, letterSpacing: -0.35 },
  titleSerif: { fontFamily: fonts.sansSemibold, fontSize: 30, lineHeight: 34, letterSpacing: -0.9 },
  statement: { fontFamily: fonts.sansMedium, fontSize: 24, lineHeight: 31, letterSpacing: -0.53 },
  /** V26: a 24pt figure or title in semibold (a reading's value, a photo card's title, the drawer's question). */
  heading: { fontFamily: fonts.sansSemibold, fontSize: 24, lineHeight: 31, letterSpacing: -0.53, fontVariant: ['tabular-nums'] as ('tabular-nums')[] },
  headline: { fontFamily: fonts.sansSemibold, fontSize: 20, lineHeight: 26, letterSpacing: -0.4 },
  /** V26: the headline size in medium, for a two-tone line ("I’m arriving calm."). */
  headlineMedium: { fontFamily: fonts.sansMedium, fontSize: 20, lineHeight: 26, letterSpacing: -0.4 },
  title: { fontFamily: fonts.sansSemibold, fontSize: 16, lineHeight: 21, letterSpacing: -0.22 },
  button: { fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 22, letterSpacing: -0.18 },
  buttonCompact: { fontFamily: fonts.sansSemibold, fontSize: 14, lineHeight: 20, letterSpacing: -0.12 },
  greeting: { fontFamily: fonts.sansMedium, fontSize: 16, lineHeight: 21, letterSpacing: -0.12 },
  /** V26: a list row's title. */
  rowTitle: { fontFamily: fonts.sansSemibold, fontSize: 15, lineHeight: 21, letterSpacing: -0.15 },
  /** V26: a checklist line. */
  bodyL: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, letterSpacing: -0.12 },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, letterSpacing: -0.12 },
  /** V26: 15pt medium (a wheel option, a text bar's words). */
  bodyMedium: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 22, letterSpacing: -0.12 },
  callout: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18, letterSpacing: -0.04 },
  /** V26: a 13pt semibold label (segmented control, area tiles). */
  label: { fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 18, letterSpacing: -0.04 },
  mono: { fontFamily: fonts.mono, fontSize: 12.5, lineHeight: 16, letterSpacing: 0 },
  unit: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 16, letterSpacing: 0 },
  micro: { fontFamily: fonts.sansSemibold, fontSize: 11, lineHeight: 13, letterSpacing: 0.1 },
} as const;

export type TypeStyle = keyof typeof type;

/** `tile`: the V26 board's 10pt gap between tiles, photo cards and accordion sections. */
export const space = { xxs: 4, xs: 8, sm: 12, md: 16, lg: 20, xl: 24, xxl: 32, xxxl: 48, gutter: 20, cardPad: 20, cardGap: 12, section: 32, tile: 10 } as const;

/** v4: tighter, more precise. Buttons are 14pt slabs; pills only for tags/chips.
 * V26: `tile` (16) small photo tiles and area tiles, `photo` (24) photo cards, `tail` (6) the corner a chat bubble speaks from. */
export const radius = { xs: 7, sm: 10, md: 12, lg: 20, xl: 28, button: 14, score: 16, chart: 8, full: 999, tile: 16, photo: 24, tail: 6 } as const;

export const componentSize = { iconStroke: 1.6, icon: 22, navIcon: 22, toolCompact: 88, rowIcon: 40, row: 64, nextMovePhoto: 190, bottomNav: 64, progressCapsule: 30, progressBar: 6, progressThin: 4, lightField: 440, button: 50, moneyAccount: 140, cameraShutter: 74, cameraModes: 205, cameraBottom: 34, mealConfirmPhoto: 150, mealResultPhoto: 190, mealScore: 56,
  /** V26 additions, from the board's kit. */
  round: 40, roundSm: 32, roundLg: 56, roundXl: 72, iconSm: 18, iconXs: 16, thumb: 48, dockItem: 48, buttonSm: 40, topBarV26: 52, feelHandle: 44, decideSide: 48, decideKnob: 76, dot: 6 } as const;

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

/** V26 floating lift (board `--float`): the dock pill, the front move card, a slider knob, the feeling handle. Unlike
 * `floatShadow`, it also lifts in dark mode, as the board does. */
export const floatLift = (scheme: 'light' | 'dark') => ({
  shadowColor: scheme === 'dark' ? '#000' : '#141417',
  shadowOpacity: scheme === 'dark' ? 0.4 : 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 12 },
  elevation: scheme === 'dark' ? 10 : 8,
});

/** V26 sheet edge (board `.sheet`): a soft shadow above a sheet or drawer. */
export const sheetShadow = {
  shadowColor: '#000',
  shadowOpacity: 0.12,
  shadowRadius: 32,
  shadowOffset: { width: 0, height: -12 },
  elevation: 16,
} as const;

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
