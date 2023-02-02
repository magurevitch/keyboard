function highlightNote(index) {
  var tCanvas = $('#temperment').get(0);
  var tCtx = tCanvas.getContext("2d");
  tCtx.fillStyle = "#FF0000";
  tCtx.fillRect(scaleToTemperment(intervals[index]?.cents_above_base || 0)-10, 25, 20, 20);

  var kCanvas = $('#keyboard').get(0);
  var kCtx = kCanvas.getContext("2d");
  kCtx.fillStyle = "#FF0000";
  let scaleIndices = getScaleIndices();
  let size = kCanvas.width / (scaleIndices.length+1);
  if (index < 0) {
    kCtx.fillRect(0, kCanvas.height/2, size, kCanvas.height/2);
  } else if (intervals[index]?.in_scale) {
    let start = (scaleIndices.findIndex(x => x === index)+1) * size;
    kCtx.fillRect(start, kCanvas.height/2, size, kCanvas.height/2);
  } else {
    let scaleIndex = scaleIndices.findIndex(x => x > index);
    if(scaleIndex === -1) {
      scaleIndex = scaleIndices.length;
    }
    let aboveIndex = scaleIndex === scaleIndices.length ? intervals.length : scaleIndices[scaleIndex];
    let numberAccidentals = aboveIndex - (scaleIndex === 0 ? -1 : scaleIndices[scaleIndex-1]);
    let accidentalsBelowAbove = aboveIndex - index;
    let accidentalSize = size / numberAccidentals;
    let baseStart = scaleIndex * size;
    kCtx.fillRect(baseStart + 3*size/2 - (accidentalsBelowAbove+0.5) * accidentalSize, 2, accidentalSize, kCanvas.height/2);
  }
}

function showCents() {
  var canvas = $('#temperment').get(0);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0000FF";
  var prev = 0;
  let cents = intervals.filter(x => x.in_scale).map(x => x.cents_above_base);

  for(var c of cents) {
    ctx.fillRect(scaleToTemperment(prev)+1, 104, 2, 10);
    ctx.fillRect(scaleToTemperment(prev)+3, 106, scaleToTemperment(c)-scaleToTemperment(prev)-5, 2);
    ctx.fillRect(scaleToTemperment(c)-3, 104, 2, 10);
    ctx.fillText((c - prev).toFixed(2), scaleToTemperment(prev)+5, 116);
    prev = c;
  }
}

function showGuidelines() {
  var canvas = $('#temperment').get(0);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FF00FF";
  let baseNote = parseFloat($('#base').val());
  guidelines.forEach(item => {
    var cents = item.type === 'hz' ? fractionToCents(item.number, baseNote) : item.type === 'ratio' ? fractionToCents(item.number) : item.number;
    ctx.fillRect(scaleToTemperment(cents)-1, 0, 2, 105);
    ctx.fillText(item.number.toFixed(2) + ' ' + item.type, scaleToTemperment(cents)-5, 115);
  });
}

function highlightSelected() {
  if(selected !== false) {
    var canvas = $('#temperment').get(0);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFF00";
    ctx.fillRect(scaleToTemperment(intervals[selected].cents_above_base)-4, 0, 8, 110);
    ctx.fillRect(scaleToTemperment(intervals[selected].cents_above_base)-20, 15, 40, 40);
  }
}

function showFundamentalNote() {
  var canvas = $('#temperment').get(0);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(scaleToTemperment(0)-2, 0, 4, 150);
  ctx.fillRect(scaleToTemperment(0)-15, 20, 30, 30);
}

function showNote(item) {
  var canvas = $('#temperment').get(0);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(scaleToTemperment(item.cents_above_base)-2, 10, 4, 90);
  ctx.fillRect(scaleToTemperment(item.cents_above_base)-15, 20, 30, 30);
  ctx.clearRect(scaleToTemperment(item.cents_above_base)-10, 25, 20, 20);
  if(item.in_scale) {
    ctx.fillStyle = "#0000FF";
    ctx.beginPath();
    ctx.arc(scaleToTemperment(item.cents_above_base), 35, 12, 0,2*Math.PI);
    ctx.fill();
  }
}

