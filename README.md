# hardpass [![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/hardpass.svg
[npm-url]: https://npmjs.org/package/hardpass

Lightweight password strength checker that enforces a strong password policy.

## features

* >99% smaller than [zxcvbn][zxcvbn-link], just 2.2KB gzipped, 6.6KB uncompressed.
* Feedback messages for weak passwords
* Familiar API

[zxcvbn-link]: https://github.com/dropbox/zxcvbn

## install

```shell
npm install hardpass --save

# or with yarn

yarn add hardpass
```

## usage

```js
const hardpass = require('hardpass');

hardpass('qwerty123');
/*
{
  score: 0,
  feedback: {
    warning: 'Not complex enough',
    suggestions: [
      'Try adding at least 1 upper case character',
      'Try adding at least 1 special character',
      'Must be at least 10 characters long'
    ]
  }
}
*/

hardpass('Cm;cF*1f5L');
/*
{
  score: 4
}
*/
```

## policy

Inspired by [OWASP Proper Password Strenth Controls][owasp-url].

[owasp-url]: https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/Authentication_Cheat_Sheet.md#implement-proper-password-strength-controls

### implemented

* Password Length
  * at least 10 characters
  * at most 128 characters
* Password Complexity
  * at least 3 of:
    * at least 1 uppercase character (A-Z)
    * at least 1 lowercase character (a-z)
    * at least 1 digit (0-9)
    * at least 1 special character (punctuation) — ` !"#$%&'()*+,-./:;<=>?@[\\\]^_\`{|}~`
  * not more than 2 identical characters in a row (e.g., 111 not allowed)
* Feedback messages

### planned

* Password Topologies
  * Ban commonly used password topologies
* Configurable feedback messages
* Configurable password dictionaries

## motivation

> zxcvbn.js bundled and minified is about 400kB gzipped or 820kB uncompressed, most of which is dictionaries.[link][zxcvbn-quote-url]

We can eliminate the majority of weak passwords by enforcing baseline recommended
security policies for strong passwords.

We can prune common password dictionaries to reduce their footprint as well, and
provide different configurations for file-size tradeoffs.

[zxcvbn-quote-url]: https://github.com/dropbox/zxcvbn#script-load-latency

## license

[MIT © Andrew Krawchyk][license-url]

[license-url]: https://github.com/akrawchyk/hardpass/blob/master/LICENSE.txt
