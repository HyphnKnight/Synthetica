import controlStatus    from './controls';
import cameraControls   from './camera';
import { renderScene }  from './3dBase';


const gameLoop = loop( dT => {
  testMesh.rotation.x += dT * 0.005;
  testMesh.rotation.y += dT * 0.005;
  testMesh.rotation.z += dT * 0.005;

  cameraControls( dT );
  renderScene();

} );

function main( options ) {
  gameLoop();
}

export default main;
