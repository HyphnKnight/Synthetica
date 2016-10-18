import Store from '../util/store';

import {
  isEqual
} from '../util/functional';

import { pixelHeightCalculator } from './terrain';

function Entity( ) {

  const {
    data,
    graphics,
    behaviors,
    initialize,
    terminate,
    updater
  } = options;

  this.graphics = graphics || false;

  this.behaviors = behaviors || false;

  this.data = Store( Object.assign( defaultData, ( data || {} ) ) );

  this.dataUnsubscription = this.data.subscribe( ( newData, oldData ) => {

    if ( !!this.graphics && !isEqual( oldData.position, newData.position ) ) {
      this.graphics.activeMesh.position.set(
        newData.position.x,
        newData.position.y,
        pixelHeightCalculator( newData.position.x, newData.position.y )
      );
    }

    if ( !!updater ) {
      updater( this, newData, oldData );
    }

  } );

  this.lifeCycle = {
    initialize: initialize || false,
    terminate: terminate || false,
  };

  this.lifeCycle.initialize( this );

}

Entity.prototype.delete = function() {
  this.dataSubscription();
  this.lifeCycle.terminate( this );
};

export default Entity;
