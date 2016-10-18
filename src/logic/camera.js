import THREE from 'three';
import { camera } from './3dBase.js';
import { controlStatus } from './controls.js'

let
  rotation = 0,
  cameraDistance = 16;

camera.position.x = 0;
camera.position.y = -1 * cameraDistance;
camera.position.z = cameraDistance / 2;

function cameraControls( dT ) {

  const
    { w, a, s, d, q, e, up, down, right, left, shift, ctrl } = controlStatus,
    direction = new THREE.Vector3(),
    movement = new THREE.Vector3();

  direction.copy( camera.getWorldDirection() );

  direction.setZ( 0 );

  direction.normalize();

  if ( w || up ) {
    movement.add( direction );
  }

  if ( s || down ) {
    movement.addScaledVector( direction, -1 );
  }

  if ( d || right ) {

    const
      x = direction.x,
      y = direction.y,
      newDir = ( new THREE.Vector3() ).copy( direction );

    newDir.setX( y );
    newDir.setY( -x );

    movement.add( newDir );

  }

  if ( a || left ) {

    const
      x = direction.x,
      y = direction.y,
      newDir = ( new THREE.Vector3() ).copy( direction );

    newDir.setX( -y );
    newDir.setY( x );

    movement.add( newDir );

  }

  if ( q ) {
    rotation += Math.PI / 32 * dT;
  }

  if ( e ) {
    rotation -= Math.PI / 32 * dT;
  }

  if ( shift && cameraDistance <= 36 ) {
    cameraDistance += dT;
    movement.addScaledVector( direction, -1 );
  }

  if ( ctrl && cameraDistance >= 3 ) {
    cameraDistance -= dT;
    movement.add( direction );
  }

  let lookPos = new THREE.Vector3( 0, cameraDistance, 0 )
    .applyAxisAngle( new THREE.Vector3( 0, 0, 1 ), rotation )
    .add( camera.position );

  lookPos.z = 0;

  camera.position.z = cameraDistance / 2;

  camera.lookAt( lookPos );

  camera.position.addScaledVector( movement, dT );

}

export default cameraControls;
