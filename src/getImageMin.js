export default function getImageMinSize() {

  let imageAspect = this.imageWidth / this.imageHeight;
  let height = this.backgroundObject ? this.backgroundObject.h : this.h;
  let width = this.backgroundObject ? this.backgroundObject.w : this.w;
  let containerAspect = width / height;

  if ( this.imageOrientation === 'portrait' ) {

    if ( height > width ) {
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

    let imageHeight = width / imageAspect;

    if ( imageHeight > height ) {

      return height;

    } else {

      return this.imageHeight;

    }

  } else {
    //Image orientation is square

    let imageWidth = height * imageAspect;

    if ( width > height ) {
      //Container orientation is landscape

      return height;

    } else {

      return height

    }

  }

}
