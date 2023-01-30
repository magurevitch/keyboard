var synth = new Tone.Synth({
  oscillator: {
    type: 'sawtooth4',
    partials: [1, 0.5, 0.25, 0.125, 0.0625]
  },
  envelope: {
    attack : 0.01 ,
    decay : 0.03,
    sustain : 0.2 ,
    release : 0 ,
    attackCurve : 'linear' ,
    decayCurve : 'linear' ,
    releaseCurve : 'exponential'
  }
}).toMaster();
var sequence = null;
var playing = false;
var intervals = makeTet(12).map(x => {
  return {cents_above_base: x, in_scale: false};
});
var selected = false;
var guidelines = [{number: 2, type: 'ratio'}];

function makeScale() {
  return intervals.filter(x => x.in_scale).map(x => x.cents_above_base);
}

function makeSequence(sequence) {
  return new Tone.Sequence(function(time, note){
      draw();
      var canvas = $('canvas').get(0);
      var ctx = canvas.getContext("2d");
      var scaleToCanvas = x => linearMapping(x,0,1200,canvas.width/8,7*canvas.width/8);
      ctx.fillStyle = "#FF0000";
      ctx.fillRect(scaleToCanvas(note)-10, 25, 20, 20);
      let baseNote = parseFloat($('#base').val());
      synth.triggerAttackRelease(centsToPitch(baseNote, note), "4n", time);
  }, sequence, "4n");
};

function fractionToCents(a, b) {
  return 1200 * Math.log2(b ? a/b : a);
}

function centsToPitch(baseNote, cents_above_base) {
  return baseNote * Math.pow(2, cents_above_base / 1200);
}

function showCents() {
  var canvas = $('canvas').get(0);
  var ctx = canvas.getContext("2d");
  var scaleToCanvas = x => linearMapping(x,0,1200,canvas.width/8,7*canvas.width/8);
  ctx.fillStyle = "#0000FF";
  var prev = 0;
  var cents = [];
  for(var interval of intervals) {
    if(interval.in_scale) {
      ctx.fillRect(scaleToCanvas(prev)+1, 104, 2, 10);
      ctx.fillRect(scaleToCanvas(prev)+3, 106, scaleToCanvas(interval.cents_above_base)-scaleToCanvas(prev)-5, 2);
      ctx.fillRect(scaleToCanvas(interval.cents_above_base)-3, 104, 2, 10);
      ctx.fillText((interval.cents_above_base - prev).toFixed(2), scaleToCanvas(prev)+5, 116);
      prev = interval.cents_above_base;
    }
  }
  return cents;
}

function showGuidelines() {
  var canvas = $('canvas').get(0);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FF00FF";
  let baseNote = parseFloat($('#base').val());
  var scaleToCanvas = x => linearMapping(x,0,1200,canvas.width/8,7*canvas.width/8);
  guidelines.forEach(item => {
    var cents = item.type === 'hz' ? fractionToCents(item.number, baseNote) : item.type === 'ratio' ? fractionToCents(item.number) : item.number;
    ctx.fillRect(scaleToCanvas(cents)-1, 0, 2, 105);
    ctx.fillText(item.number.toFixed(2) + ' ' + item.type, scaleToCanvas(cents)-5, 115);
  });
}

function draw() {
  var canvas = $('canvas').get(0);
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);
  var scaleToCanvas = x => linearMapping(x,0,1200,canvas.width/8,7*canvas.width/8);
  ctx.fillStyle = "#FFFF00";
  if(selected !== false) {
    ctx.fillRect(scaleToCanvas(intervals[selected].cents_above_base)-4, 0, 8, 110);
    ctx.fillRect(scaleToCanvas(intervals[selected].cents_above_base)-20, 15, 40, 40);
  }
  showGuidelines();
  ctx.fillStyle = "#000000";
  ctx.fillRect(scaleToCanvas(0)-2, 0, 4, 150);
  ctx.fillRect(scaleToCanvas(0)-15, 20, 30, 30);
  intervals.forEach((item, i) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(scaleToCanvas(item.cents_above_base)-2, 10, 4, 90);
    ctx.fillRect(scaleToCanvas(item.cents_above_base)-15, 20, 30, 30);
    ctx.clearRect(scaleToCanvas(item.cents_above_base)-10, 25, 20, 20);
    if(item.in_scale) {
      ctx.fillStyle = "#0000FF";
      ctx.beginPath();
      ctx.arc(scaleToCanvas(item.cents_above_base), 35, 12, 0,2*Math.PI);
      ctx.fill();
    }
  });
  showCents();
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

