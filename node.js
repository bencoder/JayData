var JayDataNode = {
  draw: function(context) {
    context.strokeRect(this.position.x,this.position.y,100,50);
    context.textAlign="center";
    context.fillStyle = 'black';
    context.font = "13px Calibri";
    context.fillText(this.name, this.position.x+50,this.position.y+25);
    this.audioConnections.map(toNode => {
      context.beginPath();
      context.moveTo(this.position.x+100,this.position.y+50);
      context.lineTo(toNode.position.x,toNode.position.y);
      context.stroke();
    });
  },

  drawSelected: function(context) {
    context.strokeStyle = 'red';
    context.strokeRect(this.position.x,this.position.y,100,50);
    context.strokeStyle = 'black';
  },

  getAudioParamContext: function() {

  },

  createPropertyInterface: function() {
    const thisNode = this;
    const propertiesDiv = document.createElement('div');
    this.properties.map(property => {
      const label = document.createElement('label');
      label.appendChild(document.createTextNode(property.name));
      propertiesDiv.appendChild(label);
      let element;
      let value = null;
      if (property.location === 'this') {
        value = thisNode[property.param || property.name];
      } else if (property.location === 'audioParam') {
        value = thisNode.node[property.param || property.name].value;
        //label.innerHTML = property.name + ' (' + value + ')';
      } else if (property.location === 'custom') {
        value = property.getValue();
      } else {
        value = thisNode.node[property.param || property.name]
      }

      switch(property.type) {
        case 'range':
          element = document.createElement('input');
          element.type = 'range';
          element.min = property.min || thisNode.node[property.param || property.name].minValue;
          element.max = property.max || thisNode.node[property.param || property.name].maxValue;
          element.step = property.step || 0.01;
          break;
        case 'input':
          element = document.createElement('input');
          element.type = 'text';
          break;
        case 'file':
          element = document.createElement('input');
          element.type = 'file';
          break;
        case 'selection':
          element = document.createElement('select');
          property.values.map(prop => {
            const el = document.createElement('option');
            el.appendChild(document.createTextNode(prop));
            element.appendChild(el);
          });
          break;
        default:
          return;
      }

      if (value || value === 0) {
        element.value = value;
      }

      if (property.location === 'custom') {
        element.onchange = property.onChange;
      } else {

        element.onchange = function () {
          if (property.location === 'this') {
            thisNode[property.param || property.name] = this.value;
          } else if (property.location === 'audioParam') {
            thisNode.node[property.param || property.name].value = this.value;
            //this.previousSibling.innerHTML = property.name + ' (' + this.value + ')';
          } else {
            thisNode.node[property.param || property.name] = this.value;
          }
        }

      }

      propertiesDiv.appendChild(element);
    });
    return propertiesDiv;
  },


  connectDisconnectAudio: function(nodeToConnect) {
    if (this.audioConnections.includes(nodeToConnect)) {
      this.node.disconnect(nodeToConnect.node);
      this.audioConnections = this.audioConnections.filter(item => item !== nodeToConnect);
      return;
    }
    if (this.node.numberOfOutputs === 0) {
      alert('You cannot connect a destination node to any other node');
    }
    if (nodeToConnect.node.numberOfInputs === 0) {
      alert('You cannot connect to a source node');
      return;
    }

    this.node.connect(nodeToConnect.node);
    this.audioConnections.push(nodeToConnect);
  },

};