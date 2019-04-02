export type CharsOccurrences = { [key: string]: number };

export interface HardpassOutput {
  score: number,
  feedback: {
    warning: string,
    suggestions: Array<string>
  }
}

export function hardpass(password: string): boolean;
