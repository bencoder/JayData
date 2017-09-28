let filterCount = 0;

function Filter(audioContext, position) {

  this.node = audioContext.createBiquadFilter();
  this.name = 'filter ' + (++filterCount);
  this.position = position;

  this.properties = [
    {
      name: 'name',
      type: 'input',
      location: 'this',
    },
    {
      name: 'frequency',
      type: 'range',
      min: 100,
      max: 800,
      location: 'audioParam'
    },
    {
      name: 'Q',
      type: 'input',
      location: 'audioParam'
    },
    {
      name: 'type',
      type: 'selection',
      values: ['lowpass', 'highpass', 'bandpass', 'lowshelf', 'highshelf', 'peaking', 'notch', 'allpass']
    }
  ];

  this.audioConnections = [];

}

Filter.prototype = Object.create(JayDataNode);