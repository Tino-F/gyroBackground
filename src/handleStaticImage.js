const { LinearFilter } = require('three/src/constants');
const { TextureLoader } = require('three/src/loaders/TextureLoader');

export default function handleStaticImage( imageSource, cb ) {

  let loader = new TextureLoader();

  loader.load( imageSource, function ( texture ) {
    //onload

    texture.minFilter = LinearFilter;
    this.imageWidth = texture.image.width;
    this.imageHeight = texture.image.height;

    //Determine image orientation
    if ( this.imageHeight > this.imageWidth ) {
      this.imageOrientation = 'portrait';
    } else if ( this.imageWidth === this.imageHeight ) {
      this.imageOrientation = 'square';
    } else {
      this.imageOrientation = 'landscape';
    }

    cb( texture );

  }.bind( this ),
  //progress callback not yet supported
  undefined,
  function ( err ) {
    //onError

    console.error( err );
    throw new Error('failed to load image ' + imageSource);

  });

}
