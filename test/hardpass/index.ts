import test, { ExecutionContext } from "ava";
import hardpass from "../../src/hardpass";

const isStrong = (t: ExecutionContext, password: string, expected: boolean) => {
  t.is(hardpass(password), expected)
}

test("short password", isStrong, 'i"PSTg,98', false)
test("long password", isStrong, 'hsqwydgM4CR5c1XjzuZzTDQf&#K$=U417DC?q2?8E3AG+rq#3=9q."-H$932x"54hsqwydgM4CR5c1XjzuZzTDQf&#K$=U417DC?q2?8E3AG+rq#3=9q."-H$932x"54c', false)
test("password length lower bound", isStrong, "Cm;cF*1f5L", true)
test("password length upper bound", isStrong, "w?4P9M&25z6TE9ss:1g57e;.&_pDd,@UYmu:4CSfX;U5@jKz3563geLdpCZ9-Mu.w?4P9M&25z6TE9ss:1g57e;.&_pDd,@UYmu:4CSfX;U5@jKz3563geLd`CZ9-Muc", true)
test("no upper case, no lower case", isStrong, "^#=383=11?", false)
test("no upper case, no digits", isStrong, '_q/q"i?qe', false)
test("no upper case, no specials", isStrong, "12cx489fwi", false);
test("no lower case, no digits", isStrong, '"&PUTNF&-_', false);
test("no lower case, no specials", isStrong, "12B483GWRC", false);
test("no digits, no specials", isStrong, "SWgsXLejJu", false);
test("repeated identical chars", isStrong, "`$T3$6M5vGmj999.Jr", false);
test("allow space left pad", isStrong, " ZHsyu6uK7", true);
test("allow space right pad", isStrong, "ZHsyu6uK7 ", true);
