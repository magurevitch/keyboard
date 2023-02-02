var synth = new Tone.Synth().toDestination();
Tone.Transport.scheduleRepeat((time) => drawOscillator(synth.oscillator, time, frequency), 1/60);
Tone.Transport.start(0);

let frequency = 1;

function makeSequence(scale) {
  return new Tone.Sequence(function(time, index) {
    playNote(index, time, true);
  }, scale, "4n");
};

function playNote(index, time, noRedraw) {
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
          <input type="number" id="${name}" min=0 max=1 step=0.1 value=${synth.envelope[name]}>
          ${hasCurve ? `<select id="${name}-curve">
            <option value="linear">linear</option>
            <option value="exponential">exponential</option>
          </select>` : ""}
        </div>`);
  $(`#${name}`).change(() => {
    let val = parseFloat($(`#${name}`).val());
    synth.envelope[name] = val;
    drawEnvelope(synth.envelope);
    playNote(-1);
  });
  if (hasCurve) {
    synth.envelope[`${name}Curve`] = "linear";
    $(`#${name}-curve`).change(() => {
      let val = $(`#${name}-curve`).val();
      synth.envelope[`${name}Curve`] = val;
      drawEnvelope(synth.envelope);
      playNote(-1);
    });
  }
}

const HARMONICS = {
  1: "Fundamental",
  2: "Octave",
  3: "Perfect 5th",
  4: "Octave",
  5: "Major 3rd",
  6: "Perfect 5th",
  7: "Harmonic 7th",
  8: "Octave",
  9: "Major 2nd",
  10: "Major 3rd",
  11: "Tritone",
  12: "Perfect 5th",
  13: "Neutral 6th",
  14: "Harmonic 7th",
  15: "Major 7th",
  16: "Octave"
};

$(document).ready(function() {
  makeKnob('attack', true);
  makeKnob('decay', true);
  makeKnob('sustain');
  makeKnob('release', true);
  drawEnvelope(synth.envelope);
  drawOscillator(synth.oscillator, 0, frequency);
  $('#oscillator-type').change(() => {
    let val = $('#oscillator-type').val();
    if (val === 'partials') {
      synth.oscillator.partials = new Array(16).fill(1);
      range(1,17).forEach((item) => {
        $('#partials').append(`<div class="flex-child">${item} (${HARMONICS[item]}) <input type="number" id="harmonic-${item}" min=-1 max=1 step=0.1 value=1></div>`);
        $(`#harmonic-${item}`).change(() => {
          let val = parseFloat($(`#harmonic-${item}`).val());
          let newPartials = [...synth.oscillator.partials];
          newPartials.splice(item-1, 1, val);
          synth.oscillator.partials = newPartials;
          playNote(-1);
        });
      });

    } else {
      $('#partials').empty();
      synth.oscillator.type = val;
    }
    playNote(-1);
  });
});
