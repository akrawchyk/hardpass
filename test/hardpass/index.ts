import test, { ExecutionContext } from 'ava';
import { HardpassOutput } from '../../src/hardpass/types.d';
import hardpass from '../../src/hardpass';

const output = (t: ExecutionContext, password: string, expected: HardpassOutput) => {
  t.deepEqual(hardpass(password), expected);
};

function weakOutput(suggestions: string | Array<string>, warning = 'Not complex enough') {
  if (!Array.isArray(suggestions)) {
    suggestions = [suggestions];
  }

  return {
    score: 0,
    feedback: {
      warning,
      suggestions
    }
  };
}

function strongOutput() {
  return {
    score: 4
  };
}

// weak

test('short password', output, 'i"PSTg,98', weakOutput('Must be at least 10 characters long'));

test(
  'long password',
  output,
  'hsqwydgM4CR5c1XjzuZzTDQf&#K$=U417DC?q2?8E3AG+rq#3=9q."-H$932x"54hsqwydgM4CR5c1XjzuZzTDQf&#K$=U417DC?q2?8E3AG+rq#3=9q."-H$932x"54c',
  weakOutput('Can only be at most 128 characters long')
);

test(
  'repeated identical chars',
  output,
  '`$T3$6M5vGmj999.Jr',
  weakOutput(['Cannot have any repeated identical characters'])
);

test(
  'no upper case, no lower case',
  output,
  '^#=383=11?',
  weakOutput([
    'Try adding at least 1 upper case character',
    'Try adding at least 1 lower case character'
  ])
);

test(
  'no upper case, no digits',
  output,
  '_q/q"i?qea',
  weakOutput(['Try adding at least 1 upper case character', 'Try adding at least 1 digit'])
);

test(
  'no upper case, no specials',
  output,
  '12cx489fwi',
  weakOutput([
    'Try adding at least 1 upper case character',
    'Try adding at least 1 special characater'
  ])
);

test(
  'no lower case, no digits',
  output,
  '"&PUTNF&-_',
  weakOutput(['Try adding at least 1 lower case character', 'Try adding at least 1 digit'])
);

test(
  'no lower case, no specials',
  output,
  '12B483GWRC',
  weakOutput([
    'Try adding at least 1 lower case character',
    'Try adding at least 1 special characater'
  ])
);

test(
  'no digits, no specials',
  output,
  'SWgsXLejJu',
  weakOutput(['Try adding at least 1 digit', 'Try adding at least 1 special characater'])
);

// strong

test('password length lower bound', output, 'Cm;cF*1f5L', strongOutput());

test(
  'password length upper bound',
  output,
  'w?4P9M&25z6TE9ss:1g57e;.&_pDd,@UYmu:4CSfX;U5@jKz3563geLdpCZ9-Mu.w?4P9M&25z6TE9ss:1g57e;.&_pDd,@UYmu:4CSfX;U5@jKz3563geLd`CZ9-Muc',
  strongOutput()
);

test('allow space left pad', output, ' ZHsyu6uK7', strongOutput());

test('allow space right pad', output, 'ZHsyu6uK7 ', strongOutput());
