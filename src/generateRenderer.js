import { WebGLRenderer } from 'three';
import isWebGL2Available from './isWebGL2Available';

export default function generateRenderer() {
  let renderer;

  if ( isWebGL2Available() ) {
    //Use WebGL2

    let canvas = document.createElement( 'canvas' );
    let context = canvas.getContext( 'webgl2' );
    renderer = new WebGLRenderer({ canvas: canvas, context: context, antialias: true, alpha: true });

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

  //Make sure the zIndex of all the children are at least 1

  for ( let i = 0; i < this.target.children.length; i++ ) {
    let child = this.target.children[i];
    if ( child.style.zIndex == 0 || !child.style.zIndex ) {
      child.style.zIndex = 1;
    }
  }

  this.target.prepend( container )

  return renderer;
}
