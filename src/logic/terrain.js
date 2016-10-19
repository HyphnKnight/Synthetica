import { times } from '../util/functional.js';

let
  scale = 10,
  variation = 200,
  xArray = times( scale, () => Math.pow( Math.floor( Math.random() * variation ) / scale, 2 ) / scale + 1 ),
  yArray = times( scale, () => Math.pow( Math.floor( Math.random() * variation ) / scale, 2 ) / scale + 1 ),
  zArray = times( scale, () => Math.pow( Math.floor( Math.random() * variation ) / scale, 2 ) / scale + 1 );

function trigCalc( val, intense ) {
  return ( Math.sin( val * intense ) / intense ) + ( Math.cos( val * intense ) / intense );
}

function heightCalculator( seed, number ) {
  return seed.reduce( ( prev, curr ) => prev + trigCalc( number, curr ), 0 ) / scale;
}

function hexHeightCalculator( hex ) {
  return ( heightCalculator( xArray, hex.pixel[0] ) + heightCalculator( yArray, hex.pixel[1] ) ) / 2
}

function pixelHeightCalculator( x, y ) {
  return ( heightCalculator( xArray, x ) + heightCalculator( yArray, y ) ) / 2
}

function vector3HeightCalculator( x, y, z ) {
  return ( heightCalculator( xArray, x ) + heightCalculator( yArray, y ) + heightCalculator( zArray, z ) ) / 3;
}

export {
  hexHeightCalculator,
  pixelHeightCalculator,
  vector3HeightCalculator
};
