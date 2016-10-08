import memoizeWithCache from '../../../util/memoize.js';
import { fetchVector, releaseVector } from '../Vector.js';
import { momentOfIntertia, momentVector } from '../Equations.js';

function Collision( rigidbody, rigidbodyTarget, geometry, geometryTarget, point, normal, time, intersect ) {

  this.rigidbody = rigidbody;
  this.rigidbodyTarget = rigidbodyTarget;

  this.geometry = geometry;
  this.geometryTarget = geometryTarget;

  this.point = point;

  this.normal = normal;

  this.time = time;

  this.intersect = intersect;

}

const sqrt = memoizeWithCache( num => Math.sqrt( num ) );

function detectCollision( timeStep ) {

  return function detectCollisionWithTimeStep( pair ) {

    let collisionPairs = [];


    for ( let x = 0; x < pair[ 0 ].geometries.length; ++x ) {

      for ( let y = 0; y < pair[ 1 ].geometries.length; ++y ) {

        if ( circleCircleIntersectionBoolean( pair[ 0 ].geometries[ x ].getPosition(), pair[ 0 ].velocityMagnitude + pair[ 0 ].geometries[ x ].boundingRadius, pair[ 0 ].displacement, pair[ 1 ].geometries[ y ].getPosition(), pair[ 1 ].velocityMagnitude + pair[ 1 ].geometries[ y ].boundingRadius, pair[ 1 ].displacement ) ) {

          collisionPairs.push( [ pair[ 0 ], pair[ 0 ].geometries[ x ], pair[ 1 ], pair[ 1 ].geometries[ y ] ] )

        }

      }

    }

    return collisionPairs
        .map( detectGeometryCollision( timeStep ) )
        .filter( collision => !!collision )
        .sort( ( a, b ) => b.time - a.time )[ 0 ];

  };

}

function detectGeometryCollision( timeStep ) {

  return function detectGeometryCollisionWithTimeStep( pair ) {

    if ( ( pair[ 1 ].type === 'Point' || pair[ 1 ].type === 'Circle' ) && ( pair[ 3 ].type === 'Point' || pair[ 3 ].type === 'Circle' ) ) {
      return circleCircleCollision( timeStep ).apply( null, pair );
    }

  };

}

function resolveIntersection( collision ) {
  return collision;
}

function resolveCollision( timeStep ) {

  return function resolveCollisionWithTimeStep( collision ) {

    if ( collision.rigidbody.collided || collision.rigidbodyTarget.collided ) {
      return false;
    }

    if ( !!collision.intersect ) {
      resolveIntersection( collision );
    }

    const
      { rigidbody, rigidbodyTarget, normal, point, time } = collision,
      momentVectorSelf = momentVector( rigidbody.position, point ),
      momentVectorTarget = momentVector( rigidbodyTarget.position, point ),
      relativeVelocity = rigidbody.velocity.copy().subtract( rigidbodyTarget.velocity ),
      relativeMomentVector = momentVectorTarget.copy().scale( rigidbodyTarget.angularVelocity ).subtract( momentVectorSelf.copy().scale( rigidbody.angularVelocity ) ),
      elasticity = ( rigidbody.elasticity + rigidbodyTarget.elasticity ) / 2;

    let
      J = ( 1 + elasticity ) * relativeVelocity.add( relativeMomentVector ).dotProduct( normal ),
      denom = 0,
      dp1, dp2, momentOfIntertiaSelf, momentOfIntertiaTarget;

    releaseVector( relativeVelocity );
    releaseVector( relativeMomentVector );

    if ( rigidbody.terminalVelocity !== 0 ) {
      denom += 1 / rigidbody.mass;
    }

    if ( rigidbodyTarget.terminalVelocity !== 0 ) {
      denom += 1 / rigidbodyTarget.mass;
    }

    if ( rigidbody.terminalAngularVelocity !== 0 ) {
      dp1 = momentVectorSelf.dotProduct( normal );
      momentOfIntertiaSelf = momentOfIntertia( rigidbody.position, point, rigidbody.mass );
      denom += dp1 * dp1 / momentOfIntertiaSelf;
    }

    if ( rigidbodyTarget.terminalAngularVelocity !== 0 ) {
      dp2 = momentVectorTarget.dotProduct( normal );
      momentOfIntertiaTarget = momentOfIntertia( rigidbodyTarget.position, point, rigidbodyTarget.mass );
      denom += dp2 * dp2 / momentOfIntertiaTarget;
    }

    releaseVector( momentVectorTarget );
    releaseVector( momentVectorSelf );

    if ( denom === 0 ) {
      return false;
    }

    J /= denom

    rigidbody.move( time );
    rigidbodyTarget.move( time );

    if ( rigidbody.terminalVelocity !== 0 ) {
      rigidbody.velocity.add( normal.copy().scale( -J / rigidbody.mass ) );
    }

    if ( rigidbodyTarget.terminalVelocity !== 0 ) {
      rigidbodyTarget.velocity.subtract( normal.copy().scale( -J / rigidbodyTarget.mass ) );
    }


    if ( rigidbody.terminalAngularVelocity !== 0 ) {
      rigidbody.angularVelocity += J * dp1 / momentOfIntertiaSelf;
    }

    if ( rigidbodyTarget.terminalAngularVelocity !== 0 ) {
      rigidbodyTarget.angularVelocity -= J * dp2 / momentOfIntertiaTarget;
    }

    rigidbody.preCollisionCalculations( timeStep );
    rigidbodyTarget.preCollisionCalculations( timeStep );

    rigidbody.move( 1 - time );
    rigidbodyTarget.move( 1 - time );

    rigidbody.collided = true;
    rigidbodyTarget.collided = true;


  };

}

