/* Store.js */

import {
  isEqual,
  uniqueId,
  curry,
  identity
} from './functional';

function setStore( store, subscriptions, obj ) {

  const objKeys = Object.keys( obj );

  let oldStore;

  if ( objKeys.map( key => {

    if ( !isEqual( obj[ key ], store.__store__[ key ] ) ) {

      if ( !oldStore ) {

        oldStore = Object.assign( {}, store.__store__ );

      }

      store.__store__[ key ] = obj[ key ];

      return true;

    } else {

      return false;

    }

  } ).some( identity ) ) {

    Object.keys( subscriptions ).forEach( key => subscriptions[ key ]( store, oldStore ) );

  }

}

function Store( protoObj ) {

  protoObj = typeof protoObj === 'string' ? JSON.parse( protoObj ) : protoObj;

  if ( Object.keys( protoObj ).some( key => key === 'subscribe' || key === '__store__' || key === 'set' ) ) {
    throw 'Store can not be created from an object with reserved keys: subscribe, __store__ and set.';
  }

  const
    subscriptions = {},
    newStore = {
      subscribe: func => {

        const key = uniqueId();

        subscriptions[ key ] = func;

        return () => {
          delete subscriptions[ key ];
        };

      },
      __store__: {}
    };

  Object.keys( protoObj ).forEach( key => {

    newStore.__store__[ key ] = protoObj[ key ];

    Object.defineProperty( newStore, key, {
      set: value => {
        if ( !isEqual( value, newStore.__store__[ key ] ) ) {
          const oldStore = Object.assign( {}, newStore.__store__ );
          newStore.__store__[ key ] = value;
          Object.keys( subscriptions ).forEach( key => subscriptions[ key ]( newStore, oldStore ) );
        }
      },
      get: () => newStore.__store__[ key ]
    } );

  } );

  Object.defineProperty( newStore, 'JSON', {
    set: string => newStore.set( JSON.parse( string ) ),
    get: () => JSON.stringify( newStore.__store__ )
  } );

  newStore[ Symbol.iterator ] = () => ( function iteratorMaker( protoObj ) {
    'use strict';

    const objKeys = Object.keys( protoObj );

    let index = 0;

    return {
      next: function next() {

        const value = protoObj[ objKeys[ index ] ];

        let result;

        if ( index > objKeys.length - 1 ) {
          result = { done: true };
        } else {
          result = { value, done: false };
          ++index;
        }

        return result;

      }
    }
  } )( protoObj );

  newStore.set = curry( setStore, newStore, subscriptions );

  return Object.preventExtensions( newStore );

}

export default Store;
