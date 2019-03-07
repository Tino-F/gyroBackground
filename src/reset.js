//Reset the phone's original orientation value
const { Quaternion } = require('three/src/math/Quaternion');

export default function reset() {

  this.vrDisplay.getFrameData( this.frameData );
  this.originalQ = new Quaternion( ...this.frameData.pose.orientation );
  this.phoneContainer.setRotationFromQuaternion( this.originalQ );

}
