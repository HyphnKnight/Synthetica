import {
  identity,
  curry,
  uniqueId,
  flatten,
  times,
  unique,
  sort,
  difference,
  chain
} from '../util/functional.js';

import {
  materials, renderScene
} from './3dBase';

const neighborRelativePositions = [
  {	q: 0, r: -1 },
  {	q: 1, r: -1 },
  {	q: 1, r: 0 },
  {	q: 0, r: 1 },
  {	q: -1, r: 1 },
  {	q: -1, r: 0 }
];

function roundHexXYZ( hex ) {

  let
    rx		= Math.round( hex.x ),
    ry		= Math.round( hex.y ),
    rz		= Math.round( hex.z );

  const
    xDiff	= Math.abs( rx - hex.x ),
    yDiff	= Math.abs( ry - hex.y ),
    zDiff	= Math.abs( rz - hex.z );

  if (  xDiff > yDiff && xDiff > zDiff ) {
    rx = -ry - rz;
  } else if ( yDiff > zDiff ) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return {
    x: rx,
    y: ry,
    z: rz
  };

}

function lerp( start, end, time ) {
  return start + ( end - start ) * time;
}

function lerp3d( hexA, hexB, time ) {
  return {
    x: lerp( hexA.x, hexB.x, time ),
    y: lerp( hexA.y, hexB.y, time ),
    z: lerp( hexA.z, hexB.z, time )
  };
}

function distanceFromTo( hex, targetHex ) {
  return ( Math.abs( hex.x - targetHex.x ) + Math.abs( hex.y - targetHex.y ) + Math.abs( hex.z - targetHex.z ) ) / 2;
}

function addHexes( hex, targetHex ) {
  return hex.parent.get( hex.q + targetHex.q, hex.r + targetHex.r );
}

function subtractHexes( hex, targetHex ) {
  return hex.parent.get( hex.q - targetHex.q, hex.r - targetHex.r );
}

function getNeighbor( hex, direction ) {
  return addHexes( hex, neighborRelativePositions[ direction ] );
}

function getNeighbors( hex ) {
  return neighborRelativePositions.map( curry( addHexes, hex ) ).filter( identity );
}

function lerpHex( hexA, hexB, time ) {

  const point = roundHexXYZ( lerp3d( hexA, hexB, time ) );

  return hexA.parent.get( point.x, point.z );

}

function lineFromTo( hex, targetHex ) {


  return times( distanceFromTo( hex, targetHex ), ( interval, length ) => {

    const point = roundHexXYZ( lerp3d( hex, targetHex, ( interval + 1 ) / length ) );

    return hex.parent.get( point.x, point.z );

  } )

}

function evaluatePathIteration( resistFunc, heuristicFunc, rootHex, destinationHex ) {
  return function evaluatePathIterationInside( hex ) {

    hex.pathing.cameFrom  = rootHex;
    hex.pathing.costSoFar = resistFunc( hex, rootHex ) + rootHex.pathing.costSoFar;
    hex.pathing.touched   = false;

    if ( !!heuristicFunc ) {
      hex.pathing.priority = hex.pathing.costSoFar + heuristicFunc( hex, destinationHex, rootHex );
    }

    return hex;
  }
}

function getHexPath( hex ) {

  let result = [];

  while ( !!hex.pathing.cameFrom ) {

    result.push( hex );

    hex = hex.pathing.cameFrom;

  }

  return result.reverse();

}

function getWithin( distance, hex ) {

  const hexes = [];

  for ( let dx = -distance; dx <= distance; ++dx ) {

    for ( let dy = Math.max( -distance, -dx - distance ); dy <= Math.min( distance, -dx + distance ); ++dy ) {

      hexes.push( hex.parent.get( dx + hex.x, -dx - dy + hex.z ) );

    }

  }

  return hexes.filter( identity );

}

function getRing( distance, hex ) {

  let currentHex = hex.add( { q: -distance, r: distance } );

  currentHex = !currentHex ? { q: hex.q + -distance, r: hex.r + distance } : currentHex;

  const
    grid = hex.parent,
    results = [ currentHex ];

  for ( let i = 0; i < 6; ++i ) {
    for ( let j = 0; j < distance; ++j ) {

      const nextHex = grid.get(
        currentHex.q + neighborRelativePositions[ i ].q,
        currentHex.r + neighborRelativePositions[ i ].r
      );

      if ( !nextHex ) {
        currentHex = {
          q: currentHex.q + neighborRelativePositions[ i ].q,
          r: currentHex.r + neighborRelativePositions[ i ].r
        };
      } else {
        currentHex = nextHex;
        results.push( currentHex );
      }

    }
  }

  return unique( results.filter( hex => hex.type === 'HEX' ) );

}

function getSpiral( distance, hex ) {

  return flatten( times( distance, x => getRing( x, hex ) ) );

}

function isNewAndInRange( maxResist, hex ) {
  return hex.pathing.costSoFar <= maxResist && !hex.pathing.touched;
}

function getReachable( resistFunc, maxResist, startingHex ) {

  startingHex.pathing.cameFrom = false;
  startingHex.pathing.costSoFar = 0;
  startingHex.pathing.touched = false;

  let
    hexes = [ startingHex ],
    results = [],
    rootHex;

  while ( hexes.some( ( hex ) => !hex.pathing.touched ) ) {

    rootHex = hexes.shift();

    results.push( rootHex );

    rootHex.pathing.touched = true;

    const
      pathEvaluator = evaluatePathIteration( resistFunc, () => 1, rootHex, null ),
      rangeChecker = curry( isNewAndInRange, maxResist );

    hexes = chain( getNeighbors( rootHex ) )
      .difference( hexes )
      .difference( results )
      .map( pathEvaluator )
      .filter( rangeChecker )
      .concat( hexes )
      .unique()
      .value;

  }

  return results;

}

