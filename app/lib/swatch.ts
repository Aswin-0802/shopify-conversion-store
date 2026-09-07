const COLOR_MAP: Record<string, string> = {
  black: '#121212',
  white: '#f4f1ea',
  ivory: '#f3ead8',
  cream: '#efe6d4',
  beige: '#d8c3a5',
  gray: '#8a8580',
  grey: '#8a8580',
  charcoal: '#3a3a3a',
  silver: '#c5c5c5',
  navy: '#1b2a4a',
  blue: '#2f5f9e',
  ocean: '#2a5f73',
  teal: '#2c6f6a',
  green: '#2f6a3a',
  olive: '#6b6f3a',
  forest: '#1f4a32',
  jam: '#7a2740',
  red: '#b42318',
  burgundy: '#6e1f32',
  clay: '#b57a4a',
  rust: '#b85c38',
  orange: '#d46a2c',
  yellow: '#e2b84a',
  gold: '#c4a056',
  brown: '#6b4226',
  tan: '#c4a07a',
  pink: '#d48aa8',
  rose: '#c56b7a',
  violet: '#6b4c9a',
  purple: '#5c3d8a',
};

export function colorFromName(name?: string | null) {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  if (COLOR_MAP[key]) return COLOR_MAP[key];

  const match = Object.keys(COLOR_MAP).find((color) => key.includes(color));
  return match ? COLOR_MAP[match] : null;
}

export function isColorOption(optionName?: string | null) {
  if (!optionName) return false;
  return /colou?r|shade|hue/i.test(optionName);
}
