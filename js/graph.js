/**
 * Graph data structure and core operations
 */

class GraphNode {
  constructor(id, x, y, label = null) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.label = label !== null ? String(label) : String(id);
    this.radius = 24;
    this.state = 'default'; // 'default' | 'start' | 'target' | 'frontier' | 'visiting' | 'visited' | 'path'
    this.distance = Infinity;
    this.heuristic = 0;
    this.parent = null;
  }

  resetState() {
    this.state = 'default';
    this.distance = Infinity;
    this.heuristic = 0;
    this.parent = null;
  }
}

class GraphEdge {
  constructor(from, to, weight = 1, directed = false) {
    this.from = from;
    this.to = to;
    this.weight = weight;
    this.directed = directed;
    this.state = 'default'; // 'default' | 'traversing' | 'visited' | 'path'
  }

  resetState() {
    this.state = 'default';
  }
}

class Graph {
  constructor(directed = false, weighted = false) {
    this.nodes = new Map(); // id -> GraphNode
    this.edges = [];        // GraphEdge[]
    this.isDirected = directed;
    this.isWeighted = weighted;
    this.startNodeId = null;
    this.targetNodeId = null;
    this.nextNodeId = 0;
  }

  addNode(x, y, label = null, customId = null) {
    const id = customId !== null ? customId : this.nextNodeId++;
    if (typeof id === 'number' && id >= this.nextNodeId) {
      this.nextNodeId = id + 1;
    }
    const node = new GraphNode(id, x, y, label !== null ? label : id);
    this.nodes.set(id, node);

    // If first node, make it start
    if (this.startNodeId === null) {
      this.startNodeId = id;
    } else if (this.targetNodeId === null && this.nodes.size === 2) {
      this.targetNodeId = id;
    }

    return node;
  }

  removeNode(id) {
    if (!this.nodes.has(id)) return false;
    this.nodes.delete(id);
    this.edges = this.edges.filter(e => e.from !== id && e.to !== id);
    if (this.startNodeId === id) {
      const keys = Array.from(this.nodes.keys());
      this.startNodeId = keys.length > 0 ? keys[0] : null;
    }
    if (this.targetNodeId === id) {
      const keys = Array.from(this.nodes.keys()).filter(k => k !== this.startNodeId);
      this.targetNodeId = keys.length > 0 ? keys[keys.length - 1] : null;
    }
    return true;
  }

  addEdge(from, to, weight = 1) {
    if (!this.nodes.has(from) || !this.nodes.has(to) || from === to) return null;
    // Check if edge already exists
    const existing = this.getEdge(from, to);
    if (existing) {
      existing.weight = weight;
      return existing;
    }
    const edge = new GraphEdge(from, to, weight, this.isDirected);
    this.edges.push(edge);
    return edge;
  }

  removeEdge(from, to) {
    const prevLen = this.edges.length;
    this.edges = this.edges.filter(e => {
      if (this.isDirected) {
        return !(e.from === from && e.to === to);
      } else {
        return !((e.from === from && e.to === to) || (e.from === to && e.to === from));
      }
    });
    return this.edges.length < prevLen;
  }

  getEdge(from, to) {
    return this.edges.find(e => {
      if (this.isDirected) {
        return e.from === from && e.to === to;
      } else {
        return (e.from === from && e.to === to) || (e.from === to && e.to === from);
      }
    });
  }

  getNeighbors(nodeId) {
    const neighbors = [];
    for (const edge of this.edges) {
      if (edge.from === nodeId) {
        neighbors.push({
          nodeId: edge.to,
          weight: edge.weight,
          edge: edge
        });
      } else if (!this.isDirected && edge.to === nodeId) {
        neighbors.push({
          nodeId: edge.from,
          weight: edge.weight,
          edge: edge
        });
      }
    }
    return neighbors;
  }

  setStartNode(id) {
    if (!this.nodes.has(id)) return;
    this.startNodeId = id;
    if (this.targetNodeId === id) {
      this.targetNodeId = null;
    }
  }

  setTargetNode(id) {
    if (!this.nodes.has(id)) return;
    this.targetNodeId = id;
    if (this.startNodeId === id) {
      this.startNodeId = null;
    }
  }

  clear() {
    this.nodes.clear();
    this.edges = [];
    this.startNodeId = null;
    this.targetNodeId = null;
    this.nextNodeId = 0;
  }

  resetStates() {
    for (const node of this.nodes.values()) {
      node.resetState();
    }
    for (const edge of this.edges) {
      edge.resetState();
    }
  }

  getNodeAt(x, y, radiusBuffer = 0) {
    for (const node of this.nodes.values()) {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.hypot(dx, dy);
      if (dist <= node.radius + radiusBuffer) {
        return node;
      }
    }
    return null;
  }

  getEdgeAt(x, y, threshold = 10) {
    for (const edge of this.edges) {
      const n1 = this.nodes.get(edge.from);
      const n2 = this.nodes.get(edge.to);
      if (!n1 || !n2) continue;

      // Distance from point to line segment
      const dist = this.distToSegment({ x, y }, n1, n2);
      if (dist <= threshold) {
        return edge;
      }
    }
    return null;
  }

  distToSegment(p, v, w) {
    const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projX = v.x + t * (w.x - v.x);
    const projY = v.y + t * (w.y - v.y);
    return Math.hypot(p.x - projX, p.y - projY);
  }

  euclideanDistance(nodeId1, nodeId2) {
    const n1 = this.nodes.get(nodeId1);
    const n2 = this.nodes.get(nodeId2);
    if (!n1 || !n2) return 0;
    // Normalized scale so heuristic doesn't vastly overpower edge weights
    return Math.round(Math.hypot(n1.x - n2.x, n1.y - n2.y) / 50);
  }
}
