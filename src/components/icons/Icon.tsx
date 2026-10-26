import { memo } from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

/**
 * Set de ícones próprio (traço 2px, grid 24) desenhado para o budd.
 * Evita uma dependência de ícones inteira para ~40 glifos e garante
 * consistência visual com o design aprovado.
 */
const glyphs = {
  home: <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  map: (
    <>
      <Path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z" />
      <Path d="M9 4v14M15 6v14" />
    </>
  ),
  ticket: (
    <>
      <Path d="M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z" />
      <Path d="M14 7v10" />
    </>
  ),
  user: (
    <>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  search: (
    <>
      <Circle cx={11} cy={11} r={7} />
      <Path d="m20 20-3.5-3.5" />
    </>
  ),
  pin: (
    <>
      <Path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <Circle cx={12} cy={9.5} r={2.5} />
    </>
  ),
  chevronDown: <Path d="m6 9 6 6 6-6" />,
  chevronLeft: <Path d="m15 18-6-6 6-6" />,
  chevronRight: <Path d="m9 18 6-6-6-6" />,
  bell: (
    <>
      <Path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" />
      <Path d="M10 21h4" />
    </>
  ),
  sliders: (
    <>
      <Path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1" />
      <Circle cx={15} cy={6} r={2} />
      <Circle cx={9} cy={12} r={2} />
      <Circle cx={17} cy={18} r={2} />
    </>
  ),
  mic: (
    <>
      <Rect x={9} y={3} width={6} height={11} rx={3} />
      <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </>
  ),
  heart: <Path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  star: <Path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
  sparkle: (
    <>
      <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
      <Path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
    </>
  ),
  clock: (
    <>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  share: <Path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />,
  plus: <Path d="M12 5v14M5 12h14" />,
  minus: <Path d="M5 12h14" />,
  check: <Path d="m5 12 5 5L20 7" />,
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  calendar: (
    <>
      <Rect x={3} y={5} width={18} height={16} rx={2} />
      <Path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  route: (
    <>
      <Path d="M12 2 22 12 12 22 2 12z" />
      <Path d="M9 14v-2.5h5.5M12.5 9l2.5 2.5-2.5 2.5" />
    </>
  ),
  phone: <Path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />,
  locate: <Path d="M3 11 21 3l-8 18-2-8z" />,
  list: <Path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  send: <Path d="M12 19V5M5 12l7-7 7 7" />,
  card: (
    <>
      <Rect x={3} y={5} width={18} height={14} rx={2} />
      <Path d="M3 10h18" />
    </>
  ),
  pix: (
    <>
      <Path d="M12 3 21 12 12 21 3 12z" />
      <Path d="M8 12h8" />
    </>
  ),
  wallet: (
    <>
      <Path d="M4 7a2 2 0 0 1 2-2h12v4" />
      <Rect x={3} y={9} width={18} height={11} rx={2} />
      <Circle cx={16} cy={14.5} r={1.3} />
    </>
  ),
  tag: (
    <>
      <Path d="M3 12V4h8l10 10-8 8z" />
      <Circle cx={7.5} cy={7.5} r={1.5} />
    </>
  ),
  lock: (
    <>
      <Rect x={5} y={11} width={14} height={10} rx={2} />
      <Path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  settings: (
    <>
      <Circle cx={12} cy={12} r={3} />
      <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </>
  ),
  camera: (
    <>
      <Path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <Circle cx={12} cy={13} r={3.5} />
    </>
  ),
  wifiOff: (
    <>
      <Path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0" />
      <Path d="M12 19h.01M3 3l18 18" />
    </>
  ),
  refresh: <Path d="M20 12a8 8 0 1 1-2.3-5.7L20 8.5M20 4v4.5h-4.5" />,
  alert: <Path d="M12 7v6M12 17h.01" />,
  // Categorias
  beer: (
    <>
      <Path d="M6 8h10v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z" />
      <Path d="M16 11h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2" />
      <Path d="M6 8a3 3 0 0 1 3-4 3 3 0 0 1 5 0 2.5 2.5 0 0 1 2 4" />
    </>
  ),
  cocktail: (
    <>
      <Path d="M4 4h16l-8 9z" />
      <Path d="M12 13v7M8 20h8" />
    </>
  ),
  burger: (
    <>
      <Path d="M4 11a8 6 0 0 1 16 0z" />
      <Path d="M3 14h18" />
      <Path d="M4 17h16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
    </>
  ),
  music: (
    <>
      <Path d="M9 18V5l11-2v13" />
      <Circle cx={6} cy={18} r={3} />
      <Circle cx={17} cy={16} r={3} />
    </>
  ),
  service: (
    <>
      <Path d="M4 18h16" />
      <Path d="M6 18a6 6 0 0 1 12 0" />
      <Path d="M12 9V7M10 7h4" />
    </>
  ),
} as const;

export type IconName = keyof typeof glyphs;

/** Ícones desenhados como forma cheia quando `filled`. */
const fillable: ReadonlySet<IconName> = new Set<IconName>(['heart', 'star', 'sparkle']);

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
}

function IconBase({ name, size = 24, color = colors.text1, strokeWidth = 2, filled = false }: IconProps) {
  const fill = filled && fillable.has(name) ? color : 'none';
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
    >
      {glyphs[name]}
    </Svg>
  );
}

export const Icon = memo(IconBase);
