import { fetchVector, releaseVector } from './Vector';
import {
  heuristicFind,
  isUndefined
} from '../util/functional';

function closestHex( char, set ) {
  return heuristicFind( set, setHex => fetchVector( char.data.position )
    .sub( fetchVector( char.data.hex.data.geometry.outline.position ) )
    .magnitude() );
}

function moveThroughSet( char, set, forward = true, repeat = true, alternate = false ) {

  let
    target = set.indexOf( closestHex( char, set ) ),
    currentIndex = 0;

  return function moveThroughSetInside() {

    const increment = ( forward ? 1 : -1 );

    currentIndex = set.indexOf( char.data.hex );

    if ( currentIndex > -1 ) {

      const
        pos = fetchVector( char.data.position ),
        geoPos = fetchVector( char.data.hex.data.geometry.outline.position ),
        distance = pos.sub( geoPos ).magnitude();

      if ( distance < 0.25 ) {

        if ( isUndefined( target ) ) {

          target = currentIndex;

        }

        if ( target === currentIndex ) {

          target += increment;

        }

        if ( !!repeat ) {

          if ( target < 0 ) {

            if ( !!alternate ) {
              forward = !forward;
              target = 1;
            } else {
              target = set.length - 1;
            }

          } else if ( target > set.length - 1 ) {

            if ( !!alternate ) {
              forward = !forward;
              target = set.length - 2;
            } else {
              target = 0;
            }

          }

        }

      }

      releaseVector( pos, geoPos );

    }

    return set[ target ];

  }

}

function orbit( char, hex, range = 3, clockwise = true ) {
  return moveThroughSet( char, hex.getRing( range ), clockwise );
}

function spiral( char, hex, range = 3, clockwise = true ) {
  return moveThroughSet( char, hex.getSpiral( range ), clockwise, true, true );
}

function pathTo( char, hex ) {
  return moveThroughSet( char, char.data.hex.lineTo( hex ), true, false );
}

function obstructedLineTo( char, hex ) {
  return moveThroughSet( char, char.data.hex.obstructedLineTo( hex, hex => hex.data.height ), true, false );
}

function keepInsideDistance( charA, charB, range ) {

  const obstructedCalc = {};

  return function keepInsideDistanceInside() {

    if ( charA.data.hex.distanceTo( charB.data.hex ) > range ) {

      const lineRef = `${charA.id} ${charB.id}`;

      if ( !obstructedCalc[ lineRef ] ) {
        obstructedCalc[ lineRef ] = charA.data.hex.obstructedLineTo( charB.data.hex, hex => hex.data.height );
      }

      return obstructedCalc[ lineRef ][ 0 ];

    } else {

      return charA.data.hex;

    }

  }

}

function keepAwayDistance( charA, charB, range ) {

  const obstructedCalc = {};

  return function keepAwayDistanceInside() {

    if ( charA.data.hex.distanceTo( charB.data.hex ) < range ) {

      const lineRef = `${charA.id} ${charB.id}`;

      if ( !obstructedCalc[ lineRef ] ) {
        obstructedCalc[ lineRef ] = charA.data.hex.obstructedLineTo( closestHex( charA, charB.data.hex.getRing( range ) ), hex => hex.data.height );
      }

      return obstructedCalc[ lineRef ][ 0 ];

    } else {

      return charA.data.hex;

    }

  }

}

function keepAtDistance( charA, charB, range ) {

  const
    away = keepAwayDistance( charA, charB, range ),
    inside = keepAwayDistance( charA, charB, range );

  if ( charA.data.hex.distanceTo( charB.data.hex ) < range ) {

    return inside();

  } else if ( charA.data.hex.distanceTo( charB.data.hex ) > range ) {

    return away();

  }

  return charA.data.hex;

}

export {
  orbit,
  spiral,
  pathTo,
  obstructedLineTo,
  keepInsideDistance,
  keepAwayDistance,
  keepAtDistance
};
