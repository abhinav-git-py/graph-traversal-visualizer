/**
 * Graph Traversal and Pathfinding Algorithms
 * Each algorithm generates an array of discrete steps for replay, scrubbing, and inspection.
 */

const ALGORITHM_METADATA = {
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    dataStructure: 'Queue (FIFO)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    guaranteesShortestPath: 'Yes (Unweighted graphs)',
    weighted: false,
    description: 'Explores the graph layer by layer using a FIFO queue. Guarantees the shortest path in unweighted graphs.',
    code: [
      'function BFS(start, target):',
      '  queue = new Queue()',
      '  visited = new Set([start])',
      '  queue.enqueue(start)',
      '  while queue is not empty:',
      '    curr = queue.dequeue()',
      '    if curr == target: return reconstructPath()',
      '    for neighbor of curr:',
      '      if neighbor not in visited:',
      '        visited.add(neighbor)',
      '        parent[neighbor] = curr',
      '        queue.enqueue(neighbor)',
      '  return null // no path found'
    ]
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    dataStructure: 'Stack (LIFO)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    guaranteesShortestPath: 'No',
    weighted: false,
    description: 'Explores as far as possible along each branch before backtracking using a LIFO stack. Does not guarantee shortest path.',
    code: [
      'function DFS(start, target):',
      '  stack = new Stack()',
      '  visited = new Set()',
      '  stack.push(start)',
      '  while stack is not empty:',
      '    curr = stack.pop()',
      '    if curr not in visited:',
      '      visited.add(curr)',
      '      if curr == target: return reconstructPath()',
      '      for neighbor of curr in reverse:',
      '        if neighbor not in visited:',
      '          parent[neighbor] = curr',
      '          stack.push(neighbor)',
      '  return null // no path found'
    ]
  },
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    dataStructure: 'Min-Priority Queue',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    guaranteesShortestPath: 'Yes (Non-negative weights)',
    weighted: true,
    description: 'Finds the optimal shortest path in weighted graphs with non-negative edge weights by greedily visiting the node with minimum known distance.',
    code: [
      'function Dijkstra(start, target):',
      '  dist = { all: Infinity }; dist[start] = 0',
      '  pq = new PriorityQueue()',
      '  pq.insert(start, priority=0)',
      '  while pq is not empty:',
      '    curr, d = pq.extractMin()',
      '    if d > dist[curr]: continue',
      '    if curr == target: return reconstructPath()',
      '    for (neighbor, weight) of curr:',
      '      if dist[curr] + weight < dist[neighbor]:',
      '        dist[neighbor] = dist[curr] + weight',
      '        parent[neighbor] = curr',
      '        pq.insert(neighbor, dist[neighbor])',
      '  return null // no path found'
    ]
  },
  astar: {
    id: 'astar',
    name: 'A* Search Algorithm',
    dataStructure: 'Min-Priority Queue (f = g + h)',
    timeComplexity: 'O(E) to O(b^d)',
    spaceComplexity: 'O(V)',
    guaranteesShortestPath: 'Yes (with admissible heuristic)',
    weighted: true,
    description: 'Informed search algorithm using f(n) = g(n) + h(n), where g is exact cost from start and h is Euclidean heuristic to the target.',
    code: [
      'function AStar(start, target):',
      '  gScore = { all: Infinity }; gScore[start] = 0',
      '  fScore = { all: Infinity }; fScore[start] = h(start, target)',
      '  pq = new PriorityQueue()',
      '  pq.insert(start, priority=fScore[start])',
      '  while pq is not empty:',
      '    curr = pq.extractMin()',
      '    if curr == target: return reconstructPath()',
      '    for (neighbor, weight) of curr:',
      '      tentative_g = gScore[curr] + weight',
      '      if tentative_g < gScore[neighbor]:',
      '        gScore[neighbor] = tentative_g',
      '        fScore[neighbor] = tentative_g + h(neighbor, target)',
      '        parent[neighbor] = curr',
      '        pq.insert(neighbor, fScore[neighbor])',
      '  return null // no path found'
    ]
  },
  greedy: {
    id: 'greedy',
    name: 'Greedy Best-First Search',
    dataStructure: 'Min-Priority Queue (h only)',
    timeComplexity: 'O(b^m)',
    spaceComplexity: 'O(V)',
    guaranteesShortestPath: 'No',
    weighted: true,
    description: 'Greedily expands the node that appears closest to the target according to heuristic h(n). Fast, but not guaranteed to find optimal path.',
    code: [
      'function GreedyBestFirst(start, target):',
      '  visited = new Set()',
      '  pq = new PriorityQueue()',
      '  pq.insert(start, priority=h(start, target))',
      '  while pq is not empty:',
      '    curr = pq.extractMin()',
      '    if curr in visited: continue',
      '    visited.add(curr)',
      '    if curr == target: return reconstructPath()',
      '    for neighbor of curr:',
      '      if neighbor not in visited:',
      '        parent[neighbor] = curr',
      '        pq.insert(neighbor, h(neighbor, target))',
      '  return null // no path found'
    ]
  }
};

