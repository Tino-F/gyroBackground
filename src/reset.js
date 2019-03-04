//Reset the phone's original orientation value

export default function reset() {

  this.vrDisplay.getFrameData( this.frameData );
  this.originalQ = new Quaternion( ...this.frameData.pose.orientation );
  this.phoneContainer.setRotationFromQuaternion( this.originalQ );

}
