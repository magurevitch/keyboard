function highlightNote(index) {
  var tCanvas = $('#temperment').get(0);
  var tCtx = tCanvas.getContext("2d");
  tCtx.fillStyle = "#FF0000";
  tCtx.fillRect(scaleToCanvas(tCanvas, intervals[index]?.cents_above_base || 0)-10, 25, 20, 20);

  var kCanvas = $('#keyboard').get(0);
  var kCtx = kCanvas.getContext("2d");
  kCtx.fillStyle = "#FF0000";
  let scaleIndices = getScaleIndices();
  let size = kCanvas.width / (scaleIndices.length+1);
  if (index < 0) {
    kCtx.fillRect(0, kCanvas.height/2, size, kCanvas.height/2);
  } else if (intervals[index].in_scale) {
    let start = (scaleIndices.findIndex(x => x === index)+1) * size;
    kCtx.fillRect(start, kCanvas.height/2, size, kCanvas.height/2);
  } else {
    //if not in scale
  }
}

function showCents() {
  var canvas = $('#temperment').get(0);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0000FF";
  var prev = 0;
  let cents = intervals.filter(x => x.in_scale).map(x => x.cents_above_base);

  for(var c of cents) {
    ctx.fillRect(scaleToCanvas(canvas,prev)+1, 104, 2, 10);
    ctx.fillRect(scaleToCanvas(canvas,prev)+3, 106, scaleToCanvas(canvas, c)-scaleToCanvas(canvas,prev)-5, 2);
    ctx.fillRect(scaleToCanvas(canvas,c)-3, 104, 2, 10);
    ctx.fillText((c - prev).toFixed(2), scaleToCanvas(canvas,prev)+5, 116);
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
    ctx.fillRect(scaleToCanvas(canvas,cents)-1, 0, 2, 105);
    ctx.fillText(item.number.toFixed(2) + ' ' + item.type, scaleToCanvas(canvas,cents)-5, 115);
  });
}

function highlightSelected() {
  if(selected !== false) {
    var canvas = $('#temperment').get(0);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFF00";
    ctx.fillRect(scaleToCanvas(canvas,intervals[selected].cents_above_base)-4, 0, 8, 110);
    ctx.fillRect(scaleToCanvas(canvas,intervals[selected].cents_above_base)-20, 15, 40, 40);
  }
}

function showFundamentalNote() {
  var canvas = $('#temperment').get(0);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(scaleToCanvas(canvas,0)-2, 0, 4, 150);
  ctx.fillRect(scaleToCanvas(canvas,0)-15, 20, 30, 30);
}

function showNote(item) {
  var canvas = $('#temperment').get(0);
  var ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(scaleToCanvas(canvas,item.cents_above_base)-2, 10, 4, 90);
  ctx.fillRect(scaleToCanvas(canvas,item.cents_above_base)-15, 20, 30, 30);
  ctx.clearRect(scaleToCanvas(canvas,item.cents_above_base)-10, 25, 20, 20);
  if(item.in_scale) {
    ctx.fillStyle = "#0000FF";
    ctx.beginPath();
    ctx.arc(scaleToCanvas(canvas,item.cents_above_base), 35, 12, 0,2*Math.PI);
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
    let accidentals = (scaleIndices[i] || intervals.length) - item;
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
