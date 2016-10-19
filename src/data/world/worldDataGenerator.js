const
    THREE = require( 'three' ),
    fs = require( 'fs' );

function forEach( array, func ) {

  const arrayLength = array.length;

  for ( let index = 0; index < arrayLength; ++index ) {

    func( array[ index ], index, array );

  }

  return Array.from( array );

}

function map( array, func ) {

  const
    arrayLength = array.length,
    result = [];

  for ( let index = 0; index < arrayLength; ++index ) {

    result[index] = func( array[ index ], index, array );

  }

  return result;

}

function flattenUniqueFaces( array ) {

  const
    arrayLength = array.length,
    results = [];

  for ( let i = 0; i < arrayLength; ++i ) {

    results.push(
      array[ i ][ 0 ],
      array[ i ][ 1 ],
      array[ i ][ 2 ]
    );

  }

  return results;

}

function find( array, func ) {

  const arrayLength = array.length;

  let result;

  for ( let i = 0; i < arrayLength; ++i ) {

    if ( func( array[ i ] ) ) {
      result = array[ i ];
      i = arrayLength;
    }

  }

  return result;

}

function indexOf( array, value ) {

  const arrayLength = array.length;

  let result = -1;

  for ( let i = 0; i < arrayLength; ++i ) {

    if ( array[i] === value ) {

      return i;

    }

  }

  return result;

}

function createSphere( iter ) {

  const startTime = Date.now();

  console.log( `Creating Sphere w/ ${iter}` );

  const
    vectors = [
      new THREE.Vector3( 1, 0, 0 ),
      new THREE.Vector3( 0, 1, 0 ),
      new THREE.Vector3( 0, 0, 1 ),
      new THREE.Vector3(-1, 0, 0 ),
      new THREE.Vector3( 0,-1, 0 ),
      new THREE.Vector3( 0, 0,-1 )
    ],
    faces = [ [
      [ vectors[0], vectors[1], vectors[2] ],
      [ vectors[4], vectors[0], vectors[2] ],
      [ vectors[1], vectors[3], vectors[2] ],
      [ vectors[3], vectors[4], vectors[2] ],
      [ vectors[1], vectors[0], vectors[5] ],
      [ vectors[0], vectors[4], vectors[5] ],
      [ vectors[3], vectors[1], vectors[5] ],
      [ vectors[4], vectors[3], vectors[5] ],
    ] ];

  let
    finalVertices = [],
    finalFaces = [];

  for ( let i = 0; i < iter; ++i ) {

    console.log( `   iter : ${i}, ${ ( Date.now() - startTime ) / 1000}` );

    faces[ i + 1 ] = [];

    console.log( faces[ i ].length );

    forEach( faces[ i ], vecs => {

      const [ vecA, vecB, vecC ] = vecs;

      let
        vec1 = (new THREE.Vector3()).addVectors( vecA, vecB ).normalize(),
        vec2 = (new THREE.Vector3()).addVectors( vecB, vecC ).normalize(),
        vec3 = (new THREE.Vector3()).addVectors( vecC, vecA ).normalize();

      vec1 = find( vectors, vec => vec.equals( vec1 ) ) || vec1;
      vec2 = find( vectors, vec => vec.equals( vec2 ) ) || vec2;
      vec3 = find( vectors, vec => vec.equals( vec3 ) ) || vec3;

      faces[ i + 1 ].push(
        [ vecA, vec1, vec3 ],
        [ vecB, vec2, vec1 ],
        [ vecC, vec3, vec2 ],
        [ vec1, vec2, vec3 ]
      );

      vectors.push(
        vec1,
        vec2,
        vec3
      );

    } );

  }

  console.log( `   Calc verts, ${ ( Date.now() - startTime ) / 1000}` );

  finalVertices = flattenUniqueFaces( faces[ iter ] )

  console.log( `   Calc Faces, ${ ( Date.now() - startTime ) / 1000}` );

  finalFaces = map( faces[ iter ], vecs => ([
    indexOf( finalVertices, vecs[0] ),
    indexOf( finalVertices, vecs[1] ),
    indexOf( finalVertices, vecs[2] )
  ]) );

  return [
    map( finalVertices, vert => ([ vert.x, vert.y, vert.z ]) ),
    finalFaces
  ];

}

function writeData( name, iter, data ) {

  return new Promise( ( resolve, reject ) => {

    const fileName = `${name}_${iter}.json`;

    fs.writeFile(
      fileName,
      `{"seed":${JSON.stringify( data )}}`,
      error => {
        if ( error ) {
          reject( error );
        }
        resolve( fileName );
      }
    );

  } );

}

console.log( 'Starting Build' );

writeData( 'BASE', 7, createSphere(7) ).catch( error => { throw error } )
/*
forEach(
  [ 0, 1, 2, 3, 4, 5, 6 ],
  num => writeData( 'BASE', num, createSphere(num) ).catch( error => { throw error } )
);
*/
