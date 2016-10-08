import THREE from 'three';
import { materials } from './3dBase.js';

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

export { hexToHexOutline, hexToHexBackground, createTankMesh, hexOutlinesGeometries };
