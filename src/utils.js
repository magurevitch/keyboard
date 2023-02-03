function fsum(funcs) {
  return (x) => funcs.map(f => f(x)).reduce((a,b)=>a+b, 0);
}

function fractionToCents(a, b) {
  return 1200 * Math.log2(b ? a/b : a);
}

function centsToFraction(cents_above_base) {
  return Math.pow(2, cents_above_base / 1200);
}

function linearMapping(x, a, b, c, d) {
  return (x-a)*(d-c)/(b-a) + c;
}

function range(start, finish) {
  if(!finish) {
    finish = start;
    start = 0;
  }
  var array = [];
  for(var i=start;i<finish; i++) {
    array.push(i);
  }
  return array;
}

function indexOfSmallest(a) {
 var lowest = 0;
 for (var i = 1; i < a.length; i++) {
  if (a[i] < a[lowest]) lowest = i;
 }
 return [lowest, a[lowest]];
}
