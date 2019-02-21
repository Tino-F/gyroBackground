/*

Here are some of the options I plan on including:

Sensitivity

*/

import WebVRPolyfill from 'webvr-polyfill';
import Relax from 'rellax';
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  TextureLoader,
  MeshBasicMaterial,
  PlaneGeometry,
  Mesh,
  LinearFilter,
  RepeatWrapping,
  Vector3,
  Quaternion,
  Object3D
} from 'three';

export default class GyroBackground {

  isWebGL2Available() {
		try {
			var canvas = document.createElement( 'canvas' );
			return !! ( window.WebGL2RenderingContext && canvas.getContext( 'webgl2' ) );
		} catch ( e ) {
			return false;
		}
	}

  enableAccelerometer() {

    let config = (function() {
      let config = {};
      let q = window.location.search.substring(1);
      if (q === '') {
        return config;
      }
      let params = q.split('&');
      let param, name, value;
      for (let i = 0; i < params.length; i++) {
        param = params[i].split('=');
        name = param[0];
        value = param[1];
        // All config values are either boolean or float
        config[name] = value === 'true' ? true :
                       value === 'false' ? false :
                       parseFloat(value);
      }
      return config;
    })();

    let polyfill = new WebVRPolyfill( config );

    this.frameData = new VRFrameData();

    navigator.getVRDisplays().then(function ( vrDisplays ) {

      this.vrDisplay = vrDisplays[0];

      if ( this.vrDisplay ) {

        this.vrDisplay.getFrameData( this.frameData );
        console.log("Using webvr-polyfill version " + WebVRPolyfill.version + " with configuration: " + JSON.stringify(config));

      } else {

        this.vrDisplay = false;

      }

    }.bind( this ))

  }

  enableParallax( className, speed ) {

    let parallaxItem = new Relax( `.${className}`, {
      speed: speed,
      center: true
    });

  }

  getSquareMax() {

    let imageAspect = this.imageWidth / this.imageHeight;
    let containerAspect = this.w / this.h;

    if ( this.imageOrientation === 'portrait' ) {

      if ( this.h > this.w ) {
        //Contaer is in portrait mode

        if ( imageAspect < containerAspect ) {
          //Image is taller than container
          return this.imageWidth;

        } else {

          return this.imageHeight

        }

      } else {
        //Contanier is in landscape mode or square

        return this.imageWidth / containerAspect;

      }

    } else if ( this.imageOrientation === 'landscape' ) {

      let imageHeight = this.w / imageAspect;

      if ( imageHeight > this.h ) {

        return this.h;

      } else {

        return this.imageHeight;

      }

    } else {
      //Image orientation is square

      let imageWidth = this.h * imageAspect;

      if ( this.w > this.h ) {
        //Container orientation is landscape

        return this.h;

      } else {

        return this.h

      }

    }

  }

  resize( e ) {

    //Update sensitivity before zoom

    if ( window.innerHeight < window.innerWidth ) {
      this.phoneOrientation = 'landscape';
    } else {
      this.phoneOrientation = 'portrait';
    }

    this.sensitivity = this.phoneOrientation === 'landscape' ? this.landscapeSensitivity : this.portraitSensitivity;
    this.zoom = this.phoneOrientation === 'landscape' ? this.landscapeZoom : this.portraitZoom;
    this.offsetX = this.phoneOrientation === 'landscape' ? this.landscapeOffsetX : this.portraitOffsetX;
    this.offsetY = this.phoneOrientation === 'landscape' ? this.landscapeOffsetY : this.portraitOffsetY;

    this.imagePlane.position.x = parseInt(this.offsetX);
    this.imagePlane.position.y = parseInt(this.offsetY);

    this.boundingRect = this.target.getBoundingClientRect();
    this.w = this.boundingRect.width;
    this.h = this.boundingRect.height;

    this.target.children[0].style.height = this.h + 'px';
    this.target.children[0].style.width = this.w + 'px';

    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( this.w, this.h );

    this.squareMax = this.getSquareMax();
    this.freedom = Math.floor( this.squareMax / 2 ) * ( this.sensitivity / 10 );
    this.dist = ( this.squareMax - ( this.freedom * 2 ) ) / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
    this.camera.position.z = this.dist;
    this.camera.position.z -= this.zoom;

    this.renderer.render( this.scene, this.camera );

  }

