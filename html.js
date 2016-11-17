const
  path = require( 'path' ),
  fs = require( 'fs' ),
  pug = require( 'pug' );

console.log( 'Building index.html' );

fs.writeFile(
  path.resolve( 'dist/index.html' ),
  pug.renderFile( path.resolve( 'src/index.pug' ), { pretty: true } ),
  error => {

    if ( error ) {

      throw error;

    }

    console.log( 'index.html Built' );

  }

);
