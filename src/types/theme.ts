export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  [cssVar: string]: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  desc: string;
  dark: ThemeColors;
  light: ThemeColors;
  swatches: {
    dark: string[];
    light: string[];
  };
}

export interface CustomThemeStorage {
  dark?: ThemeColors;
  light?: ThemeColors;
  [key: string]: any;
}
