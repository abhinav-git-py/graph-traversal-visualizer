# 🕸️ GraphTraverse: Interactive Graph Traversal & Pathfinding Visualizer

An interactive, responsive web application for visualizing graph traversal and pathfinding algorithms in real-time. Features synchronized pseudocode tracing, dynamic data structure inspection (Queue, Stack, Priority Queue), custom graph builder, and rich preset topologies.

![GraphTraverse Preview](https://img.shields.io/badge/Algorithms-BFS%20%7C%20DFS%20%7C%20Dijkstra%20%7C%20A*-6366f1)
![License](https://img.shields.io/badge/License-MIT-emerald)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Web)-blue)

---

## 🚀 Key Features

- **5 Core Graph Algorithms**:
  - **Breadth-First Search (BFS)**: Layer-by-layer exploration guaranteeing shortest paths in unweighted graphs.
  - **Depth-First Search (DFS)**: Deep branch backtracking exploration using a LIFO stack.
  - **Dijkstra's Algorithm**: Optimal shortest path discovery in non-negative weighted graphs with Min-Priority Queue.
  - **A* Search Algorithm**: Heuristic-guided optimal pathfinding using $f(n) = g(n) + h(n)$ with Euclidean distance.
  - **Greedy Best-First Search**: Heuristic-driven greedy search exploring the closest-looking node.
- **Synchronized Pseudocode Tracer**:
  - Highlights the exact active line of pseudocode corresponding to the current visual step.
- **Real-Time Data Structure Visualizer**:
  - Inspect the internal contents of the **Queue**, **Stack**, or **Min-Priority Queue** live as nodes are pushed and popped.
- **Interactive Graph Creation & Editing**:
  - **Add Node**: Click anywhere on the canvas to place nodes.
  - **Connect Nodes (Add Edge)**: Click source then target node. Double-click an edge to edit its weight!
  - **Move Node**: Click and drag any node naturally.
  - **Custom Start / Target**: Pick any node as the starting point or destination target.
  - **Directed & Weighted Toggles**: Switch between directed/undirected and weighted/unweighted graph modes instantly.
- **Presets**:
  - City Road Network (Realistic travel distances)
  - Hierarchical Binary Tree (Level order)
  - Grid Lattice with Obstacles (Labyrinth / Maze)
  - Cycles & Bridge Graph (Bottlenecks)
  - Random Connected Network
- **Timeline & Playback Controls**:
  - Play / Pause (Spacebar shortcut)
  - Step Forward / Step Backward (Arrow keys)
  - Scrub slider to jump to any historical step
  - Speed slider (0.2x to 5.0x)
  - Canvas Pan & Zoom (Mouse wheel + drag)

---

## 📊 Algorithm Comparison

| Algorithm | Data Structure | Time Complexity | Space Complexity | Guarantees Shortest Path? | Weighted Graphs? |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **BFS** | Queue (FIFO) | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | ✅ Yes (Unweighted) | No |
| **DFS** | Stack (LIFO) | $\mathcal{O}(V + E)$ | $\mathcal{O}(V)$ | ❌ No | No |
| **Dijkstra** | Min-Priority Queue | $\mathcal{O}((V + E) \log V)$ | $\mathcal{O}(V)$ | ✅ Yes (Optimal) | ✅ Yes ($\ge 0$) |
| **A\* Search** | Min-PQ ($f = g + h$) | $\mathcal{O}(E) \sim \mathcal{O}(b^d)$ | $\mathcal{O}(V)$ | ✅ Yes (Admissible $h$) | ✅ Yes |
| **Greedy BFS** | Min-PQ ($h$ only) | $\mathcal{O}(b^m)$ | $\mathcal{O}(V)$ | ❌ No | ✅ Yes |

---

## 💻 Local Quickstart

No Node.js or complex build setup required! You can run it locally with Python's built-in web server:

```bash
# 1. Navigate to the project directory
cd graph-traversal-visualizer

# 2. Start a lightweight HTTP server
python -m http.server 8000
```

Now open [http://localhost:8000](http://localhost:8000) in your web browser.

---

## 🌐 Free Instant Deployment Guides

### Option 1: GitHub Pages (Recommended)

1. Create a new GitHub repository at [github.com/new](https://github.com/new) named `graph-visualizer`.
2. Push your project code:
   ```bash
   git init
   git add .
   git commit -m "feat: complete graph traversal visualizer"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/graph-visualizer.git
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** &rarr; **Pages** (under Code and automation).
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and folder `/ (root)`.
   - Click **Save**.
4. In ~60 seconds, your website will be live at:
   `https://<YOUR_GITHUB_USERNAME>.github.io/graph-visualizer/`

> [!TIP]
> The included `.github/workflows/deploy.yml` also automatically triggers GitHub Actions deployment every time you push to `main`!

---

### Option 2: Vercel (Instant 1-Click)

1. Visit [vercel.com](https://vercel.com) and log in.
2. Click **Add New** &rarr; **Project**.
3. Import your GitHub repository or drag and drop this project folder.
4. Click **Deploy**.
5. Your visualizer gets an instant global `https://<project-name>.vercel.app` URL with automatic SSL!

---

### Option 3: Netlify

1. Visit [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `graph-traversal-visualizer` folder onto the page.
3. Your site is live immediately!

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` | Play / Pause visualization |
| `→` (Right Arrow) | Step Forward one step |
| `←` (Left Arrow) | Step Backward one step |
| `R` | Reset playback to beginning |
| `Mouse Wheel` | Zoom in / Zoom out |
| `Alt + Drag` or `Middle Click` | Pan canvas |
| `Double Click Edge` | Edit edge weight |

---

## 🛠️ Project Structure

```
graph-traversal-visualizer/
├── index.html            # Main HTML with glassmorphism layout & modals
├── css/
│   └── style.css         # Custom animations, scrollbar & canvas aesthetics
├── js/
│   ├── graph.js          # Graph, GraphNode, GraphEdge data structures
│   ├── algorithms.js     # Discrete step generators for BFS, DFS, Dijkstra, A*, Greedy
│   ├── presets.js        # Built-in graph topologies (Trees, Grids, Networks)
│   ├── canvas.js         # Canvas 2D engine with pan, zoom & glow effects
│   └── app.js            # Main controller connecting UI, timeline & metrics
├── .github/
│   └── workflows/
│       └── deploy.yml    # Automated GitHub Actions deployment
├── vercel.json           # Vercel deployment configuration
├── netlify.toml          # Netlify static hosting headers
└── README.md             # Documentation and deployment guide
```

---

## 📜 License

Distributed under the MIT License. Feel free to use, modify, and showcase in your portfolio!
