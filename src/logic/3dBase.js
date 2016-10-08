import THREE from 'three';

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
  camera = new THREE.PerspectiveCamera( 65, window.innerWidth / window.innerHeight, 0.1, 1000 ),
  renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( colors.background );
renderer.localClippingEnabled = true;

camera.up = new THREE.Vector3( 0, 0, 1 );

document.body.appendChild( renderer.domElement );

function renderScene() {
  renderer.render( scene, camera );
}

export { colors, materials, scene, camera, renderer, canvas, renderScene }
