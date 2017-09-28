let gainCount = 0;

function Gain(audioContext, position) {

  this.node = audioContext.createGain();
  this.name = 'gain ' + (++gainCount);
  this.position = position;

  this.properties = [
    {
      name: 'name',
      type: 'input',
      location: 'this',
    },
    {
      name: 'gain',
      type: 'input',
      location: 'audioParam'
    }
  ];

  this.audioConnections = [];

}

Gain.prototype = Object.create(JayDataNode);