/**
 * Main Application Controller for Graph Traversal Visualizer
 */

class App {
  constructor() {
    this.graph = new Graph(false, true);
    this.canvas = null;
    this.currentAlgo = 'bfs';
    this.steps = [];
    this.currentStepIndex = -1;
    this.isPlaying = false;
    this.playTimer = null;
    this.speedMs = 400; // Animation delay

    this.initDOM();
    this.initPresets();
    this.initEventListeners();
    this.loadPreset('cityNetwork');
    this.updateAlgorithmUI();
  }

  initDOM() {
    const canvasEl = document.getElementById('graphCanvas');
    this.canvas = new GraphCanvas(canvasEl, this.graph);
    this.canvas.onGraphModified = () => {
      this.resetVisualization();
      this.updateNodeSelectors();
    };

    // UI elements
    this.algoSelect = document.getElementById('algoSelect');
    this.presetSelect = document.getElementById('presetSelect');
    this.startNodeSelect = document.getElementById('startNodeSelect');
    this.targetNodeSelect = document.getElementById('targetNodeSelect');

    this.playBtn = document.getElementById('playBtn');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.resetBtn = document.getElementById('resetBtn');
    this.clearBtn = document.getElementById('clearBtn');
    this.speedSlider = document.getElementById('speedSlider');
    this.speedLabel = document.getElementById('speedLabel');
    this.timelineSlider = document.getElementById('timelineSlider');
    this.stepCounter = document.getElementById('stepCounter');

    this.directedToggle = document.getElementById('directedToggle');
    this.weightedToggle = document.getElementById('weightedToggle');

    this.statusMessage = document.getElementById('statusMessage');
    this.pseudocodeContainer = document.getElementById('pseudocodeContainer');
    this.dsTitle = document.getElementById('dsTitle');
    this.dsContainer = document.getElementById('dsContainer');

    // Stats
    this.statVisited = document.getElementById('statVisited');
    this.statPathCost = document.getElementById('statPathCost');
    this.statTotalSteps = document.getElementById('statTotalSteps');
    this.statComplexity = document.getElementById('statComplexity');
    this.statSpace = document.getElementById('statSpace');
  }

  initPresets() {
    // Initial setup handled in constructor
  }

