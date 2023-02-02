var synth = new Tone.Synth().toDestination();
Tone.Transport.scheduleRepeat((time) => drawOscillator(synth.oscillator, time), 1);
Tone.Transport.start(0);

function makeSequence(scale) {
  return new Tone.Sequence(function(time, index) {
      draw();
      highlightNote(index);
      let baseNote = parseFloat($('#base').val());
      synth.triggerAttackRelease(centsToPitch(baseNote, intervals[index]?.cents_above_base || 0), "4n", time);
  }, scale, "4n");
};

function playNote(index) {
  draw();
  highlightNote(index);
  let baseNote = parseFloat($('#base').val());
  synth.triggerAttackRelease(centsToPitch(baseNote, intervals[index]?.cents_above_base || 0), "4n");
  Tone.Transport.schedule(function(time){
	  draw();
  }, Tone.Transport.seconds + 1.5);
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
  2: "Perfect 5th",
  3: "Major 2nd",
  4: "Major 6th",
  5: "Major 3rd",
  6: "Major 7th",
  7: "Tritone",
  8: "Minor 2nd",
  9: "Minor 6th",
  10: "Minor 3rd",
  11: "Minor 7th",
  12: "Perfect 4th",
  13: "Pythagorean Comma"
};

$(document).ready(function() {
  makeKnob('attack', true);
  makeKnob('decay', true);
  makeKnob('sustain');
  makeKnob('release', true);
  drawEnvelope(synth.envelope);
  drawOscillator(synth.oscillator, 0);
  $('#oscillator-type').change(() => {
    let val = $('#oscillator-type').val();
    if (val === 'partials') {
      synth.oscillator.partials = [1,0,1,0,1,0,1,0,1,0,1,0,1];
      range(1,14).forEach((item) => {
        $('#partials').append(`<div class="flex-child">${item} (${HARMONICS[item]}) <input type="number" id="harmonic-${item}" min=-1 max=1 step=0.1 value="${item%2}"></div>`);
        $(`#harmonic-${item}`).change(() => {
          let val = parseFloat($(`#harmonic-${item}`).val());
          let newPartials = [...synth.oscillator.partials];
          newPartials.splice(item-1, 1, val);
          synth.oscillator.partials = newPartials;
          drawOscillator(synth.oscillator);
          playNote(-1);
        });
      });

    } else {
      $('#partials').empty();
      synth.oscillator.type = val;
    }
    drawOscillator(synth.oscillator);
    playNote(-1);
  });
});
