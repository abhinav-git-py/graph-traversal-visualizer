/**
 * Graph Preset Generators
 */

const PRESETS = {
  binaryTree: (graph, width, height) => {
    graph.clear();
    graph.isDirected = false;
    graph.isWeighted = false;

    const centerX = width / 2;
    const startY = 80;
    const levelHeight = 90;

    // 15 nodes (4 levels: 1, 2, 4, 8)
    const levels = 4;
    let currentId = 0;
    const nodeCoords = [];

    for (let level = 0; level < levels; level++) {
      const count = Math.pow(2, level);
      const span = width * 0.85;
      const step = span / (count + 1);
      const startX = centerX - span / 2;

      for (let i = 0; i < count; i++) {
        const x = startX + (i + 1) * step;
        const y = startY + level * levelHeight;
        const node = graph.addNode(x, y, `${currentId}`, currentId);
        nodeCoords.push(node);
        currentId++;
      }
    }

    // Connect parents to children
    for (let i = 0; i < 7; i++) {
      const leftChild = 2 * i + 1;
      const rightChild = 2 * i + 2;
      if (leftChild < nodeCoords.length) {
        graph.addEdge(i, leftChild, 1);
      }
      if (rightChild < nodeCoords.length) {
        graph.addEdge(i, rightChild, 1);
      }
    }

    graph.setStartNode(0);
    graph.setTargetNode(13);
  },

  cityNetwork: (graph, width, height) => {
    graph.clear();
    graph.isDirected = false;
    graph.isWeighted = true;

    const paddingX = width * 0.12;
    const paddingY = height * 0.15;
    const w = width - 2 * paddingX;
    const h = height - 2 * paddingY;

    const cities = [
      { id: 0, label: 'Seattle', x: paddingX + w * 0.1, y: paddingY + h * 0.15 },
      { id: 1, label: 'SF', x: paddingX + w * 0.08, y: paddingY + h * 0.55 },
      { id: 2, label: 'LA', x: paddingX + w * 0.15, y: paddingY + h * 0.85 },
      { id: 3, label: 'Denver', x: paddingX + w * 0.38, y: paddingY + h * 0.45 },
      { id: 4, label: 'Dallas', x: paddingX + w * 0.52, y: paddingY + h * 0.8 },
      { id: 5, label: 'Chicago', x: paddingX + w * 0.65, y: paddingY + h * 0.3 },
      { id: 6, label: 'Atlanta', x: paddingX + w * 0.75, y: paddingY + h * 0.7 },
      { id: 7, label: 'NYC', x: paddingX + w * 0.9, y: paddingY + h * 0.25 },
      { id: 8, label: 'Miami', x: paddingX + w * 0.88, y: paddingY + h * 0.9 }
    ];

    cities.forEach(c => graph.addNode(c.x, c.y, c.label, c.id));

    // Connect with realistic relative travel weights
    const edges = [
      { from: 0, to: 1, weight: 6 },
      { from: 0, to: 3, weight: 9 },
      { from: 1, to: 2, weight: 4 },
      { from: 1, to: 3, weight: 8 },
      { from: 2, to: 4, weight: 11 },
      { from: 3, to: 4, weight: 6 },
      { from: 3, to: 5, weight: 7 },
      { from: 4, to: 6, weight: 6 },
      { from: 5, to: 7, weight: 5 },
      { from: 5, to: 6, weight: 5 },
      { from: 6, to: 7, weight: 6 },
      { from: 6, to: 8, weight: 4 },
      { from: 7, to: 8, weight: 9 }
    ];

    edges.forEach(e => graph.addEdge(e.from, e.to, e.weight));

    graph.setStartNode(0); // Seattle
    graph.setTargetNode(8); // Miami
  },

  gridLattice: (graph, width, height) => {
    graph.clear();
    graph.isDirected = false;
    graph.isWeighted = false;

    const rows = 4;
    const cols = 5;
    const paddingX = width * 0.18;
    const paddingY = height * 0.15;
    const cellW = (width - 2 * paddingX) / (cols - 1);
    const cellH = (height - 2 * paddingY) / (rows - 1);

    const grid = [];
    let id = 0;

    for (let r = 0; r < rows; r++) {
      grid[r] = [];
      for (let c = 0; c < cols; c++) {
        // Skip a couple nodes to simulate maze obstacles
        if ((r === 1 && c === 2) || (r === 2 && c === 2)) {
          grid[r][c] = null;
          continue;
        }
        const x = paddingX + c * cellW;
        const y = paddingY + r * cellH;
        graph.addNode(x, y, `${id}`, id);
        grid[r][c] = id;
        id++;
      }
    }

    // Connect horizontal and vertical neighbors
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const curr = grid[r][c];
        if (curr === null) continue;

        // Right neighbor
        if (c + 1 < cols && grid[r][c + 1] !== null) {
          graph.addEdge(curr, grid[r][c + 1], 1);
        }
        // Down neighbor
        if (r + 1 < rows && grid[r + 1][c] !== null) {
          graph.addEdge(curr, grid[r + 1][c], 1);
        }
      }
    }

    graph.setStartNode(0);
    const lastNodeId = id - 1;
    graph.setTargetNode(lastNodeId);
  },

  cycleAndBridge: (graph, width, height) => {
    graph.clear();
    graph.isDirected = false;
    graph.isWeighted = true;

    const cx1 = width * 0.28;
    const cy1 = height * 0.5;
    const r1 = Math.min(width, height) * 0.25;

    const cx2 = width * 0.72;
    const cy2 = height * 0.5;

    // Cycle 1 (4 nodes)
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2;
      const x = cx1 + r1 * Math.cos(angle);
      const y = cy1 + r1 * Math.sin(angle);
      graph.addNode(x, y, `${i}`, i);
    }
    graph.addEdge(0, 1, 3);
    graph.addEdge(1, 2, 2);
    graph.addEdge(2, 3, 4);
    graph.addEdge(3, 0, 5);

    // Bridge node in center
    const bridgeNode = graph.addNode(width * 0.5, height * 0.5, 'B', 4);
    graph.addEdge(0, 4, 3);

    // Cycle 2 (4 nodes)
    for (let i = 0; i < 4; i++) {
      const angle = Math.PI + (i * Math.PI) / 2;
      const x = cx2 + r1 * Math.cos(angle);
      const y = cy2 + r1 * Math.sin(angle);
      const id = 5 + i;
      graph.addNode(x, y, `${id}`, id);
    }
    graph.addEdge(4, 5, 4); // Bridge to cycle 2
    graph.addEdge(5, 6, 2);
    graph.addEdge(6, 7, 6);
    graph.addEdge(7, 8, 3);
    graph.addEdge(8, 5, 2);

    graph.setStartNode(2);
    graph.setTargetNode(7);
  },

  randomNetwork: (graph, width, height) => {
    graph.clear();
    graph.isDirected = false;
    graph.isWeighted = true;

    const numNodes = 10;
    const padding = 100;
    const usableW = width - 2 * padding;
    const usableH = height - 2 * padding;

    // Place nodes avoiding overlaps
    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
      let x, y, tooClose;
      let attempts = 0;
      do {
        x = padding + Math.random() * usableW;
        y = padding + Math.random() * usableH;
        tooClose = nodes.some(n => Math.hypot(n.x - x, n.y - y) < 80);
        attempts++;
      } while (tooClose && attempts < 100);

      const node = graph.addNode(x, y, String.fromCharCode(65 + i), i);
      nodes.push(node);
    }

    // Ensure connectivity via spanning tree first
    for (let i = 1; i < numNodes; i++) {
      // Connect to a random previous node with small distance
      let nearestPrev = 0;
      let minDist = Infinity;
      for (let j = 0; j < i; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < minDist) {
          minDist = d;
          nearestPrev = j;
        }
      }
      const weight = Math.floor(Math.random() * 8) + 2;
      graph.addEdge(i, nearestPrev, weight);
    }

    // Add extra random edges
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < 220 && Math.random() > 0.5) {
          const weight = Math.floor(Math.random() * 9) + 1;
          graph.addEdge(i, j, weight);
        }
      }
    }

    graph.setStartNode(0);
    graph.setTargetNode(numNodes - 1);
  }
};
