import HexGrid from './HexGrid';
import THREE from 'three';
import loop from './loop';
import {
  loadTexture
} from './contentLoader'
import {
  hexToHexOutline,
  hexToHexBackground,
  hexOutlinesGeometries,
  createSphere
} from './geometry';
import {
  hexHeightCalculator,
  pixelHeightCalculator
} from './terrain';
import {
  scene,
  renderScene,
  materials
} from './3dBase';
import { createTank } from './tank';
import { controlStatus } from './controls';
import cameraControls from './camera';
import {
  orbit,
  pathTo,
  obstructedLineTo,
  spiral,
  hover
} from './intelligence';
import generateSphere from './sphere';

const
  mapSize = 14,
  gameMap = new HexGrid( mapSize, hex => ( { height: hexHeightCalculator( hex ) } ) );

/* Graphics */
/*
gameMap.hexes.forEach( hex => {

  hex.data.geometry = {
    outline: hexToHexOutline( hex.pixel, pixelHeightCalculator ),
    background: hexToHexBackground( hex.pixel, pixelHeightCalculator )
  };

  hex.data.geometry.outline.userData = { hex };
  //hex.data.geometry.background.userData = { hex };

  scene.add( hex.data.geometry.outline );
  //scene.add( hex.data.geometry.background );

} );

var geometry = new THREE.PlaneGeometry( gameMap.radius*4, gameMap.radius*4, gameMap.radius*8, gameMap.radius*8 );
var smap = null;
var bmap = null;

geometry.vertices.forEach( vert => {
  vert.z = pixelHeightCalculator( vert.x, vert.y );
} )*/

var geometry = createSphere( 6,
  vec => ( Math.sin( vec.x * 10 ) + Math.sin( vec.y * 10 ) + Math.sin( vec.z * 10 ) ) / 3 * 0.1 + 1
);

var material = new THREE.MeshPhongMaterial({
  shading : THREE.FlatShading,
  color: 0x0000ff
});

console.log( geometry );

const testMesh = new THREE.Mesh( geometry, material );

scene.add( testMesh );

var directionalLight = new THREE.PointLight( 0xFFFFFF, 1, 100 );
directionalLight.position.set( 10, 10, 10 );
scene.add( directionalLight );



/*
function renderNewScene() {
  var material = new THREE.MeshPhongMaterial({
    normalMap   :  bmap,
    bumpMap     :  bmap,
    bumpScale   : 0.45,
    map         :  smap,
    shading : THREE.FlatShading
  });
  var plane = new THREE.Mesh( geometry, material );
  var plane2 = new THREE.Mesh( geometry, materials.wireGreyDark );
  plane.position.z = -0.1;
  plane.castShadow = true;
  plane.receiveShadow = true;
  scene.add( plane );
  scene.add( plane2 );
  var directionalLight = new THREE.PointLight( 0xFFFFFF, 1, 100 );
  directionalLight.position.set( 10, 10, 10 );
  scene.add( directionalLight );

  renderScene();


  const tank = createTank( gameMap, 0, 0 );

  let tankOrbit = null;

  scene.add( tank.data.mesh );

  controlStatus.subscribe( ( state, oldState ) => {

    if ( !!state.click && state.click !== oldState.click ) {

      const
        planeIntersection = state.click.find( intersection => intersection.object === plane ),
        { x, y } = planeIntersection.point,
        hex = gameMap.getHexFromPixel( x, y );

      if ( !!hex ) {
        tankOrbit = obstructedLineTo( tank, hex, 5, true );
      }

    }

  } )
}
*/

let gameLoop = loop( dT => {
  testMesh.rotation.z += dT * 0.01;

  cameraControls( dT );
  renderScene();

} );

gameLoop();
