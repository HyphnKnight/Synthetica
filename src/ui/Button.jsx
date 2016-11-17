import React from 'react';
import Reflex from '../util/Reflex.jsx';

import { identity } from '../util/functional';

import {} from './Button.scss';

class Button extends Reflex {

  constructor() {

    super();

  }

  getDefaultProps() {
    return {
      action: identity,
      disabled: false,
      disabledAction: identity
    };
  }

  render() {

    const
      { action,
        disabled,
        disabledAction,
        children } = this.props,
      clas = `Button state-${ !disabled ? 'enabled' : 'disabled' }`,
      clickAction = !disabled ? action : disabledAction;

    return ( <a
      class={ clas }
      onClick={ clickAction } >{
      children
    }</a> );
  }

}

export default Button;
