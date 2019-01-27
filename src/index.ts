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

type CharMode = { [key: string]: number }

function regexMatchCount(password: string, re: RegExp): number {
  let count = 0;
  while (re.exec(password)) count++;
  return count;
}

function upperCaseCharCount(password: string): number {
  const re = /[A-Z]/g;
  return regexMatchCount(password, re);
}

function lowerCaseCharCount(password: string): number {
  const re = /[a-z]/g;
  return regexMatchCount(password, re);
}

function digitCount(password: string): number {
  const re = /\d/g;
  return regexMatchCount(password, re);
}

function specialCharCount(password: string): number {
  const re = /[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g;
  return regexMatchCount(password, re);
}

function repeatedIdenticalCharCount(password: string): number {
  const charOccurs = password.split("").reduce((occurs: CharMode, char: string) => {
    if (!occurs[char]) {
      occurs[char] = 1;
    } else {
      occurs[char]++;
    }
    return occurs;
  }, {});

  const chars = Object.entries(charOccurs)
    .filter(([_char, occurrences]) => occurrences >= 3)
    .map(([char, _occurrences]) => char);

  // search for at least 3 in a row for all chars occurring at least 3 times
  const counts = chars.map(char => {
    const re = new RegExp(`[${char}]{3,}`, "g");
    return regexMatchCount(password, re);
  });

  return counts.filter(Boolean).length;
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

function complexityChecks(password: string): number {
  const checks = [
    atLeast(1, upperCaseCharCount, password),
    atLeast(1, lowerCaseCharCount, password),
    atLeast(1, digitCount, password),
    atLeast(1, specialCharCount, password)
  ];

  return checks.filter(Boolean).length;
}

export default function hardpass(password: string): boolean {
  const checks = [
    atLeast(3, complexityChecks, password),
    atLeast(10, length, password),
    atMost(128, length, password),
    atMost(0, repeatedIdenticalCharCount, password)
  ];

  return checks.every(Boolean);
};
