import { Point, Circle, Rectangle } from '../physics/2d/Geometries.js';
import { Rigidbody } from '../physics/2d/Rigidbody.js';
import { Engine } from '../physics/2d/Engine.js';

let scale = 20;

const
  canvas = document.getElementById( 'graphics' ),
  ctx = canvas.getContext( '2d' ),
  /* COLORS */
  colors = {
    background: '#1e1d1c',
    grey: '#e8e0dd',
    greyDark: '#655643',
    blueDark: '#1d7674',
    blue: '#78c0a8',
    blueLight: '#61d8d5',
    redDark: '#EFA91B',
    red: '#F07818',
    redLight: '#EF1B1B'
  },

  /* Draw Canvas Geometry */

  drawCircle = ( x, y, radius, dashed ) => color => {
    if ( dashed === 'M' ) {
      ctx.setLineDash( [ 0.2 * scale, 1 * scale ] );
    }
    if ( dashed === 'B' ) {
      ctx.setLineDash( [ 0.2 * scale, 0.4 * scale ] );
    }
    ctx.beginPath();
    ctx.arc( window.innerWidth / 2 + x * scale, window.innerHeight / 2 + y * scale, radius * scale, 0, Math.PI * 2, true );
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
    if ( !!dashed ) {
      ctx.setLineDash( [] );
    }
  },

  drawArc = ( x, y, arc ) => color => {
    ctx.beginPath();
    ctx.arc( window.innerWidth / 2 + x * scale, window.innerHeight / 2 + y * scale, 0.25 * scale, 0, arc, true );
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
  },

  drawPolygon = points => color => {
    ctx.beginPath();
    points.forEach( ( point, index, array ) => index === 0 ? ctx.moveTo( window.innerWidth / 2 + point.x * scale, window.innerHeight / 2 + point.y * scale ) : ctx.lineTo( window.innerWidth / 2 + point.x * scale, window.innerHeight / 2 + point.y * scale ) )
    ctx.closePath();
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.translate( 0, 0 );
  },


  /* Draw Physics */

  drawRigidbody = ( rigidbody ) => {

    const color = false ? colors.red : colors.blue;

    rigidbody.geometries.forEach( geometry => {

      if ( geometry.type === 'Point' || geometry.type === 'Circle' ) {
        drawCircle.apply( null, geometry.getPosition( rigidbody ).toArray().concat( [ geometry.radius || 0.1 ] ) )( color );
      } else if ( geometry.type === 'Rectangle' || geometry.type === 'Polygon' ) {
        drawPolygon( geometry.points( rigidbody ) )( color );
      }

    } );

    drawArc( rigidbody.position.x, rigidbody.position.y, rigidbody.angularVelocity )( colors.blueLight )

    drawCircle( rigidbody.position.x, rigidbody.position.y, rigidbody.boundingRadius, 'B' )( !!rigidbody.boundingCollided ? colors.redDark : colors.blueDark );
    drawCircle( rigidbody.position.x, rigidbody.position.y, rigidbody.boundingMovementRadius, 'M' )( !!rigidbody.boundingMovementCollided ? colors.redDark : colors.blueDark );

  },

  clearRigidbody = rigidbody => {

    const width = rigidbody.boundingMovementRadius * scale;

    ctx.clearRect( window.innerWidth / 2 + rigidbody.position.x * scale - width - 5, window.innerHeight / 2 + rigidbody.position.y * scale - width - 5, width * 2 + 10, width * 2 + 10 )

  };



canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let
  timeStep = 0,
  timeScale = 0.1,
  currentTime = Date.now(),
  paused = false;

const
  engine = new Engine(),
  /*rigidbodyA = new Rigidbody( 8, 8, Math.PI / 4, [
    new Point( -1, -1, 1 ),
    new Circle( 1, 2, 0, 1 ),
    new Rectangle( -1, 1, Math.PI / 4, 4, 2 )
  ], {} ),*/
  rigidbodyB = new Rigidbody( 3, 0.1, Math.PI / 4, [
   // new Circle( 1, 2, 0, 1 ),
   // new Circle( -1, 1, 0, 2 ),
    new Circle( 0, 0, 0, 1 )
  ], {
    mass: 2
  } ),
  rigidbodyC = new Rigidbody( -3, 0, 0, [
    new Circle( 0, 0, 0, 0.5 )
  ], {} );

//rigidbodyA.velocity.add( { x: 0.1, y: 0.1 } );
//rigidbodyB.velocity.add( { x: 0.1, y: 0 } );
rigidbodyC.velocity.add( { x: 1, y: 0 } );

//engine.add( rigidbodyA );
engine.add( rigidbodyB );
engine.add( rigidbodyC );

function loop() {
  engine.rigidbodies.forEach( clearRigidbody );
  timeStep = Date.now() - currentTime;
  currentTime += timeStep;
  engine.iterate( timeStep / ( 16 / timeScale ) );
  //ctx.clearRect( 0, 0, window.innerWidth, window.innerHeight );
  engine.rigidbodies.forEach( drawRigidbody );
  if ( !paused ) {
    window.requestAnimationFrame( loop );
  }
}

document.body.onkeyup = function( e ) {
  if ( e.keyCode == 32 ) {
    if ( paused ) {
      timeStep = 0;
      currentTime = Date.now();
      paused = !paused;
      loop();
    } else {
      paused = !paused;
    }
  }
}

loop();
