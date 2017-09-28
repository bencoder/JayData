function Output(audioContext, position) {

  this.node = audioContext.destination;
  this.name = 'output';

  this.position = position;

  this.properties = [];

  this.audioConnections = [];
}

Output.prototype = Object.create(JayDataNode);