class AlgorithmRunner {
  static run(algoId, graph, startId, targetId) {
    if (!graph || !graph.nodes.has(startId)) return [];

    switch (algoId) {
      case 'bfs':
        return this.runBFS(graph, startId, targetId);
      case 'dfs':
        return this.runDFS(graph, startId, targetId);
      case 'dijkstra':
        return this.runDijkstra(graph, startId, targetId);
      case 'astar':
        return this.runAStar(graph, startId, targetId);
      case 'greedy':
        return this.runGreedy(graph, startId, targetId);
      default:
        return this.runBFS(graph, startId, targetId);
    }
  }

  static reconstructPath(parentMap, targetId, startId) {
    const path = [];
    let curr = targetId;
    while (curr !== null && curr !== undefined) {
      path.unshift(curr);
      if (curr === startId) break;
      curr = parentMap[curr];
    }
    return path.length > 0 && path[0] === startId ? path : [];
  }

  // --- Breadth-First Search ---
  static runBFS(graph, startId, targetId) {
    const steps = [];
    const visited = new Set();
    const parent = {};
    const queue = [startId];
    visited.add(startId);

    const getNodeLabel = id => graph.nodes.get(id)?.label ?? id;

    steps.push({
      codeLine: 2,
      activeNodeId: startId,
      visitedNodes: Array.from(visited),
      frontierNodes: [...queue],
      activeEdge: null,
      dsType: 'Queue',
      dsItems: queue.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
      message: `Enqueued starting Node ${getNodeLabel(startId)}.`,
      path: []
    });

    while (queue.length > 0) {
      const curr = queue.shift();

      steps.push({
        codeLine: 5,
        activeNodeId: curr,
        visitedNodes: Array.from(visited),
        frontierNodes: [...queue],
        activeEdge: null,
        dsType: 'Queue',
        dsItems: queue.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
        message: `Dequeued Node ${getNodeLabel(curr)}. Examining current node.`,
        path: []
      });

      if (targetId !== null && curr === targetId) {
        const path = this.reconstructPath(parent, targetId, startId);
        steps.push({
          codeLine: 6,
          activeNodeId: curr,
          visitedNodes: Array.from(visited),
          frontierNodes: [...queue],
          activeEdge: null,
          dsType: 'Queue',
          dsItems: queue.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
          message: `🎯 Target Node ${getNodeLabel(curr)} reached! Reconstructing shortest path.`,
          path: path,
          isCompleted: true
        });
        return steps;
      }

      const neighbors = graph.getNeighbors(curr);
      for (const { nodeId: neighbor, edge } of neighbors) {
        steps.push({
          codeLine: 7,
          activeNodeId: curr,
          visitedNodes: Array.from(visited),
          frontierNodes: [...queue],
          activeEdge: { from: curr, to: neighbor },
          dsType: 'Queue',
          dsItems: queue.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
          message: `Inspecting edge (${getNodeLabel(curr)} -> ${getNodeLabel(neighbor)}).`,
          path: []
        });

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parent[neighbor] = curr;
          queue.push(neighbor);

          steps.push({
            codeLine: 10,
            activeNodeId: neighbor,
            visitedNodes: Array.from(visited),
            frontierNodes: [...queue],
            activeEdge: { from: curr, to: neighbor },
            dsType: 'Queue',
            dsItems: queue.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
            message: `Visited Node ${getNodeLabel(neighbor)} and enqueued it.`,
            path: []
          });

          if (targetId !== null && neighbor === targetId) {
            const path = this.reconstructPath(parent, targetId, startId);
            steps.push({
              codeLine: 6,
              activeNodeId: neighbor,
              visitedNodes: Array.from(visited),
              frontierNodes: [...queue],
              activeEdge: { from: curr, to: neighbor },
              dsType: 'Queue',
              dsItems: queue.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
              message: `🎯 Target Node ${getNodeLabel(neighbor)} reached! Shortest path discovered.`,
              path: path,
              isCompleted: true
            });
            return steps;
          }
        } else {
          steps.push({
            codeLine: 8,
            activeNodeId: curr,
            visitedNodes: Array.from(visited),
            frontierNodes: [...queue],
            activeEdge: { from: curr, to: neighbor },
            dsType: 'Queue',
            dsItems: queue.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
            message: `Node ${getNodeLabel(neighbor)} has already been visited. Skipping.`,
            path: []
          });
        }
      }
    }

