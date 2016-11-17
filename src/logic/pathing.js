import _ from 'lodash';

const {
  fetchPathNode,
  releasePathNode
} = (function(){


  const
    nodeCache = [],
    cacheLimit = 300;

  function createPathNode( position, cameFrom, costSoFar, priority, touched ) {
    return {
      position,
      cameFrom,
      costSoFar,
      priority: priority + costSoFar,
      touched
    };
  }

  function fetchNode(  position, cameFrom = false, costSoFar = 0, priority = 0, touched = false ) {
    if ( !nodeCache.length ) {

      return createPathNode( position, cameFrom, costSoFar, priority );

    } else {

      const fetchedNode = nodeCache.pop();

      fetchedNode.position = position;
      fetchedNode.cameFrom = cameFrom;
      fetchedNode.costSoFar = costSoFar;
      fetchedNode.priority = priority;
      fetchedNode.touched = touched;

      return fetchedNode;

    }
  }

  function releaseNode( ...nodes ) {

    nodes.forEach( node => nodeCache.push( node ) );

    while ( nodeCache.length > cacheLimit ) {
      nodeCache.pop();
    }

    return nodeCache.length;

  }

  return {
    fetchPathNode: fetchNode,
    releasePathNode: releaseNode,
  };

})(),
DEBUG__STOPNUM = 4000;

function smartPath( options ) {

  if ( options.start === options.end ) {
    return [ options.start ];
  }

  let
    { priorityFunc,
      resistFunc,
      maxResist,
      getNeighbors,
      start,
      end } = options,
    results = [],
    root = null,
    i = 0,
    pathNodes = [ fetchPathNode(
      start,
      false,
      0,
      priorityFunc( start, end )
    ) ],
    endNode = null;

  while( !endNode ) {

    if ( ++i > DEBUG__STOPNUM ) {
      return _.map( pathNodes, node => node.position );
    }

    root = _.find( pathNodes, node => !node.touched );

    root.touched = true;

    if ( root.priority > maxResist ) {
      return false;
    }

    const newNeighbors = _( getNeighbors( root.position ) )
      .filter( neighbor => !_.find(
          pathNodes,
          node => node.position === neighbor
      ) )
      .map( newNeighbor => fetchPathNode(
          newNeighbor,
          root,
          resistFunc( newNeighbor, root.position ) + root.costSoFar,
          priorityFunc( newNeighbor, end, root.position )
      ) )
      .value(),
      foundEndNode = _.find(
        newNeighbors,
        neighborNode => neighborNode.position === end
      );

    // If you do, mark it and end the cycle.
    if ( foundEndNode ) {
      endNode = foundEndNode;
      continue;
    }

    pathNodes.push( ...newNeighbors );

    pathNodes = _.sortBy( pathNodes, node => node.priority );

  }

  // Found end, now loop back through path nodes
  while( !!endNode.cameFrom ) {
    if ( ++i > DEBUG__STOPNUM ) {
      return _.map( pathNodes, node => node.position );
    }
    results.push( endNode.position );
    endNode = endNode.cameFrom;
  }

  releasePathNode( pathNodes );

  return results

}

export {
  smartPath
};