function circleOverlapCircle( point, radius, pointTarget, radiusTarget ) {
  return point.copy().subtract( pointTarget ).magnitude() <= radius + radiusTarget;
}

function rigidbodyMovementOverlap( rigidbody, rigidbodyTarget ) {
  return circleOverlapCircle( rigidbody.position, rigidbody.boundingMovementRadius, rigidbodyTarget.position, rigidbodyTarget.boundingMovementRadius )
}


  /* Circle Collision Checks */

function circleCircleIntersectionBoolean( position, radius, displacement, positionTarget, radiusTarget, displacementTarget ) {

  const
    relativePosition = position.copy().subtract( positionTarget ),
    combinedRadius = radius + radiusTarget,
    relativePositionProduct = relativePosition.dotProduct( relativePosition );

  if ( relativePositionProduct < combinedRadius * combinedRadius ) {
    releaseVector( relativePosition );
    return true;
  }

  const
    relativeDisplacement = displacement.copy().subtract( displacementTarget ),
    a = relativeDisplacement.dotProduct( relativeDisplacement ),
    b = relativePosition.dotProduct( relativeDisplacement ),
    c = relativePosition.dotProduct( relativePosition ) - combinedRadius * combinedRadius,
    root = b * b - a * c;

  releaseVector( relativeDisplacement );

  if ( root < 0 ) {
    return false;
  }

  const t = ( -b - sqrt( root ) ) / a;

  if ( t > 1 || t < 0 ) {
    return false;
  }

  return true;

}

function circleCircleCollision( timeStep ) {

  return function circleCircleCollisionWithTimeStep( rigidbody, geometry, rigidbodyTarget, geometryTarget ) {

    const
      relativePosition = geometry.getPosition().subtract( geometryTarget.getPosition() ),
      combinedRadius = geometry.radius + geometryTarget.radius,
      relativePositionProduct = relativePosition.dotProduct( relativePosition );

    if ( relativePositionProduct < combinedRadius * combinedRadius ) {
      releaseVector( relativePosition );
      return new Collision( rigidbody, rigidbodyTarget, geometry, geometryTarget, relativePosition.scale( 0.5 ).add( rigidbody.position ), geometry.getPosition().copy().subtract( geometryTarget.getPosition() ).normalize(), 0, true );
    }

    const
      relativeDisplacement = rigidbody.displacement.copy().subtract( rigidbodyTarget.displacement ),
      a = relativeDisplacement.dotProduct( relativeDisplacement ),
      b = relativePosition.dotProduct( relativeDisplacement ),
      c = relativePosition.dotProduct( relativePosition ) - combinedRadius * combinedRadius,
      root = b * b - a * c;

    if ( root < 0 ) {
      [ relativePosition, relativeDisplacement ].map( releaseVector );
      return false;
    }

    const t = ( -b - sqrt( root ) ) / a;

    if ( t > 1 || t < 0 ) {
      [ relativePosition, relativeDisplacement ].map( releaseVector );
      return false;
    }

    releaseVector( relativeDisplacement );

    return new Collision( rigidbody, rigidbodyTarget, geometry, geometryTarget, relativePosition.scale( 0.5 ).add( rigidbody.position ), geometry.getPosition().subtract( geometryTarget.getPosition() ).normalize(), t, false );

  };

}

function CollisionCheck( rigidbodies, timeStep ) {

  rigidbodies.forEach( rigidbody => {
    rigidbody.boundingMovementCollided = false;
    rigidbody.boundingCollided = false;
    rigidbody.collided = false;
  } );

  const
    asleep = rigidbodies.filter( rigidbody => rigidbody.asleep() ),
    active = rigidbodies.filter( rigidbody => !rigidbody.asleep() );

  let collisionPairs = [];

  for ( let x = 0; x < active.length; ++x ) {

    for ( let y = x + 1; y < active.length; ++y ) {

      if ( rigidbodyMovementOverlap( active[ x ], active[ y ] ) ) {

        collisionPairs.push( [ active[ x ], active[ y ] ] );

      }

    }

    for ( let z = 0; z < asleep.length; ++z ) {

      if ( rigidbodyMovementOverlap( active[ x ], asleep[ z ] ) ) {

        collisionPairs.push( [ active[ x ], asleep[ z ] ] );

      }

    }

  }

  collisionPairs
    .map( pair => {

      pair[ 0 ].boundingMovementCollided = true;
      pair[ 1 ].boundingMovementCollided = true;

      return pair;

    } )
    .filter( pair => circleCircleIntersectionBoolean( pair[ 0 ].position, pair[ 0 ].boundingRadius, pair[ 0 ].displacement, pair[ 1 ].position, pair[ 1 ].boundingRadius, pair[ 1 ].displacement ) )
    .map( pair => {

      pair[ 0 ].boundingCollided = true;
      pair[ 1 ].boundingCollided = true;

      return pair;

    } )
    .map( detectCollision( timeStep ) )
    .filter( collision => !!collision )
    .map( resolveCollision( timeStep ) );


}


export {
  CollisionCheck
};
