import { fetchVector, releaseVector } from '../Vector.js';

/* Type Definitions */

type Point = {
  position: Vector;
  rotation: number;
  boundingRadius: number;
  parent: Rigidbody;
  type: string;
}

type Line = {
  start: Vector;
  end: Vector;
};

type Circle = {
  position: Vector;
  rotation: number;
  radius: number;
  boundingRadius: number;
  parent: Rigidbody;
  type: string;
}

type Rectangle = {
  position: Vector;
  rotation: number;
  width: number;
  height: number;
  originalPoints: Array<Vector>;
  boundingRadius: number;
  parent: Rigidbody;
  type: string;
}

type Polygon = {
  position: Vector;
  rotation: number;
  originalPoints: Array<Vector>;
  boundingRadius: number;
  parent: Rigidbody;
  type: string;
}

type Geometry = Point | Circle | Rectangle | Polygon;

type LineGeometry = Rectangle | Polygon;

function getGeometryGlobalPosition( geometry: Geometry ): Vector {
  return geometry.position.copy()
    .rotate( geometry.parent.rotation )
    .add( geometry.parent.position );
}

function getFarthestPointFromOriginSort( origin: Vector ): number {

  return function getFarthestPointFromOriginSortEvaluator( pointA: Vector, pointB: Vector ): number {

    const
      relativePointA = pointA.copy().subtract( origin ),
      relativePointB = pointB.copy().subtract( origin ),
      pointAMagnitude = relativePointA.magnitude(),
      pointBMagnitude = relativePointB.magnitude();

    releaseVector( relativePointA );
    releaseVector( relativePointB );

    return pointAMagnitude - pointBMagnitude;

  };

}

function getFarthestPointFromOrigin( origin: Vector, points: Array<Vector> ): Vector {
  return Array
    .from( points )
    .sortBy( getFarthestPointFromOriginSort( origin ) )
    .pop();
}


function getLineGeometryPoints( lineGeometry: LineGeometry ): Array<Vector> {
  return lineGeometry.originalPoints.map( ( point: Vector ): Vector => point
    .copy()
    .rotate( lineGeometry.rotation )
    .add( lineGeometry.position )
    .rotate( lineGeometry.parent.rotation )
    .add( lineGeometry.parent.position ) );
}

function getLinesFromPoints( points: Array<Vector> ): Array<Line> {
  return points.map( ( point: Vector, index: number, points: Array<Vector> ): Line => ( { start: point, end: points[ index + 1 ] || points[ 0 ] } ) );
}

/* Point Definition */


function createPoint( x: number, y: number, rotation: number, parent: Rigidbody ): Point {
  return {
    position: fetchVector( x, y ),
    rotation,
    boundingRadius: 0.001,
    parent,
    type: 'Point'
  };
}

function getPointFarthestPoint( point: Point ): Vector {
  return point.position.copy();
}


/* Circle Definition */

function createCircle( x: number, y: number, rotation: number, radius: number, parent: Rigidbody ): Circle {
  return {
    position: fetchVector( x, y ),
    rotation,
    radius,
    boundingRadius: radius,
    parent,
    type: 'Circle'
  };
}

function getCircleFarthestPoint( circle: Circle ): Vector {
  return circle.position.copy()
    .normalize()
    .scale( circle.radius )
    .add( circle.position );
}

/* Rectangle Definition */

function createRectangle( x: number, y: number, rotation: number, width: number, height: number, parent: Rigidbody ): Rectangle {
  return {
    position: fetchVector( x, y ),
    rotation,
    width,
    height,
    originalPoints: [
       // Top Left
      fetchVector( -width / 2,  height / 2 ),
      // Top Right
      fetchVector( width / 2,  height / 2 ),
      // Bottom Right
      fetchVector( width / 2, -height / 2 ),
       // Bottom Left
      fetchVector( -width / 2, -height / 2 )
    ],
    boundingRadius: Math.sqrt( ( width / 2 ) * ( width / 2 ) + ( height / 2 ) * ( height / 2 ) ),
    parent,
    type: 'Rectangle'
  };
}


/* Polygon Definition */

function createPolygon( x: number, y: number, rotation: number, points: Array<Vector>, parent: Rigidbody  ): Polygon {

  const
    origin = points.reduce( ( sumPoint: Vector, point: Vector ): Vector => sumPoint.add( point ), fetchVector() ).scale( 1 / points.length ),
    originalPoints = points.map( ( point: Vector ): Vector => point.subtract( origin ) ),
    farthestPoint = getFarthestPointFromOrigin( origin, originalPoints ),
    boundingRadius = farthestPoint.magnitude();

  releaseVector( origin );
  releaseVector( farthestPoint );

  return {
    position: fetchVector( x, y ),
    rotation,
    originalPoints,
    boundingRadius,
    parent,
    type: 'Rectangle'
  };

}

export {
  getGeometryGlobalPosition,
  getFarthestPointFromOrigin,
  getLineGeometryPoints,
  getLinesFromPoints,
  createPoint,
  getPointFarthestPoint,
  createCircle,
  getCircleFarthestPoint,
  createRectangle,
  createPolygon
};
