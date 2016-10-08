import React from 'react-lite';
import Reflex from '../util/Reflex.jsx';

import { } from './UserInterface.scss';

//import Menu   from './Menu/Menu.jsx';
//import Cursor from './Cursor/Cursor.jsx';

import {
  Button,
  PopUp
} from './basic.jsx';

class UserInterface extends Reflex {

  constructor() {

    super();

    this.state = {
      menu: true,
      tab: 'AI'
    };

  }

  render() {

    const
      sampleButton = Button( () => this.setState( { menu: false } ), 'Do Something', {
        urgency: 0,
        urgencyText: 3
      } ),
      samplePopUp = PopUp( 'Sample PopUp', [ sampleButton ], {
        urgency: 3,
        close: () => console.log( 'close' )
      } );

    return ( <section class={ 'UserInterface' + this.generateClasses( 'menu', 'tab' ) } >{
      !!this.state.menu ? samplePopUp : ''
    }</section> );

  }

}

export default UserInterface;
