/* functional.js */

/* Type Testing */

function isNull( x ) {
  return x === null;
}

function isUndefined( x ) {
  return typeof x === 'undefined';
}

function isNullOrUndefined( x ) {
  return isNull( x ) || isUndefined( x );
}

function isString( x ) {
  return typeof x === 'string';
}

function isNumber( x ) {
  return typeof x === 'number';
}

function isBoolean( x ) {
  return typeof x === 'boolean';
}

function isDate( date ) {
  return Object.prototype.toString.call( date ) === '[object Date]';
}

function isArray( x ) {
  return Array.isArray( x );
}

function isFunction( x ) {
  return ( {} ).toString.call( x ) === '[object Function]';
}

function isComparable( value ) {
  return typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'string' ||
    typeof value === 'symbol' ||
    typeof value === 'function';
}

function isFalsey( value ) {
  return isNullOrUndefined( value ) ||
    ( isBoolean( value ) && !value ) ||
    ( isString( value ) && value === '' ) ||
    ( isNumber( value ) && isNaN( value ) );
}

function isEqual( valueA, valueB ) {

  if ( typeof valueA !== typeof valueB ) {
    return false;
  } else if ( typeof valueA === 'undefined' ) {
    return true;
  } else if ( valueA === null || valueB === null || isComparable( valueA ) ) {
    return valueA === valueB;
  } else if ( valueA.type === 'HEX' && valueB.type === 'HEX' ) {
    return valueA.id === valueB.id;
  } else if ( isDate( valueA ) && isDate( valueB ) ) {
    return valueA.getTime() === valueB.getTime();
  } else if ( Array.isArray( valueA ) && Array.isArray( valueB ) ) {
    return valueA.length === valueB.length && !valueA.find( ( val, index ) => !isEqual( valueB[ index ], val ) );
  } else if ( valueA instanceof Map && valueB instanceof Map ) {
    return valueA.size === valueB.size && isEqual( Array.from( valueA.entries() ), Array.from( valueB.entries() ) );
  } else if ( valueA instanceof Set && valueB instanceof Set ) {
    return valueA.size === valueB.size && isEqual( Array.from( valueA ), Array.from( valueB ) );
  } else if ( !!valueA.__store__ && !!valueB.__store__  ) {
    return isEqual( valueA.__store__, valueB.__store__ );
  } else if ( Object.keys( valueA ).length === Object.keys( valueA ).length ) {
    return !Object.keys( valueA ).find( val => !isEqual( valueA[ val ], valueB[ val ] ) );
  } else {
    return false;
  }

}


/* Functions */

function identity( x ) {
  return x;
}

function curry( func, ...args ) {
  return function curryInside( ...insideArgs ) {
    return func( ...args.concat( insideArgs ) );
  }
}

function compose( ...functions ) {
  return function composeInside( ...args ) {
    const firstFunc = functions.shift();
    return functions.reduce( function composeReduce( result, func ) {
      return func( result );
    }, firstFunc.apply( null, args ) );
  }
}

function promiseCompose( ...functions ) {
  return function promiseComposeInside( ...args ) {
    return functions.reduce( function composeReduce( result, func ) {
      return result.then( func )
    }, Promise.resolve( args ) )
    .catch( function promiseComposeError( error ) {
      throw error;
    } );
  }
}

function memoize( func, keyFunc = JSON.stringify ) {

  const memoizeDB = {};

  return function memoizeInside( ...args ) {

    const key = keyFunc( ...args );

    if ( typeof memoizeDB[ key ] !== undefined ) {

      return memoizeDB[ key ];

    } else {

      memoizeDB[ key ] = func( ...args );

      return memoizeDB[ key ];

    }

  }

}


/* Array Functions */

function times( length, func = identity ) {
  return map( new Array( length ).fill( 0 ), ( _, i ) => func( i, length ) );
}

