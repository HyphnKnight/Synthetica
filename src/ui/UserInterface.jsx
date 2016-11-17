import React from 'react';
import Reflex from '../util/Reflex.jsx';

import ui from '../data/ui';

import { } from './UserInterface.scss';

import BehaviorEditor from './BehaviorEditor/BehaviorEditor.jsx';

class UserInterface extends Reflex {

  constructor() {

    super();

    this.state = {
      view: ui.view,
    };

  }

  componentDidMount() {
    ui.subscribe( state => this.setState( {
      view: state.view
    } ) );
  }

  render() {

    let clas = 'UserInterface';

    clas += ' state-view-' + this.state.view;

    return ( <section class={ clas } >
      <BehaviorEditor />
    </section> );

  }

}

export default UserInterface;
