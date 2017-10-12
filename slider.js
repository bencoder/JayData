let sliderCount = 0;

function Slider(audioContext, position) {

  this.node = audioContext.createConstantSource();
  this.name = 'slider ' + (++sliderCount);
  this.position = position;
  this.max = 100;
  this.min = 0;
  this.step = 0.01

  this.properties = [
    {
      name: 'name',
      type: 'input',
      location: 'this',
    },
    {
      name: 'max',
      type: 'input',
      location: 'this'
    },
    {
      name: 'min',
      type: 'input',
      location: 'this'
    },
    {
      name: 'step',
      type: 'input',
      location: 'this'
    },
    {
      name: 'offset',
      type: 'range',
      max: this.max,
      min: this.min,
      step: this.step,
      location: 'audioParam'
    }
  ];


  this.audioConnections = [];
  this.audioParamConnections = [];
}

Slider.prototype = Object.create(JayDataNode);