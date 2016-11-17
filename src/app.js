'use strict';

import ReactDom from 'react-dom';
import React    from 'react';
//import main from './logic/main.js';
import UserInterface from './ui/UserInterface.jsx';

ReactDom.render( React.createElement( UserInterface, {} ), document.getElementById( 'root' ) );

//main();
