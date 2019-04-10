import { CharsOccurrences, HardpassFeedback, HardpassOutput } from './types';

function regexMatchCount(password: string, re: RegExp): number {
  let count = 0;
  while (re.exec(password)) count++;
  return count;
}

const upperCaseRe = /[A-Z]/g;
function upperCaseCharCount(password: string): number {
  return regexMatchCount(password, upperCaseRe);
}

const lowerCaseRe = /[a-z]/g;
function lowerCaseCharCount(password: string): number {
  return regexMatchCount(password, lowerCaseRe);
}

const digitRe = /\d/g;
function digitCount(password: string): number {
  return regexMatchCount(password, digitRe);
}

const specialRe = /[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g;
function specialCharCount(password: string): number {
  return regexMatchCount(password, specialRe);
}

function countCharsOccurrences(password: string): CharsOccurrences {
  return password.split('').reduce((occurs: CharsOccurrences, char: string): CharsOccurrences => {
    if (!occurs[char]) {
      occurs[char] = 1;
    } else {
      occurs[char]++;
    }
    return occurs;
  }, {});
}

function repeatedIdenticalCharCount(password: string, maxRepeats = 2): number {
  const charsOccurs = countCharsOccurrences(password);
  const recurringChars = Object.entries(charsOccurs)
    .filter(([_char, occurrences]) => occurrences > maxRepeats)
    .map(([char, _occurrences]) => char);

  // search for repeated chars for all chars recurring more than maxRepeats
  const repeatedChars = recurringChars.reduce((repeats: Array<string>, char: string): Array<
    string
  > => {
    switch (char) {
      case '\\':
      case ']':
        char = `\${char}`; // escape char in regex
        break;
    }

    const minOccurs = maxRepeats + 1;
    const re = new RegExp(`[${char}]{${minOccurs},}`, 'g');

    if (regexMatchCount(password, re) > 0) {
      repeats.push(char);
    }

    return repeats;
  }, []);

  return repeatedChars.length;
}

function length(password: string): number {
  return password.length;
}

function atLeast(count: number, check: Function, password: string): boolean {
  return check(password) >= count;
}

function atMost(count: number, check: Function, password: string): boolean {
  return check(password) <= count;
}

function withSuggestion(check: Function, suggestion = 'suggestion'): string {
  if (!check()) {
    return suggestion;
  } else {
    return '';
  }
}

function provideFeedback(password: string): HardpassFeedback {
  // prettier-ignore
  const complexitySuggestions = [
    withSuggestion(() => atLeast(1, upperCaseCharCount, password), 'Try adding at least 1 upper case character'),
    withSuggestion(() => atLeast(1, lowerCaseCharCount, password), 'Try adding at least 1 lower case character'),
    withSuggestion(() => atLeast(1, digitCount, password), 'Try adding at least 1 digit'),
    withSuggestion(() => atLeast(1, specialCharCount, password), 'Try adding at least 1 special characater')
  ].filter(Boolean);
  const additionalSuggestions = [
    withSuggestion(() => atLeast(10, length, password), 'Must be at least 10 characters long'),
    withSuggestion(() => atMost(128, length, password), 'Can only be at most 128 characters long'),
    withSuggestion(
      () => atMost(0, repeatedIdenticalCharCount, password),
      'Cannot have any repeated identical characters'
    )
  ].filter(Boolean);
  // prettier-ignore-end
  let suggestions: Array<string> = [];
  let warnings: Array<string> = [];

  if (complexitySuggestions.length > 1) {
    // min complexity requirements == 3/4 checks
    suggestions = complexitySuggestions;
  }

  if (additionalSuggestions.length > 0) {
    // all are required
    suggestions = suggestions.concat(additionalSuggestions);
  }

  if (suggestions.length > 0) {
    warnings.push('Not complex enough');
  }

  return {
    warning: warnings.join(' and '),
    suggestions
  };
}

export default function hardpass(password: string): HardpassOutput {
  const feedback = provideFeedback(password);
  const isStrong = !feedback.warning;
  const score = isStrong ? 4 : 0; // we're either weak:0 or strong:4
  const output = { score };

  // same as zxcvbn
  if (score <= 2) {
    Object.assign(output, feedback);
  }

  return output;
}
