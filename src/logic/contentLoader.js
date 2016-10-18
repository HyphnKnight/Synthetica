import THREE from 'three';

function loadContent( loader ) {

  return function loadContentInside( path, repeat = false, scale = 0 ) {

    return new Promise( ( resolve, reject ) => {

      loader.load(
        require( path ),
        function ( content ) {

          if ( !!repeat ) {
              content.wrapS = THREE.RepeatWrapping;
              content.wrapT = THREE.RepeatWrapping;
          }

          if ( !!scale ) {
            content.repeat.set( scale,scale );
          }

          resolve( content );

        },
        function ( xhr ) {
          console.log( name, xhr.loaded / xhr.total );
        },
        function ( error ) {
          reject( error );
        }
      );

    } );

  };

}

const
  //images
  imageLoader = new THREE.ImageLoader(),
  loadImage = loadContent( imageLoader );

  //textures
  textureLoader = new THREE.TextureLoader(),
  loadTexture = loadContent( textureLoader );

export {
  loadImage,
  loadTexture
};
