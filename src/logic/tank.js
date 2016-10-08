import Store from '../util/store';
import { materials } from './3dBase.js';
import {
  isEqual,
  lerp,
  curry,
  heuristicFind
} from '../util/functional';
import { createTankMesh, hexOutlinesGeometries  } from './geometry';
import { pixelHeightCalculator } from './terrain';

function sqrLengthOfVectorDiff( vec1, vec2 ) {
  return Math.pow( vec1.x - vec2.x, 2 ) + Math.pow( vec1.y - vec2.y, 2 )
}

function moveTank( tank, x, y, dt ) {
  tank.position = {
    x: tank.position.x + lerp( 0, x * tank.movement, dt ),
    y: tank.position.y + lerp( 0, y * tank.movement, dt )
  };
}

function updateTank( map, tank, state, oldState ) {

  if ( !isEqual( state.position, oldState.position ) ) {

    state.mesh.position.x = state.position.x;
    state.mesh.position.y = state.position.y;
    state.mesh.position.z = pixelHeightCalculator( state.position.x, state.position.y );

    tank.hex = heuristicFind( hexOutlinesGeometries, geo => sqrLengthOfVectorDiff( geo.position, state.position ) ).userData.hex;

  }

  if ( !isEqual( state.health, oldState.health ) ) {
    tank.dead = state.health > 0;
  }

  if ( !isEqual( state.view, oldState.view ) ) {

    if ( oldState.view && oldState.view.length ) {
      oldState.view.forEach( hex => {
        hex.data.geometry.outline.material = materials.lineBlueDark;
      } );
    }

    state.view.forEach( hex => {
      hex.data.geometry.outline.material = materials.lineBlueLight;
    } );

  }

  if ( !isEqual( state.hex, oldState.hex ) ) {


    tank.view = state.hex.getReachable( hex => {
      //console.log( hex.data.height, hex.data.height + 1 > 0 );
      return hex.data.height + 1;
    }, 10 );

    //console.log( tank.view.length );

  }

}

function createTank( map, q, r ) {

  const
    startingHex = map.get( q, r ),
    newTank = Store( {
      hex: startingHex,
      movement: 0.1,
      position: { x: startingHex.pixel[ 0 ], y: startingHex.pixel[ 1 ] },
      health: 100,
      dead: false,
      mesh: createTankMesh(),
      view: []
    } ),
    move = curry( moveTank, newTank );

  updateTank( map, newTank, newTank, {} );

  newTank.subscribe( curry( updateTank, map, newTank ) );

  return {
    move,
    data: newTank
  }

}

export { createTank };
