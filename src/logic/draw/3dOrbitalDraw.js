import THREE from 'three';
import { fetchVector, releaseVector } from '../physics/Vector.js';

/*
Planetary Bodies to modal
* Planet - different colors / orbits
* moon - different colors / orbits
* Star - red or blue
* ring - color
* Asteriod Belt - blarg
* Blackhole - radius
 */

const
  colors = {
    background: '#1e1d1c',
    grey: '#e8e0dd',
    greyDark: '#655643',
    blueDark: '#1d7674',
    blue: '#78c0a8',
    blueLight: '#61d8d5',
    redDark: '#EFA91B',
    red: '#F07818',
    redLight: '#EF1B1B'
  },
  materials = {
    background: new THREE.MeshBasicMaterial( { color: colors.background, shading: THREE.FlatShading } ),
    grey: new THREE.MeshBasicMaterial( { color: colors.grey, shading: THREE.FlatShading } ),
    wireRedDark: new THREE.MeshBasicMaterial( { color: colors.redDark, shading: THREE.FlatShading, wireframe: true } ),
    wireRed: new THREE.MeshBasicMaterial( { color: colors.red, shading: THREE.FlatShading, wireframe: true } ),
    wireRedLight: new THREE.MeshBasicMaterial( { color: colors.redLight, shading: THREE.FlatShading, wireframe: true } ),
    wireBlueDark: new THREE.MeshBasicMaterial( { color: colors.blueDark, shading: THREE.FlatShading, wireframe: true } ),
    wireBlue: new THREE.MeshBasicMaterial( { color: colors.blue, shading: THREE.FlatShading, wireframe: true } ),
    wireBlueLight: new THREE.MeshBasicMaterial( { color: colors.blueLight, shading: THREE.FlatShading, wireframe: true } ),
    wireGrey: new THREE.MeshBasicMaterial( { color: colors.grey, shading: THREE.FlatShading, wireframe: true } ),
    wireGreyDark: new THREE.MeshBasicMaterial( { color: colors.greyDark, shading: THREE.FlatShading, wireframe: true } ),

    lineRedDark: new THREE.LineBasicMaterial( { color: colors.redDark } ),
    lineRed: new THREE.LineBasicMaterial( { color: colors.red } ),
    lineRedLight: new THREE.LineBasicMaterial( { color: colors.redLight } ),
    lineBlueDark: new THREE.LineBasicMaterial( { color: colors.blueDark } ),
    lineBlue: new THREE.LineBasicMaterial( { color: colors.blue } ),
    lineBlueLight: new THREE.LineBasicMaterial( { color: colors.blueLight } ),
    lineGrey: new THREE.LineBasicMaterial( { color: colors.grey } ),
    lineGreyDark: new THREE.LineBasicMaterial( { color: colors.greyDark } )
  },
  canvas = document.getElementById( 'graphics' ),
  scene = new THREE.Scene(),
  width = window.innerWidth / 50,
  height = window.innerHeight / 50,
  //camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / - 2, height / 2, -500, 1000 ),
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ),
  renderer = new THREE.WebGLRenderer( { canvas } );

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( colors.background );

document.body.appendChild( renderer.domElement );

function CreateBelt( time ) {

  let
    scaleDirection = -1,
    currentScale = 1,
    outerScale = 1.001;

  const

    outerTorus = new THREE.TorusGeometry( 5, 0.35, 16, 64 ),
    backgroundTorus = new THREE.TorusGeometry( 5, 0.3, 64, 32 ),

    backgroundMesh = new THREE.Mesh( backgroundTorus, materials.background ),
    outerMesh = new THREE.Mesh( outerTorus, materials.wireBlueLight ),

    iceBelt = new THREE.Object3D();

  backgroundMesh.rotation.x = Math.PI / 2;
  outerMesh.rotation.x = Math.PI / 2;

  iceBelt.add( backgroundMesh );
  iceBelt.add( outerMesh );
  iceBelt.applyMatrix( new THREE.Matrix4().makeScale( 1, 0.25, 1 ) )

  return {
    geometry: iceBelt,
    animate: function() {
      outerMesh.rotation.z += 0.01;
      backgroundMesh.rotation.z += 0.005;
    }
  };

}

function CreateSun( scale ) {

  let
    scaleDirection = -1,
    currentScale = 1,
    outerScale = 1.001;

  const

    backgroundSphere = new THREE.SphereGeometry( 0.9 * scale, 32, 32 ),
    innerSphere = new THREE.SphereGeometry( 0.95 * scale, 16, 16 ),
    outerSphere = new THREE.SphereGeometry( 1 * scale, 16, 16 ),

    backgroundMesh = new THREE.Mesh( backgroundSphere, materials.background ),
    innerMesh = new THREE.Mesh( innerSphere, materials.wireRedDark ),
    outerMesh = new THREE.Mesh( outerSphere, materials.wireRedLight ),

    sun = new THREE.Object3D(),
    outerEdge = new THREE.Object3D();

  outerEdge.add( outerMesh );

  sun.add( backgroundMesh );
  sun.add( innerMesh );
  sun.add( outerEdge );

  return {
    geometry: sun,
    animate: function() {
      outerMesh.rotation.x += 0.01;
      outerMesh.rotation.y += 0.01;
      outerMesh.rotation.z += 0.01;
      outerEdge.applyMatrix( new THREE.Matrix4().makeScale( outerScale, outerScale, outerScale ) )
      currentScale *= outerScale;
      if ( currentScale < 1 ) {
        outerScale += 0.002;
      } else if ( currentScale > 1.2 ) {
        outerScale -= 0.002;
      }
    }
  };

}

