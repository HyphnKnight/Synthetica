import { Point, Circle, Rectangle } from '../physics/2d/Geometries.js';
import { Rigidbody } from '../physics/2d/Rigidbody.js';
import { Engine } from '../physics/2d/Engine.js';import THREE from 'three';
import { fetchVector } from '../physics/Vector.js';
import { accelerationFromForce } from '../physics/Equations.js';
import { controlStatus } from '../controls.js';

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

function CreateSun( scale ) {

  let
    scaleDirection = -1,
    currentScale = 1,
    outerScale = 1.001;

  const


    rigidbody = new Rigidbody( 0, 0, 0, [
      new Circle( 0, 0, 0, scale )
    ], {
      terminalVelocity: 0,
      terminalAngularVelocity: 0
    } ),

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
    rigidbody: rigidbody,
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


    rigidbody = new Rigidbody( options.position.x, options.position.y, 0, [
      new Circle( 0, 0, 0, options.scale )
    ], {
      velocity: options.velocity
    } ),

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

  return {
    rigidbody,
    geometry: planet,
    animate: function( time ) {
      colorMesh.rotation.y += 0.05;

      planet.position.x = rigidbody.position.x;
      planet.position.z = rigidbody.position.y;

    }
  };

}

function gravity( planets, sun, time ) {

  planets.forEach( planet => {

    const
      relativePosition = sun.rigidbody.position.copy().subtract( planet.rigidbody.position ).normalize(),
      acceleration = accelerationFromForce( planet.rigidbody.mass, relativePosition );

    planet.rigidbody.velocity.add( acceleration.scale( time ) );


  } )

}

const
  cameraDistance = 30,
  cameraXAxis = new THREE.Vector3( 1, 0, 0 ),
  cameraYAxis = new THREE.Vector3( 0, 1, 0 ),
  cameraZAxis = new THREE.Vector3( 0, 0, 1 ),
  sun = CreateSun( 1 ),
  alpha = CreatePlanet( {
    position: fetchVector( 3, 0 ),
    scale: 0.25,
    velocity: fetchVector( 0, 1.7 )
  } ),
  beta = CreatePlanet( {
    position: fetchVector( 0, 8 ),
    scale: 0.25,
    velocity: fetchVector( -1.7, 0 )
  } ),
  planets = [ alpha, beta ];

scene.add( sun.geometry );
scene.add( alpha.geometry );
scene.add( beta.geometry );

camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 0;

camera.lookAt( sun.geometry.position );


function render( time ) {

  sun.animate( time )

  alpha.animate( time )

  beta.animate( time )

  renderer.render( scene, camera );

}


let
  time = 0,
  timeStep = 0,
  timeScale = 0.1,
  currentTime = Date.now(),
  paused = false;

const
  engine = new Engine();

engine.add( sun.rigidbody );
engine.add( alpha.rigidbody );
engine.add( beta.rigidbody );

function userInput( time ) {

  const { w, a, s, d, up, down, left, right } = controlStatus;

  if ( w || up ) {
    camera.position.applyAxisAngle( cameraZAxis, -2 * Math.PI / 600 );
  }

  if ( s || down ) {
    camera.position.applyAxisAngle( cameraZAxis, 2 * Math.PI / 600 );
  }

  if ( a || left ) {
    camera.position.applyAxisAngle( cameraYAxis, -2 * Math.PI / 600 );
  }

  if ( d || right ) {
    camera.position.applyAxisAngle( cameraYAxis, 2 * Math.PI / 600 );
  }

  if ( w || up || s || down || a || left || d || right ) {
    camera.position.setLength( 10 );
    camera.lookAt( sun.geometry.position );
  }

}

function loop() {

  timeStep = Date.now() - currentTime;

  if ( timeStep > 16 ) {
    timeStep = 16;
  }

  currentTime += timeStep;

  time = timeStep / ( 16 / timeScale );

  engine.iterate( time );

  gravity( planets, sun, time )

  render( time );

  userInput();

  if ( !paused ) {
    window.requestAnimationFrame( loop );
  }

}

loop();
