export type TitleLine = {
  text: string;
  accent?: boolean;
};

export type RenderRequest = {
  title?: TitleLine[];
  subtitle?: string;
};