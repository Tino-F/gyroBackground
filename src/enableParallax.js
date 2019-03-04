import Relax from 'rellax';

export default function enableParallax( className, speed ) {

  let parallaxItem = new Relax( `.${className}`, {
    speed: speed,
    center: true
  });

}
