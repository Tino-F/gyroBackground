/*

Here are some of the options I plan on including:

Sensitivity

*/

import WebVRPolyfill from 'webvr-polyfill';
import Relax from 'rellax';


export default class KaleidoBackground {

  drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY, scale) {

    if (arguments.length === 2) {
        x = y = 0;
        w = ctx.canvas.width;
        h = ctx.canvas.height;
    }

    scale = typeof scale === "number" ? scale : 1;

    // default offset is center
    offsetX = typeof offsetX === "number" ? offsetX : 0.5;
    offsetY = typeof offsetY === "number" ? offsetY : 0.5;

    // keep bounds [0.0, 1.0]
    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    var iw = img.width,
        ih = img.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r,   // new prop. width
        nh = ih * r,   // new prop. height
        cx, cy, cw, ch, ar = 1;

    // decide which gap to fill
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
    nw *= ar;
    nh *= ar;

    // calc source rectangle
    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    // make sure source rectangle is valid
    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    // fill image in dest. rectangle
    ctx.drawImage(img, cx, cy, cw, ch,  x, y, w, h);
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
        this.originalOrientation = [ this.frameData.pose.orientation[0], this.frameData.pose.orientation[1], this.frameData.pose.orientation[2], this.frameData.pose.orientation[3] ] ;
        console.log("Using webvr-polyfill version " + WebVRPolyfill.version + " with configuration: " + JSON.stringify(config));

      } else {

        this.vrDisplay = false;

      }

    }.bind( this ))

  }

  enableParallax( target ) {

    let parallaxItem = new Relax( `.${this.canvasClass}`, {

    });

  }

  resize( e ) {

    this.targets.forEach( function( targetEl, i ) {

      let boundingRect = targetEl.getBoundingClientRect();
      let height = boundingRect.height;
      let width = boundingRect.width

      //console.log(`width: ${width}, height: ${height}`);

      this.ctxArray[i].height = height;
      this.ctxArray[i].width = width;

      this.containerArray[i].style.height = height;
      this.containerArray[i].style.width = width;

      this.containerArray[i].children[0].height = height;
      this.containerArray[i].children[0].width = width;

    }.bind( this ));

  }

  animate() {

    requestAnimationFrame( this.animate );

    this.vrDisplay.getFrameData( this.frameData );
    let orientation = this.frameData.pose.orientation;
    let x = ( this.originalOrientation[1] - orientation[1] ) * this.sensitivity * this.scaleConstant;
    let y = ( this.originalOrientation[0] - orientation[0] ) * this.sensitivity * this.scaleConstant;

    this.ctxArray.forEach(function( el ) {

      this.drawImageProp( el.ctx, this.image, x, y, el.width, el.height )

    }.bind( this ));

  }

  constructor( target, imageSource, { sensitivity = 0.5, parallax = false } = { sensitivity: 1, parallax: false } ) {

    if ( !target ) {
      throw new Error('No target was specified.');
    }

    this.sensitivity = sensitivity;
    this.scaleConstant = 200;
    this.originalOrientation = [0, 0, 0];
    this.resize = this.resize.bind( this );
    this.enableAccelerometer = this.enableAccelerometer.bind( this );
    this.animate = this.animate.bind( this );
    this.enableParallax = this.enableParallax.bind( this );

    this.enableAccelerometer();

    this.image = document.createElement('img');
    this.image.setAttribute('src', imageSource);
    this.ctxArray = [];
    this.containerArray = []

    window.onload = function () {

      this.targets = document.querySelectorAll( target );

      if ( !this.targets ) {
        throw new Error('Cound not find any taget elements with query: ' + target);
      }

      this.targets.forEach( function( targetEl ) {

        //Get Element height
        let boundingRect = targetEl.getBoundingClientRect();
        let height = boundingRect.height;
        let width = boundingRect.width;

        //Create and size canvas
        let canvas = document.createElement('canvas');

        //Create unique class name (used for Rellax.js)
        this.canvasClass = Math.floor(Math.random() * 100000) + 1;
        this.canvasClass = 'gyroCanvas-' + this.canvasClass;
        canvas.classList.add( this.canvasClass );

        canvas.width = width;
        canvas.height = height;
        let ctx = canvas.getContext('2d');

        //Create div container for canvas so that 3D CSS scaling can be taken advantage of

        let container = document.createElement('div');
        container.className = 'gyro-container';
        container.style.position = 'absolute';
        container.style.zIndex = -1;
        container.style.overflow = 'hidden';
        container.width = width;
        container.height = height;

        container.append( canvas );
        this.containerArray.push( container );

        //Draw Image if the source is valid
        try {
          this.drawImageProp( ctx, this.image, 0, 0, width, height )
        } catch ( err ) {
          throw new Error('Unable to draw selected Image, please check the image source.');
        }

        this.ctxArray.push( {
          ctx: ctx,
          width: width,
          height: height,
          scale: 1 + ( this.sensitivity * 0.1 )
        } );

        targetEl.prepend( container );

      }.bind( this ));

      if ( !this.vrDisplay && parallax ) {

        this.enableParallax( target );

      } else {

        this.containerArray.forEach(function ( container ) {

          container.children[0].style.transform = `scale(${ 1 + ( this.sensitivity * 0.8 ) })`;

        }.bind( this ));

        this.vrDisplay.getFrameData( this.frameData );
        this.originalOrientation = [ this.frameData.pose.orientation[0], this.frameData.pose.orientation[1], this.frameData.pose.orientation[2], this.frameData.pose.orientation[3] ] ;
        this.animate();

      }

    }.bind( this );

    window.addEventListener('resize', this.resize)

  }

}