function getFieldOfView( range, blockedFunc, hex ) {

  return getWithin( range, hex )
    .filter( ( currentHex ) => !blockedFunc( currentHex ) )
    .filter( ( currentHex ) => lineFromTo( hex, currentHex ).some( lineHex => !blockedFunc( lineHex ) ) );

}

function rayCast( heuristic, resistFunc, maxResist, hex, direction ) {

  heuristic = !!heuristic ? heuristic : () => true;
  resistFunc = !!resistFunc ? resistFunc : () => 1;
  maxResist =  !!maxResist ? maxResist : Number.MAX_VALUE;

  const ray = [];

  let
    currentHex = hex,
    resistance = 0;

  while ( !!currentHex && !!heuristic( currentHex ) && resistance < maxResist ) {

    currentHex = getNeighbor( currentHex, direction );

    if ( !!currentHex ) {
      ray.push( currentHex );
      resistance += resistFunc( currentHex );
    } else {
      return false;
    }

  }

  return ray;

}



function obstructedLineFromTo( priorityFunc, resistFunc, maxResist, startingHex, destinationHex ) {

    startingHex.pathing.cameFrom = false;
    startingHex.pathing.costSoFar = 0;
    startingHex.pathing.priority = priorityFunc( startingHex, destinationHex );

    destinationHex.pathing.cameFrom = false;

    let
      hexes = [ startingHex ],
      clearHexes = [],
      rootHex;


    while ( !destinationHex.pathing.cameFrom ) {

      rootHex = hexes[ 0 ];

      if ( rootHex.pathing.priority > maxResist ) {
        return false;
      }

      hexes = chain( rootHex.neighbors )
        .difference( hexes )
        .map( evaluatePathIteration( resistFunc, priorityFunc, rootHex, destinationHex ) )
        .concat( hexes )
        .unique()
        .sort( hex => hex.pathing.priority, false )
        .value;

    }

    const path = getHexPath( destinationHex );

    return path;

}

function hexPixelPosition( hex ) {
  return ( [ Math.sqrt( 3 ) * ( hex.q + hex.r / 2 ), 1.5 * hex.r ] );
}

function Hex( radius, x, y ) {

  this.id = uniqueId();

  this.parent = null;
  this.pixel = null;

  this.storageX = x;
  this.storageY = y;

  this.r = y - radius,
  this.q = -radius - Math.min( 0, this.r ) + x;

  this.x = this.q;
  this.z = this.r;
  this.y = -this.q - this.r;

  this.pathing = {};

  this.data = null;

}

Hex.prototype.type = 'HEX';

Hex.prototype.add = function hexAdd( hex ) {
  return addHexes( this, hex );
};

Hex.prototype.sub = function hexSub( hex ) {
  return subtractHexes( this, hex );
};

Hex.prototype.distanceTo = function hexDistanceFromTo( hex ) {
  return distanceFromTo( this, hex );
};

Hex.prototype.getNeighbor = function hexGetNeighbor( direction ) {
  return getNeighbor( this, direction );
};

Hex.prototype.getNeighbors = function hexGetNeighbors() {
  return getNeighbors( this );
};

Hex.prototype.lerp = function hexLerp( hex, delta ) {
  return lerpHex( this, hex, delta );
};

Hex.prototype.lineTo = function hexLineFromTo( hex ) {
  return lineFromTo( this, hex );
};

Hex.prototype.getWithin = function hexGetWithin( distance ) {
  return getWithin( distance, this );
};

Hex.prototype.getRing = function hexGetWithin( distance ) {
  return getRing( distance, this );
};

Hex.prototype.getSpiral = function hexGetWithin( distance ) {
  return getSpiral( distance, this );
};

Hex.prototype.getFieldOfView = function hexGetFieldOfView( distance, blockedFunc ) {
  return getFieldOfView( distance, blockedFunc, this );
};

Hex.prototype.rayCast = function hexRayCast( heuristic, resistFunc, maxResist, direction ) {
  return rayCast( heuristic, resistFunc, maxResist, this, direction );
};

Hex.prototype.obstructedLineTo = function hexObstructedLineFromTo( destinationHex, resistFunc, maxResist = Number.MAX_VALUE, priorityFunc = distanceFromTo ) {
  return obstructedLineFromTo( priorityFunc, resistFunc, maxResist, this, destinationHex );
};

Hex.prototype.getReachable = function hexGetReachable( resistFunc, maxResist ) {
  return getReachable( resistFunc, maxResist, this );
};

Hex.prototype.getPixelPosition = function hexPixel() {
  return hexPixelPosition( this );
};

function HexGrid( radius, func ) {

  this.radius = radius;

  this.data = times( radius * 2 + 1, y => times( ( y <= radius ? radius + 1 + y : radius * 3 + 1 - y ), x => new Hex( radius, x, y ) ) );

  this.hexes = flatten( this.data );

  this.hexes.forEach( hex => {
    hex.parent = this;
    hex.pixel = hex.getPixelPosition();
    hex.neighbors = getNeighbors( hex );
    hex.data = func( hex );
  } );

}

HexGrid.prototype.get = function HexGridGet( q, r ) {
  return ( this.data[ this.radius + r ] === undefined ? null : this.data[ this.radius + r ][ this.radius + Math.min( 0, r ) + q ] );
};

HexGrid.prototype.getHexFromPixel = function HexGridGetHexFromPixel( x, y ) {

  const
    r = y / 1.5,
    q = x / Math.sqrt( 3 ) - r / 2;


  return this.get( Math.round( q ), Math.round( r ) );

};

export default HexGrid;
