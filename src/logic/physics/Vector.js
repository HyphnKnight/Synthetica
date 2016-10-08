import memoizeWithCache from '../../util/memoize.js';

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
  return [ lerp( x1, x2, delta) , lerp( y1, y2, delta) ];
}

function vectorMagnitudeSqr( x: number, y: number ): Array<number> {
  return sqr( x ) + sqr( y );
}

function magnitudeOfVector( x: number, y: number ): Array<number> {
  return Math.sqrt( sqr( x ) + sqr( y ) );
}

function normalizeVector( x: number, y: number ): Array<number> {
  return x === 0 && y === 0 ? [ 0, 1 ] : scaleVector( x, y, 1 / magnitudeOfVector( x, y ) );
}

function normalVector( x: number, y: number ): Array<number> {
  return [ -y, x ];
}

function component( x1: number, y1: number, x2: number, y2: number ): number {
  return magnitudeOfVector( x1, y1 ) * Math.cos( Math.atan( y1, x1 ) - Math.atan( y2, x2 ) );
}

function componentVector( x1: number, y1: number, x2: number, y2: number ): Array<number> {
  return scaleVector.apply( null, normalVector( x1, y1 ).concat( [ component( x1, y1, x2, y2 ) ] ) )
}

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

/* Memoized Vector Math Library */

const VecMath = {
  add: memoizeWithCache( addVectors ),
  subtract: memoizeWithCache( subtractVectors ),
  scale: memoizeWithCache( scaleVector ),
  lerp: memoizeWithCache( lerpVector ),
  magnitude: memoizeWithCache( magnitudeOfVector ),
  normalize: memoizeWithCache( normalizeVector ),
  normal: memoizeWithCache( normalVector ),
  componentVector: memoizeWithCache( componentVector ),
  dotProduct: memoizeWithCache( dotProduct ),
  crossProduct: memoizeWithCache( crossProduct ),
  rotate: memoizeWithCache( rotateVector )
};

/* Vector Definition */

function Vector( x, y ) {

  this.x = x || 0;
  this.y = y || 0;

}

Vector.prototype.type = 'Vector';

Vector.prototype.add = function vectorAdd( vector ) {
  return setVector( this, VecMath.add( this.x, this.y, vector.x, vector.y ) );
};

Vector.prototype.subtract = function vectorSubtract( vector ) {
  return setVector( this, VecMath.subtract( this.x, this.y, vector.x, vector.y ) );
};

Vector.prototype.magnitude = function vectorMagnitude() {
  return VecMath.magnitude( this.x, this.y );
};

Vector.prototype.scale = function vectorScale( scale ) {
  return setVector( this, VecMath.scale( this.x, this.y, scale ) );
};

Vector.prototype.lerp = function vectorLerp( vector, delta ) {
  return setVector( this, VecMath.lerp( this.x, this.y, vector.x, vector.y, delta ) );
};

Vector.prototype.normalize = function vectorNormalize() {
  return setVector( this, VecMath.normalize( this.x, this.y ) );
};

Vector.prototype.normal = function vectorNormal() {
  return setVector( this, VecMath.normal( this.x, this.y ) );
};

Vector.prototype.dotProduct = function vectorDotProduct( vector ) {
  return VecMath.dotProduct( this.x, this.y, vector.x, vector.y );
};

Vector.prototype.crossProduct = function vectorCrossProduct( vector ) {
  return VecMath.crossProduct( this.x, this.y, vector.x, vector.y );
};

Vector.prototype.rotate = function vectorRotate( rotation ) {
  return setVector( this, VecMath.rotate( this.x, this.y, rotation ) );
};

Vector.prototype.scaleTo = function vectorScaleTo( length ) {
  return setVector( this, VecMath.scale.apply( null, VecMath.normalize( this.x, this.y ).concat( [ length ] ) ) );
};

Vector.prototype.set = function vectorSet( xy ) {
  return setVector( this, ( xy.type === 'Vector' ? [ xy.x, xy.y ] : xy ) );
};

Vector.prototype.toArray = function vectorToArray() {
  return [ this.x, this.y ];
};

Vector.prototype.zero = function vectorZero() {

  this.x = 0;
  this.y = 0;

  return this;
};

Vector.prototype.copy = function vectorCopy() {

  return fetchVector( this.x, this.y );
};

/* Vector Cache */

let
  vectorCache = [],
  cacheLimit = 300;

function fetchVector( x, y ) {
  if ( !vectorCache.length ) {
    return new Vector( x, y );
  } else {
    return vectorCache.pop().set( [ x, y ] );
  }
}

function releaseVector( vec ) {
  vectorCache.push( vec.zero() );

  while ( vectorCache.length > 300 ) {

  }

  return vectorCache.length;

}

function changeVectorCacheLimit( num ) {
  cacheLimit = num;
}

export { fetchVector, releaseVector, changeVectorCacheLimit };
