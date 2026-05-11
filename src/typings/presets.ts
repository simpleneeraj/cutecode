export interface BaseFrameProps {
  padding: string | number | any;
  darkMode: boolean;
  transparent: boolean;
  themeBackground: string;
  backgroundImage?: string;
  fileName: string;
  onFileNameChange: (name: string) => void;
  selectedLanguage: { name?: string; value?: string } | null;
  windowWidth: number | null;
  code: string;
  exportSize: number | null;
  themeId?: string;
  children?: React.ReactNode;
}
