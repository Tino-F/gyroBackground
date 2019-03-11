const { PlaneGeometry } = require('three/src/geometries/PlaneGeometry');
const { Mesh } = require('three/src/objects/Mesh');
const { MeshBasicMaterial } = require('three/src/materials/MeshBasicMaterial');
const { Vector3 } = require('three/src/math/Vector3');
const { Scene } = require('three/src/scenes/Scene');
const { Quaternion } = require('three/src/math/Quaternion');
const { PerspectiveCamera } = require('three/src/cameras/PerspectiveCamera');
const { Object3D } = require('three/src/core/Object3D');

const Rellax = require('rellax');

import handleStaticImage from './handleStaticImage';
import getImageMinSize from './getImageMin';
import generateRenderer from './generateRenderer';

export default class additionalBackground {

  animate( zRotation ) {

    this.camera.position.x = ( this.backgroundObject.targetVector.x * this.freedom ) * this.yInverse;
    this.camera.position.y = ( this.backgroundObject.targetVector.y * this.freedom ) * this.yInverse;
    this.camera.rotation.z = zRotation * ( -0.4 * this.sensitivity/10 );
    this.renderer.render( this.scene, this.camera );

  }

  resize3D() {

    this.sensitivity = this.backgroundObject.phoneOrientation === 'landscape' ? this.landscapeSensitivity : this.portraitSensitivity;
    this.zoom = this.backgroundObject.phoneOrientation === 'landscape' ? this.landscapeZoom : this.portraitZoom;
    this.offsetX = this.backgroundObject.phoneOrientation === 'landscape' ? this.landscapeOffsetX : this.portraitOffsetX;
    this.offsetY = this.backgroundObject.phoneOrientation === 'landscape' ? this.landscapeOffsetY : this.portraitOffsetY;

    this.imagePlane.position.x = parseInt(this.offsetX);
    this.imagePlane.position.y = parseInt(this.offsetY);

    this.rendererContainer.style.height = this.backgroundObject.h + 'px';
    this.rendererContainer.style.width = this.backgroundObject.w + 'px';

    this.camera.aspect = this.backgroundObject.w / this.backgroundObject.h;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( this.backgroundObject.w, this.backgroundObject.h );

    this.imageMinSize = this.getImageMinSize();
    this.freedom = Math.floor( this.imageMinSize / 2 ) * ( this.sensitivity / 10 );
    this.dist = ( this.imageMinSize - ( this.freedom * 2 ) ) / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
    this.camera.position.z = this.dist;
    this.camera.position.z -= this.zoom;

  }

  orderZ() {
    let length = this.backgroundObject.additionalBackgrounds.length;
    this.backgroundObject.container.style.zIndex = -length - 2;
    this.container.style.zIndex = -1;

    this.backgroundObject.additionalBackgrounds.forEach( ( b, i ) => {
      b.container.style.zIndex = ( i - length ) - 1
    });
  }

  resizeParallax( h, vm ) {
    this.container.style.top = -vm + 'px';
    this.container.style.height = h + 'px';
    this.container.style.width = this.backgroundObject.w + 'px';
    this.orderZ();
  }

  initParallax( imageSource, speed ) {

    let uniqueClass = Math.floor(Math.random() * 100000) + 1;
    uniqueClass = 'gyroCanvas-' + uniqueClass;
    this.container = document.createElement('div');
    this.container.classList.add( uniqueClass );
    this.container.style.height = this.backgroundObject.h + 'px';
    this.container.style.width = this.backgroundObject.w + 'px';
    this.container.style.overflow = 'hidden';
    this.container.style.position = 'absolute';
    this.container.style.backgroundSize = 'cover';
    this.container.style.backgroundPosition = 'center';
    this.container.style.backgroundImage = `url(${imageSource})`;

    if ( this.className ) {
      this.container.classList.add( this.className );
    }

    this.orderZ();

    this.target.prepend( this.container );

    let parallaxItem = new Rellax( `.${uniqueClass}`, {
      speed: speed,
      center: true
    });

  }

  init3D( texture ) {

    this.camera = new PerspectiveCamera( 75, this.backgroundObject.w / this.backgroundObject.h, 0.1, 3000 );
    this.scene = new Scene();
    this.renderer = this.generateRenderer();
    this.renderer.setSize( this.backgroundObject.w, this.backgroundObject.h );
    this.imageMinSize = this.getImageMinSize();

    let length = this.backgroundObject.additionalBackgrounds.length;
    this.backgroundObject.rendererContainer.style.zIndex = -length - 2;
    this.rendererContainer.style.zIndex = -1;

    this.backgroundObject.additionalBackgrounds.forEach( ( b, i ) => {
      b.rendererContainer.style.zIndex = ( i - length ) - 1
    });

    texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    this.material = new MeshBasicMaterial({ map: texture, transparent: true });
    let g = new PlaneGeometry( this.imageWidth, this.imageHeight );
    this.imagePlane = new Mesh( g, this.material );
    this.imagePlane.position.x = parseInt(this.offsetX);
    this.imagePlane.position.y = parseInt(this.offsetY);

    this.scene.add( this.imagePlane );

    //Calculate how much space the plane needs to move based on sensitivity
    this.freedom = Math.floor( this.imageMinSize / 2 ) * ( this.sensitivity / 10 );
    this.zoom = this.backgroundObject.phoneOrientation === 'landscape' ? this.landscapeZoom : this.portraitZoom;

    //Calculate the distance the camera needs to be from the image in order to be fill the screen
    this.dist = ( this.imageMinSize - ( this.freedom * 2 ) ) / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
    this.camera.position.z = this.dist;
    this.camera.position.z -= this.zoom;

    //Create a element to keep track of the phone's original orientation
    this.phoneContainer = new Object3D();
    this.phoneContainer.setRotationFromQuaternion( this.backgroundObject.originalQ );

    this.phone = new Object3D();
    this.phone.position.set( 0, 0, 0 );
    this.phone.setRotationFromQuaternion( this.backgroundObject.q );

    this.targetPosition = new Object3D();
    this.targetPosition.position.set( 0, 0, -1 );

    this.targetVector = new Vector3();

    this.phoneContainer.add( this.phone );
    this.phone.add( this.targetPosition );
    this.scene.add( this.phone );
  }

