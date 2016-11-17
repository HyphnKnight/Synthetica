import React from 'react';
import Reflex from '../../util/Reflex.jsx';

//import { } from './Menu.scss';

class Cursor extends Reflex {

  constructor() {

    super();

    this.state = {
      open: false
    };


  }

  render() {
    return ( <section class={ 'Cursor' + this.generateClasses( [ 'open' ] ) } >
      <nav>
        <a>Diagnostics</a>
        <a>Intelligence Architect</a>
      </nav>
    </section> );
  }

}

export default Cursor;
