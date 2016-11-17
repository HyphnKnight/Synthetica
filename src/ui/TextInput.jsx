import React from 'react';
import Reflex from '../util/Reflex.jsx';

import {
  isFunction
} from '../util/functional';

import {} from './TextInput.scss';

class TextInput extends Reflex {

  constructor() {

    super();

    this.state = {
      valid: false,
      empty: false
    }

  }

  componentDidMount() {

    const
      { valid, value, onEmpty, onValid } = this.props,
      isValid = isFunction( valid ) ? valid( value ) : !!value,
      isEmpty = value === '';

    if ( isValid && isFunction( onValid ) ) {
      onValid( value );
    }

    if ( isEmpty && isFunction( onEmpty ) ) {
      onEmpty( value );
    }

    this.setState({
      valid: isValid,
      empty: isEmpty
    });

  }

  getDefaultProps() {
    return {
      valid: value => value !== '',
      onEmpty: false,
      onValid: false,
      placeholder: '',
      value: ''
    }
  }

  change( e ) {

    const
      { valid,
        onEmpty,
        onValid,
        onChange } = this.props,
      value = e.target.value,
      isValid = isFunction( valid ) ? valid(value) : !!value,
      isEmpty = value === '';

    if ( isValid && isFunction( onValid ) ) {
      onValid( value );
    }

    if ( isEmpty && isFunction( onEmpty ) ) {
      onEmpty( value );
    }

    this.setState({
      valid: isValid,
      empty: isEmpty
    });

    onChange( value );

  }

  render() {

    const
      { value, placeholder } = this.props,
      { valid, empty } = this.state;

    let clas = 'TextInput';

    clas += !valid ? '' : ' state-valid';
    clas += !empty ? '' : ' state-empty';

    return (<input
      class={ clas }
      onChange={ event => this.change( event ) }
      value={ value }
      placeholder={ placeholder }
    />);
  }

}

export default TextInput;
