var sequence = null;
var playing = false;
let pythagoreanPhrygian = [...makePythagoreanScale(3, 7), 2].map(ratio => fractionToCents(ratio));
var intervals = makeTet(12).map(x => {
  return {cents_above_base: x, in_scale: !!nearestGuide(x, pythagoreanPhrygian, 12)};
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

function scaleToTemperment(x) {
  let canvas = $('#temperment').get(0);
  return linearMapping(x,0,1200,canvas.width/8,7*canvas.width/8);
}

function makeTet(number) {
  return range(1,number+1).map(x => x * 1200/number);
}

function makePythagoreanScale(ratio, steps) {
  let notes = range(1,steps).map(i => normalizeToBase(Math.pow(ratio, i), 2)[0]);
  notes.sort();
  return notes;
}

function normalizeGuideline(item) {
  return item.type === 'hz' ? fractionToCents(item.number, baseNote) : item.type === 'ratio' ? fractionToCents(item.number) : item.number;
}

function nearestGuide(value, guides, distance) {
  var closest = indexOfSmallest(guides.map(x => Math.abs(value - x)));
  if(closest[1] < distance) {
    return guides[closest[0]];
  }
  return null;
}

function snapToNearest(note) {
  let type = $('#snap-type').val();
  let snap = parseFloat($('#snap').val());
  let closest;
  if (type === 'cents') {
    let closeMultiple = note.cents_above_base - (note.cents_above_base % snap);
    closest = nearestGuide(note.cents_above_base , [closeMultiple, closeMultiple + snap], snap);
  } else {
    closest = nearestGuide(note.cents_above_base , guidelines.map(item => normalizeGuideline(item)), snap);
  }
  note.cents_above_base = closest || note.cents_above_base;
}

function makeMode(scaleDegree) {
  if(scaleDegree < 0) return intervals;
  if(!objEqual(intervals[intervals.length-1], {cents_above_base: 1200, in_scale: true})) return intervals;

  const tempermentDegree = getScaleIndices()[scaleDegree];
  const centShift = intervals[tempermentDegree].cents_above_base;
  let after = intervals.slice(tempermentDegree+1).map(x =>  {return { cents_above_base: x.cents_above_base - centShift, in_scale: x.in_scale }});
  let before = intervals.slice(0,tempermentDegree).map(x => { return { cents_above_base: x.cents_above_base - centShift + 1200, in_scale: x.in_scale }});
  return [...after, ...before, {cents_above_base: 1200, in_scale: true}];
}

$(document).ready(function() {
  draw();
  $('#temperment').mousedown(function(event) {
    var canvas = $('#temperment').get(0);
    var scaleFromCanvas = x => linearMapping(x,canvas.width/8,7*canvas.width/8,0,1200);
    var closest = indexOfSmallest(intervals.map(x => Math.abs(event.offsetX - scaleToTemperment(x.cents_above_base))));
    if(closest[1] < 15) {
      if(20 < event.offsetY && event.offsetY < 50) {
        intervals[closest[0]].in_scale = !intervals[closest[0]].in_scale;
        playNote(closest[0]);
      } else {
        selected = closest[0];
        playNote(selected);
      }
    } else {
      var cents = scaleFromCanvas(event.offsetX);
      var position = cents < intervals[closest[0]]?.cents_above_base ? closest[0] : closest[0] + 1;
      intervals.splice(position, 0, {cents_above_base: cents, in_scale: false});
      playNote(position);
    }
    draw();
  }).mousemove(function(event) {
    if(selected !== false) {
      var canvas = $('#temperment').get(0);
      var scaleFromCanvas = x => linearMapping(x,canvas.width/8,7*canvas.width/8,0,1200);
      intervals[selected].cents_above_base = scaleFromCanvas(event.offsetX);
      playNote(selected);
      draw();
    }
  }).mouseup(function(event) {
    if (selected !== false) {
      snapToNearest(intervals[selected]);
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
  $('#guideline-type').change((e) => {
    let type =  $('#guideline-type').val();
    if (type === 'ratio') {
      $('#guideline-denom').show();
    } else {
      $('#guideline-denom').hide();
    }
  })
  $('#add-guideline').click(function(event) {
    let type =  $('#guideline-type').val();
    let number = parseFloat($('#guideline').val());
    if(type === 'ratio') {
      number = number / parseFloat($('#guideline-denom').val());
    }
    if($('#add-object').val() === 'note') {
      let baseNote = parseFloat($('#base').val());
      let cents = type === 'hz' ? fractionToCents(number, baseNote) : type === 'ratio' ? fractionToCents(number) : number;
      var closest = indexOfSmallest(intervals.map(x => Math.abs(cents - x.cents_above_base)));
      var position = cents < intervals[closest[0]]?.cents_above_base ? closest[0] : closest[0] + 1;
      intervals.splice(position, 0, {cents_above_base: cents, in_scale: false});
    } else {
      let guideline = {number: number, type: type};
      let snap = parseFloat($('#snap').val());
      intervals.forEach((item) => item.in_scale = item.in_scale || !!nearestGuide(item.cents_above_base , [normalizeGuideline(guideline)], snap));
      guidelines.push(guideline);
    }
    draw();
  });
  $('#snap-all').click(function(event) {
    intervals.forEach(note => {
      snapToNearest(note);
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
    let snap = parseFloat($('#snap').val());
    let scaleNotes = intervals.filter(x => x.in_scale).map(x => x.cents_above_base);
    intervals = makeTet(tet).map(x => {
      return {cents_above_base: x, in_scale: !!nearestGuide(x, scaleNotes, snap)};
    });
    draw();
  });
  $('#base').change(function(event) {
    draw();
  });
  $('#keyboard').click(function(event) {
    let canvas = $('#keyboard').get(0);
    let scaleDegree = linearMapping(event.offsetX, 0, canvas.width, -1, intervals.filter(x=> x.in_scale).length);
    let scaleIndices = getScaleIndices();
    if(event.offsetY < canvas.height / 2) {
      let noteBelow = Math.floor(scaleDegree-0.5);
      if(noteBelow < -1) {
        playNote(-1);
      } else {
        let indexBelow = scaleIndices[noteBelow] === undefined ? -1 : scaleIndices[noteBelow];
        let indexAbove = scaleIndices[noteBelow+1] === undefined ? intervals.length : scaleIndices[noteBelow+1];
        let intervalSize = indexAbove-indexBelow;
        let intervalDegree = intervalSize === 1 ?
          scaleIndices[Math.floor(scaleDegree)] :
          Math.floor(linearMapping(scaleDegree-0.5,noteBelow+1/(2*intervalSize),noteBelow+1-1/(2*intervalSize), indexBelow+1, indexAbove));
        playNote(intervalDegree);
      }
    } else {
      playNote(scaleIndices[Math.floor(scaleDegree)] === undefined ? -1 : scaleIndices[Math.floor(scaleDegree)]);
    }
  });
});
