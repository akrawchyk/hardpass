export type CharsOccurrences = { [key: string]: number };

export interface HardpassFeedback {
  warning: string;
  suggestions: Array<string>;
}

export interface HardpassOutput {
  score: number;
  feedback?: HardpassFeedback;
}

export type hardpass = (password: string) => HardpassOutput;
