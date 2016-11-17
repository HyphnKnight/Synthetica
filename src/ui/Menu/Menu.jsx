import React from 'react';
import Reflex from '../../util/Reflex.jsx';
import ui from '../../data/ui';

import { } from './Menu.scss';


class Menu extends Reflex {

  constructor() {

    super();

    this.state = {
      open: false
    };


  }

  render() {
    return ( <section class={ 'Menu' + this.generateClasses( 'open' ) } >
    </section> );
  }

}

export default Menu;
