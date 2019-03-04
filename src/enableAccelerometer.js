import WebVRPolyfill from 'webvr-polyfill';

export default function enableAccelerometer() {

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
      //console.log("Using webvr-polyfill version " + WebVRPolyfill.version + " with configuration: " + JSON.stringify(config));

    } else {

      this.vrDisplay = false;

    }

  }.bind( this ))

}