  handleStaticImage( imageSource, cb ) { handleStaticImage.call( this, imageSource, cb ); }
  getImageMinSize() { return getImageMinSize.apply( this ); }
  generateRenderer() { return generateRenderer.apply( this ); }

  constructor ( backgroundObject, imageSource, {
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
    landscapeOffsetY,
    visualize = false,
    className = false
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
     landscapeOffsetY,
     visualize: false,
     className: false
   } ) {

     this.initParallax = this.initParallax.bind( this );
     this.resizeParallax = this.resizeParallax.bind( this );
     this.init3D = this.init3D.bind( this );
     this.resize3D = this.resize3D.bind( this );
     this.animate = this.animate.bind( this );
     this.handleStaticImage = this.handleStaticImage.bind( this );
     this.getImageMinSize = this.getImageMinSize.bind( this );
     this.generateRenderer = this.generateRenderer.bind( this );
     this.orderZ = this.orderZ.bind( this );

     if ( !imageSource || typeof(imageSource) !== 'string' ) {
       throw new Error('No image was chosen.');
     }

     this.backgroundObject = backgroundObject;
     this.className = className;

     this.yInverse = this.backgroundObject.isIOS ? -1 : 1;
     this.yInverse *= inverted ? -1 : 1;

     this.landscapeOffsetX = typeof(landscapeOffsetX) === 'undefined' ? offsetX : landscapeOffsetX;
     this.landscapeOffsetY = typeof(landscapeOffsetY) === 'undefined' ? offsetY : landscapeOffsetY;

     this.portraitOffsetX = typeof(portraitOffsetX) === 'undefined' ? offsetX : portraitOffsetX;
     this.portraitOffsetY = typeof(portraitOffsetY) === 'undefined' ? offsetY : portraitOffsetY;

     this.offsetX = this.backgroundObject.phoneOrientation === 'landscape' ? this.landscapeOffsetX : this.portraitOffsetX;
     this.offsetY = this.backgroundObject.phoneOrientation === 'landscape' ? this.landscapeOffsetY : this.portraitOffsetY;

     this.portraitSensitivity = typeof(portraitSensitivity) === 'undefined' ? sensitivity : portraitSensitivity;
     this.landscapeSensitivity = typeof(landscapeSensitivity) === 'undefined' ? sensitivity : landscapeSensitivity;
     this.sensitivity = this.backgroundObject.phoneOrientation === 'landscape' ? this.landscapeSensitivity : this.portraitSensitivity;

     this.target = this.backgroundObject.target;

     let fileTypeRegex = /\.[0-9a-z]+$/i;
     this.fileType = fileTypeRegex.exec( imageSource )[0];

     if ( this.fileType === '.gif' ) {
       //User selected a gif
       //replace handleStaticImage witha function to handle video/gif loading
       this.loader = this.handleStaticImage.bind( this );
     } else {
       this.loader = this.handleStaticImage.bind( this );
     }

     if ( this.backgroundObject.vrDisplay ) {
       // Enable 3D Scene

       let imageAspect = this.backgroundObject.h / this.backgroundObject.w;

       this.portraitZoom = typeof(portraitZoom) === 'undefined' ? zoom : portraitZoom;
       this.landscapeZoom = typeof(landscapeZoom) === 'undefined' ? ( this.backgroundObject.phoneOrientation === 'landscape' ? zoom * imageAspect : zoom ) : landscapeZoom;

       this.loader( imageSource, function( texture ) {

         this.init3D( texture );

         if( this.backgroundObject.isIOS ) {

           if ( parseInt( this.originalQ._x.toFixed() ) === -0 ) {
             this.yInverse *= -1
           }

         }

       }.bind( this ));
     } else {
       if ( this.backgroundObject.container ) {
         // Enable Parallax

         this.initParallax( imageSource, parallaxSpeed );

       } else {
         //Just a regular background image

         this.target.style.backgroundImage = `url(${imageSource}), ${this.target.style.backgroundImage}`;
         if ( this.className ) {
           this.target.classList.add( this.className );
         }

       }
     }

   }

}
