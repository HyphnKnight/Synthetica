//import THREE from 'three';

import {
  //colors,
  //materials,
  //scene,
  //camera,
  //renderer,
  //canvas
} from './3dBase.js';

import HexGrid from '../HexGrid/next.js';

import {
  times
} from '../util/functional.js';

import {
  hexToHex
} from './makeGeometry.js';

//import loop from '../loop.js';

//import { controlStatus } from '../controls.js'

function hexHeightCalculatorGenerator() {

  const
    qArray = times( 16, (): number => Math.floor( Math.random() * 100 ) ),
    rArray = times( 16, (): number => Math.floor( Math.random() * 100 ) );

  function trigCalc( val: number, intense: number ): number {
    return ( Math.sin( val * intense ) / intense ) + ( Math.cos( val * intense ) / intense );
  }

  function heightCalculator( posQ: number, posR: number ): number {

    const
      qHeight = qArray.reduce( ( prev: number, curr: number ): number => prev + trigCalc( posQ, curr ), 0 ) / 16,
      rHeight = rArray.reduce( ( prev: number, curr: number ): number => prev + trigCalc( posR, curr ), 0 ) / 16;

    return ( qHeight + rHeight ) / 2;

  }

  return function hexHeightCalculator( hex ) {
    return heightCalculator( hex.q, hex.r );
  }

}

const HexMap = new HexGrid( 14, ( hex ) => ( {

} ) );