function showKeyboard() {
  var canvas = $('#keyboard').get(0);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#444444";
  ctx.fillRect(0,0,canvas.width, canvas.height);
  let scaleIndices = getScaleIndices();
  let size = canvas.width / (scaleIndices.length+1);
  range(scaleIndices.length+1).forEach((i) => {
    let start = i * size;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(start + 4, 2, size-8, canvas.height-4);
  });
  [-1, ...scaleIndices].forEach((item, i) => {
    ctx.fillStyle = "#000000";
    let accidentals = (scaleIndices[i] === undefined ? intervals.length : scaleIndices[i]) - item;
    let accidentalSize = size/accidentals;
    let start = (i + 1/2) * size + accidentalSize/2;
    range(accidentals-1).forEach((i) => {
      ctx.fillRect(start + (i*accidentalSize) + 2, 2, accidentalSize-4, canvas.height/2);
    });
  });
}

function draw() {
  var canvas = $('#temperment').get(0);
  var ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  canvas = $('#keyboard').get(0);
  ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  highlightSelected();
  showGuidelines();
  showFundamentalNote();
  intervals.forEach((item) => showNote(item));
  showCents();
  showKeyboard();
}

function drawEnvelope(envelope) {
  let canvas = $('#envelope-canvas').get(0);
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  let fit = (x) => linearMapping(x, 0, 3, 0, canvas.width);

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.moveTo(0, canvas.height);
  if(envelope.attackCurve === "linear") {
    ctx.lineTo(fit(envelope.attack), 0);
  } else {
    ctx.quadraticCurveTo(0,0,fit(envelope.attack), 0);
  }
  if(envelope.decayCurve === "linear") {
    ctx.lineTo(fit(envelope.attack+envelope.decay), (1-envelope.sustain)*canvas.height);
  } else {
    ctx.quadraticCurveTo(fit(envelope.attack),(1-envelope.sustain)*canvas.height,fit(envelope.attack+envelope.decay),(1-envelope.sustain)*canvas.height);
  }
  ctx.lineTo(fit(3-envelope.release), (1-envelope.sustain)*canvas.height);
  if(envelope.releaseCurve === "linear") {
    ctx.lineTo(canvas.width, canvas.height);
  } else {
    ctx.quadraticCurveTo(fit(3-envelope.release),canvas.height,canvas.width,canvas.height);
  }
  ctx.stroke();
}

const WAVE_FUNCTIONS = {
  'sine': (frequency, amplitude) => (x) => (amplitude/2 * Math.sin(x*2*Math.PI*frequency)),
  'square': (frequency, amplitude) => (x) => (x*frequency % 2) < 1 ? amplitude/2 : -amplitude/2,
  'triangle': (frequency, amplitude) => (x) =>  amplitude * Math.abs((2*x*frequency % 2) - 1) - amplitude/2,
  'sawtooth': (frequency, amplitude) => (x) => amplitude * (x*frequency % 1) - amplitude/2
};

function drawOscillator(oscillator, time, frequency) {
  let canvas = $('#oscillator').get(0);
  let ctx = canvas.getContext("2d");
  ctx.clearRect(0,0,canvas.width,canvas.height);

  let waveFunction = oscillator.partials.length === 0 ?
      WAVE_FUNCTIONS[oscillator.type](2/canvas.width,-canvas.height) :
      fsum(oscillator.partials.map((partial, index) => (x) => -canvas.height * partial * Math.sin(x*4*Math.PI*(index+1)/ canvas.width) / (2*oscillator.partials.reduce((a,b)=>a+Math.abs(b), 0))));

  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.moveTo(0, canvas.height/2);
  for (let i = 0; i<canvas.width; i++) {
    ctx.lineTo(i, canvas.height/2+waveFunction(((frequency || 1) * i)+time));
  }
  ctx.stroke();
}
