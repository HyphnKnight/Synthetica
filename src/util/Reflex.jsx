import React from 'react';
import {
  isUndefined,
  isString,
  isBoolean,
  isEqual,
  objectFind
} from './functional';

class Reflex extends React.Component {

  constructor() {

    super();

    this.state = {};

  }

  shouldComponentUpdate( nextProps, nextState ) {

    if ( !!objectFind( nextState, ( stateValue, stateName ) => isUndefined( this.state[ stateName ] ) ) ) {
      throw 'Reflex - Attempting to set value of unregistered key.'
    }

    return !!objectFind( nextProps, ( propValue, propName ) => !isEqual( this.props[ propName ], propValue ) ) ||
      !!objectFind( nextState, ( stateValue, stateName ) => !isEqual( this.state[ stateName ], stateValue ) );

  }

  generateClasses( ...propertyNames ) {

    let cssClasses = '';

    propertyNames.forEach( name => {

      if ( !isUndefined( this.state[ name ] ) ) {

        if ( isBoolean( this.state[ name ] ) ) {

          if ( !!this.state[ name ] ) {
            cssClasses += ` state-${name}`;
          }

        } else if ( isString( this.state[ name ] ) ) {

          cssClasses += ` state-${name}-${this.state[ name ]}`;

        }

      } else {

        throw 'Reflex - Attempting to create class from unregistered key';

      }

    } );

    return cssClasses;

  }

}

export default Reflex;
