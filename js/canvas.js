/**
 * Canvas renderer for graph nodes, edges, animations, and interactions
 */

class GraphCanvas {
  constructor(canvasElement, graph) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.graph = graph;

    // Viewport transform
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.isPanning = false;
    this.panStart = { x: 0, y: 0 };

    // Interaction states
    this.mode = 'select'; // 'select', 'addNode', 'addEdge', 'setStart', 'setTarget', 'delete'
    this.draggedNode = null;
    this.edgeStartNode = null;
    this.hoveredNode = null;
    this.hoveredEdge = null;
    this.mousePos = { x: 0, y: 0 }; // Screen space
    this.worldMousePos = { x: 0, y: 0 }; // World space

    // Visual step state
    this.currentStep = null;

    // Animation frame for glowing edge pulses
    this.animationTick = 0;

    this.initEvents();
    this.resize();
    this.startAnimationLoop();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);
    this.render();
  }

  screenToWorld(sx, sy) {
    return {
      x: (sx - this.panX) / this.zoom,
      y: (sy - this.panY) / this.zoom
    };
  }

  worldToScreen(wx, wy) {
    return {
      x: wx * this.zoom + this.panX,
      y: wy * this.zoom + this.panY
    };
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse Move
    this.canvas.addEventListener('mousemove', e => {
      const rect = this.canvas.getBoundingClientRect();
      this.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      this.worldMousePos = this.screenToWorld(this.mousePos.x, this.mousePos.y);

      if (this.isPanning) {
        this.panX = this.mousePos.x - this.panStart.x;
        this.panY = this.mousePos.y - this.panStart.y;
        this.render();
        return;
      }

      if (this.draggedNode && this.mode === 'select') {
        this.draggedNode.x = this.worldMousePos.x;
        this.draggedNode.y = this.worldMousePos.y;
        this.render();
        return;
      }

      // Check hovers
      const prevHoveredNode = this.hoveredNode;
      const prevHoveredEdge = this.hoveredEdge;

      this.hoveredNode = this.graph.getNodeAt(this.worldMousePos.x, this.worldMousePos.y);
      this.hoveredEdge = !this.hoveredNode ? this.graph.getEdgeAt(this.worldMousePos.x, this.worldMousePos.y) : null;

      if (prevHoveredNode !== this.hoveredNode || prevHoveredEdge !== this.hoveredEdge || this.edgeStartNode) {
        this.render();
      }
    });

    // Mouse Down
    this.canvas.addEventListener('mousedown', e => {
      // Middle click or space+click for panning
      if (e.button === 1 || e.altKey || (e.button === 0 && e.shiftKey)) {
        this.isPanning = true;
        this.panStart = { x: this.mousePos.x - this.panX, y: this.mousePos.y - this.panY };
        this.canvas.style.cursor = 'grabbing';
        return;
      }

      if (e.button === 0) {
        const clickedNode = this.graph.getNodeAt(this.worldMousePos.x, this.worldMousePos.y);
        const clickedEdge = !clickedNode ? this.graph.getEdgeAt(this.worldMousePos.x, this.worldMousePos.y) : null;

        if (this.mode === 'select') {
          if (clickedNode) {
            this.draggedNode = clickedNode;
            this.canvas.style.cursor = 'grabbing';
          }
        } else if (this.mode === 'addNode') {
          if (!clickedNode) {
            this.graph.addNode(this.worldMousePos.x, this.worldMousePos.y);
            this.triggerStateChange();
            this.render();
          }
        } else if (this.mode === 'addEdge') {
          if (clickedNode) {
            if (!this.edgeStartNode) {
              this.edgeStartNode = clickedNode;
            } else if (this.edgeStartNode.id !== clickedNode.id) {
              // Create edge
              const defaultWeight = this.graph.isWeighted ? Math.floor(Math.random() * 8) + 2 : 1;
              this.graph.addEdge(this.edgeStartNode.id, clickedNode.id, defaultWeight);
              this.edgeStartNode = null;
              this.triggerStateChange();
              this.render();
            } else {
              this.edgeStartNode = null;
              this.render();
            }
          } else {
            this.edgeStartNode = null;
            this.render();
          }
        } else if (this.mode === 'setStart') {
          if (clickedNode) {
            this.graph.setStartNode(clickedNode.id);
            this.triggerStateChange();
            this.render();
          }
        } else if (this.mode === 'setTarget') {
          if (clickedNode) {
            this.graph.setTargetNode(clickedNode.id);
            this.triggerStateChange();
            this.render();
          }
        } else if (this.mode === 'delete') {
          if (clickedNode) {
            this.graph.removeNode(clickedNode.id);
            this.triggerStateChange();
            this.render();
          } else if (clickedEdge) {
            this.graph.removeEdge(clickedEdge.from, clickedEdge.to);
            this.triggerStateChange();
            this.render();
          }
        }
      }
    });

    // Mouse Up
    window.addEventListener('mouseup', () => {
      if (this.isPanning) {
        this.isPanning = false;
        this.updateCursor();
      }
      if (this.draggedNode) {
        this.draggedNode = null;
        this.updateCursor();
      }
    });

    // Mouse Wheel (Zoom)
    this.canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newZoom = Math.min(Math.max(this.zoom * zoomFactor, 0.3), 3.0);

      // Zoom centered at mouse position
      this.panX = this.mousePos.x - (this.mousePos.x - this.panX) * (newZoom / this.zoom);
      this.panY = this.mousePos.y - (this.mousePos.y - this.panY) * (newZoom / this.zoom);
      this.zoom = newZoom;
      this.render();
    }, { passive: false });

    // Double click to edit edge weight
    this.canvas.addEventListener('dblclick', () => {
      const edge = this.graph.getEdgeAt(this.worldMousePos.x, this.worldMousePos.y);
      if (edge && this.graph.isWeighted) {
        const input = prompt(`Enter new weight for edge (${edge.from} -> ${edge.to}):`, edge.weight);
        if (input !== null) {
          const val = parseInt(input, 10);
          if (!isNaN(val) && val > 0) {
            edge.weight = val;
            this.triggerStateChange();
            this.render();
          }
        }
      }
    });
  }

  setMode(mode) {
    this.mode = mode;
    this.edgeStartNode = null;
    this.updateCursor();
    this.render();
  }

  updateCursor() {
    switch (this.mode) {
      case 'select':
        this.canvas.style.cursor = 'default';
        break;
      case 'addNode':
        this.canvas.style.cursor = 'crosshair';
        break;
      case 'addEdge':
        this.canvas.style.cursor = 'pointer';
        break;
      case 'setStart':
      case 'setTarget':
        this.canvas.style.cursor = 'pointer';
        break;
      case 'delete':
        this.canvas.style.cursor = 'not-allowed';
        break;
      default:
        this.canvas.style.cursor = 'default';
    }
  }

  resetView() {
    this.panX = 0;
    this.panY = 0;
    this.zoom = 1;
    this.render();
  }

  centerGraph() {
    if (this.graph.nodes.size === 0) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const node of this.graph.nodes.values()) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }
    const graphCenterX = (minX + maxX) / 2;
    const graphCenterY = (minY + maxY) / 2;

    this.panX = this.width / 2 - graphCenterX * this.zoom;
    this.panY = this.height / 2 - graphCenterY * this.zoom;
    this.render();
  }

  setStep(step) {
    this.currentStep = step;
    this.render();
  }

  clearStep() {
    this.currentStep = null;
    this.render();
  }

  startAnimationLoop() {
    const loop = () => {
      this.animationTick += 0.05;
      // If there is an active traversal or path, render continuous pulse
      if (this.currentStep && (this.currentStep.activeEdge || (this.currentStep.path && this.currentStep.path.length > 0))) {
        this.render();
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  triggerStateChange() {
    if (this.onGraphModified) {
      this.onGraphModified();
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Draw background grid
    this.drawBackgroundGrid(ctx);

    // Apply pan & zoom
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.zoom, this.zoom);

    // 1. Draw Edges
    this.drawEdges(ctx);

    // 2. Draw Active/Temp Edge being created
    if (this.edgeStartNode && this.mode === 'addEdge') {
      this.drawTempEdge(ctx);
    }

    // 3. Draw Nodes
    this.drawNodes(ctx);

    ctx.restore();
  }

  drawBackgroundGrid(ctx) {
    const gridSize = 40 * this.zoom;
    const offsetX = this.panX % gridSize;
    const offsetY = this.panY % gridSize;

    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';

    for (let x = offsetX; x < this.width; x += gridSize) {
      for (let y = offsetY; y < this.height; y += gridSize) {
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  drawEdges(ctx) {
    const pathEdges = new Set();
    if (this.currentStep && this.currentStep.path && this.currentStep.path.length > 1) {
      for (let i = 0; i < this.currentStep.path.length - 1; i++) {
        const u = this.currentStep.path[i];
        const v = this.currentStep.path[i + 1];
        pathEdges.add(`${u}->${v}`);
        if (!this.graph.isDirected) {
          pathEdges.add(`${v}->${u}`);
        }
      }
    }

    const activeEdge = this.currentStep ? this.currentStep.activeEdge : null;

    for (const edge of this.graph.edges) {
      const n1 = this.graph.nodes.get(edge.from);
      const n2 = this.graph.nodes.get(edge.to);
      if (!n1 || !n2) continue;

      const isPath = pathEdges.has(`${edge.from}->${edge.to}`) || (!this.graph.isDirected && pathEdges.has(`${edge.to}->${edge.from}`));
      const isActive = activeEdge && ((activeEdge.from === edge.from && activeEdge.to === edge.to) ||
        (!this.graph.isDirected && activeEdge.from === edge.to && activeEdge.to === edge.from));
      const isHovered = this.hoveredEdge === edge;

      // Draw line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);

      if (isPath) {
        ctx.strokeStyle = '#10b981'; // Radiant emerald
        ctx.lineWidth = 4.5;
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 14;
      } else if (isActive) {
        ctx.strokeStyle = '#38bdf8'; // Glowing cyan
        ctx.lineWidth = 4;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 16;
      } else if (isHovered) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.45)';
        ctx.lineWidth = 2;
      }
      ctx.stroke();
      ctx.restore();

      // If directed, draw arrowhead at target node boundary
      if (this.graph.isDirected) {
        this.drawArrowhead(ctx, n1, n2, isPath ? '#10b981' : (isActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.7)'));
      }

      // Draw weight badge if graph is weighted
      if (this.graph.isWeighted) {
        this.drawWeightBadge(ctx, n1, n2, edge.weight, isPath, isActive);
      }
    }
  }

  drawArrowhead(ctx, fromNode, toNode, color) {
    const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
    // Offset by target node radius so arrowhead touches the outer perimeter
    const targetX = toNode.x - Math.cos(angle) * (toNode.radius + 3);
    const targetY = toNode.y - Math.sin(angle) * (toNode.radius + 3);

    const headLength = 12;
    const headAngle = Math.PI / 7;

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(targetX, targetY);
    ctx.lineTo(
      targetX - headLength * Math.cos(angle - headAngle),
      targetY - headLength * Math.sin(angle - headAngle)
    );
    ctx.lineTo(
      targetX - headLength * Math.cos(angle + headAngle),
      targetY - headLength * Math.sin(angle + headAngle)
    );
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawWeightBadge(ctx, n1, n2, weight, isPath, isActive) {
    const midX = (n1.x + n2.x) / 2;
    const midY = (n1.y + n2.y) / 2;

    ctx.save();
    const text = String(weight);
    ctx.font = '600 12px "Fira Code", monospace';
    const textWidth = ctx.measureText(text).width;
    const paddingX = 8;
    const badgeW = textWidth + paddingX * 2;
    const badgeH = 20;

    // Background pill
    ctx.beginPath();
    ctx.roundRect(midX - badgeW / 2, midY - badgeH / 2, badgeW, badgeH, 10);
    ctx.fillStyle = isPath ? '#064e3b' : (isActive ? '#0c4a6e' : '#0f172a');
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = isPath ? '#34d399' : (isActive ? '#38bdf8' : '#334155');
    ctx.stroke();

    // Text
    ctx.fillStyle = isPath ? '#a7f3d0' : (isActive ? '#bae6fd' : '#e2e8f0');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, midX, midY + 1);
    ctx.restore();
  }

  drawTempEdge(ctx) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.edgeStartNode.x, this.edgeStartNode.y);
    ctx.lineTo(this.worldMousePos.x, this.worldMousePos.y);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.restore();
  }

  drawNodes(ctx) {
    const step = this.currentStep;
    const visitedSet = new Set(step?.visitedNodes || []);
    const frontierSet = new Set(step?.frontierNodes || []);
    const pathSet = new Set(step?.path || []);
    const activeNodeId = step?.activeNodeId;

    for (const node of this.graph.nodes.values()) {
      const isStart = this.graph.startNodeId === node.id;
      const isTarget = this.graph.targetNodeId === node.id;
      const isPath = pathSet.has(node.id);
      const isActive = activeNodeId === node.id;
      const isFrontier = frontierSet.has(node.id);
      const isVisited = visitedSet.has(node.id);
      const isHovered = this.hoveredNode === node;
      const isEdgeSource = this.edgeStartNode === node;

      // Color selection
      let bgColor = '#1e293b';
      let borderColor = '#475569';
      let glowColor = 'transparent';
      let glowBlur = 0;

      if (isPath) {
        bgColor = '#047857';
        borderColor = '#34d399';
        glowColor = '#10b981';
        glowBlur = 18;
      } else if (isActive) {
        bgColor = '#b45309';
        borderColor = '#fbbf24';
        glowColor = '#f59e0b';
        glowBlur = 20;
      } else if (isStart) {
        bgColor = '#065f46';
        borderColor = '#10b981';
        glowColor = '#10b981';
        glowBlur = 14;
      } else if (isTarget) {
        bgColor = '#881337';
        borderColor = '#f43f5e';
        glowColor = '#f43f5e';
        glowBlur = 14;
      } else if (isFrontier) {
        bgColor = '#164e63';
        borderColor = '#22d3ee';
        glowColor = '#06b6d4';
        glowBlur = 12;
      } else if (isVisited) {
        bgColor = '#312e81';
        borderColor = '#818cf8';
        glowColor = '#6366f1';
        glowBlur = 8;
      }

      if (isEdgeSource || (isHovered && this.mode === 'addEdge')) {
        borderColor = '#c084fc';
        glowColor = '#a855f7';
        glowBlur = 16;
      }

      // Draw node circle
      ctx.save();
      if (glowBlur > 0) {
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowBlur;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fillStyle = bgColor;
      ctx.fill();

      ctx.lineWidth = isPath || isActive || isStart || isTarget ? 3.5 : 2.5;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
      ctx.restore();

      // Node label
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y);
      ctx.restore();

      // Start / Target Badge tags
      if (isStart || isTarget) {
        const tagText = isStart ? 'START' : 'TARGET';
        const tagBg = isStart ? '#10b981' : '#f43f5e';
        ctx.save();
        ctx.font = '800 9px "Plus Jakarta Sans", sans-serif';
        const tw = ctx.measureText(tagText).width;
        const bw = tw + 10;
        const bh = 15;
        const by = node.y - node.radius - 10;

        ctx.beginPath();
        ctx.roundRect(node.x - bw / 2, by - bh / 2, bw, bh, 6);
        ctx.fillStyle = tagBg;
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(tagText, node.x, by);
        ctx.restore();
      }

      // Distance / Heuristic metric badge underneath node
      if (step && step.distances && step.distances[node.id] !== undefined && step.distances[node.id] !== Infinity) {
        const dVal = step.distances[node.id];
        ctx.save();
        ctx.font = '600 11px "Fira Code", monospace';
        const distText = `d: ${dVal}`;
        const dw = ctx.measureText(distText).width + 8;
        const dy = node.y + node.radius + 11;

        ctx.beginPath();
        ctx.roundRect(node.x - dw / 2, dy - 8, dw, 16, 4);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(distText, node.x, dy);
        ctx.restore();
      }
    }
  }
}
