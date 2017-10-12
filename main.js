function Position(x,y) {
  this.x = x;
  this.y = y;
}


function jaydata(canvasId, propertiesId, buttonId) {
  const canvas = document.getElementById(canvasId);
  const viewContext = canvas.getContext('2d');
  const properties = document.getElementById(propertiesId);

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();

  const button = document.getElementById(buttonId);

  const nodes = [];
  nodes.push(new Output(audioContext, new Position(800,800)));
  let selectedNode = null;
  this.nodes = nodes;

  function createContextMenu() {
    let contextPosition;
    const contextMenu = document.createElement('select');
    contextMenu.style.display = 'none';
    contextMenu.style.position = 'absolute';
    contextMenu.size = 10;

    const createGroup = (title) => {
      const group = document.createElement('optgroup');
      group.label = title;
      contextMenu.appendChild(group);
      return group
    }

    const sourceGroup = createGroup('Sound Sources');
    const effectGroup = createGroup('Effects');
    const otherGroup = createGroup('Other');

    const createOption = (name, group, newOsc) => {
      const option = document.createElement('option');
      option.appendChild(document.createTextNode(name));
      group.appendChild(option);
      option.onclick =  () => {
        nodes.push(newOsc());
        contextMenu.hide();
      };
    }

    createOption('Oscillator', sourceGroup, () => {return new Oscillator(audioContext, contextPosition)});
    createOption('Wave Loop', sourceGroup, () => {return new WaveInput(audioContext, contextPosition)});
    createOption('Gain', effectGroup, () => {return new Gain(audioContext, contextPosition)});
    createOption('Delay', effectGroup, () => {return new Delay(audioContext, contextPosition)});
    createOption('Filter', effectGroup, () => {return new Filter(audioContext, contextPosition)});
    //createOption('Slider', otherGroup, () => {return new Slider(audioContext, contextPosition)});
    createOption('Visualisation', otherGroup, () => {return new Visualiser(audioContext, contextPosition)});


    document.body.appendChild(contextMenu);

    contextMenu.show = (event) => {
      contextPosition = new Position(event.offsetX, event.offsetY);
      contextMenu.style.top = event.clientY + 'px';
      contextMenu.style.left = event.clientX + 'px';
      contextMenu.style.display = 'block';
      return false;
    };

    contextMenu.hide = () => {
      contextMenu.selectedIndex = -1;
      contextMenu.style.display = 'none';
    };

    return contextMenu;
  }

  const contextMenu = createContextMenu();


  canvas.oncontextmenu = contextMenu.show;

  let mouseDown = false;
  let mousePosition;
  let mouseOffset;
  let audioParamContextMenu;
  let connecting = false;

  canvas.onmousedown = (event) => {
    contextMenu.hide();
    if (audioParamContextMenu) {
      try {
        document.body.removeChild(audioParamContextMenu);
      } catch (e) {}
      audioParamContextMenu = null;
    }
    selectedNode = null;
    const x = event.offsetX;
    const y = event.offsetY;
    for(const node of nodes) {
      const event = node.mouseEventType(x,y);
      if (event === 'block') {
        selectedNode = node;
        mouseOffset = new Position(x-node.position.x, y-node.position.y);
        break;
      }
      if (event === 'output') {
        selectedNode = node;
        connecting = true;
        break;
      }
    }

    while (properties.firstChild) {
      properties.removeChild(properties.firstChild);
    }

    if (selectedNode) {
      properties.appendChild(selectedNode.createPropertyInterface());
    }

    mouseDown = true;
  };

  canvas.onmouseup = (event) => {
    mouseDown = false;
    if (!connecting) {
      return;
    }
    connecting = false;
    const x = event.offsetX;
    const y = event.offsetY;
    for(const node of nodes) {
      const event = node.mouseEventType(x,y);
      if (event === 'input') {
        selectedNode.connectDisconnectAudio(node);
        return;
      }
      if (event === 'audioParam') {
        node.createAudioParamContextMenu(selectedNode);
        return;
      }
    }
  };

  canvas.onmousemove = (event) => {
    if (mouseDown && selectedNode && !connecting) {
      selectedNode.position.x = event.offsetX - mouseOffset.x;
      selectedNode.position.y = event.offsetY - mouseOffset.y;
    }
    mousePosition = new Position(event.offsetX, event.offsetY);
  };

  //button.onclick()

  function draw() {
    viewContext.clearRect(0,0,canvas.width,canvas.height);
    nodes.map(node => {
      node.draw(viewContext);
    });

    if (selectedNode) {
      selectedNode.drawSelected(viewContext);
    }

    if (mouseDown && connecting) {
      viewContext.beginPath();
      viewContext.moveTo(selectedNode.position.x+selectedNode.width, selectedNode.position.y + selectedNode.height);
      viewContext.lineTo(mousePosition.x, mousePosition.y);
      viewContext.stroke();
    }

    window.requestAnimationFrame(draw);
  }

  window.requestAnimationFrame(draw);
}