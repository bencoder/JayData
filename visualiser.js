let analyserCount = 0;

function Visualiser(audioContext, position) {

  this.node = audioContext.createAnalyser();
  this.node.fftSize = 2048;
  const bufferLength = this.node.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  this.name = 'analyser ' + (++analyserCount);
  this.position = position;
  this.width = 300;
  this.height = 200;

  this.properties = [
    {
      name: 'name',
      type: 'input',
      location: 'this',
    }
  ];

  this.draw = (context) => {
    this.drawOutline(context);
    this.drawConnections(context);
    this.node.getByteTimeDomainData(dataArray);

    const sliceWidth = this.width * 1.0 / bufferLength;
    context.strokeStyle = 'black';
    context.beginPath();
    let x = this.position.x;
    for(let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = this.position.y + v * this.height/2;
      if(i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
      x += sliceWidth;
    }
    context.stroke();
  }


  this.audioConnections = [];
  this.audioParamConnections = [];
}

Visualiser.prototype = Object.create(JayDataNode);