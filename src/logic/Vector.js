import {
  isNumber,
  isArray
} from '../util/functional';

/* Math Utility */

function sqr( x: number ): number {
  return Math.pow( x, 2 );
}

function safeRound( num: number ): number {
  return Math.round( num * 1000000 ) / 1000000;
}

function lerp( start: number, end: number, delta: number ): number {
  return start + ( end - start ) * delta;
}

/* Vector Mathematics */

function addVectors( x1: number, y1: number, x2: number, y2: number ): Array<number> {
  return [ x1 + x2, y1 + y2 ];
}

function subtractVectors( x1: number, y1: number, x2: number, y2: number ): Array<number> {
  return [ x1 - x2, y1 - y2 ];
}

function scaleVector( x: number, y: number, scale: number ): Array<number> {
  return [ x * scale, y * scale ];
}

function lerpVector( x1: number, y1: number, x2: number, y2: number, delta: number ): Array<number> {
  return [ lerp( x1, x2, delta ), lerp( y1, y2, delta ) ];
}

function magnitudeOfVectorSqr( x: number, y: number ): number {
  return sqr( x ) + sqr( y );
}

function magnitudeOfVector( x: number, y: number ): number {
  return Math.sqrt( magnitudeOfVectorSqr( x, y ) );
}

function normalizeVector( x: number, y: number ): Array<number> {
  return x === 0 && y === 0 ? [ 0, 1 ] : scaleVector( x, y, 1 / magnitudeOfVector( x, y ) );
}

function normalVector( x: number, y: number ): Array<number> {
  return [ -y, x ];
}

/*
function component( x1: number, y1: number, x2: number, y2: number ): number {
  return magnitudeOfVector( x1, y1 ) * Math.cos( Math.atan( y1, x1 ) - Math.atan( y2, x2 ) );
}

function componentVector( x1: number, y1: number, x2: number, y2: number ): Array<number> {
  return scaleVector.apply( null, normalVector( x1, y1 ).concat( [ component( x1, y1, x2, y2 ) ] ) )
}
*/

function dotProduct( x1: number, y1: number, x2: number, y2: number ): number {
  return x1 * x2 + y1 * y2;
}

function crossProduct( x1: number, y1: number, x2: number, y2: number ): number {
  return x1 * x2 - y1 * y2;
}

function rotateVector( x: number, y: number, rotation: number ): Array<number> {

  const
    s = Math.sin( rotation ),
    c = Math.cos( rotation );

  return [ safeRound( x * c - y * s ), safeRound( x * s + y * c ) ];
}

/* Vector Utilities */

function setVector( vector: Vector, xy: Array<number> ): Vector {

  vector.x = xy[ 0 ];
  vector.y = xy[ 1 ];

  return vector;
}

function createVector( vector: Vector, xy: Array<number> ): Vector {
  return new Vector( xy[ 0 ], xy[ 1 ] );
}

/* Vector Definition */

class Vector {
  constructor( ...args ) {

    this.data = [ 0, 0 ];
    this.type = 'Vector';

    this.set( ...args );

  }

  get x() {
    return this.data[ 0 ];
  }

  set x( value ) {
    this.data[ 0 ] = value;
  }

  get y() {
    return this.data[ 1 ];
  }

  set y( value ) {
    this.data[ 1 ] = value;
  }

  add( vector ) {
    this.data = addVectors( this.data[ 0 ], this.data[ 1 ], vector.data[ 0 ], vector.data[ 1 ] );
    return this;
  }

  sub( vector ) {
    this.data = subtractVectors( this.data[ 0 ], this.data[ 1 ], vector.data[ 0 ], vector.data[ 1 ] );
    return this;
  }

  magnitudeSqr() {
    return magnitudeOfVectorSqr( this.data[ 0 ], this.data[ 1 ] );
  }

  magnitude() {
    return magnitudeOfVector( this.data[ 0 ], this.data[ 1 ] );
  }

  scale( scale ) {
    this.data = scaleVector( this.data[ 0 ], this.data[ 1 ], scale );
    return this;
  }

  lerp( vector, delta ) {
    this.data = lerpVector( this.data[ 0 ], this.data[ 1 ], vector.data[ 0 ], vector.data[ 1 ], delta );
    return this;
  }

  normalize() {
    this.data = normalizeVector( this.data[ 0 ], this.data[ 1 ] );
    return this;
  }

  normal() {
    this.data = normalVector( this.data[ 0 ], this.data[ 1 ] );
    return this;
  }

  dotProduct( vector ) {
    return dotProduct( this.data[ 0 ], this.data[ 1 ], vector.data[ 0 ], vector.data[ 1 ] );
  }

  crossProduct( vector ) {
    return crossProduct( this.data[ 0 ], this.data[ 1 ], vector.data[ 0 ], vector.data[ 1 ] );
  }

  rotate( rotation ) {
    this.data = rotateVector( this.data[ 0 ], this.data[ 1 ], rotation );
    return this;
  }

  scaleTo( length ) {
    return this.normalize().scale( length );
  }

  set( x, y ) {
    if ( isNumber( x ) && isNumber( y ) ) {
      this.data = [ x, y ];
    } else if ( isArray( x ) && isNumber( x[ 0 ] ) && isNumber( x[ 1 ] ) ) {
      this.data = [ x[ 0 ], x[ 1 ] ];
    } else if ( isNumber( x.x ) && isNumber( x.y ) ) {
      this.data = [ x.x, x.y ];
    } else {
      throw 'Vector - invalid parameters passed to Vector.set';
    }
    return this;
  }

  zero() {
    this.data = [ 0, 0 ];
    return this;
  }

  copy() {
    return new Vector( this.data[ 0 ], this.data[ 1 ] );
  }

}

/* Vector Cache */

let
  vectorCache = [],
  cacheLimit = 300;

function fetchVector( x, y ) {
  if ( !vectorCache.length ) {
    return new Vector( x, y );
  } else {
    return vectorCache.pop().set( x, y );
  }
}

function releaseVector( ...vectors ) {

  vectors.forEach( vec => vectorCache.push( vec.zero() ) );

  while ( vectorCache.length > 300 ) {
    vectorCache.pop();
  }

  return vectorCache.length;

}

function changeVectorCacheLimit( num ) {
  cacheLimit = num;
}

export { fetchVector, releaseVector, changeVectorCacheLimit };