function makeTet(number) {
  return range(1,number+1).map(x => x * 1200/number);
}

function makePythagorean(ratio, comma) {
  return [];
}

function indexOfSmallest(a) {
 var lowest = 0;
 for (var i = 1; i < a.length; i++) {
  if (a[i] < a[lowest]) lowest = i;
 }
 return [lowest, a[lowest]];
}

function snapNote(note, guides, distance) {
  var closest = indexOfSmallest(guides.map(x => Math.abs(note.cents_above_base - x)));
  if(closest[1] < distance) {
    note.cents_above_base = guides[closest[0]];
  }
}

function snapToNearest(note, snap) {
  let closeMultiple = note.cents_above_base - (note.cents_above_base % snap);
  snapNote(note, [closeMultiple, closeMultiple + snap], snap);
}

function startSequence() {
  var s = makeScale(intervals);
  var scale = [0].concat(s).concat(s.slice(0,s.length-1).reverse());
  sequence = makeSequence(scale);
  Tone.start();
  sequence.start(0);
  Tone.Transport.start("+0.1");
}

$(document).ready(function() {
  draw();
  $('canvas').mousedown(function(event) {
    var canvas = $('canvas').get(0);
    var ctx = canvas.getContext("2d");
    var scaleToCanvas = x => linearMapping(x,0,1200,canvas.width/8,7*canvas.width/8);
    var scaleFromCanvas = x => linearMapping(x,canvas.width/8,7*canvas.width/8,0,1200);
    var closest = indexOfSmallest(intervals.map(x => Math.abs(event.offsetX - scaleToCanvas(x.cents_above_base))));
    if(closest[1] < 15) {
      if(20 < event.offsetY && event.offsetY < 50) {
        intervals[closest[0]].in_scale = !intervals[closest[0]].in_scale;
      } else {
        selected = closest[0];
      }
    } else {
      var cents = scaleFromCanvas(event.offsetX);
      var position = cents < intervals[closest[0]].cents_above_base ? closest[0] : closest[0] + 1;
      intervals.splice(position, 0, {cents_above_base: cents, in_scale: false});
    }
    draw();
  }).mousemove(function(event) {
    if(selected !== false) {
      var canvas = $('canvas').get(0);
      var scaleFromCanvas = x => linearMapping(x,canvas.width/8,7*canvas.width/8,0,1200);
      intervals[selected].cents_above_base = scaleFromCanvas(event.offsetX);
      draw();
    }
  }).mouseup(function(event) {
    if (selected !== false) {
      let snap = parseFloat($('#snap').val());
      snapToNearest(intervals[selected], snap);
      selected = false;
    }
    if(playing) {
      sequence.stop(0);
      startSequence();
    }
    draw();
  }).mouseout(function(event) {
    if(selected !== false) {
      intervals.splice(selected, 1);
      selected = false;
      draw();
    }
  });
  $('#play').click(function(event) {
    if (playing) {
      $('#play').text("Play Scale");
      sequence.stop(0);
      playing = false;
      draw();
    } else {
      $('#play').text("Stop Scale");
      startSequence();
      playing=true;
    }
  });
  $('#add-guideline').click(function(event) {
    let type =  $('#guideline-type').val();
    let number = parseFloat($('#guideline').val());
    if($('#add-object').val() === 'note') {
      let baseNote = parseFloat($('#base').val());
      let cents = type === 'hz' ? fractionToCents(number, baseNote) : type === 'ratio' ? fractionToCents(number) : number;
      intervals.push({cents_above_base:  cents, in_scale: false});
      intervals.sort();
    } else {
      guidelines.push({number: number, type: type});
    }
    draw();
  });
  $('#snap-all').click(function(event) {
    intervals.forEach(note => {
      let snap = parseFloat($('#snap').val());
      snapToNearest(note, snap);
    });
    if(playing) {
      sequence.stop(0);
      startSequence();
    }
    draw();
  });
  $('#make-tet').click(function(event) {
    let tet = parseFloat($('#tet').val());
    if(playing) {
      $('#play').text("Play Scale");
      sequence.stop(0);
      playing = false;
    }
    intervals = makeTet(tet).map(x => {
      return {cents_above_base: x, in_scale: false};
    });
    draw();
  });
  $('#base').change(function(event) {
    draw();
  });
});
