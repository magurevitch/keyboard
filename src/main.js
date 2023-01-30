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

function getScaleIndices() {
  return intervals.reduce((acc, x, i) => x.in_scale ? [...acc, i] : acc, []);
}

function makeScale() {
  let indices = getScaleIndices();
  return [-1, ...indices, ...indices.slice(0, indices.length-1).reverse(), -1];
}

function makeSequence(scale) {
  return new Tone.Sequence(function(time, index){
      draw();
      highlightNote(index);
      let baseNote = parseFloat($('#base').val());
      synth.triggerAttackRelease(centsToPitch(baseNote, intervals[index]?.cents_above_base || 0), "4n", time);
  }, scale, "4n");
};

function fractionToCents(a, b) {
  return 1200 * Math.log2(b ? a/b : a);
}

function centsToPitch(baseNote, cents_above_base) {
  return baseNote * Math.pow(2, cents_above_base / 1200);
}

function scaleToCanvas(canvas, x) {
  return linearMapping(x,0,1200,canvas.width/8,7*canvas.width/8);
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
  let scale = makeScale();
  sequence = makeSequence(scale);
  Tone.start();
  sequence.start(0);
  Tone.Transport.start("+0.1");
}

$(document).ready(function() {
  draw();
  $('#temperment').mousedown(function(event) {
    var canvas = $('#temperment').get(0);
    var scaleFromCanvas = x => linearMapping(x,canvas.width/8,7*canvas.width/8,0,1200);
    var closest = indexOfSmallest(intervals.map(x => Math.abs(event.offsetX - scaleToCanvas(canvas,x.cents_above_base))));
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
      var canvas = $('#temperment').get(0);
      var scaleFromCanvas = x => linearMapping(x,canvas.width/8,7*canvas.width/8,0,1200);
      intervals[selected].cents_above_base = scaleFromCanvas(event.offsetX);
      draw();
    }
  }).mouseup(function(event) {
    if (selected !== false) {
      let snap = parseFloat($('#snap').val());
      snapToNearest(intervals[selected], snap);
      intervals.sort((a,b) => a.cents_above_base - b.cents_above_base);
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
      var closest = indexOfSmallest(intervals.map(x => Math.abs(cents - x.cents_above_base)));
      var position = cents < intervals[closest[0]].cents_above_base ? closest[0] : closest[0] + 1;
      intervals.splice(position, 0, {cents_above_base: cents, in_scale: false});
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
