import test from 'ava';
import hardpass from './index.js'

test('short password', t => {
  t.is(hardpass('i"PSTg,98'), false)
})
test('long password', t => {
  t.is(hardpass('hsqwydgM4CR5c1XjzuZzTDQf&#K$=U417DC?q2?8E3AG+rq#3=9q."-H$932x"54hsqwydgM4CR5c1XjzuZzTDQf&#K$=U417DC?q2?8E3AG+rq#3=9q."-H$932x"54c'), false)
})
test('password length lower bound', t => {
  t.is(hardpass('Cm;cF*1f5L'), true)
})
test('password length middle', t => {
  t.is(hardpass('krcWV*@R,#%ur5T*xq4XSThJ$d*1~59Z1!5,2t$Nb@45Fdk2SMm2D219H_E/~6zr'), true)
})
test('password length upper bound', t => {
  t.is(hardpass('w?4P9M&25z6TE9ss:1g57e;.&_pDd,@UYmu:4CSfX;U5@jKz3563geLdpCZ9-Mu.w?4P9M&25z6TE9ss:1g57e;.&_pDd,@UYmu:4CSfX;U5@jKz3563geLd`CZ9-Muc'), true)
})

test('no upper case, no lower case', t => {
  t.is(hardpass('^#=383=11?'), false)
})
test('no upper case, no digits', t => {
  t.is(hardpass('_q/q"i\?qe'), false)
})
test('no upper case, no specials', t => {
  t.is(hardpass('12cx489fwi'), false)
})
test('no lower case, no digits', t => {
  t.is(hardpass('"&PUTNF&-_'), false)
})
test('no lower case, no specials', t => {
  t.is(hardpass('12B483GWRC'), false)
})
test('no digits, no specials', t => {
  t.is(hardpass('SWgsXLejJu'), false)
})

test('repeated identical chars', t => {
  t.is(hardpass('`$T3$6M5vGmj999.Jr'), false)
})

test('allow space left pad', t => {
  t.is(hardpass(' ZHsyu6uK7'), true)
})
test('allow space right pad', t => {
  t.is(hardpass('ZHsyu6uK7 '), true)
})
