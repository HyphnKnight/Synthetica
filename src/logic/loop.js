
let
  startOfFrame = Date.now(),
  deltaT = 0,
  paused = true

function loop( func ) {

  function loopIterate() {

    deltaT = Date.now() - startOfFrame;

    deltaT = deltaT > 16 ? 16 : deltaT;

    startOfFrame += deltaT;

    func( deltaT / 16 );

    if ( !paused ) {

      window.requestAnimationFrame( loopIterate );

    }

  };

  return function togglePause( force ) {

    paused = force !== undefined ? !!force : !paused;

    if ( !paused ) {
      loopIterate();
    }

  }

}

export default loop;