import React from 'react';
import Reflex from '../util/Reflex.jsx';

import {} from './Frame.scss';

class Frame extends Reflex {

  constructor() {

    super();

  }

  render() {

    const
      { size,
        urgency,
        title,
        subTitle,
        children,
        close } = this.props,
      headerContent = [],
      clas = `Frame ${ title.replace( /\s/, '' ) } state-size-${size} state-urgency-${urgency}`;

    for ( let i = size + 1; i >= 0; --i ) {

      const closefunc = !!close && i === size + 1 ? close : null;

      let value = '';

      if ( size + 1 === i ) {
        value = 'X';
      } else if ( i === 0 ) {
        value = title;
      } else if ( i === 1 ) {
        value = subTitle;
      }

      headerContent.push( <div key={i} onClick={ closefunc } >{ value }</div> );

    }

    return ( <section class={ clas } >
      <header>{ headerContent }</header>
      <div class="Frame-Content">{
        children
      }</div>
    </section> );
  }

}

export default Frame;