function move( array, from, to ) {

  const
    result = [],
    arrayLength = array.length;

  let mod = 0;

  for ( let i = 0; i < arrayLength; ++i ) {

    if ( i === from ) {

      result[ to ] = array[ i ];

    } else {

      if ( i > from && i > to ) {
        mod = -0;
      } else if ( i > from ) {
        mod = -1;
      } else if ( i >= to ) {
        mod = 1;
      } else {
        mod = 0;
      }

      result[ i + mod ] = array[ i ];

    }

  }

  return result;

}

function difference( array, targetArray ) {
  return filter( array, val => targetArray.indexOf( val ) === -1 );
}

function flatten( array ) {
  return [].concat.apply( [], array );
}

function unique( array ) {
  return filter( array, ( value, index, self ) => self.indexOf( value ) === index );
}

function uniqueBy( array, func = identity ) {
  return unique( map( array, value => func( value ) ) );
}

function groupBy( array, func = identity ) {
  return reduce( array, ( groupedResults, value ) => {
    const key = func( value );
    if ( isArray( groupedResults[ key ] ) ) {
      groupedResults[ key ].push( value );
    } else {
      groupedResults[ key ] = [ value ];
    }
    return groupedResults;
  }, {} );
}

function invoke( array ) {
  return map( array, func => {
    func();
    return func;
  } );
}

function filter( array, func = identity ) {

  const
    arrayLength = array.length,
    result = [];

  for ( let index = 0; index < arrayLength; ++index ) {

    if ( !!func( array[ index ], index, array ) ) {

      result.push( array[ index ] );

    }

  }

  return result;

}

function indexOf( array, value ) {

  const arrayLength = array.length;

  let result = -1;

  for ( let i = 0; i < arrayLength; ++i ) {

    if ( array[ i ] === value ) {

      return i;

    }

  }

  return result;

}

function reduce( array, func, initial = 0 ) {

  const arrayLength = array.length;

  let result = initial;

  for ( let index = 0; index < arrayLength; ++index ) {

    result = func( result, array[ index ], index, array );

  }

  return result

}

function forEach( array, func ) {

  const arrayLength = array.length;

  for ( let index = 0; index < arrayLength; ++index ) {

    func( array[ index ], index, array );

  }

  return Array.from( array );

}

function map( array, func = identity ) {

  const
    arrayLength = array.length,
    result = [];

  for ( let index = 0; index < arrayLength; ++index ) {

    result[ index ] = func( array[ index ], index, array );

  }

  return result;

}

function concat( ...arrays ) {
  return flatten( arrays );
}

function sort( array, func = identity, ascending = true ) {

  let sortFunc;

  if ( !ascending ) {

    sortFunc = function descendingSort( a, b ) {
      return func( a ) - func( b );
    };

  } else {

    sortFunc = function ascendingSort( a, b ) {
      return func( b ) - func( a );
    };

  }

  return Array.from( array ).sort( sortFunc );

}

function reverse( array ) {
  return Array.from( array ).reverse()
}

function heuristicFind( array, func = identity ) {
  return sort( array, func, false )[ 0 ];
}

/* Map Functions */

function mapFilter( map, func = identity ) {
  const newMap = Map( {} );
  map.forEach( function mapFilterInside( value, key ) {
    if ( func( value ) ) {
      newMap.set( key, value );
    }
  } );
  return newMap;
}

function mapMap( map, func = identity ) {
  const newMap = Map( {} );
  map.forEach( function mapMapInside( value, key ) {
    newMap.set( key, func( value ) );
  } );
  return newMap;
}

function mapDifferenceKey( map, targetMap ) {
  return mapFilter( map, function mapDifferenceKeyInside( value, key ) {
    return !targetMap.get( key );
  } )
}

function mapDifferenceValue( map, targetMap ) {
  return mapFilter( map, function mapDifferenceValueInside( value ) {
    return !targetMap.has( value );
  } )
}

function mapMerge( map, targetMap ) {
  const newMap = Map( {} );
  targetMap.forEach( function mapTargetMergeInside( value, key ) {
    newMap.set( key, value );
  } );
  map.forEach( function mapMergeInside( value, key ) {
    newMap.set( key, value );
  } );
  return newMap;
}

