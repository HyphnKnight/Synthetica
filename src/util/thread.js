const
  numberOfCPUs = require('os').cpus().length,
  cluster = require('cluster');

let activeCPUS = 0;

function chunk( array, number ) {

  const
    result = [],
    arrayLength = array.length;

  for ( let index = 0; index < arrayLength; ++index ) {

    result[ Math.floor( index / number ) ].push( array[ index ] );

  }

  return result;

}

function flatten( array ) {

  return [].concat.apply( [], array );

}

function map( array, func = identity ) {

  const
    arrayLength = array.length,
    result = [];

  for ( let index = 0; index < arrayLength; ++index ) {

    result[index] = func( array[ index ], index, array );

  }

  return result;

}

function thread( array, func ) {

  const
    usableCPUS = numberOfCPUs - activeCPUS,
    chunkData = chunk( array, array.length / usableCPUS );

  return Promise.all( map( chunkData, data => createThread( data, func ) ) )
    .then( results => flatten( results ) )
    .catch( error => {
      throw error;
    } )

}

function createThread( data, func ) {

  const worker = cluster.fork();

  ++activeCPUS;

  return new Promise( ( resolve, reject ) => {

    worker.on( 'message', function workerTask( msg ) {

      let results;

      try {
        results = func( data );
      } catch( error ) {
        reject( error );
      }

      --activeCPUS;

      resolve( results );

    } )

  } )

}

if (cluster.isMaster) {

} else {

}
