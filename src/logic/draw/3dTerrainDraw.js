import THREE from 'three';
import { createMap, hexPixelPosition } from '../HexGrid/next.js';

import { fetchVector, releaseVector } from '../physics/Vector.js';

import { colors, materials, scene, camera, renderer, canvas } from './3dBase.js';

import loop from '../loop.js';

import { controlStatus } from '../controls.js'

let
  xArray = new Array( 16 ).fill( 1 ),
  yArray = new Array( 16 ).fill( 1 );

xArray.map( () => Math.floor( Math.random() * 100 ) );
yArray.map( () => Math.floor( Math.random() * 100 ) );

const
  //{ Grid } = HexLib,
  { background, wireBlue, lineBlueDark, lineBlueLight } = materials,
  size = 1,
  trigCalc = ( val, intense ) => ( Math.sin( val * intense ) / intense ) + ( Math.cos( val * intense ) / intense ),
  hexHeightCalculator = ( q, r ) => {
    const [ xHex, yHex ] = hexPixelPosition( size, hex );
    return { height: heightCalculator( xHex, yHex ) / 4 };
  },
  heightCalculator = ( posX, posY ) => {
    const
      x = xArray.reduce( ( prev, curr ) => prev + trigCalc( posX, curr ), 0 ) / 16,
      y = yArray.reduce( ( prev, curr ) => prev + trigCalc( posY, curr ), 0 ) / 16;

    return x + y;
  },
  HexMap = createMap( 14, hexHeightCalculator ),
  sphere = new THREE.Mesh( new THREE.SphereGeometry( 1, 32, 32 ), new THREE.MeshBasicMaterial( { color: 0xffff00 } ) ),
  terrain = new THREE.Object3D();

function hexGridToGeometry( hexGrid ) {

  const geometry = new THREE.Geometry(),
    verts = [],
    faces = []

  hexGrid.hexes.forEach( ( hex, index, hexes ) => {

    const
      [ x, y ] = hex.pixel( size ),
      point = new THREE.Vector3( x, y, hex.data.height );

    let
      facePointsA = [ hex, hex.add( { q: -1, r: 1 } ), hex.add( { q: 0, r: 1 } ) ],
      facePointsB = [ hex, hex.add( { q: 0, r: -1 } ), hex.add( { q: 1, r: -1 } ) ];

    if ( !!facePointsA[ 1 ] && !!facePointsA[ 2 ] ) {
      facePointsA = facePointsA.map( fpHex => hexes.indexOf( fpHex ) );
      faces.push( new THREE.Face3( facePointsA[ 2 ], facePointsA[ 1 ], facePointsA[ 0 ] ) );
    }

    if ( !!facePointsB[ 1 ] && !!facePointsB[ 2 ] ) {
      facePointsB = facePointsB.map( fpHex => hexes.indexOf( fpHex ) );
      faces.push( new THREE.Face3( facePointsB[ 0 ], facePointsB[ 1 ], facePointsB[ 2 ] ) );
    }

    verts.push( point );

  } );

  geometry.vertices = verts;
  geometry.faces = faces;

  geometry.computeBoundingSphere();

  return geometry;

}

function hexToHex( hex ) {

  const
    geometry = new THREE.CircleGeometry( 0.95, 6 ),
    material = new THREE.LineBasicMaterial( { color: colors.red } ),
    [ x, y ] = hex.pixel( 1 );

  geometry.vertices
    .map( vert => {
      vert.applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), Math.PI / 2 );
      return vert;
    } )
    .map( vert => {
      vert.z = heightCalculator( vert.x + x, vert.y + y ) / 4;
    } );

  geometry.verticesNeedUpdate = true;
  geometry.vertices.shift();

  material.transparent = true;
  material.opacity = 1 - Math.sqrt( Math.pow( x, 2 ) + Math.pow( y, 2 ) ) / 25 + 0.1;

  const mesh = new THREE.Line( geometry, material );

  mesh.position.x = x;
  mesh.position.y = y;

  return mesh;

}

HexMap.grid.hexes
  .map( hexToHex )
  .forEach( mesh => scene.add( mesh ) );

let
  mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster(),
  INTERSECTED = null,
  INTERSECTED_OPACITY = null,
  INTERSECTED_MATERIAL = null;

document.addEventListener( 'mousemove', function onDocumentMouseMove( event ) {

  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

}, false );


document.addEventListener( 'click', e => {

  raycaster.setFromCamera( mouse, camera );

  let intersects = raycaster.intersectObjects( scene.children );

  if ( intersects.length > 0 ) {

    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( !!INTERSECTED ) {
        INTERSECTED.material = INTERSECTED_MATERIAL;
        INTERSECTED.opacity = INTERSECTED_OPACITY;
      }


      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED_MATERIAL = INTERSECTED.material;
      INTERSECTED_OPACITY = INTERSECTED.opacity;

      INTERSECTED.opacity = 1;
      INTERSECTED.material = lineBlueDark;

    }

  }

} )


//const
  //terrainGeo = hexGridToGeometry( HexMap ),
  //terrainBackgroundMesh = new THREE.Mesh( terrainGeo, background );
  /*clippingMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color: { type: 'c', value:  new THREE.Color( "rgba(255, 255, 255, 0.5)" ) },
      height: { type: 'f', value: 1 },
    },
    vertexShader: document.getElementById('vertShader').text,
    fragmentShader: document.getElementById('fragShader').text
  });

const sampleClip = new THREE.Mesh( clippingPlane, clippingMaterial );

lineBlueDark.transparent = true;
lineBlueDark.opacity = 0.25;

//terrainBackgroundMesh.position.z = -0.02

//terrain.add( terrainMesh );
//terrain.add( terrainBackgroundMesh );

//terrain.rotation.x = Math.PI / 2;

//scene.add( sampleClip );
*/

//scene.add( sphere );

//scene.add( terrainBackgroundMesh );
