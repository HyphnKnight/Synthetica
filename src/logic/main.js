import controlStatus    from './controls';
import cameraControls   from './camera';
import { renderScene }  from './3dBase';


const gameLoop = loop( dT => {

  cameraControls( dT );
  renderScene();

} );

function main( options ) {
  gameLoop();
}

export default main;
