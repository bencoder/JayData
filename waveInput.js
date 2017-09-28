let waveCount = 0;

function WaveInput(audioContext, position) {

  this.node = audioContext.createBufferSource();
  this.node.loop = true;

  this.name = 'wave ' + (++waveCount);
  this.position = position;

  this.properties = [
    {
      name: 'name',
      type: 'input',
      location: 'this',
    },
    {
      name: 'playbackRate',
      type: 'input',
      location: 'audioParam'
    },
    {
      name: 'detune',
      type: 'input',
      location: 'audioParam'
    },
    {
      name: 'file',
      type: 'file',
      location: 'custom',
      onChange: (event) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          audioContext.decodeAudioData(event.target.result, buffer => {
            this.node.buffer = buffer;
            this.node.loop = true;
            this.node.start();
          });
        };
        reader.readAsArrayBuffer(event.target.files[0]);
      },
      getValue: () => {
        return null;
      }
    }
  ];

  this.audioConnections = [];
  this.audioParamConnections = [];

}

WaveInput.prototype = Object.create(JayDataNode);