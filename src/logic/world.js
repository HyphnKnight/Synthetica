import THREE from 'three';
import { createSphere } from './geometry';
import { vector3HeightCalculator } from './terrain';
import {
  flatten,
  uniqueBy,
  times,
  forEach,
  map
} from '../util/functional'

function getFaceVectorsIndexArray( face, vectors ) {
  const { a, b, c } = face;
  return [ a, b, c ];
}

function faceArrayContainsIndex( index, faceArray ) {
  return faceArray[0] === index ||
    faceArray[1] === index ||
    faceArray[2] === index;
}

function getAdjacentVectors( vectorIndex, faceArrays ) {
  return uniqueBy(
    flatten(
      faceArrays.filter(
        faceArray =>  faceArray[0] === vectorIndex ||
                      faceArray[1] === vectorIndex ||
                      faceArray[2] === vectorIndex
      )
    )
  ).filter( index => index !== vectorIndex );
}

function createWorldGeometry() {

  const
    geo = createSphere( 5 ),
    { vertices, faces } = geo,
    numberOfVerts = vertices.length,
    faceArrays = faces.map( face => getFaceVectorsIndexArray( face, vertices ) ),
    randomVerts = times( 6, () => Math.floor( Math.random() * numberOfVerts ) )
      .map( vertIndex => ({ index: vertIndex, vec: vertices[ vertIndex ] }) );

  forEach( randomVerts, vertData => {
    const { index, vec } = vertData;
    console.log( vertData )
    vec.setLength( 1.1 );
    /*getAdjacentVectors( vertData.index, faceArrays )
      .map( vertIndex => vertices[ vertIndex ].setLength(1.2) );*/
  } );

  geo.computeBoundingSphere();

  return geo;
}


export {
  createWorldGeometry,
  loadWorldGeometry
};
