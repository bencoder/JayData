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
    const sourceGroup = document.createElement('optgroup');
    sourceGroup.label = 'Sound Sources';
    contextMenu.appendChild(sourceGroup);

    const effectGroup = document.createElement('optgroup');
    effectGroup.label = 'Effects';
    contextMenu.appendChild(effectGroup);

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
  let shiftDown = false;
  let mouseOffset;

  canvas.onmousedown = (event) => {
    contextMenu.hide();
    const prevSelected = selectedNode;
    selectedNode = null;
    const x = event.offsetX;
    const y = event.offsetY;
    nodes.map(node => {
      const p = node.position;
      if ((x > p.x) && (x < p.x+100) && (y > p.y) && (y < p.y + 50)) {
        selectedNode = node;
        mouseOffset = new Position(x-p.x, y-p.y);
      }
    });
    if (selectedNode && (selectedNode !== prevSelected)) {
      if (prevSelected && shiftDown) {
        prevSelected.connectDisconnectAudio(selectedNode);
        selectedNode = prevSelected;
      }
      if (prevSelected && ctrlDown) {

        selectedNode = prevSelected;
      }
      while (properties.firstChild) {
        properties.removeChild(properties.firstChild);
      }
      properties.appendChild(selectedNode.createPropertyInterface());
    } else if (!selectedNode) {
      while (properties.firstChild) {
        properties.removeChild(properties.firstChild);
      }
    }
    mouseDown = true;
  };

  canvas.onmouseup = () => {
    mouseDown = false;
  };

  canvas.onmousemove = (event) => {
    if (mouseDown && selectedNode) {
      selectedNode.position.x = event.offsetX - mouseOffset.x;
      selectedNode.position.y = event.offsetY - mouseOffset.y;
    }
  };

  document.onkeydown = (event) => {
    if (event.keyCode === 16) {
      shiftDown = true;
    }
  };

  document.onkeyup = () => {
    shiftDown = false;
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

    window.requestAnimationFrame(draw);
  }

  window.requestAnimationFrame(draw);
}