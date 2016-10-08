import { CollisionCheck } from './Collision.js';

/*const
  //boundingOverlap = ( rigidbody, rigidbodyTarget ) => rigidbody.boundingMovementRadius + rigidbodyTarget.boundingMovementRadius < VectorLibrary.add( rigidbody.position, rigidbodyTarget.position ).magnitude(),
  rigidbodySetup = timeStep => rigidbody => {
    rigidbody.accelerate( timeStep );
    rigidbody.calculateBoundingMovementCircle();
    if ( !rigidbody.collided ) {
      rigidbody.move( timeStep );
    }
  },*/

function rigidbodyUpdate( timeStep ) {

  return function rigidbodyUpdateWithTimeStep( rigidbody ) {

    rigidbody.accelerate( timeStep );
    rigidbody.calculateBoundingMovementCircle();
    rigidbody.preCollisionCalculations( timeStep );

    return rigidbody;

  };

}

function Engine() {

  this.rigidbodies = [];
  this.possibleCollisions = [];

}

Engine.prototype.iterate = function( timeStep ) {

  this.rigidbodies.forEach( rigidbodyUpdate( timeStep ) );

  CollisionCheck( this.rigidbodies, timeStep );

  this.rigidbodies
    .filter( rigidbody => !rigidbody.collided )
    .map( rigidbody => rigidbody.move( 1 ) );

};

Engine.prototype.add = function( rigidbody ) {
  this.rigidbodies.push( rigidbody );
  return rigidbody;
};

export { Engine };