function CreatePlanet( options ) {

  //{ scale, orbit, angle, discovered} ) {

  let updatePosition;

  const

    backgroundSphere = new THREE.SphereGeometry( 0.95 * options.scale ),
    colorSphere = new THREE.SphereGeometry( 1 * options.scale, Math.floor( options.scale * 36 ), Math.floor( options.scale * 36 ) ),
    //atmoSphere = new THREE.SphereGeometry( 1.15 * options.scale, Math.floor( options.scale * 24 ), Math.floor( options.scale * 24 ) ),

    backgroundMesh = new THREE.Mesh( backgroundSphere, materials.background ),
    colorMesh = new THREE.Mesh( colorSphere, options.discovered ? materials.wireBlueDark : materials.wireGreyDark ),
    //atmoMesh = new THREE.Mesh( atmoSphere, options.discovered ? materials.wireBlue : materials.wireGrey ),

    planet = new THREE.Object3D();

  planet.add( backgroundMesh );
  planet.add( colorMesh );
  //planet.add( atmoMesh );

  if ( options.orbit.type ) {
    updatePosition = () => {
      const { x, y } = CirclularOrbitPosition( options.position || { x: 0, y: 0 }, options.orbit.radius, options.angle );
      planet.position.x = x;
      planet.position.z = y;
    };
  } else {
    updatePosition = () => {
      const { x, y } = EllipticalOrbitPosition( options.position || { x: 0, y: 0 }, options.orbit.a, options.orbit.b, options.angle );
      planet.position.x = x;
      planet.position.z = y;
    };
  }

  if ( options.moon ) {
    planet.add( options.moon.geometry );
  }

  return {
    geometry: planet,
    animate: function( time ) {
      colorMesh.rotation.y += 0.05;
      options.angle += options.orbit.speed * time;
      updatePosition();
      if ( options.moon ) {
        options.moon.animate( time )
      }
    }
  };

}

function CirclularOrbitPosition( center, radius, angle ) {

  const { x, y } = center;

  return fetchVector( radius * Math.cos( angle ) + x, radius * Math.sin( angle ) + y );

}

function EllipticalOrbitPosition( center, a, b, angle ) {

  const
    { x, y } = center,
    xPosition = a * Math.cos( angle ),
    yPosition = b * Math.sin( angle );

  return fetchVector( xPosition + x, yPosition + y );

}

const
  sun = CreateSun( 1 ),
  moonA = CreatePlanet( {
    scale: 0.2,
    orbit: {
      type: true,
      radius: 1,
      speed: 2 * Math.PI / 180
    },
    angle: Math.PI,
    discovered: true
  } ),
  planetA = CreatePlanet( {
    scale: 0.25,
    orbit: {
      type: true,
      radius: 3,
      speed: 2 * Math.PI / 360
    },
    angle: Math.PI,
    discovered: true,
    moon: moonA
  } ),
  planetB = CreatePlanet( {
    scale: 0.1,
    orbit: {
      type: false,
      a: 10,
      b: 5,
      speed: 2 * Math.PI / 960
    },
    angle: Math.PI / 3,
    discovered: true
  } ),
  planetC = CreatePlanet( {
    scale: 0.3,
    orbit: {
      type: true,
      radius: 5,
      speed: 2 * Math.PI / 720
    },
    angle: Math.PI / 2,
    discovered: true
  } ),
  asteBelt = CreateBelt(),
  planeGeoA = new THREE.CircleGeometry( 3, 32 ),
  planeGeoB = new THREE.CircleGeometry( 1, 32 ).scale( 10, 5, 1 ),
  planeGeoC = new THREE.CircleGeometry( 10, 32 );

planeGeoA.vertices.shift();
planeGeoB.vertices.shift();
planeGeoC.vertices.shift();

const
  planeA = new THREE.Line( planeGeoA, materials.lineGrey ),
  planeB = new THREE.Line( planeGeoB, materials.lineGrey ),
  planeC = new THREE.Line( planeGeoC, materials.lineGrey );


planeA.rotation.x = Math.PI / 2;
planeB.rotation.x = Math.PI / 2;
planeC.rotation.x = Math.PI / 2;

scene.add( planeA );
scene.add( planeB );
scene.add( planeC );
scene.add( sun.geometry );
scene.add( planetA.geometry );
scene.add( planetB.geometry );
scene.add( planetC.geometry );
scene.add( asteBelt.geometry );

camera.position.x = 5;
camera.position.y = 5;
camera.position.z = 5;


let
  timeStep = 0,
  currentTime = Date.now();

function render() {

  timeStep = Date.now() - currentTime;

  camera.lookAt( sun.geometry.position );

  sun.animate( timeStep / 16 )

  planetA.animate( timeStep / 16 )
  planetB.animate( timeStep / 16 )
  planetC.animate( timeStep / 16 )

  asteBelt.animate( timeStep / 16 )

  currentTime += timeStep;

  requestAnimationFrame( render );

  renderer.render( scene, camera );

}

render();
