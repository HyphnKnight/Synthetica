'use strict';

import React from 'react-lite';
import ReactDom from 'react-lite';

import main from './logic/main.js';
import UserInterface from './ui/UserInterface.jsx';

ReactDom.render( React.createElement( UserInterface, {} ), document.getElementById( 'root' ) );

main();
