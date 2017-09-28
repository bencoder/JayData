let delayCount = 0;

function Delay(audioContext, position) {

  this.node = audioContext.createDelay();
  this.name = 'delay ' + (++delayCount);
  this.position = position;

  this.properties = [
    {
      name: 'name',
      type: 'input',
      location: 'this',
    },
    {
      name: 'delayTime',
      type: 'input',
      location: 'audioParam'
    }
  ];

  this.audioConnections = [];

}

Delay.prototype = Object.create(JayDataNode);