# hardpass

Lightweight password strength checker that enforces a strong password policy.

## Policies

Inspired by https://www.owasp.org/index.php/Authentication_Cheat_Sheet#Implement_Proper_Password_Strength_Controls.

### Implemented

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

### Planned

* Password Topologies
  * Ban commonly used password topologies
* If the new password doesn't comply with the complexity policy, the error message should describe EVERY complexity rule that the new password does not comply with, not just the 1st rule it doesn't comply with.

### Considering

* Passphrases shorter than 20 characters are usually considered weak if they only consist of lower case Latin characters.

## Usage

To install hardpass, run:

```console
npm install hardpass --save
# or with yarn
yarn add hardpass
```

```js
const hardpass = require('hardpass');

hardpass('qwerty123')
//=> false
```

## Docs

TODO

## License

[MIT © Andrew Krawchyk](https://github.com/akrawchyk/hardpass/blob/master/LICENSE.txt)
