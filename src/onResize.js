export default function onResize () {

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

  this.rendererContainer.style.height = this.h + 'px';
  this.rendererContainer.style.width = this.w + 'px';

  this.camera.aspect = this.w / this.h;
  this.camera.updateProjectionMatrix();

  this.renderer.setSize( this.w, this.h );

  this.additionalBackgrounds.forEach( b => b.resize3D() );

  this.imageMinSize = this.getImageMinSize();
  this.freedom = Math.floor( this.imageMinSize / 2 ) * ( this.sensitivity / 10 );
  this.dist = ( this.imageMinSize - ( this.freedom * 2 ) ) / ( 2 * Math.tan( this.camera.fov * Math.PI / 360 ) );
  this.camera.position.z = this.dist;
  this.camera.position.z -= this.zoom;

  this.renderer.render( this.scene, this.camera );

}
