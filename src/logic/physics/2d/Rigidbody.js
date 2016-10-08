import { fetchVector, releaseVector } from '../Vector.js';
import { lerp, lerpVector } from '../Equations.js'

const
  descendingSort = ( a, b ) => b - a,
  PI2 = Math.PI * 2;

function createRigidbody( options = {} ) {

  const rigidbody = Store( {
    
  } );

}

function Rigidbody( x, y, rotation, geometries, options ) {

  this.position = fetchVector( x, y );

  this.rotation = rotation || 0;

  const origin = geometries.reduce( ( sum, current ) => sum.add( current.position ), fetchVector() ).scale( 1 / geometries.length );

  this.geometries = geometries;

  this.geometries.forEach( geometry => {
    geometry.position.subtract( origin );
    geometry.parent = this;
  } );

  this.mass = options.mass || 1;
  this.elasticity = options.elasticity || 1;

  this.fixed = !!options.fixed;

  this.collided = false;

  this.velocity = options.velocity || fetchVector();
  this.acceleration = options.acceleration || fetchVector();
  this.terminalVelocity = options.terminalVelocity || 99;
  this.displacement = fetchVector();

  this.velocityMagnitude = 0;

  this.angularVelocity = options.angularVelocity || 0;
  this.angularAcceleration = options.angularAcceleration || 0;
  this.terminalAngularVelocity = options.terminalAngularVelocity || Math.PI * 2;
  this.angularDisplacement = 0;

  this.boundingRadius = 0;
  this.boundingMovementRadius = 0;

  this.calculateBoundingCircle();

}

Rigidbody.prototype.preCollisionCalculations = function( timeStep ) {

  this.displacement = this.displacement.set( this.velocity ).scale( timeStep );

  this.angularDisplacement = this.angularVelocity * timeStep;

  this.velocityMagnitude = this.velocity.magnitude();

  this.boundingMovementRadius = this.boundingRadius + this.velocity.magnitude();

  return this;

};

Rigidbody.prototype.asleep = function() {

  return this.velocity.magnitude() === 0;

};

Rigidbody.prototype.calculateBoundingCircle = function() {

  this.boundingRadius = this.geometries.map( geometry => geometry.farthestPoint().magnitude() ).sort( descendingSort )[ 0 ];

  return this;

};

Rigidbody.prototype.calculateBoundingMovementCircle = function() {

  this.boundingMovementRadius = this.boundingRadius + this.velocity.magnitude();

  return this;

};

Rigidbody.prototype.calculatePosition = function( timeSection ) {

  this.position.set( lerpVector( this.position.x, this.position.y, this.displacement.x, this.displacement.y, timeSection ) );

  return this;

};

Rigidbody.prototype.calculateVelocity = function( timeStep ) {

  this.velocity.set( lerpVector( this.velocity.x, this.velocity.y, this.acceleration.x, this.acceleration.y, timeStep ) );

  if ( this.velocity.magnitude() > this.terminalVelocity ) {

    this.velocity.scaleTo( this.terminalVelocity );

  }

  return this;

};

Rigidbody.prototype.calculateAngularPosition = function( timeSection ) {

  this.rotation = lerp( this.rotation, this.angularDisplacement, timeSection ) / PI2;

  return this;

};

Rigidbody.prototype.calculateAngularVelocity = function( timeStep ) {

  this.angularVelocity = lerp( this.angularVelocity, this.angularAcceleration, timeStep ) / PI2;

  if ( Math.abs( this.angularVelocity ) > this.terminalAngularVelocity ) {

    this.angularVelocity = ( this.angularVelocity / Math.abs( this.angularVelocity ) ) * this.terminalAngularVelocity;

  }

  return this;

};

Rigidbody.prototype.accelerate = function( timeStep ) {

  this.calculateVelocity( timeStep );
  this.calculateAngularVelocity( timeStep );

  return this;

};

Rigidbody.prototype.move = function( timeSection ) {

  this.calculatePosition( timeSection );
  this.calculateAngularPosition( timeSection );

  return this;

};

export { Rigidbody };
