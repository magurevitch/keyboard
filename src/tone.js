var synth = new Tone.Synth().toDestination();

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
}

$(document).ready(function() {
  $('#attack').change(() => {
    let val = parseFloat($('#attack').val());
    console.log(synth, synth.envelope)
    synth.envelope.attack = val;
    drawEnvelope(synth.envelope);
    playNote(-1);
  });
  $('#decay').change(() => {
    let val = parseFloat($('#decay').val());
    synth.envelope.decay = val;
    drawEnvelope(synth.envelope);
    playNote(-1);
  });
  $('#sustain').change(() => {
    let val = parseFloat($('#sustain').val());
    synth.envelope.sustain = val;
    drawEnvelope(synth.envelope);
    playNote(-1);
  });
  $('#release').change(() => {
    let val = parseFloat($('#release').val());
    synth.envelope.release = val;
    drawEnvelope(synth.envelope);
    playNote(-1);
  });
});
