import Store from '../util/store';

const ui = Store( {
  view: 'loading',
  behaviors: [
    { name: 'Scout' },
    { name: 'Warrior' },
    { name: 'Miner' }
  ]
} );

export default ui;
