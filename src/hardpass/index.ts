/* hardpass

Problem:
Too many websites/applications have arbitrary and insecure password strength requirements.
Requirements are often inconvenient for the user with no added security benefit

Solution:
Library with configurable levels of safety, including sane and recommended defaults

1st: default minimum
smallest bundle size
https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Password_Complexity
The password change mechanism should require a minimum level of complexity that makes sense for the application and its user population. For example:
* Password must meet at least 3 out of the following 4 complexity rules
  * at least 1 uppercase character (A-Z)
  * at least 1 lowercase character (a-z)
  * at least 1 digit (0-9)
  * at least 1 special character (punctuation) — do not forget to treat space as special characters too
  * at least 10 characters
  * at most 128 characters
  * not more than 2 identical characters in a row (e.g., 111 not allowed)
Make sure that every character the user types in is actually included in the password. We've seen systems that truncate the password at a length shorter than what the user provided (e.g., truncated at 15 characters when they entered 20).
As application's require more complex password policies, they need to be very clear about what these policies are. The required policy needs to be explicitly stated on the password change page
If the new password doesn't comply with the complexity policy, the error message should describe EVERY complexity rule that the new password does not comply with, not just the 1st rule it doesn't comply with.

2nd: extended dictionaries
these trade larger bundle size for more strict password checking
various different password dicts: https://github.com/danielmiessler/SecLists/tree/master/Passwords
darkweb2017-top100.txt - 1KB
password-permutations.txt - 1KB
probable-v2-wpa-top62.txt - 1KB
probable-v2-top207.txt - 2KB
Sucuri-Top-Wordpress-Passwords.txt - 1KB
twitter-banned.txt - 3KB
10-million-password-list-top-500.txt - 4KB
probable-v2-wpa-top447.txt - 5KB
cirt-default-passwords.txt - 8KB
darkweb2017-top1000.txt - 8KB
10-million-password-list-top-1000.txt - 8KB
1337speak.txt - 10KB
korelogic-password.txt - 11KB
probable-v2-top1575.txt - 12KB
john-the-ripper.txt - 22KB
probable-v2-wpa-top4800.txt - 45KB
10-million-password-list-top-10000.txt - 75KB
darkweb2017-top10000.txt - 81KB
10k-most-common.txt - 82KB
Keyboard-Combinations.txt - 83KB
probable-v2-top12000.txt - 98KB
Most-Popular-Letter-Passes.txt - 315KB
10-million-password-list-top-100000.txt - 764KB
allow different lists to be combined?
use settings to drive bundling decisions
e.g. MIN_LENGTH = 8, remove all strings < length 8 from any extended dictionaries
extended checks:
these trade more network requests and more network time for more strict password checking

3rd: various api services:
https://haveibeenpwned.com/API/v2
*/

import { CharsOccurrences, HardpassFeedback, HardpassOutput } from "./types";

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
  return password
    .split("")
    .reduce((occurs: CharsOccurrences, char: string): CharsOccurrences => {
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
  const repeatedChars = recurringChars.reduce(
    (repeats: Array<string>, char: string): Array<string> => {
      switch (char) {
        case "\\":
        case "]":
          char = `\${char}`; // escape char in regex
          break;
      }

      const minOccurs = maxRepeats + 1;
      const re = new RegExp(`[${char}]{${minOccurs},}`, "g");

      if (regexMatchCount(password, re) > 0) {
        repeats.push(char);
      }

      return repeats;
    },
    []
  );

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

function withSuggestion(check: Function, suggestion = "suggestion"): string {
  if (!check()) {
    return suggestion;
  } else {
    return "";
  }
}

function provideFeedback(password: string): HardpassFeedback {
  const complexitySuggestions = [
    withSuggestion(
      () => atLeast(1, upperCaseCharCount, password),
      "Try adding at least 1 upper case character"
    ),
    withSuggestion(
      () => atLeast(1, lowerCaseCharCount, password),
      "Try adding at least 1 lower case character"
    ),
    withSuggestion(
      () => atLeast(1, digitCount, password),
      "Try adding at least 1 digit"
    ),
    withSuggestion(
      () => atLeast(1, specialCharCount, password),
      "Try adding at least 1 special characater"
    )
  ].filter(Boolean);
  const additionalSuggestions = [
    withSuggestion(
      () => atLeast(10, length, password),
      "Must be at least 10 characters long"
    ),
    withSuggestion(
      () => atMost(128, length, password),
      "Can only be at most 128 characters long"
    ),
    withSuggestion(
      () => atMost(0, repeatedIdenticalCharCount, password),
      "Cannot have any repeated identical characters"
    )
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
    warnings.push("Not complex enough");
  }

  return {
    warning: warnings.join(" and "),
    suggestions
  };
}

export default function hardpass(password: string): HardpassOutput {
  const feedback = provideFeedback(password);
  const isStrong = !!feedback.warning;
  const score = isStrong ? 4 : 0; // we're either weak:0 or strong:4

  return {
    score,
    feedback
  };
}