  initEventListeners() {
    // Algorithm change
    this.algoSelect.addEventListener('change', e => {
      this.currentAlgo = e.target.value;
      const meta = ALGORITHM_METADATA[this.currentAlgo];
      if (meta.weighted && !this.graph.isWeighted) {
        this.graph.isWeighted = true;
        this.weightedToggle.checked = true;
      }
      this.resetVisualization();
      this.updateAlgorithmUI();
    });

    // Preset change
    this.presetSelect.addEventListener('change', e => {
      this.loadPreset(e.target.value);
    });

    // Start / Target selectors
    this.startNodeSelect.addEventListener('change', e => {
      const val = e.target.value === '' ? null : (isNaN(e.target.value) ? e.target.value : parseInt(e.target.value, 10));
      this.graph.setStartNode(val);
      this.resetVisualization();
      this.canvas.render();
    });

    this.targetNodeSelect.addEventListener('change', e => {
      const val = e.target.value === '' ? null : (isNaN(e.target.value) ? e.target.value : parseInt(e.target.value, 10));
      this.graph.setTargetNode(val);
      this.resetVisualization();
      this.canvas.render();
    });

    // Graph toggles
    this.directedToggle.addEventListener('change', e => {
      this.graph.isDirected = e.target.checked;
      this.resetVisualization();
      this.canvas.render();
    });

    this.weightedToggle.addEventListener('change', e => {
      this.graph.isWeighted = e.target.checked;
      // If weighted was enabled and edges have no weights, give them default weights
      if (this.graph.isWeighted) {
        this.graph.edges.forEach(edge => {
          if (edge.weight === 1) edge.weight = Math.floor(Math.random() * 8) + 2;
        });
      }
      this.resetVisualization();
      this.canvas.render();
    });

    // Playback buttons
    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.prevBtn.addEventListener('click', () => this.stepBackward());
    this.nextBtn.addEventListener('click', () => this.stepForward());
    this.resetBtn.addEventListener('click', () => this.resetVisualization());
    this.clearBtn.addEventListener('click', () => this.clearGraph());

    // Speed slider
    this.speedSlider.addEventListener('input', e => {
      const val = parseInt(e.target.value, 10);
      // Map slider 1..10 to 800ms down to 50ms
      this.speedMs = Math.round(900 - val * 85);
      this.speedLabel.textContent = `${(val / 5).toFixed(1)}x`;
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });

    // Timeline scrubber
    this.timelineSlider.addEventListener('input', e => {
      const stepIdx = parseInt(e.target.value, 10);
      this.pause();
      this.goToStep(stepIdx);
    });

    // Editing mode buttons
    document.querySelectorAll('[data-mode]').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active-tool'));
        const targetBtn = e.currentTarget;
        targetBtn.classList.add('active-tool');
        const mode = targetBtn.getAttribute('data-mode');
        this.canvas.setMode(mode);
      });
    });

    // Center view button
    const centerBtn = document.getElementById('centerBtn');
    if (centerBtn) {
      centerBtn.addEventListener('click', () => this.canvas.centerGraph());
    }

    // Reset view button
    const resetViewBtn = document.getElementById('resetViewBtn');
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => this.canvas.resetView());
    }

    // Randomize weights button
    const randomizeWeightsBtn = document.getElementById('randomizeWeightsBtn');
    if (randomizeWeightsBtn) {
      randomizeWeightsBtn.addEventListener('click', () => {
        this.graph.edges.forEach(edge => {
          edge.weight = Math.floor(Math.random() * 9) + 1;
        });
        this.resetVisualization();
        this.canvas.render();
      });
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', e => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        this.stepForward();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        this.stepBackward();
      } else if (e.key === 'r' || e.key === 'R') {
        this.resetVisualization();
      }
    });
  }

  loadPreset(presetName) {
    this.pause();
    const presetFn = PRESETS[presetName];
    if (presetFn) {
      presetFn(this.graph, this.canvas.width, this.canvas.height);
      this.directedToggle.checked = this.graph.isDirected;
      this.weightedToggle.checked = this.graph.isWeighted;
      this.updateNodeSelectors();
      this.resetVisualization();
      this.canvas.centerGraph();
    }
  }

  clearGraph() {
    this.pause();
    this.graph.clear();
    this.updateNodeSelectors();
    this.resetVisualization();
    this.canvas.render();
  }

  updateNodeSelectors() {
    this.startNodeSelect.innerHTML = '<option value="">None</option>';
    this.targetNodeSelect.innerHTML = '<option value="">None</option>';

    for (const [id, node] of this.graph.nodes) {
      const opt1 = document.createElement('option');
      opt1.value = id;
      opt1.textContent = `Node ${node.label}`;
      if (this.graph.startNodeId === id) opt1.selected = true;
      this.startNodeSelect.appendChild(opt1);

      const opt2 = document.createElement('option');
      opt2.value = id;
      opt2.textContent = `Node ${node.label}`;
      if (this.graph.targetNodeId === id) opt2.selected = true;
      this.targetNodeSelect.appendChild(opt2);
    }
  }

  updateAlgorithmUI() {
    const meta = ALGORITHM_METADATA[this.currentAlgo];
    if (!meta) return;

    // Pseudocode
    this.pseudocodeContainer.innerHTML = '';
    meta.code.forEach((line, index) => {
      const lineEl = document.createElement('div');
      lineEl.className = 'code-line px-3 py-1 text-xs rounded text-slate-300 font-mono whitespace-pre';
      lineEl.dataset.line = index;
      lineEl.textContent = `${(index + 1).toString().padStart(2, ' ')}  ${line}`;
      this.pseudocodeContainer.appendChild(lineEl);
    });

    // Complexity cards
    this.statComplexity.textContent = meta.timeComplexity;
    this.statSpace.textContent = meta.spaceComplexity;
    this.dsTitle.textContent = meta.dataStructure;
  }

  prepareSteps() {
    if (this.steps.length > 0) return;

    if (this.graph.startNodeId === null) {
      this.statusMessage.innerHTML = '<span class="text-rose-400">⚠️ Please select a Start Node first.</span>';
      return;
    }

    this.steps = AlgorithmRunner.run(
      this.currentAlgo,
      this.graph,
      this.graph.startNodeId,
      this.graph.targetNodeId
    );

    this.timelineSlider.max = Math.max(0, this.steps.length - 1);
    this.statTotalSteps.textContent = this.steps.length;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    this.prepareSteps();
    if (this.steps.length === 0) return;

    // If at end, start from beginning
    if (this.currentStepIndex >= this.steps.length - 1) {
      this.currentStepIndex = -1;
    }

    this.isPlaying = true;
    this.playBtn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Pause</span>
    `;
    this.playBtn.classList.replace('bg-indigo-600', 'bg-amber-600');
    this.playBtn.classList.replace('hover:bg-indigo-500', 'hover:bg-amber-500');

    this.runPlayLoop();
  }

  runPlayLoop() {
    if (!this.isPlaying) return;

    if (this.currentStepIndex < this.steps.length - 1) {
      this.stepForward();
      this.playTimer = setTimeout(() => this.runPlayLoop(), this.speedMs);
    } else {
      this.pause();
    }
  }

  pause() {
    this.isPlaying = false;
    if (this.playTimer) {
      clearTimeout(this.playTimer);
      this.playTimer = null;
    }
    this.playBtn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <span>Play</span>
    `;
    this.playBtn.classList.replace('bg-amber-600', 'bg-indigo-600');
    this.playBtn.classList.replace('hover:bg-amber-500', 'hover:bg-indigo-500');
  }

  stepForward() {
    this.prepareSteps();
    if (this.steps.length === 0) return;

    if (this.currentStepIndex < this.steps.length - 1) {
      this.goToStep(this.currentStepIndex + 1);
    }
  }

  stepBackward() {
    this.prepareSteps();
    if (this.steps.length === 0) return;

    if (this.currentStepIndex > 0) {
      this.goToStep(this.currentStepIndex - 1);
    }
  }

  goToStep(index) {
    if (index < 0 || index >= this.steps.length) return;
    this.currentStepIndex = index;
    const step = this.steps[index];

    // Update canvas
    this.canvas.setStep(step);

    // Update timeline & counters
    this.timelineSlider.value = index;
    this.stepCounter.textContent = `${index + 1} / ${this.steps.length}`;

    // Update status message
    this.statusMessage.innerHTML = `<span class="text-indigo-300 font-semibold">Step ${index + 1}:</span> ${step.message}`;

    // Highlight pseudocode line
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
    if (step.codeLine !== undefined && step.codeLine !== null) {
      const activeEl = document.querySelector(`.code-line[data-line="${step.codeLine}"]`);
      if (activeEl) {
        activeEl.classList.add('active');
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    // Update Data Structure contents
    this.renderDataStructure(step);

    // Update metrics
    this.statVisited.textContent = step.visitedNodes ? step.visitedNodes.length : 0;

    if (step.path && step.path.length > 0) {
      let totalCost = 0;
      for (let i = 0; i < step.path.length - 1; i++) {
        const edge = this.graph.getEdge(step.path[i], step.path[i + 1]);
        totalCost += edge ? edge.weight : 1;
      }
      this.statPathCost.textContent = `${totalCost} (${step.path.length} nodes)`;
    } else {
      this.statPathCost.textContent = 'None';
    }
  }

  renderDataStructure(step) {
    this.dsContainer.innerHTML = '';
    if (!step.dsItems || step.dsItems.length === 0) {
      this.dsContainer.innerHTML = '<span class="text-xs text-slate-500 italic">Empty</span>';
      return;
    }

    step.dsItems.forEach(item => {
      const badge = document.createElement('div');
      badge.className = 'ds-badge px-2.5 py-1 text-xs rounded-md bg-slate-800 border border-cyan-500/30 text-cyan-200 font-mono shadow-sm flex items-center gap-1.5 whitespace-nowrap';
      badge.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>${item.label}</span>
      `;
      this.dsContainer.appendChild(badge);
    });
  }

  resetVisualization() {
    this.pause();
    this.steps = [];
    this.currentStepIndex = -1;
    this.timelineSlider.value = 0;
    this.timelineSlider.max = 0;
    this.stepCounter.textContent = '0 / 0';
    this.statVisited.textContent = '0';
    this.statPathCost.textContent = '0';
    this.statTotalSteps.textContent = '0';
    this.statusMessage.textContent = 'Click "Play" or "Step" to begin visualization.';
    this.dsContainer.innerHTML = '<span class="text-xs text-slate-500 italic">Empty</span>';
    document.querySelectorAll('.code-line').forEach(el => el.classList.remove('active'));
    this.canvas.clearStep();
  }
}

// Instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
