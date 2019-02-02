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
  Mesh
} from 'three';

export default class KaleidoBackground {

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
        this.originalOrientation = [ this.frameData.pose.orientation[0], this.frameData.pose.orientation[1], this.frameData.pose.orientation[2], this.frameData.pose.orientation[3] ] ;
        console.log("Using webvr-polyfill version " + WebVRPolyfill.version + " with configuration: " + JSON.stringify(config));

      } else {

        this.vrDisplay = false;

      }

    }.bind( this ))

  }

  enableParallax( speed ) {

    this.renderers.forEach( function ( renderer ) {

      let uniqueClass = Math.floor(Math.random() * 100000) + 1;
      uniqueClass = 'gyroCanvas-' + uniqueClass;
      renderer.domElement.classList.add( uniqueClass );

      let parallaxItem = new Relax( `.${uniqueClass}`, {
        speed: speed,
        center: true
      });

    });

  }

  orientationChange ( e ) {

    if ( window.innerHeight > window.innerWidth ) {
      this.orientation = 'portrait';
    } else {
      this.orientation = 'landscape';
    }

  }

  resize( e ) {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.squareMax = this.imageWidth < this.imageHeight ? this.imageWidth : this.imageHeight;

    this.targets.forEach( function ( target, i ) {

      let boundingRect = target.getBoundingClientRect();
      let w = boundingRect.width;
      let h = boundingRect.height;

      if ( w > h ) {
        this.squareMax = h < this.squareMax ? h : this.squareMax;
      } else {
        this.squareMax = w < this.squareMax ? w : this.squareMax;
      }

      target.children[0].style.height = h + 'px';
      target.children[0].style.width = w + 'px';

      this.renderers[i].setSize( w, h );

    }.bind( this ));

    this.dist = this.squareMax / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
    this.camera.position.z = this.dist;

    console.log( this.dist );

  }

  animate() {

    requestAnimationFrame( this.animate );

    this.vrDisplay.getFrameData( this.frameData );
    let orientation = this.frameData.pose.orientation;

    let x = this.originalOrientation[0] - orientation[0];
    let y = this.originalOrientation[1] - orientation[1];
    let z = this.originalOrientation[2] - orientation[2];

    this.camera.position.x = y * 100;
    this.camera.position.y = x * -100;
    this.camera.rotation.z = orientation[2];

    this.renderers.forEach(function ( renderer ) {
      renderer.render( this.scene, this.camera );
    }.bind( this ));

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

  generateRenderer( target ) {

    //Get Element height
    let boundingRect = target.getBoundingClientRect();
    let w = boundingRect.width;
    let h = boundingRect.height;

    if ( w > h ) {
      this.squareMax = h < this.squareMax ? h : this.squareMax;
    } else {
      this.squareMax = w < this.squareMax ? w : this.squareMax;
    }

    let renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor( 0x000000, 0 );
    renderer.setSize( w, h );

    let container = document.createElement('div');
    container.style.height = h + 'px';
    container.style.width = w + 'px';
    container.style.overflow = 'hidden';
    container.style.position = 'absolute';
    container.appendChild( renderer.domElement );
    target.prepend( container )

    return renderer;

  }

  constructor( target, imageSource, { sensitivity = 0.5, parallax = false, parallaxSpeed = -2 } = { sensitivity: 0.5, parallax: false, parallaxSpeed: -2 } ) {

    if ( !target ) {
      throw new Error('No target was specified.');
    }

    this.sensitivity = sensitivity;
    this.originalOrientation = [0, 0, 0];
    this.resize = this.resize.bind( this );
    this.enableAccelerometer = this.enableAccelerometer.bind( this );
    this.animate = this.animate.bind( this );
    this.enableParallax = this.enableParallax.bind( this );
    this.generateRenderer = this.generateRenderer.bind( this );
    this.getVisibleHeight = this.getVisibleHeight.bind( this );
    this.orientationChange = this.orientationChange.bind( this );

    this.renderers = [];

    if ( window.innerHeight > window.innerWidth ) {
      this.orientation = 'portrait';
    } else {
      this.orientation = 'landscape';
    }

    this.enableAccelerometer();

    this.loader = new TextureLoader();

    this.loader.load( imageSource, function ( texture ) {
      //onload

      this.material = new MeshBasicMaterial({ map: texture });
      this.imageWidth = texture.image.width;
      this.imageHeight = texture.image.height;

      //Wait for the page to finish loading so that we can find all the target elements
      window.onload = function () {

        this.targets = document.querySelectorAll( target );

        if ( !this.targets ) {
          throw new Error('Cound not find any taget elements with query: ' + target);
        }

        this.camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1500 );
        this.scene = new Scene();

        let g = new PlaneGeometry( this.imageWidth, this.imageHeight );
        this.imagePlane = new Mesh( g, this.material );
        this.scene.add( this.imagePlane );

        //
        this.squareMax = this.imageWidth < this.imageHeight ? this.imageWidth : this.imageHeight;

        //Generate renderers for each target
        this.targets.forEach( function ( target ) {

          let renderer = this.generateRenderer( target );
          this.renderers.push( renderer );

        }.bind( this ));

        //this.squareMax = this.imageWidth < this.imageHeight ? this.imageWidth : this.imageHeight;
        this.dist = this.squareMax / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
        this.camera.position.z = this.dist;

        if ( !this.vrDisplay && parallax ) {

          this.renderers.forEach(function ( renderer ) {
            renderer.render( this.scene, this.camera );
          }.bind( this ));

          this.enableParallax( parallaxSpeed );

        } else if ( this.vrDisplay ) {

          this.vrDisplay.getFrameData( this.frameData );
          let originalOrientation = this.frameData.pose.orientation;

          this.originalOrientation = [
            originalOrientation[0],
            originalOrientation[1],
            originalOrientation[2],
            originalOrientation[3]
          ]

          this.animate();

        }

      }.bind( this );

    }.bind( this ),
    //progress callback not yet supported
    undefined,
    function ( err ) {
      //onError

      console.error( err );
      throw new Error('failed to load image ' + imageSource);

    });

    window.addEventListener('resize', this.resize.bind( this ));
    window.addEventListener('orientationchange', this.orientationChange.bind( this ));

  }

}
