import THREE from 'three';
import { materials } from './3dBase.js';
import {
  flatten,
  uniqueBy
} from '../util/functional';

const
  hexOutlinesGeometries = [],
  hexBodiesGeometries = [],
  tanksGeometries = [];

function hexToHexOutline( position, heightCalculator ) {

  const
    geometry = new THREE.CircleGeometry( 0.95, 6 ),
    material = materials.lineBlueDark,
    [ x, y ] = position;

  geometry.vertices
    .map( vert => {
      vert.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI / 2 );
      return vert;
    } )
    .map( vert => {
      vert.z = heightCalculator( vert.x + x, vert.y + y );
    } );

  geometry.verticesNeedUpdate = true;
  geometry.vertices.shift();

  let mesh = new THREE.Line( geometry, material );

  mesh.position.x = x;
  mesh.position.y = y;

  hexOutlinesGeometries.push( mesh );

  return mesh;

}

function hexToHexBackground( position, heightCalculator ) {

  const
    geometry = new THREE.CircleGeometry( 0.95, 6 ),
    material = materials.background,
    [ x, y ] = position;

  geometry.vertices
    .map( vert => {
      vert.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI / 2 );
      return vert;
    } )
    .map( vert => {
      vert.z = heightCalculator( vert.x + x, vert.y + y );
    } );


  geometry.vertices[ 0 ].z = Array.from( geometry.vertices )
    .splice( 1, 9 )
    .reduce( ( sum, vert ) => sum + vert.z, 0 ) / 6;

  geometry.verticesNeedUpdate = true;

  let mesh = new THREE.Mesh( geometry, material );

  mesh.position.x = x;
  mesh.position.y = y;

  hexBodiesGeometries.push( mesh );

  return mesh;

}

function createTankMesh() {

  const
    geometry = new THREE.SphereGeometry( 0.25, 16, 16 ),
    material = materials.wireRedLight,
    mesh = new THREE.Mesh( geometry, material );

  tanksGeometries.push( mesh )

  return mesh;

}

function returnOne() {
  return 1;
}

function identity( x ) {
  return x;
}

function createSphere( iter, vertMod = returnOne, vertsMod = identity ) {

  const
    geometry = new THREE.Geometry(),
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

  for ( let i = 0; i < iter; ++i ) {

    faces[ i + 1 ] = [];

    faces[ i ].forEach( vecs => {

      const [ vecA, vecB, vecC ] = vecs;

      let
        vec1 = (new THREE.Vector3()).addVectors( vecA, vecB ).normalize(),
        vec2 = (new THREE.Vector3()).addVectors( vecB, vecC ).normalize(),
        vec3 = (new THREE.Vector3()).addVectors( vecC, vecA ).normalize();

      vec1 = vectors.find( vec => vec.equals( vec1 ) ) || vec1;
      vec2 = vectors.find( vec => vec.equals( vec2 ) ) || vec2;
      vec3 = vectors.find( vec => vec.equals( vec3 ) ) || vec3;

      faces[ i + 1 ].push( [ vecA, vec1, vec3 ] );
      faces[ i + 1 ].push( [ vecB, vec2, vec1 ] );
      faces[ i + 1 ].push( [ vecC, vec3, vec2 ] );
      faces[ i + 1 ].push( [ vec1, vec2, vec3 ] );

      vectors.push( vec1 );
      vectors.push( vec2 );
      vectors.push( vec3 );


    } );

  }

  geometry.vertices = uniqueBy( flatten( faces[ iter ] ) );

  geometry.faces = faces[ iter ].map( vecs => new THREE.Face3(
    geometry.vertices.indexOf( vecs[0] ),
    geometry.vertices.indexOf( vecs[1] ),
    geometry.vertices.indexOf( vecs[2] )
  ) );

  geometry.computeBoundingSphere();

  return geometry;

}

export {
  hexToHexOutline,
  hexToHexBackground,
  createTankMesh,
  hexOutlinesGeometries,
  createSphere
};
