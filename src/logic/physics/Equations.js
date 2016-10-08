import memoizeWithCache from '../../util/memoize.js';
import { fetchVector } from './Vector.js';

/* Utility Functions */
function lerp( start: number, change: number, percentage: number ): number {
  return start + change * percentage;
}

const
  sqr = ( x: number ) : number => Math.pow( x, 2 ),
  memoizedLerp = memoizeWithCache( lerp );

function lerpVector( x1: number, y1: number, x2: number, y2: number, timeStep: number ): array {
  return [ memoizedLerp( x1, x2, timeStep ), memoizedLerp( y1, y2, timeStep ) ];
}

function momentOfIntertia( position: Vector, point: Vector, mass: number ): number {
  return sqr( fetchVector().set( point ).subtract( position ).magnitude() ) * mass;
}

function momentVector( position: Vector, point: Vector ): Vector {
  return point.copy().subtract( position ).normal().normalize();
}

function velocityOfImpactPoint( angularVelocity: number, point: Vector, velocity: number ): Vector {
  return fetchVector().set( velocity ).add( { x: -angularVelocity * point.y, y: angularVelocity * point.x } );
}

function accelerationFromForce( mass: number, force: Vector ): Vector {
  return force.copy().scale( 1 / mass );
}

export {
  memoizedLerp as lerp,
  lerpVector,
  momentOfIntertia,
  momentVector,
  velocityOfImpactPoint,
  accelerationFromForce
};
