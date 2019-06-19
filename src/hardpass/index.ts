import { CharsOccurrences, HardpassFeedback, HardpassOutput } from './types';

const SPECIAL_CHARS_PATTERN = '[ !"#$%&\'()*+,-./:;<=>?@\[\\\]^_`{|}~]'
const SPECIAL_CHARS_RE = new RegExp(SPECIAL_CHARS_PATTERN, 'g');

// TODO: accept hashcat topology and match against password
// see https://hashcat.net/wiki/doku.php?id=mask_attack
const topoMap = {
  l: '[a-z]',
  u: '[A-Z]',
  d: '\\d',
  s: SPECIAL_CHARS_PATTERN,
  a: '.'
}

// TODO how to seed with banned topologies?
// TODO precompute the regexes for patterns?
// TODO it doesnt make seense to test this unless the lengths match
function checkTopology(password: string, topology: string): boolean {
  const topoPattern = topology.split('?')
    .reduce((topo, type) => {
      return topo.concat(topoMap[type])
    }, ['^'])
    .concat('$')
    .join('')
  const topoRe = new RegExp(topoPattern)

  return topoRe.test(password)
}

function regexMatchCount(password: string, re: RegExp): number {
  let count = 0;
  while (re.exec(password)) count++;
  return count;
}

function upperCaseCharCount(password: string, re = /[A-Z]/g): number {
  return regexMatchCount(password, re);
}

function lowerCaseCharCount(password: string, re = /[a-z]/g): number {
  return regexMatchCount(password, re);
}

function digitCount(password: string, re = /\d/g): number {
  return regexMatchCount(password, re);
}

function specialCharCount(password: string, re = SPECIAL_CHARS_RE): number {
  return regexMatchCount(password, re);
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
    withSuggestion(() => atLeast(1, specialCharCount, password), 'Try adding at least 1 special character')
  ].filter(Boolean);
  // prettier-ignore
  const additionalSuggestions = [
    withSuggestion(() => atLeast(10, length, password), 'Must be at least 10 characters long'),
    withSuggestion(() => atMost(128, length, password), 'Can only be at most 128 characters long'),
    withSuggestion(() => atMost(0, repeatedIdenticalCharCount, password), 'Cannot have any repeated identical characters')
  ].filter(Boolean);
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
  const output = { score } as HardpassOutput;

  // same as zxcvbn
  if (score <= 2) {
    output.feedback = feedback;
  }

  return output;
}
