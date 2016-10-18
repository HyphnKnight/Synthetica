import {
  flatten
} from '../util/functional.js';

/*
6 points located at
(x,y,z)
(0,0,1)
(0,0,-1)
(1,0,0)
(-1,0,0)
(0,-1,0)
(0,1,0)

normalize all points

loop =>
  take 3 adjacent points average there value
  normalize, repeat

*/

function avgVectors( vectors ) {
  return vectors.reduce( ( avgVec, vec ) => avgVec.add( vec ), new Vector3() ).normalize()
}

function generateSphere( iter ) {

  const
    vectors = [],
    faces = [];

  for ( let i = 0; i < iter; ++i ) {

    faces[ i + 1 ] = [];

    faces[ i ].forEach( vecs => {

      const
        [ vec1, vec2, vec3 ] = vecs,
        newVec = avgVecs( vecs );

      faces[ i + 1 ].push( [ newVec, vec1, vec2 ] );
      faces[ i + 1 ].push( [ newVec, vec2, vec3 ] );
      faces[ i + 1 ].push( [ newVec, vec3, vec1 ] );

      vectors.push( newVec );


    } );

  }

  return {
    vectors,
    faces: flatten( faces )
  };

}

export default generateSphere;
