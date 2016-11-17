const
  conditions = new Map(),
  actions = new Map();



/*

Global Information
Base postion
Beacon position

Unit Information
position; x,y,z,r
health;
Sensor-content;
Vision-content;

Sensor Information
postion: x,y,z,r



What does a unit 'know'?
!personal Status;
!creation Point;
!Relative unit position units in front and units in back;

Scout
  if you can see enemy units, deploy a beacon and retreat but stay within sight
  if you see resoures, drop a resource beacon and continue searching
  default: move to closest unexplored hex

Different Strategies
  Turtle - units swarm around base then jump out when they discover a unit, explore as a huge
  Skirmish - units will peg enemies then retreat

crafting system:
Natural Resources



Create beacon
- player names a beacon and then all unit can know that location
- for example a scout finds resources then drops a resource beacon and all nearby miners come running
- for example a soldier find

sensor: list of types, but not specifics
vision: list of specifics;
ping


  IF   -> CASE( CASE PARAM )( TYPE )
  THEN -> ACTION( PARAM )( SUBJ );

  first select a target
  if ( [target] )
  target has list of relevant cases
  if [ [target] is (not) ]
  can easily invert the is to is not
  if ( [target] is [case] )
  after selecting the case, the case has with it stored,
  the number of parameters and their types
  if ( [target] is [case] [ params ] )
  select paramters to finish the conditional
  then [ action ]
  select an action, that action will contain


How visions works:
none -> none
sensor -> {
  position
}
vision -> {
  position,
  rotation,
  type
}

verbs -> {
  orbit
  moveTo
}

target = [
  anomaly,
  enemy,
  ally
]

targets = [
  enemies,
  anomalies
  allies
]

if ( enemy  ) {
}


Sensor vs. Vision ->
Tracked vs. untracked ->
If a unit is either an ally or has passed through the units vision cone, it becomes tracked, until it leaves sensor radius again
If a unit is tracked that means

Sensor -> none


if ( enemy within 5 tiles ) {
  move to highest nearby tile
  orbit enemy @ 3 tiles
}

if ( ally within 3 tiles ) {
  move to unexplored tile,
}

if ( ally is within 4 tiles ) {

}

*/

function createCondition( name, description, validator ) {
  return {
    name,
    description,
    validator
  };
}

function createBehavior( name, actions, default ) {
  return {
    name,
    commands,
    default
  };
};

function createCommand( condition, action ) {

  return function command( char ) {

    if ( condition( char ) ) {

      action( char );

      return true;

    } else {

      return false;

    }

  }

}

export {

};
