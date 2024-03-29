function fsum(funcs) {
  return (x) => funcs.map(f => f(x)).reduce((a,b)=>a+b, 0);
}

function fractionToCents(a, b) {
  return 1200 * Math.log2(b ? a/b : a);
}

function modulo(n, d) {
  return ((n % d) + d) % d;
}

function normalizeToBase(num, base) {
  let log = Math.log(num) / Math.log(base);
  return [Math.pow(base, modulo(log,1)), Math.floor(log)];
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

function interleave (arr, arr2) {
    if (!arr.length) return arr2.slice();
    let newArr = [];
    for (let i = 0; i < arr.length; i++) {
        newArr.push(arr[i], arr2[i]);
    }
    return newArr;
};

function extractNum(id) {
  return parseInt(id.split('-').pop());
}

function objEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }
  return true;
}
