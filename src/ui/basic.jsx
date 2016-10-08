import React from 'react-lite';

import {
  identity,
  isUndefined,
  isBoolean,
  isString,
  isNumber
} from '../util/functional.js';

import { } from './basic.scss';

function generateClasses( state ) {

  let cssClasses = '';

  Object.keys( state ).forEach( name => {


    if ( !isUndefined( state[ name ] ) ) {

      if ( isBoolean( state[ name ] ) ) {

        if ( !!state[ name ] ) {

          cssClasses += ` state-${name}`;

        }

      } else if ( isString( state[ name ] ) || isNumber( state[ name ] ) ) {

        cssClasses += ` state-${name}-${state[ name ]}`;

      }

    } else {

      throw 'Attempting to create class from unregistered key';

    }

  } );

  return cssClasses;

}

function PopUp( title, children, options ) {

  options = Object.assign( {
    wireframe: false,
    close: identity,
    urgency: 1
  }, options );

  return (
    <div class={ 'PopUp' + generateClasses( options ) } >
      <div class="PopUp-Top" onClick={ options.close } >X</div>
      <div class="PopUp-Top" ></div>
      <div class="PopUp-Top" ></div>
      <div class="PopUp-Top" ></div>
      <div class="PopUp-Top" >{
        title
      }</div>
      <div class="PopUp-Content" >{
        children
      }</div>
    </div>
  );
}

function Button( action, children, options ) {

  options = Object.assign( {
    disabled: false,
    disabledAction: identity,
    urgency: 1,
    urgencyText: false
  }, options );

  const onClickAction = options.disabled ? options.disabledAction : options.action;

  return (
    <div class={ 'Button' + generateClasses( options ) }
          onClick={ onClickAction } >{
      children
    }</div>
  );

}

export {
  PopUp,
  Button,
  generateClasses
};
