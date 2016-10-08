import HexGrid from './HexGrid';
import THREE from 'three';
import loop from './loop';
import {
  hexToHexOutline,
  hexToHexBackground,
  hexOutlinesGeometries
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

const
  mapSize = 14,
  gameMap = new HexGrid( mapSize, hex => ( { height: hexHeightCalculator( hex ) } ) );

/* Graphics */

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

materials.lineBlueDark.transparent = true;
materials.lineBlueDark.opacity = 0;

var geometry = new THREE.PlaneGeometry( gameMap.radius*4, gameMap.radius*4, gameMap.radius*8, gameMap.radius*8 );
var smap = null;
var bmap = null;

geometry.vertices.forEach( vert => {
  vert.z = pixelHeightCalculator( vert.x, vert.y );
} )

var loader = new THREE.TextureLoader();

// load a resource
loader.load(
  // resource URL
  require('../design/planetTexture.jpg'),
  // Function when resource is loaded
  function ( texture ) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 32,32 );
    smap = texture;
    if ( !!bmap ) {
      renderNewScene();
    }
  }
);

loader.load(
  // resource URL
  require('../design/planetTexture_NRM.png'),
  // Function when resource is loaded
  function ( texture ) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( 32,32 );
    bmap = texture;
    if ( !!smap ) {
      renderNewScene();
    }
  }
);

function renderNewScene() {
  var material = new THREE.MeshPhongMaterial({
    normalMap   :  bmap,
    bumpMap     :  bmap,
    bumpScale   : 0.45,
    map         :  smap
  });
  var plane = new THREE.Mesh( geometry, material );
  plane.position.z = -0.2;
  plane.castShadow = true;
  plane.receiveShadow = true;
  scene.add( plane );
  var directionalLight = new THREE.PointLight( 0xFFFFFF, 1, 100 );
  directionalLight.position.set( 10, 10, 10 );
  scene.add( directionalLight );

  renderScene();

  /* Game Logic */

  const tank = createTank( gameMap, 0, 0 );

  let tankOrbit = null;

  scene.add( tank.data.mesh );

  controlStatus.subscribe( ( state, oldState ) => {

    if ( !!state.click && state.click !== oldState.click ) {

      const clickedHexBodies = controlStatus.click.filter(
        intersection => hexOutlinesGeometries.find( geo => geo === intersection.object )
      );

      if ( !!clickedHexBodies.length ) {
        tankOrbit = obstructedLineTo( tank, clickedHexBodies[ 0 ].object.userData.hex, 5, true );
      }

    }

  } )

  let gameLoop = loop( dT => {

    if ( !!tankOrbit ) {

      const
        nextPosition = tankOrbit();

      if ( !!nextPosition ) {

        const
          pixelPosition = nextPosition.pixel,
          direction = new THREE.Vector3(
            tank.data.mesh.position.x - pixelPosition[ 0 ],
            tank.data.mesh.position.y - pixelPosition[ 1 ],
            0
          ).normalize();

        tank.move(
          direction.x,
          direction.y,
          dT
        );

      } else {

        tankOrbit = null;

      }

    }

    cameraControls( dT );
    renderScene();

  } );

  gameLoop();
}
