import React from 'react';
import Reflex from '../../util/Reflex.jsx';
import ui from '../../data/ui';

import Frame from '../Frame';

import { } from './BehaviorEditor.scss';


class BehaviorEditor extends Reflex {

  constructor() {

    super();

    this.state = {
      behavior: false,
      behaviors: ui.behaviors
    };

  }

  componentDidMount() {
    ui.subscribe( state => this.setState( {
      behaviors: state.behaviors
    } ) );
  }

  render() {

    return ( <Frame
              title="Behavior Editor"
              subTitle={ !this.state.behavior ? '' : this.state.behavior.name }
              size={3}
              urgency={3}
              draggable={ true }
              close={ () => {} } >

      <div class="SelectBehavior">
        <h1>Select a Behavior</h1>
        <ul>{ this.state.behaviors.map( ( behavior, i ) => (
          <li key={ i }
              onClick={ () => this.setState( { behavior } ) } >{
            behavior.name
          }</li>
        ) ) }</ul>
      </div>

      <div class="Command">
        Build Commands
      </div>

    </Frame> );

  }

}

export default BehaviorEditor;
