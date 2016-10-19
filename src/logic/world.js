import THREE from 'three';
import { createSphere } from './geometry';
import { vector3HeightCalculator } from './terrain';
import {
  flatten,
  uniqueBy,
  times,
  map
} from '../util/functional'

import {
  seed
} from '../data/world/BASE_6.json';

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

function loadWorldGeometry() {

  const geometry = new THREE.Geometry();

  geometry.vertices = map(
    seed[0],
    vertData => new THREE.Vector3( vertData[0], vertData[1], vertData[2] )
  );
  geometry.faces = map(
    seed[1],
    faceData => new THREE.Face3( faceData[0], faceData[1], faceData[2] )
  );

  geometry.computeBoundingSphere();

  return geometry;

}

function createWorldGeometry() {

  const
    geo = createSphere( 6 ),
    numberOfVerts = geo.vertices.length,
    faceArrays = geo.faces.map( face => getFaceVectorsIndexArray( face, geo.vertices ) ),
    randomVerts = times( 4, () => Math.floor( Math.random() * numberOfVerts ) )
      .map( vertIndex => ({ index: vertIndex, vec: geo.vertices[ vertIndex ] }) );

  randomVerts.forEach( vertData => {
    vertData.vec.setLength( 1.1 );
    getAdjacentVectors( vertData.index, faceArrays )
      .map( vertIndex => geo.vertices[ vertIndex ].setLength(1.12) );
  } );

  geo.computeBoundingSphere();

  return geo;
}


export {
  createWorldGeometry,
  loadWorldGeometry
};