function mapGroupBy( map, func = identity ) {
  const newMap = Map( {} );
  map.forEach( function mapGroupByInside( value, key ) {
    const groupKey = func( value );
    if ( !newMap.get( groupKey ) ) {
      newMap.set( groupKey, new Map( { [ key ]: value } ) );
    } else {
      newMap.get( groupKey ).set( key, value );
    }
  } )
  return newMap;
}


/* Objects */

function objectGet( obj, path ) {
  return path.split( '.' ).reduce( function getReduce( value, key ) {
    return typeof value === 'undefined' ? undefined : value[ key ];
  }, obj );
}

function objectForEach( obj, func = identity ) {
  forEach( Object.keys( obj ), key => func( obj[ key ] ) );
  return obj;
}

function objectMap( obj, func = identity ) {

  const newObj = {};

  forEach( Object.keys( obj ), key => {
    newObj[ key ] = func( obj[ key ] )
  } );

  return obj;

}

function objectFind( obj, func = identity ) {

  const foundKey = Object.keys( obj ).find( key => func( obj[ key ], key ) );

  return !!foundKey ? [ obj[ foundKey ], foundKey ] : foundKey;

}

function objectToArray( obj ) {

  const newArray = [];

  forEach( Object.keys( obj ), key => newArray.push( obj[ key ] ) );

  return newArray;

}

/* Math */

function clamp( num, lower, upper ) {
  return num > upper ? upper : ( num < lower ? lower : num );
}

function random( max = 1, min = 0 ) {
  return Math.random() * ( max - min ) + min;
}

function lerp( a, b, dt ) {
  return a + ( a - b ) * dt;
}

function uniqueId() {
  return Math.floor( ( new Date() ).getTime() * 1000 + Math.random() * 1000 );
}


/* Chain */

function chain( array ) {
  if ( !isArray( array ) ) {
    throw 'Not Array';
  }
  return {
    map: compose( curry( map, array ), chain ),
    filter: compose( curry( filter, array ), chain  ),
    difference: compose( curry( difference, array ), chain  ),
    flatten: compose( curry( flatten, array ), chain  ),
    unique: compose( curry( unique, array ), chain  ),
    uniqueBy: compose( curry( uniqueBy, array ), chain  ),
    groupBy: compose( curry( groupBy, array ), chain  ),
    invoke: compose( curry( invoke, array ), chain  ),
    concat: compose( curry( concat, array ), chain  ),
    sort: compose( ( func, ascending = true ) => sort( array, func, ascending ), chain ),
    reverse: compose( curry( reverse, array ), chain  ),
    value: array
  };
}

function chainMap( chainedMap ) {
  return {
    map: compose( curry( mapMap, chainedMap ), chain ),
    filter: compose( curry( mapFilter, chainedMap ), chain  ),
    differenceKey: compose( curry( mapDifferenceKey, chainedMap ), chain  ),
    differenceValue: compose( curry( mapDifferenceValue, chainedMap ), chain  ),
    groupBy: compose( curry( mapGroupBy, chainedMap ), chain  ),
    merge: compose( curry( mapMerge, chainedMap ), chain  ),
    value: chainedMap
  };
}

export {

  // Types
  isNull,
  isUndefined,
  isNullOrUndefined,
  isString,
  isNumber,
  isBoolean,
  isArray,
  isFunction,
  isDate,
  isFalsey,
  isEqual,

  // Functions
  identity,
  curry,
  compose,
  promiseCompose,
  memoize,

  // Arrays
  times,
  move,
  difference,
  unique,
  uniqueBy,
  flatten,
  groupBy,
  invoke,
  sort,
  map,
  indexOf,
  forEach,
  heuristicFind,
  chain,

  // Maps
  mapMap,
  mapFilter,
  mapDifferenceKey,
  mapDifferenceValue,
  mapGroupBy,
  mapMerge,
  chainMap,

  // Objects
  objectGet,
  objectForEach,
  objectMap,
  objectFind,
  objectToArray,

  // Math
  clamp,
  random,
  uniqueId,
  lerp

};
