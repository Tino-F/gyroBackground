const { Mesh } = require('three/src/objects/Mesh');
const { MeshBasicMaterial } = require('three/src/materials/MeshBasicMaterial');
const { MeshNormalMaterial } = require('three/src/materials/MeshNormalMaterial');
const { BoxBufferGeometry } = require('three/src/geometries/BoxGeometry');
const { SphereGeometry } = require('three/src/geometries/SphereGeometry');

export default function visualize () {

    //Original Phone position (phone container)
    let pcg = new BoxBufferGeometry( 2, 4, 0.3 );
    let pcm = new MeshNormalMaterial({wireframe: true});
    let pc = new Mesh( pcg, pcm );
    pc.setRotationFromQuaternion( this.originalQ );

    this.phoneContainer = pc;

    //Phone
    let pm = new MeshBasicMaterial({color: 0x000000});
    let pg = new BoxBufferGeometry( 2, 4, 0.3 );
    let p = new Mesh( pg, pm );

    this.phone = p;

    //Target Position Object
    let tg = new SphereGeometry( 1, 1, 1 );
    let tm = new MeshNormalMaterial({wireframe: true});
    this.targetPosition = new Mesh( tg, tm );
    this.targetPosition.position.set( 0, 0, -1 );

    this.scene.add( this.phoneContainer );
    this.scene.add( this.phone );
    //this.scene.add( this.targetPosition );

    this.phoneContainer.add( this.phone );
    this.phone.add( this.targetPosition );
    this.scene.remove( this.imagePlane );

    let size = Math.floor( this.h / 4 );

    //Create Canvas for logging x/y data
    let canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.style.border = '1px solid black';

    let ctx = canvas.getContext("2d");
    this.graphCTX = ctx;
    this.graphCanvas = canvas;

    //Create x data visualizer
    this.yEl = document.createElement('div');
    this.yEl.style.display = 'flex';
    this.yEl.style.justifyContent = 'center';
    this.yEl.style.alignItems = 'center';
    this.yEl.style.textAlign = 'center';
    this.yEl.style.height = `${size}px`;
    this.yEl.style.position = 'absolute';
    this.yEl.style.left = '-70px';
    this.yEl.innerHTML = `Y <br/> ${ Number(this.targetVector.y).toFixed(5) }`;

    //Create y data visualizer
    this.xEl = document.createElement('div');
    this.xEl.style.width = `${size}px`;
    this.xEl.style.textAlign = 'center';
    this.xEl.innerHTML = `X <br/> ${ Number(this.targetVector.x).toFixed(5) }`;

    //Create Container
    let container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.right = 0;
    container.style.bottom = 0;

    container.appendChild( this.xEl );
    container.appendChild( this.yEl );
    container.appendChild( canvas );
    this.target.appendChild( container );

    this.animateGraph = function () {
      this.graphCTX.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);
      this.graphCTX.fillStyle = "#000000";
      this.graphCTX.beginPath();
      this.graphCTX.arc(this.graphCanvas.width * ( ( 1 + this.targetVector.x ) / 2 ), this.graphCanvas.height * ( ( 1 + this.targetVector.y ) / 2 ), 5, 0, 2 * Math.PI);
      this.graphCTX.closePath();
      this.graphCTX.fill();
      this.graphCTX.stroke();
      this.xEl.innerHTML = `X <br/> ${ Number(this.targetVector.x).toFixed(5) }`;
      this.yEl.innerHTML = `Y <br/> ${ Number(this.targetVector.y).toFixed(5) }`;
    }

    this.camera.position.set( 0, 0, 5 );
    this.camera.rotation.set( 0, 0, 0 );

  }