    steps.push({
      codeLine: 12,
      activeNodeId: null,
      visitedNodes: Array.from(visited),
      frontierNodes: [],
      activeEdge: null,
      dsType: 'Queue',
      dsItems: [],
      message: targetId !== null ? `No path exists from Node ${getNodeLabel(startId)} to Node ${getNodeLabel(targetId)}.` : 'Graph traversal completed.',
      path: [],
      isCompleted: true
    });

    return steps;
  }

  // --- Depth-First Search ---
  static runDFS(graph, startId, targetId) {
    const steps = [];
    const visited = new Set();
    const parent = {};
    const stack = [startId];

    const getNodeLabel = id => graph.nodes.get(id)?.label ?? id;

    steps.push({
      codeLine: 3,
      activeNodeId: startId,
      visitedNodes: [],
      frontierNodes: [...stack],
      activeEdge: null,
      dsType: 'Stack',
      dsItems: stack.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
      message: `Pushed starting Node ${getNodeLabel(startId)} onto stack.`,
      path: []
    });

    while (stack.length > 0) {
      const curr = stack.pop();

      steps.push({
        codeLine: 5,
        activeNodeId: curr,
        visitedNodes: Array.from(visited),
        frontierNodes: [...stack],
        activeEdge: null,
        dsType: 'Stack',
        dsItems: stack.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
        message: `Popped Node ${getNodeLabel(curr)} from stack.`,
        path: []
      });

      if (!visited.has(curr)) {
        visited.add(curr);

        steps.push({
          codeLine: 7,
          activeNodeId: curr,
          visitedNodes: Array.from(visited),
          frontierNodes: [...stack],
          activeEdge: null,
          dsType: 'Stack',
          dsItems: stack.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
          message: `Marked Node ${getNodeLabel(curr)} as visited.`,
          path: []
        });

        if (targetId !== null && curr === targetId) {
          const path = this.reconstructPath(parent, targetId, startId);
          steps.push({
            codeLine: 8,
            activeNodeId: curr,
            visitedNodes: Array.from(visited),
            frontierNodes: [...stack],
            activeEdge: null,
            dsType: 'Stack',
            dsItems: stack.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
            message: `🎯 Target Node ${getNodeLabel(curr)} found via DFS!`,
            path: path,
            isCompleted: true
          });
          return steps;
        }

        const neighbors = graph.getNeighbors(curr);
        // Push in reverse order so first neighbor is popped first
        for (let i = neighbors.length - 1; i >= 0; i--) {
          const { nodeId: neighbor } = neighbors[i];
          if (!visited.has(neighbor)) {
            if (parent[neighbor] === undefined) {
              parent[neighbor] = curr;
            }
            stack.push(neighbor);

            steps.push({
              codeLine: 11,
              activeNodeId: neighbor,
              visitedNodes: Array.from(visited),
              frontierNodes: [...stack],
              activeEdge: { from: curr, to: neighbor },
              dsType: 'Stack',
              dsItems: stack.map(id => ({ label: `Node ${getNodeLabel(id)}`, val: id })),
              message: `Pushed unvisited neighbor Node ${getNodeLabel(neighbor)} onto stack.`,
              path: []
            });
          }
        }
      }
    }

    steps.push({
      codeLine: 13,
      activeNodeId: null,
      visitedNodes: Array.from(visited),
      frontierNodes: [],
      activeEdge: null,
      dsType: 'Stack',
      dsItems: [],
      message: targetId !== null ? `No path exists to Node ${getNodeLabel(targetId)}.` : 'DFS Traversal completed.',
      path: [],
      isCompleted: true
    });

    return steps;
  }

  // --- Dijkstra's Algorithm ---
  static runDijkstra(graph, startId, targetId) {
    const steps = [];
    const dist = {};
    const parent = {};
    const visited = new Set();
    const pq = []; // Array of { id, dist }

    const getNodeLabel = id => graph.nodes.get(id)?.label ?? id;

    for (const id of graph.nodes.keys()) {
      dist[id] = Infinity;
    }
    dist[startId] = 0;
    pq.push({ id: startId, dist: 0 });

    steps.push({
      codeLine: 3,
      activeNodeId: startId,
      visitedNodes: [],
      frontierNodes: pq.map(i => i.id),
      distances: { ...dist },
      activeEdge: null,
      dsType: 'Priority Queue',
      dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (d: ${item.dist})`, val: item.id })),
      message: `Initialized distances. Set dist[${getNodeLabel(startId)}] = 0 and inserted to PQ.`,
      path: []
    });

    while (pq.length > 0) {
      // Extract min
      pq.sort((a, b) => a.dist - b.dist);
      const { id: curr, dist: d } = pq.shift();

      if (visited.has(curr)) continue;
      visited.add(curr);

      steps.push({
        codeLine: 5,
        activeNodeId: curr,
        visitedNodes: Array.from(visited),
        frontierNodes: pq.map(i => i.id),
        distances: { ...dist },
        activeEdge: null,
        dsType: 'Priority Queue',
        dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (d: ${item.dist})`, val: item.id })),
        message: `Extracted Node ${getNodeLabel(curr)} with smallest tentative distance ${d}.`,
        path: []
      });

      if (targetId !== null && curr === targetId) {
        const path = this.reconstructPath(parent, targetId, startId);
        steps.push({
          codeLine: 7,
          activeNodeId: curr,
          visitedNodes: Array.from(visited),
          frontierNodes: pq.map(i => i.id),
          distances: { ...dist },
          activeEdge: null,
          dsType: 'Priority Queue',
          dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (d: ${item.dist})`, val: item.id })),
          message: `🎯 Target Node ${getNodeLabel(curr)} reached! Optimal path distance is ${d}.`,
          path: path,
          isCompleted: true
        });
        return steps;
      }

      const neighbors = graph.getNeighbors(curr);
      for (const { nodeId: neighbor, weight } of neighbors) {
        if (visited.has(neighbor)) continue;

        const newDist = dist[curr] + weight;
        steps.push({
          codeLine: 8,
          activeNodeId: curr,
          visitedNodes: Array.from(visited),
          frontierNodes: pq.map(i => i.id),
          distances: { ...dist },
          activeEdge: { from: curr, to: neighbor },
          dsType: 'Priority Queue',
          dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (d: ${item.dist})`, val: item.id })),
          message: `Checking edge to Node ${getNodeLabel(neighbor)} (weight ${weight}). New distance: ${newDist} vs Current: ${dist[neighbor] === Infinity ? '∞' : dist[neighbor]}.`,
          path: []
        });

        if (newDist < dist[neighbor]) {
          dist[neighbor] = newDist;
          parent[neighbor] = curr;
          pq.push({ id: neighbor, dist: newDist });

          steps.push({
            codeLine: 11,
            activeNodeId: neighbor,
            visitedNodes: Array.from(visited),
            frontierNodes: pq.map(i => i.id),
            distances: { ...dist },
            activeEdge: { from: curr, to: neighbor },
            dsType: 'Priority Queue',
            dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (d: ${item.dist})`, val: item.id })),
            message: `⚡ Relaxed edge! Updated dist[${getNodeLabel(neighbor)}] = ${newDist}. Added to PQ.`,
            path: []
          });
        }
      }
    }

    steps.push({
      codeLine: 13,
      activeNodeId: null,
      visitedNodes: Array.from(visited),
      frontierNodes: [],
      distances: { ...dist },
      activeEdge: null,
      dsType: 'Priority Queue',
      dsItems: [],
      message: targetId !== null ? `No reachable path to Node ${getNodeLabel(targetId)}.` : 'Dijkstra execution finished.',
      path: [],
      isCompleted: true
    });

    return steps;
  }

  // --- A* Search Algorithm ---
  static runAStar(graph, startId, targetId) {
    if (targetId === null) {
      return this.runDijkstra(graph, startId, targetId);
    }

    const steps = [];
    const gScore = {};
    const fScore = {};
    const parent = {};
    const visited = new Set();
    const pq = []; // Array of { id, f, g }

    const getNodeLabel = id => graph.nodes.get(id)?.label ?? id;

    for (const id of graph.nodes.keys()) {
      gScore[id] = Infinity;
      fScore[id] = Infinity;
    }

    const hStart = graph.euclideanDistance(startId, targetId);
    gScore[startId] = 0;
    fScore[startId] = hStart;
    pq.push({ id: startId, f: fScore[startId], g: 0 });

    steps.push({
      codeLine: 3,
      activeNodeId: startId,
      visitedNodes: [],
      frontierNodes: pq.map(i => i.id),
      distances: { ...gScore },
      activeEdge: null,
      dsType: 'Priority Queue',
      dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (f: ${item.f}, g: ${item.g})`, val: item.id })),
      message: `Initialized A*. Start g=0, h=${hStart}, f=${fScore[startId]}. Inserted into PQ.`,
      path: []
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.f - b.f);
      const { id: curr } = pq.shift();

      if (visited.has(curr)) continue;
      visited.add(curr);

      steps.push({
        codeLine: 5,
        activeNodeId: curr,
        visitedNodes: Array.from(visited),
        frontierNodes: pq.map(i => i.id),
        distances: { ...gScore },
        activeEdge: null,
        dsType: 'Priority Queue',
        dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (f: ${item.f}, g: ${item.g})`, val: item.id })),
        message: `Extracted Node ${getNodeLabel(curr)} with lowest f-score = ${fScore[curr]}.`,
        path: []
      });

      if (curr === targetId) {
        const path = this.reconstructPath(parent, targetId, startId);
        steps.push({
          codeLine: 6,
          activeNodeId: curr,
          visitedNodes: Array.from(visited),
          frontierNodes: pq.map(i => i.id),
          distances: { ...gScore },
          activeEdge: null,
          dsType: 'Priority Queue',
          dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (f: ${item.f}, g: ${item.g})`, val: item.id })),
          message: `🎯 Target Node ${getNodeLabel(curr)} found! Optimal path cost = ${gScore[curr]}.`,
          path: path,
          isCompleted: true
        });
        return steps;
      }

      const neighbors = graph.getNeighbors(curr);
      for (const { nodeId: neighbor, weight } of neighbors) {
        if (visited.has(neighbor)) continue;

        const tentativeG = gScore[curr] + weight;
        const hVal = graph.euclideanDistance(neighbor, targetId);
        const tentativeF = tentativeG + hVal;

        steps.push({
          codeLine: 7,
          activeNodeId: curr,
          visitedNodes: Array.from(visited),
          frontierNodes: pq.map(i => i.id),
          distances: { ...gScore },
          activeEdge: { from: curr, to: neighbor },
          dsType: 'Priority Queue',
          dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (f: ${item.f}, g: ${item.g})`, val: item.id })),
          message: `Evaluating neighbor Node ${getNodeLabel(neighbor)}: tentative g=${tentativeG}, h=${hVal}, f=${tentativeF}.`,
          path: []
        });

        if (tentativeG < gScore[neighbor]) {
          gScore[neighbor] = tentativeG;
          fScore[neighbor] = tentativeF;
          parent[neighbor] = curr;
          pq.push({ id: neighbor, f: tentativeF, g: tentativeG });

          steps.push({
            codeLine: 11,
            activeNodeId: neighbor,
            visitedNodes: Array.from(visited),
            frontierNodes: pq.map(i => i.id),
            distances: { ...gScore },
            activeEdge: { from: curr, to: neighbor },
            dsType: 'Priority Queue',
            dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (f: ${item.f}, g: ${item.g})`, val: item.id })),
            message: `✨ Better path to Node ${getNodeLabel(neighbor)} found! g=${tentativeG}, f=${tentativeF}. Added to PQ.`,
            path: []
          });
        }
      }
    }

    steps.push({
      codeLine: 13,
      activeNodeId: null,
      visitedNodes: Array.from(visited),
      frontierNodes: [],
      distances: { ...gScore },
      activeEdge: null,
      dsType: 'Priority Queue',
      dsItems: [],
      message: `No path exists to target Node ${getNodeLabel(targetId)}.`,
      path: [],
      isCompleted: true
    });

    return steps;
  }

  // --- Greedy Best-First Search ---
  static runGreedy(graph, startId, targetId) {
    if (targetId === null) {
      return this.runBFS(graph, startId, targetId);
    }

    const steps = [];
    const parent = {};
    const visited = new Set();
    const pq = []; // Array of { id, h }

    const getNodeLabel = id => graph.nodes.get(id)?.label ?? id;

    const hStart = graph.euclideanDistance(startId, targetId);
    pq.push({ id: startId, h: hStart });

    steps.push({
      codeLine: 3,
      activeNodeId: startId,
      visitedNodes: [],
      frontierNodes: pq.map(i => i.id),
      activeEdge: null,
      dsType: 'Priority Queue (h)',
      dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (h: ${item.h})`, val: item.id })),
      message: `Initialized Greedy Search with heuristic distance h=${hStart}.`,
      path: []
    });

    while (pq.length > 0) {
      pq.sort((a, b) => a.h - b.h);
      const { id: curr, h } = pq.shift();

      if (visited.has(curr)) continue;
      visited.add(curr);

      steps.push({
        codeLine: 5,
        activeNodeId: curr,
        visitedNodes: Array.from(visited),
        frontierNodes: pq.map(i => i.id),
        activeEdge: null,
        dsType: 'Priority Queue (h)',
        dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (h: ${item.h})`, val: item.id })),
        message: `Extracted Node ${getNodeLabel(curr)} closest to target (heuristic h = ${h}).`,
        path: []
      });

      if (curr === targetId) {
        const path = this.reconstructPath(parent, targetId, startId);
        steps.push({
          codeLine: 7,
          activeNodeId: curr,
          visitedNodes: Array.from(visited),
          frontierNodes: pq.map(i => i.id),
          activeEdge: null,
          dsType: 'Priority Queue (h)',
          dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (h: ${item.h})`, val: item.id })),
          message: `🎯 Target Node ${getNodeLabel(curr)} found!`,
          path: path,
          isCompleted: true
        });
        return steps;
      }

      const neighbors = graph.getNeighbors(curr);
      for (const { nodeId: neighbor } of neighbors) {
        if (!visited.has(neighbor)) {
          const hVal = graph.euclideanDistance(neighbor, targetId);
          parent[neighbor] = curr;
          pq.push({ id: neighbor, h: hVal });

          steps.push({
            codeLine: 10,
            activeNodeId: neighbor,
            visitedNodes: Array.from(visited),
            frontierNodes: pq.map(i => i.id),
            activeEdge: { from: curr, to: neighbor },
            dsType: 'Priority Queue (h)',
            dsItems: pq.map(item => ({ label: `Node ${getNodeLabel(item.id)} (h: ${item.h})`, val: item.id })),
            message: `Evaluated neighbor Node ${getNodeLabel(neighbor)} (heuristic h = ${hVal}). Added to PQ.`,
            path: []
          });
        }
      }
    }

    steps.push({
      codeLine: 12,
      activeNodeId: null,
      visitedNodes: Array.from(visited),
      frontierNodes: [],
      activeEdge: null,
      dsType: 'Priority Queue (h)',
      dsItems: [],
      message: `No path exists to target Node ${getNodeLabel(targetId)}.`,
      path: [],
      isCompleted: true
    });

    return steps;
  }
}
