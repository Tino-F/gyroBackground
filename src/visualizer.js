import {
  MeshNormalMaterial,
  MeshBasicMaterial,
  Mesh,
  BoxBufferGeometry,
  SphereGeometry,
} from 'three';

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

    //Create Canvas for logging x/y data
    let canvas = document.createElement('canvas');
    canvas.width = Math.floor( this.h / 4 );
    canvas.height = Math.floor( this.h / 4 );
    canvas.style.position = 'absolute';
    canvas.style.right = 0;
    canvas.style.bottom = 0;
    canvas.style.border = '1px solid black';
    this.target.appendChild( canvas );

    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";

    this.graphCTX = ctx;
    this.graphCanvas = canvas;

    this.animateGraph = function () {
      this.graphCTX.clearRect(0, 0, this.graphCanvas.width, this.graphCanvas.height);
      this.graphCTX.fillStyle = "#000000";
      this.graphCTX.beginPath();
      this.graphCTX.arc(this.graphCanvas.width * ( ( 1 + this.targetVector.x ) / 2 ), this.graphCanvas.height * ( ( 1 + this.targetVector.y ) / 2 ), 5, 0, 2 * Math.PI);
      this.graphCTX.closePath();
      this.graphCTX.fill();
      this.graphCTX.stroke();
    }

    this.camera.position.set( 0, 0, 5 );
    this.camera.rotation.set( 0, 0, 0 );

  }
