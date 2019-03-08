import Rellax from 'rellax';

export default function enableParallax( className, speed ) {

  let parallaxItem = new Rellax( `.${className}`, {
    speed: speed,
    center: true
  });

  this.ready();

}
