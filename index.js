import {
  Scene,
  PerspectiveCamera,
  TextureLoader,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  Vector3,
  Quaternion,
  Object3D
} from 'three';
import visualize from './src/visualizer';
import enableAccelerometer from './src/enableAccelerometer';
import getImageMinSize from './src/getImageMin';
import resize from './src/onResize';
import animate from './src/animate';
import generateRenderer from './src/generateRenderer';
import handleStaticImage from './src/handleStaticImage';
import enableParallax from './src/enableParallax';
import reset from './src/reset';

export default class GyroBackground {

  enableAccelerometer() { enableAccelerometer.apply( this ); }
  getImageMinSize() { return getImageMinSize.apply( this ); }
  resize( e ) { resize.apply( this, e ); }
  animate() { animate.apply( this ); }
  generateRenderer() { return generateRenderer.apply( this ); }
  handleStaticImage( imageSource, cb ) { handleStaticImage.call( this, imageSource, cb ); }
  visualize() { visualize.apply( this ); }
  enableParallax( className, speed ) { enableParallax.call( this, className, speed ); }
  reset() { reset.apply( this ); }

  constructor(
    target,
    imageSource,
    {
      sensitivity = 0.5,
      inverted = false,
      parallax = false,
      parallaxSpeed = -2,
      portraitSensitivity,
      landscapeSensitivity,
      zoom = 0,
      portraitZoom,
      landscapeZoom,
      offsetX = 0,
      offsetY = 0,
      portraitOffsetX,
      portraitOffsetY,
      landscapeOffsetX,
      landscapeOffsetY
     } = {
       sensitivity: 0.5,
       inverted: false,
       parallax: false,
       parallaxSpeed: -2,
       portraitSensitivity,
       landscapeSensitivity,
       zoom: 0,
       portraitZoom,
       landscapeZoom,
       offsetX: 0,
       offsetY: 0,
       portraitOffsetX,
       portraitOffsetY,
       landscapeOffsetX,
       landscapeOffsetY
     } ) {

    if ( !target || typeof(target) !== 'string' ) {
      throw new Error('No target was specified.');
    }

    if ( !imageSource || typeof(imageSource) !== 'string' ) {
      throw new Error('No image was chosen.');
    }

    //Remove THREE.js logging
    const oldLog = console.log;
    console.log = function(...args) {
      for (let part of args)
        if (part.match("THREE")) return
      oldLog(...args)
    };

    this.resize = this.resize.bind( this );
    this.enableAccelerometer = this.enableAccelerometer.bind( this );
    this.animate = this.animate.bind( this );
    this.enableParallax = this.enableParallax.bind( this );
    this.generateRenderer = this.generateRenderer.bind( this );
    this.getImageMinSize = this.getImageMinSize.bind( this );
    this.reset = this.reset.bind( this );
    this.visualize = this.visualize.bind( this );

    if ( window.innerHeight < window.innerWidth ) {
      this.phoneOrientation = 'landscape';
    } else {
      this.phoneOrientation = 'portrait';
    }

    this.isIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    this.yInverse = this.isIOS ? -1 : 1;
    this.yInverse *= inverted ? -1 : 1;

    this.animateGraph = false;

    this.landscapeOffsetX = typeof(landscapeOffsetX) === 'undefined' ? offsetX : landscapeOffsetX;
    this.landscapeOffsetY = typeof(landscapeOffsetY) === 'undefined' ? offsetY : landscapeOffsetY;

    this.portraitOffsetX = typeof(portraitOffsetX) === 'undefined' ? offsetX : portraitOffsetX;
    this.portraitOffsetY = typeof(portraitOffsetY) === 'undefined' ? offsetY : portraitOffsetY;

    this.offsetX = this.phoneOrientation === 'landscape' ? this.landscapeOffsetX : this.portraitOffsetX;
    this.offsetY = this.phoneOrientation === 'landscape' ? this.landscapeOffsetY : this.portraitOffsetY;

    this.portraitSensitivity = typeof(portraitSensitivity) === 'undefined' ? sensitivity : portraitSensitivity;
    this.landscapeSensitivity = typeof(landscapeSensitivity) === 'undefined' ? sensitivity : landscapeSensitivity;
    this.sensitivity = this.phoneOrientation === 'landscape' ? this.landscapeSensitivity : this.portraitSensitivity;

    this.imageSource = imageSource;
    this.targetQuery = target;

    this.enableAccelerometer();

    let fileTypeRegex = /\.[0-9a-z]+$/i;
    this.fileType = fileTypeRegex.exec( imageSource )[0];

    if ( this.fileType === '.gif' ) {
      //User selected a gif
      //replace handleStaticImage witha function to handle video/gif loading
      this.loader = this.handleStaticImage.bind( this );
    } else {
      this.loader = this.handleStaticImage.bind( this );
    }

    this.loader( imageSource, function( texture ) {

      //Wait for the page to finish loading so that we can find all the target elements
      window.addEventListener( 'load', function() {

        this.target = document.querySelector( target );

        if ( !this.target ) {
          throw new Error('Cound not find any taget elements with query: ' + target);
        }

        this.target.style.position = 'relative';
        this.target.style.overflow = 'hidden';

        this.boundingRect = this.target.getBoundingClientRect();
        this.w = this.boundingRect.width;
        this.h = this.boundingRect.height;

        if ( this.w > this.h ) {
          this.containerOrientation = 'landscape';
        } else if ( this.w < this.h ) {
          this.containerOrientation = 'portrait';
        } else {
          this.containerOrientation = 'square';
        }

        this.portraitZoom = typeof(portraitZoom) === 'undefined' ? zoom : portraitZoom;

        let imageAspect = this.h / this.w;
        this.landscapeZoom = typeof(landscapeZoom) === 'undefined' ? ( this.phoneOrientation === 'landscape' ? zoom * imageAspect : zoom ) : landscapeZoom;

        if ( !this.vrDisplay ) {

          if ( parallax ) {

            let uniqueClass = Math.floor(Math.random() * 100000) + 1;
            uniqueClass = 'gyroCanvas-' + uniqueClass;
            this.container = document.createElement('div');
            this.container.classList.add( uniqueClass );
            this.container.style.height = this.h + 'px';
            this.container.style.width = this.w + 'px';
            this.container.style.zIndex = 0;
            this.container.style.overflow = 'hidden';
            this.container.style.position = 'absolute';
            this.container.style.backgroundSize = 'cover';
            this.container.style.backgroundPosition = 'center';
            this.container.style.backgroundImage = `url(${this.imageSource})`;
            this.target.prepend( this.container );

            this.enableParallax( uniqueClass, parallaxSpeed );
            this.state = 'parallax';

            const resizeParallax = function ( e ) {

              this.boundingRect = this.target.getBoundingClientRect();
              this.w = this.boundingRect.width;
              this.h = this.boundingRect.height;

              let h;

              if ( this.h < window.innerHeight ) {

                h = window.innerHeight;

              } else {

                h = this.h;

              }

              //vertical center margin
              let vm = ( h - this.h ) / 2;

              this.container.style.top = -vm + 'px';
              this.container.style.height = h + 'px';
              this.container.style.width = this.w + 'px';

            }.bind( this );

            resizeParallax();

            window.addEventListener('resize', resizeParallax);

          } else {

            this.state = 'idle';
            this.target.style.backgroundSize = 'cover';
            this.target.style.backgroundPosition = 'center';
            this.target.style.backgroundImage = `url(${this.imageSource})`;

          }

        } else if ( this.vrDisplay ) {

          this.state = 'gyro';

          this.camera = new PerspectiveCamera( 75, this.w / this.h, 0.1, 3000 );
          this.scene = new Scene();
          this.renderer = this.generateRenderer();

          texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
          this.material = new MeshBasicMaterial({ map: texture, transparent: true });
          let g = new PlaneGeometry( this.imageWidth, this.imageHeight );
          this.imagePlane = new Mesh( g, this.material );
          this.imagePlane.position.x = parseInt(this.offsetX);
          this.imagePlane.position.y = parseInt(this.offsetY);

          this.scene.add( this.imagePlane );

          this.imageMinSize = this.getImageMinSize();

          //Calculate how much space the plane needs to move based on sensitivity
          this.freedom = Math.floor( this.imageMinSize / 2 ) * ( this.sensitivity / 10 );
          this.zoom = this.phoneOrientation === 'landscape' ? this.landscapeZoom : this.portraitZoom;

          //Calculate the distance the camera needs to be from the image in order to be fill the screen
          this.dist = ( this.imageMinSize - ( this.freedom * 2 ) ) / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
          this.camera.position.z = this.dist;
          this.camera.position.z -= this.zoom;

          //Get initial orientation data
          this.vrDisplay.getFrameData( this.frameData );
          this.q = new Quaternion( this.frameData.pose.orientation[0], this.frameData.pose.orientation[1], this.frameData.pose.orientation[2], this.frameData.pose.orientation[3] );
          this.originalQ = this.q.clone();

          //Create a element to keep track of the phone's original orientation
          this.phoneContainer = new Object3D();
          this.phoneContainer.setRotationFromQuaternion( this.originalQ );

          this.phone = new Object3D();
          this.phone.position.set( 0, 0, 0 );
          this.phone.setRotationFromQuaternion( this.q );

          this.targetPosition = new Object3D();
          this.targetPosition.position.set( 0, 0, -1 );

          this.targetVector = new Vector3();

          this.phoneContainer.add( this.phone );
          this.phone.add( this.targetPosition );
          this.scene.add( this.phone );

          window.addEventListener('resize', this.resize.bind( this ));

          //Fix IOS issue
          if( this.isIOS ) {

            if ( parseInt( this.originalQ._x.toFixed() ) === -0 ) {
              this.yInverse *= -1
            }

          }

          this.animate();

        }

      }.bind( this ));

    }.bind( this ));

  }

}
