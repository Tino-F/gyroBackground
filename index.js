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
  RepeatWrapping
} from 'three';

export default class GyroBackground {

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
        this.originalOrientation = [
          this.frameData.pose.orientation[0],
          this.frameData.pose.orientation[1],
          this.frameData.pose.orientation[2],
          this.frameData.pose.orientation[3]
        ];
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

    if ( this.imageOrientation == 'portrait' ) {

      let imageWidth = this.h * imageAspect;

      if ( imageWidth > this.w ) {

        return this.imageHeight;

      } else {

        return imageWidth;

      }

    } else if ( this.imageOrientation == 'landscape' ) {

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

    this.boundingRect = this.target.getBoundingClientRect();
    this.w = this.boundingRect.width;
    this.h = this.boundingRect.height;

    this.squareMax = this.getSquareMax();

    this.target.children[0].style.height = this.h + 'px';
    this.target.children[0].style.width = this.w + 'px';

    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( this.w, this.h );

    this.dist = this.squareMax / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
    this.camera.position.z = this.dist - ( this.dist/1.1 * this.sensitivity/5 );
    this.camera.position.z -= this.zoom;

    this.renderer.render( this.scene, this.camera );

  }

  animate() {

    requestAnimationFrame( this.animate );

    this.vrDisplay.getFrameData( this.frameData );
    let orientation = this.frameData.pose.orientation;

    //let x = this.originalOrientation[0] - orientation[0];
    //let y = this.originalOrientation[1] - orientation[1];
    //let z = this.originalOrientation[2] - orientation[2];

    this.camera.position.x = ( orientation[1] * this.sensitivity ) * -100;
    this.camera.position.y = ( orientation[0] * this.sensitivity ) * 100;
    this.camera.rotation.z = orientation[2] * ( 0.3 * this.sensitivity/3 );

    this.renderer.render( this.scene, this.camera );

  }

  getVisibleHeight( depth ) {
    // compensate for cameras not positioned at z=0
    const cameraOffset = this.camera.position.z;
    if ( depth < cameraOffset ) depth -= cameraOffset;
    else depth += cameraOffset;

    // vertical fov in radians
    const vFOV = this.camera.fov * Math.PI / 180;

    // Math.abs to ensure the result is always positive
    return 2 * Math.tan( vFOV / 2 ) * Math.abs( depth );
  };

  generateRenderer() {

    let renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor( 0x000000, 0 );
    renderer.setSize( this.w, this.h );

    let container = document.createElement('div');
    container.style.height = this.h + 'px';
    container.style.width = this.w + 'px';
    container.style.overflow = 'hidden';
    container.style.position = 'absolute';
    container.style.zIndex = -1;
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

  constructor( target, imageSource, { sensitivity = 0.5, parallax = false, parallaxSpeed = -2, portraitSensitivity, landscapeSensitivity, zoom = 0, portraitZoom, landscapeZoom } = { sensitivity: 0.5, parallax: false, parallaxSpeed: -2, portraitSensitivity, landscapeSensitivity, zoom: 0, portraitZoom, landscapeZoom } ) {

    /*
      Params:
        target,
        imageSource,
        sensitivity,
        landscapeSensitivity,
        portraitSensitivity,
        zoom,
        portraitZoom,
        landscapeZoom,
        parallax,
        parallaxSpeed
    */

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

    this.portraitSensitivity = typeof(portraitSensitivity) === 'undefined' ? sensitivity : portraitSensitivity;
    this.landscapeSensitivity = typeof(landscapeSensitivity) === 'undefined' ? sensitivity : landscapeSensitivity;
    this.sensitivity = this.phoneOrientation === 'landscape' ? this.landscapeSensitivity : this.portraitSensitivity;
    //console.log(`landscape sensitivity: ${this.landscapeSensitivity}, portrait sensitivity: ${this.portraitSensitivity}`);

    this.portraitZoom = typeof(portraitZoom) === 'undefined' ? zoom : portraitZoom;
    this.landscapeZoom = typeof(landscapeZoom) === 'undefined' ? zoom : landscapeZoom;
    this.zoom = this.phoneOrientation === 'landscape' ? this.landscapeZoom : this.portraitZoom;
    //console.log(`landscape zoom: ${this.landscapeZoom}, portrait zoom: ${this.portraitZoom}`);

    this.imageSource = imageSource;
    this.targetQuery = target;
    this.originalOrientation = [0, 0, 0];
    this.resize = this.resize.bind( this );
    this.enableAccelerometer = this.enableAccelerometer.bind( this );
    this.animate = this.animate.bind( this );
    this.enableParallax = this.enableParallax.bind( this );
    this.generateRenderer = this.generateRenderer.bind( this );
    this.getVisibleHeight = this.getVisibleHeight.bind( this );
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

        if ( !this.vrDisplay ) {

          if ( parallax ) {

            let uniqueClass = Math.floor(Math.random() * 100000) + 1;
            uniqueClass = 'gyroCanvas-' + uniqueClass;
            this.container = document.createElement('div');
            this.container.classList.add( uniqueClass );
            this.container.style.height = this.h + 'px';
            this.container.style.width = this.w + 'px';
            //this.container.style.top = '-25px;'
            this.container.style.zIndex = -1;
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

          this.scene.add( this.imagePlane );

          this.squareMax = this.getSquareMax();
          this.dist = this.squareMax / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
          this.camera.position.z = this.dist - ( this.dist/1.1 * this.sensitivity/5 );

          this.vrDisplay.getFrameData( this.frameData );
          let originalOrientation = this.frameData.pose.orientation;

          this.originalOrientation = [
            originalOrientation[0],
            originalOrientation[1],
            originalOrientation[2],
            originalOrientation[3]
          ];

          window.addEventListener('resize', this.resize.bind( this ));
          this.resize();
          this.animate();

        }

      }.bind( this ));

    }.bind( this ));

  }

}
