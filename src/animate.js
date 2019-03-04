/**
TODO: Use slerp to calculate the distance between the starting Quaternion and
  the current quaternion.
**/

export default function animate () {

  this.vrDisplay.requestAnimationFrame( this.animate );

  this.vrDisplay.getFrameData( this.frameData );
  let orientation = [ ...this.frameData.pose.orientation ].map(x => x / 6.28);
  orientation[3] = 1;

  this.q.set( ...orientation ).normalize();
  this.phone.setRotationFromQuaternion( this.q );

  this.targetVector.copy( this.targetPosition.position );
  this.targetPosition.localToWorld( this.targetVector );
  this.phoneContainer.worldToLocal( this.targetVector );

  if( this.animateGraph ) {

    this.animateGraph();

  } else {

    this.camera.position.x = ( this.targetVector.x * this.freedom ) * this.yInverse;
    this.camera.position.y = ( this.targetVector.y * this.freedom ) * this.yInverse;
    this.camera.rotation.z = orientation[2] * ( -0.4 * this.sensitivity/10 );

  }

  this.renderer.render( this.scene, this.camera );

}
