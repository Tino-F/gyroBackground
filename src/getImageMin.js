export default function getImageMinSize() {

  let imageAspect = this.imageWidth / this.imageHeight;
  let containerAspect = this.w / this.h;

  if ( this.imageOrientation === 'portrait' ) {

    if ( this.h > this.w ) {
      //Contaer is in portrait mode

      if ( imageAspect < containerAspect ) {
        //Image is taller than container
        return this.imageWidth;

      } else {

        return this.imageHeight

      }

    } else {
      //Contanier is in landscape mode or square

      return this.imageWidth / containerAspect;

    }

  } else if ( this.imageOrientation === 'landscape' ) {

    let imageHeight = this.w / imageAspect;

    if ( imageHeight > this.h ) {

      return this.h;

    } else {

      return this.imageHeight;

    }

  } else {
    //Image orientation is square

    let imageWidth = this.h * imageAspect;

    if ( this.w > this.h ) {
      //Container orientation is landscape

      return this.h;

    } else {

      return this.h

    }

  }

}
