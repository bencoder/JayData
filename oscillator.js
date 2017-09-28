let oscCount = 0;

function Oscillator(audioContext, position) {

  this.node = audioContext.createOscillator();
  this.node.start();
  this.name = 'osc ' + (++oscCount);
  this.position = position;

  this.properties = [
    {
      name: 'name',
      type: 'input',
      location: 'this',
    },
    {
      name: 'frequency',
      type: 'input',
      location: 'audioParam'
    },
    {
      name: 'detune',
      type: 'input',
      location: 'audioParam'
    },
    {
      name: 'type',
      type: 'selection',
      values: ['sine', 'square', 'sawtooth', 'triangle']
    }
  ];



  this.audioConnections = [];
  this.audioParamConnections = [];
}

Oscillator.prototype = Object.create(JayDataNode);