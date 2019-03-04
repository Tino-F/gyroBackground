export default function isWebGL2Available() {

  try {
    var canvas = document.createElement( 'canvas' );
    return !! ( window.WebGL2RenderingContext && canvas.getContext( 'webgl2' ) );
  } catch ( e ) {
    return false;
  }

}
