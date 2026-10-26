/**
 * Design tokens do budd — fonte única de verdade para cor, espaço, raio,
 * tipografia e movimento. Espelham o artboard "Design System" aprovado.
 * Nenhum componente deve usar valores literais que existam aqui.
 */

export const palette = {
  lime50: '#F1FDE9',
  lime100: '#DDFAC9',
  lime300: '#ABF384',
  lime500: '#76EB3C',
  lime700: '#4CB21C',
  lime900: '#1F3D10',
  black: '#000000',
  n50: '#0B0C0B',
  n100: '#141614',
  n200: '#1E211E',
  n300: '#2A2E2A',
  n500: '#5E655C',
  n600: '#8A9187',
  n800: '#C9CEC5',
  n900: '#F4F6F2',
  red: '#FF5A4E',
  redSoft: '#FF8077',
  amber: '#FFB547',
  blue: '#6BB8FF',
  pink: '#FF7AC6',
  orange: '#FF8A3D',
  violet: '#A98BFF',
  violetSoft: '#C4B2FF',
  cyan: '#5FD4E0',
} as const;

export const colors = {
  brand: palette.lime500,
  brandPressed: palette.lime700,
  onBrand: palette.black,
  bg: palette.black,
  surface0: palette.n50,
  surface1: palette.n100,
  surface2: palette.n200,
  border: palette.n300,
  text1: palette.n900,
  text2: palette.n800,
  text3: palette.n600,
  disabled: palette.n500,
  success: palette.lime500,
  error: palette.red,
  errorText: palette.redSoft,
  warning: palette.amber,
  info: palette.blue,
  scrim: 'rgba(0,0,0,0.6)',
  overlay: 'rgba(0,0,0,0.55)',
  brandTint: 'rgba(118,235,60,0.14)',
  brandGlow: 'rgba(118,235,60,0.25)',
} as const;

/** Grid de 4pt. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 56,
} as const;

export const radius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  sheet: 32,
  pill: 999,
} as const;

/** Área mínima de toque (WCAG / HIG). */
export const hitSize = 44;

export const fonts = {
  display: 'BricolageGrotesque_800ExtraBold',
  heading: 'BricolageGrotesque_700Bold',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const typography = {
  display: { fontFamily: fonts.display, fontSize: 36, lineHeight: 40, letterSpacing: -0.6 },
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.4 },
  h2: { fontFamily: fonts.heading, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 18 },
  small: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
  overline: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, letterSpacing: 0.9, textTransform: 'uppercase' as const },
} as const;

export type TypographyVariant = keyof typeof typography;

export const motion = {
  duration: { press: 120, micro: 200, enter: 320, splash: 2400 },
  stagger: 40,
  pressScale: 0.96,
  spring: { damping: 18, stiffness: 220, mass: 1 },
} as const;

export const shadow = {
  floating: {
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  brandGlow: {
    shadowColor: palette.lime500,
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
} as const;
