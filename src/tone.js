var synth = new Tone.FMSynth({
  oscillator: {
    type: 'square',
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
}).toDestination();

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
