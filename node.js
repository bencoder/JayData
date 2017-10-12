var JayDataNode = {
  width:100,
  height:50,
  draw: function(context) {
    this.drawOutline(context);
    this.drawInputCircles(context);
    this.drawOutputCircle(context);
    this.drawName(context);
    this.drawConnections(context);
  },

  drawOutline: function(context) {
    context.strokeRect(this.position.x,this.position.y,this.width,this.height);
  },

  drawInputCircles: function(context) {
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    if (this.node.numberOfInputs > 0) {
      context.beginPath();
      context.arc(this.position.x, this.position.y,5,0,Math.PI*2)
      context.stroke();
      context.fill();
    }
    if (this.properties.filter(p => p.location === 'audioParam').length > 0) {
      context.beginPath();
      context.arc(this.position.x+this.width, this.position.y,5,0,Math.PI*2)
      context.stroke();
      context.fill();
    }
  },

  drawOutputCircle: function(context) {
    context.fillStyle = 'white';
    context.strokeStyle = 'black';
    if (this.node.numberOfOutputs > 0) {
      context.beginPath();
      context.arc(this.position.x+this.width, this.position.y+this.height,5,0,Math.PI*2)
      context.stroke();
      context.fill();
    }
  },

  drawName: function(context) {
    context.textAlign="center";
    context.fillStyle = 'black';
    context.font = "13px Calibri";
    context.fillText(this.name, this.position.x+this.width/2,this.position.y+this.height/2);
  },

  drawConnections: function(context) {
    this.audioConnections.map(toNode => {
      context.beginPath();
      context.moveTo(this.position.x+this.width,this.position.y+this.height);
      context.lineTo(toNode.position.x,toNode.position.y);
      context.stroke();
    });
    this.audioParamConnections.map(item => {
      context.beginPath();
      context.strokeStyle = 'red';
      context.moveTo(this.position.x+this.width,this.position.y+this.height);
      context.lineTo(item.node.position.x+item.node.width,item.node.position.y);
      context.stroke();
      context.strokeStyle = 'black';
      context.fillText(
        item.paramName,
        (this.position.x+this.width + item.node.position.x+item.node.height) / 2,
        (this.position.y+this.height + item.node.position.y) / 2
      );
    });
  },

  drawSelected: function(context) {
    context.strokeStyle = 'red';
    context.strokeRect(this.position.x,this.position.y,this.width,this.height);
    context.strokeStyle = 'black';
  },

  createAudioParamContextMenu: function(connectionFrom) {
    const contextMenu = document.createElement('select');
    contextMenu.style.display = 'block';
    contextMenu.style.position = 'absolute';
    contextMenu.size = 10;
    contextMenu.style.top = this.position.y+'px';
    contextMenu.style.left = (this.position.x+this.width)+'px';

    this.properties.map(prop => {
      if (prop.location !== 'audioParam') {
        return;
      }

      const option = document.createElement('option');
      option.appendChild(document.createTextNode(prop.name));
      option.onclick =  () => {
        connectionFrom.connectDisconnectAudioParam(this, prop.name);
        document.body.removeChild(contextMenu);
      };
      contextMenu.appendChild(option);
    });
    document.body.appendChild(contextMenu);
    return contextMenu;
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

    const connectionsDiv = document.createElement('div');
    connectionsDiv.innerHTML = '<h3>Outputs</h3>';

    this.audioConnections.map(toNode => {
      const element = document.createElement('p');
      element.appendChild(document.createTextNode(toNode.name + ' - Main input'));
      element.onclick = () => { this.connectDisconnectAudio(toNode);}
      connectionsDiv.appendChild(element);
    });
    this.audioParamConnections.map(item => {
      const element = document.createElement('p');
      element.appendChild(document.createTextNode(item.node.name + ' - '+item.paramName));
      element.onclick = () => { this.connectDisconnectAudioParam(item.node, item.paramName);}
      connectionsDiv.appendChild(element);
    });
    propertiesDiv.appendChild(connectionsDiv)
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

  connectDisconnectAudioParam: function(nodeToConnect, paramName) {
    const findFunc = item => {
      return item.node === nodeToConnect && item.paramName === paramName;
    };
    const foundItem = this.audioParamConnections.find(findFunc);

    if (foundItem) {
      this.node.disconnect(nodeToConnect.node[paramName]);
      this.audioParamConnections = this.audioParamConnections.filter(item => item !== foundItem);
      return;
    }

    this.node.connect(nodeToConnect.node[paramName]);
    this.audioParamConnections.push({node: nodeToConnect, paramName: paramName});
  },

  mouseEventType: function(mouseX, mouseY) {
    const p = this.position;

    const distance = (x1,y1,x2,y2) => {
      return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    };

    if (this.node.numberOfOutputs > 0) {
      if (distance(p.x+this.width,p.y+this.height,mouseX,mouseY) < 5) {
        return 'output';
      }
    }

    if (this.node.numberOfInputs > 0) {
      if (distance(p.x,p.y,mouseX,mouseY) < 5) {
        return 'input';
      }
    }


    if (this.properties.filter(p => p.location === 'audioParam').length > 0) {
      if (distance(p.x+this.width,p.y,mouseX,mouseY) < 5) {
        return 'audioParam';
      }
    }

    if ((mouseX > p.x) && (mouseX < p.x+this.width) && (mouseY > p.y) && (mouseY < p.y + this.height)) {
      return 'block';
    }

    return '';

  }

};