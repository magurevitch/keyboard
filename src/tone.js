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

$(document).ready(function() {
  makeKnob('attack', true);
  makeKnob('decay', true);
  makeKnob('sustain');
  makeKnob('release', true);
  drawEnvelope(synth.envelope);
  drawOscillator(synth.oscillator, 0);
  $('#oscillator-type').change(() => {
    let val = $('#oscillator-type').val();
    synth.oscillator.type = val;
    drawOscillator(synth.oscillator);
    playNote(-1);
  });
});