  animate() {

    this.vrDisplay.requestAnimationFrame( this.animate );

    this.vrDisplay.getFrameData( this.frameData );
    let orientation = [ ...this.frameData.pose.orientation ].map(x => x / 6.28);
    orientation[3] = 1;

    //this.phone.rotation.set( orientation[0] / 2, orientation[1] / 2, orientation[2] / 2 );

    this.q.set( ...orientation )
    this.q.normalize();
    this.phone.setRotationFromQuaternion( this.q );

    this.targetVector.copy( this.targetPosition.position );
    this.targetPosition.localToWorld( this.targetVector );
    this.phoneContainer.worldToLocal( this.targetVector );

    //mapLinear( this.targetVector.y, 1 , 3 )

    this.camera.position.x = ( this.targetVector.x * this.freedom ) * this.yInverse;
    this.camera.position.y = ( this.targetVector.y * this.freedom ) * this.yInverse;
    this.camera.rotation.z = orientation[2] * ( -0.4 * this.sensitivity/10 );

    this.renderer.render( this.scene, this.camera );

  }

  generateRenderer() {

    let renderer;

    if ( this.isWebGL2Available() ) {
      //Use WebGL2

      let canvas = document.createElement( 'canvas' );
      let context = canvas.getContext( 'webgl2' );
      renderer = new WebGLRenderer( { canvas: canvas, context: context, antialias: true, alpha: true } );

    } else {

      renderer = new WebGLRenderer({ antialias: true, alpha: true });

    }

    renderer.setClearColor( 0x000000, 0 );
    renderer.setSize( this.w, this.h );

    let container = document.createElement('div');
    container.style.height = this.h + 'px';
    container.style.width = this.w + 'px';
    container.style.overflow = 'hidden';
    container.style.position = 'absolute';
    container.style.zIndex = 0;
    container.appendChild( renderer.domElement );
    this.target.prepend( container )

    return renderer;

  }

  handleStaticImage( imageSource, cb ) {

    let loader = new TextureLoader();

    loader.load( imageSource, function ( texture ) {
      //onload

      texture.minFilter = LinearFilter;
      this.imageWidth = texture.image.width;
      this.imageHeight = texture.image.height;

      //Determine image orientation
      if ( this.imageHeight > this.imageWidth ) {
        this.imageOrientation = 'portrait';
      } else if ( this.imageWidth === this.imageHeight ) {
        this.imageOrientation = 'square';
      } else {
        this.imageOrientation = 'landscape';
      }

      cb( texture );

    }.bind( this ),
    //progress callback not yet supported
    undefined,
    function ( err ) {
      //onError

      console.error( err );
      throw new Error('failed to load image ' + imageSource);

    });

  }

  handleVideo( cb ) {

    throw new Error('not written yet :D');

  }

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
       portraitOffset,
       portraitOffset,
       landscapeOffset,
       landscapeOffset
     } ) {


    if ( !target || typeof(target) !== 'string' ) {
      throw new Error('No target was specified.');
    }

    if ( !imageSource || typeof(imageSource) !== 'string' ) {
      throw new Error('No image was chosen.');
    }

    if ( window.innerHeight < window.innerWidth ) {
      this.phoneOrientation = 'landscape';
    } else {
      this.phoneOrientation = 'portrait';
    }

    let isIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    this.yInverse = isIOS ? -1 : 1;
    this.yInverse *= inverted ? -1 : 1;

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
    this.resize = this.resize.bind( this );
    this.enableAccelerometer = this.enableAccelerometer.bind( this );
    this.animate = this.animate.bind( this );
    this.enableParallax = this.enableParallax.bind( this );
    this.generateRenderer = this.generateRenderer.bind( this );
    this.getSquareMax = this.getSquareMax.bind( this );

    this.enableAccelerometer();

    let fileTypeRegex = /\.[0-9a-z]+$/i;
    this.fileType = fileTypeRegex.exec( imageSource )[0];

    if ( this.fileType === '.gif' ) {
      //User selected a gif
      this.loader = this.handleVideo.bind( this );
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

          this.squareMax = this.getSquareMax();

          //Calculate how much space the plane needs to move based on sensitivity
          this.freedom = Math.floor( this.squareMax / 2 ) * ( this.sensitivity / 10 );
          this.zoom = this.phoneOrientation === 'landscape' ? this.landscapeZoom : this.portraitZoom;

          let imageAspect = this.imageWidth / this.imageHeight;

          this.dist = ( this.squareMax - ( this.freedom * 2 ) ) / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
          this.camera.position.z = this.dist;
          this.camera.position.z -= this.zoom;

          this.vrDisplay.getFrameData( this.frameData );

          this.q = new Quaternion( ...this.frameData.pose.orientation );

          this.originalQ = this.q.clone();
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
          //this.resize();
          this.animate();

        }

      }.bind( this ));

    }.bind( this ));

  }

}
