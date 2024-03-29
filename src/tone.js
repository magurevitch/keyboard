var synth = new Tone.PolySynth().toDestination();
let frequency = 1;

function makeSequence(scale) {
  return new Tone.Sequence(function(time, index) {
    playNote(index, time, true);
  }, scale, "4n");
};

function startSequence() {
  let scale = makeScale();
  sequence = makeSequence(scale);
  Tone.start();
  sequence.start(0);
  Tone.Transport.start("+0.1");
}

function playNote(index, time, noRedraw) {
  Tone.Transport.start(time);
  draw();
  highlightNote(index);
  let ratio = centsToFraction(intervals[index]?.cents_above_base || 0);
  frequency = ratio;
  let baseNote = parseFloat($('#base').val());
  synth.triggerAttackRelease(baseNote * ratio, "4n", time);
  if(!noRedraw) {
    Tone.Transport.schedule(function(time) {
      draw();
    }, Tone.Transport.seconds + 1.5);
  }
}

function makeKnob(name, hasCurve) {
  $('#envelope').append(`<div>
          ${name}
          <input type="number" id="${name}" min=0 max=1 step=0.1 value=${synth.get().envelope[name]}>
          ${hasCurve ? `<select id="${name}-curve">
            <option value="linear">linear</option>
            <option value="exponential">exponential</option>
          </select>` : ""}
        </div>`);
  $(`#${name}`).change(() => {
    let val = parseFloat($(`#${name}`).val());
    synth.set({ envelope: {[name]: val}});
    drawEnvelope(synth.get().envelope);
    playNote(-1);
  });
  if (hasCurve) {
    synth.set({envelope: {[`${name}Curve`] : "linear"}});
    $(`#${name}-curve`).change(() => {
      let val = $(`#${name}-curve`).val();
      synth.set({envelope: {[`${name}Curve`] : val}});
      drawEnvelope(synth.get().envelope);
      playNote(-1);
    });
  }
}

const HARMONIC_CLASSES = [
  ["Octave"],
  ["Perfect 5th"],
  ["Major 3rd", "Harmonic 7th"],
  ["Major 2nd", "Diminished Tritone", "Neutral 6th", "Major 7th"],
  ["Minor 2nd", "Minor 3rd", "Narrow 4th", "Augmented Tritone", "Augmented 5th", "Minor 6th", "Minor 7th", "Augmented 7th"]
];

function newHarmonics(rowIndex) {
  let fullIndex = (i) => 2**rowIndex+1+(2*i);
  let harmonicName = (i) => HARMONIC_CLASSES[rowIndex] ? HARMONIC_CLASSES[rowIndex][i] : `Harmonic ${fullIndex(i)}`;
  return range(2**(rowIndex-1)).map(i => `${harmonicName(i)} (${fullIndex(i)}:${2**rowIndex})`);
}

function harmonicsRows(rows) {
  synth.set({oscillator: {partials: new Array(Math.pow(2,rows)-1).fill(1)}});
  const headers = range(rows).reduce((a,b) => interleave(a, newHarmonics(b)), []);
  $('#partials').append(`<tr>${headers.map((h,i) => `<th>${h} <input type="number" id="harmonic-class-${i}" min=-1 max=1 step=0.1 value=1></th>`)}</tr>`);
  range(rows).forEach(rowNum => {
    let indices = range(Math.pow(2,rowNum), Math.pow(2,rowNum+1));
    let spacer = Math.pow(2,rows-(rowNum+1));
    let row = `${`<tr>${indices.map((i,j) => `<td colspan="${spacer}">${i} <input type="number" id="harmonic-${i}" min=-1 max=1 step=0.1 value=1 class="harmonic-class-${j*spacer} ${i % 2 === 0 ? 'even' : 'odd' }-harmonic"></td>`)}</tr>`}`;
    $('#partials').append(row);
    indices.forEach(i => $(`#harmonic-${i}`).change(() => {
      let val = parseFloat($(`#harmonic-${i}`).val());
      let newPartials = [...synth.get().oscillator.partials];
      newPartials.splice(i-1, 1, val);
      synth.set({oscillator: {partials: newPartials}});
      playNote(-1);
    }));
  });
  range(Math.pow(2,rows)).forEach(i => $(`#harmonic-class-${i}`).change(() => {
    let val = parseFloat($(`#harmonic-class-${i}`).val());
    $(`.harmonic-class-${i}`).val(val).trigger('change');
  }));
}

$(document).ready(function() {
  drawOscillator(synth.get().oscillator, 0, frequency);
  Tone.Transport.scheduleRepeat((time) => drawOscillator(synth.get().oscillator, time, frequency), 1/60);
  makeKnob('attack', true);
  makeKnob('decay', true);
  makeKnob('sustain');
  makeKnob('release', true);
  drawEnvelope(synth.get().envelope);
  $('#oscillator-type').change(() => {
    let val = $('#oscillator-type').val();
    if (val === 'partials') {
      harmonicsRows(4);
      $('#harmonics').show()
    } else {
      $('#partials').empty();
      $('#harmonics').hide();
      synth.set({oscillator: {type: val}});
    }
    playNote(-1);
  });
  $('#harmonics-periods').change(() => {
    let val = parseInt($('#harmonics-periods').val());
    $('#partials').empty();
    harmonicsRows(val);
    $(`#odd-harmonics`).val(1);
    $(`#even-harmonics`).val(1);
  });
  $(`#odd-harmonics`).change(() => {
    let f = new Function('n', `return ${$('#odd-harmonics').val()}`);
    $('.odd-harmonic').map(function(index,dom) {
      try {
        $(dom).val(f(extractNum(dom.id))).trigger('change');
      } catch (e) {
        console.log(e);
      }
    });
  });
  $(`#even-harmonics`).change(() => {
    let f = new Function('n', `return ${$('#even-harmonics').val()}`);
    $('.even-harmonic').map(function(index,dom) {
      try{
        $(dom).val(f(extractNum(dom.id))).trigger('change');
      } catch (e) {
        console.log(e);
      }
    });
  });
});
