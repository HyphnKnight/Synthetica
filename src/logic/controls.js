import Store from '../util/store';
import THREE from 'three';
import { canvas, scene, camera } from './3dBase';

const
  keyCodes = Object.freeze( {

    '38': 'up',
    '40': 'down',
    '37': 'left',
    '39': 'right',

    '81': 'q',
    '87': 'w',
    '69': 'e',
    '65': 'a',
    '83': 's',
    '68': 'd',

    '48': '0',
    '49': '1',
    '50': '2',
    '51': '3',
    '52': '4',
    '53': '5',
    '54': '6',
    '55': '7',
    '56': '8',
    '57': '9',

    '189': '-',
    '187': '=',

    '32': 'space',
    '13': 'return',
    '16': 'shift',
    '17': 'ctrl',
    '9': 'tab',
    '18': 'alt'

  } ),
  controlStatus = Store( {

    up: false,
    down: false,
    left: false,
    right: false,

    q: false,
    w: false,
    e: false,
    a: false,
    s: false,
    d: false,

    '0': false,
    '1': false,
    '2': false,
    '3': false,
    '4': false,
    '5': false,
    '6': false,
    '7': false,
    '8': false,
    '9': false,

    '-': false,
    '=': false,

    space: false,
    return: false,
    shift: false,
    ctrl: false,
    tab: false,
    alt: false,

    click: false

  } );

let
  mouse = new THREE.Vector2(),
  raycaster = new THREE.Raycaster();

function parseKeyInfo( keyCode: number | string, active: boolean ): any {

  const key = keyCodes[ keyCode + '' ];

  if ( !!key ) {

    controlStatus[ key ] = !!active;

  }

  return controlStatus[ key ];

}

function mouseMove( event ) {

  event.preventDefault();

  mouse.x = ( ( event.clientX - canvas.offsetLeft ) / canvas.clientWidth ) * 2 - 1;
  mouse.y = -( ( event.clientY - canvas.offsetTop ) / canvas.clientHeight ) * 2 + 1;

}

function mouseDown( event ) {

  event.preventDefault();

  mouse.x = ( ( event.clientX - canvas.offsetLeft ) / canvas.clientWidth ) * 2 - 1;
  mouse.y = -( ( event.clientY - canvas.offsetTop ) / canvas.clientHeight ) * 2 + 1;
  raycaster.setFromCamera( mouse.clone(), camera );

  controlStatus.click = raycaster.intersectObjects( scene.children );

}

function mouseUp() {
  if ( !!controlStatus.click ) {
    controlStatus.click = false;
  }
}

document.body.onkeyup = e => parseKeyInfo( e.keyCode, false );

document.body.onkeydown = e => parseKeyInfo( e.keyCode, true );

document.addEventListener( 'mousemove', mouseMove, false );

document.addEventListener( 'mousedown', mouseDown, false );

document.addEventListener( 'mouseup', mouseUp, false );


export { controlStatus };
