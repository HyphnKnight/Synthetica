import React from 'react-lite';
import Reflex from '../../util/Reflex.jsx';

import { } from './Menu.scss';

class Menu extends Reflex {

  constructor() {

    super();

    this.state = {
      open: false
    };


  }

  render() {
    return ( <section class={ 'Menu' + this.generateClasses( [ 'open' ] ) } >
      <nav>
        <a>Diagnostics</a>
        <a>Intelligence Architect</a>
      </nav>
    </section> );
  }

}

export default Menu;
