/**
 * Kanban Board - Main board logic and rendering
 */

const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
const PRIORITY_BADGES = { CRITICAL: '🔴', HIGH: '🟠', MEDIUM: '🟡', LOW: '🔵' };

const Board = {
  currentProjectId: null,
  currentProject: null,
  tasks: [],
  filter: {
    priority: null,
    stage: null,
  },

  /**
   * Initialize board
   */
  async init() {
    console.log('[Board] Initializing...');

    try {
      // Load projects
      const projects = await API.getProjects();
      if (!projects || projects.length === 0) {
        this.showEmptyState();
        return;
      }

      // Select first project
      this.currentProjectId = projects[0].id;
      await this.loadProject();

      // Setup WebSocket listeners
      this.setupWebSocketListeners();

      // Setup DOM event listeners
      this.setupDOMListeners();
    } catch (error) {
      console.error('[Board] Init error:', error);
      this.showError('Failed to load board');
    }
  },

  /**
   * Load project and its tasks
   */
  async loadProject() {
    try {
      console.log('[Board] Loading project:', this.currentProjectId);

      // Get project
      this.currentProject = await API.getProject(this.currentProjectId);

      // Get tasks
      this.tasks = await API.getTasks(this.currentProjectId, this.filter);

      // Render board
      this.render();
    } catch (error) {
      console.error('[Board] Load error:', error);
      this.showError('Failed to load project');
    }
  },

  /**
   * Render the entire board
   */
  render() {
    const boardEl = document.querySelector('.kanban-board');
    if (!boardEl) return;

    boardEl.innerHTML = '';

    // Render each stage as a column
    this.currentProject.stages.forEach(stage => {
      const columnEl = this.renderColumn(stage);
      boardEl.appendChild(columnEl);
    });
  },

  /**
   * Render a single column
   */
  renderColumn(stage) {
    const columnEl = document.createElement('div');
    columnEl.className = 'kanban-column';
    columnEl.dataset.stage = stage.name;

    // Header
    const tasksInStage = this.getTasks(stage.name);
    const headerEl = document.createElement('div');
    headerEl.className = 'column-header';
    headerEl.innerHTML = `
      <div class="column-title">
        <span>${stage.name}</span>
        <span class="column-count">${tasksInStage.length}</span>
      </div>
      <div class="column-actions">
        <button class="column-action-btn" data-action="add-task" title="Add task">➕</button>
      </div>
    `;

    // Cards list
    const cardsListEl = document.createElement('div');
    cardsListEl.className = 'cards-list';
    cardsListEl.dataset.stage = stage.name;

    if (tasksInStage.length === 0) {
      cardsListEl.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <div class="empty-state-text">No tasks</div>
        </div>
      `;
    } else {
      tasksInStage.forEach(task => {
        const cardEl = Cards.render(task, this.currentProjectId);
        cardsListEl.appendChild(cardEl);
      });
    }

    // Add card button
    const addCardEl = document.createElement('button');
    addCardEl.className = 'add-card-btn';
    addCardEl.textContent = '+ Add Task';
    addCardEl.addEventListener('click', () => {
      Modals.openCreateTask(this.currentProjectId, stage.name);
    });

    columnEl.appendChild(headerEl);
    columnEl.appendChild(cardsListEl);
    columnEl.appendChild(addCardEl);

    // Setup drag-drop
    this.setupColumnDragDrop(cardsListEl);

    return columnEl;
  },

  /**
   * Get tasks for a stage, sorted by priority
   */
  getTasks(stageName) {
    const stageTasksArray = this.tasks.filter(t => t.stage === stageName);
    return stageTasksArray.sort((a, b) => {
      const priorityA = PRIORITY_ORDER[a.priority] || 99;
      const priorityB = PRIORITY_ORDER[b.priority] || 99;
      return priorityA - priorityB;
    });
  },

  /**
   * Setup drag-drop for a column
   */
  setupColumnDragDrop(cardsListEl) {
    const stage = cardsListEl.dataset.stage;

    cardsListEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      cardsListEl.parentElement.classList.add('drag-over');
    });

    cardsListEl.addEventListener('dragleave', () => {
      cardsListEl.parentElement.classList.remove('drag-over');
    });

    cardsListEl.addEventListener('drop', async (e) => {
      e.preventDefault();
      cardsListEl.parentElement.classList.remove('drag-over');

      const taskId = e.dataTransfer.getData('text/plain');
      if (!taskId) return;

      try {
        await API.moveTask(this.currentProjectId, taskId, stage);
        await this.loadProject();
      } catch (error) {
        console.error('[Board] Move error:', error);
        alert('Failed to move task');
      }
    });
  },

  /**
   * Setup WebSocket listeners for real-time updates
   */
  setupWebSocketListeners() {
    WebSocketClient.on('task-created', async () => {
      console.log('[Board] Task created, reloading...');
      await this.loadProject();
    });

    WebSocketClient.on('task-updated', async () => {
      console.log('[Board] Task updated, reloading...');
      await this.loadProject();
    });

    WebSocketClient.on('task-deleted', async () => {
      console.log('[Board] Task deleted, reloading...');
      await this.loadProject();
    });

    WebSocketClient.on('task-moved', async () => {
      console.log('[Board] Task moved, reloading...');
      await this.loadProject();
    });

    WebSocketClient.on('stage-added', async () => {
      console.log('[Board] Stage added, reloading...');
      await this.loadProject();
    });

    WebSocketClient.on('stage-removed', async () => {
      console.log('[Board] Stage removed, reloading...');
      await this.loadProject();
    });

    WebSocketClient.on('stages-reordered', async () => {
      console.log('[Board] Stages reordered, reloading...');
      await this.loadProject();
    });
  },

  /**
   * Setup DOM event listeners
   */
  setupDOMListeners() {
    // Project selector
    const projectSelector = document.querySelector('.navbar-project-selector');
    if (projectSelector) {
      projectSelector.addEventListener('click', () => {
        this.showProjectSelector();
      });
    }

    // Settings button
    const settingsBtn = document.querySelector('[data-action="settings"]');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        Modals.openSettings(this.currentProjectId);
      });
    }
  },

  /**
   * Show project selector
   */
  async showProjectSelector() {
    try {
      const projects = await API.getProjects();
      const options = projects.map(p => p.name).join('\n');
      const selected = prompt('Select project:\n' + projects.map(p => `${p.id}: ${p.name}`).join('\n'));

      if (selected) {
        this.currentProjectId = selected;
        await this.loadProject();
      }
    } catch (error) {
      console.error('[Board] Project select error:', error);
    }
  },

  /**
   * Show empty state
   */
  showEmptyState() {
    const boardEl = document.querySelector('.board-container');
    if (boardEl) {
      boardEl.innerHTML = `
        <div class="empty-state" style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
          <div class="empty-state-icon" style="font-size: 64px;">📦</div>
          <div class="empty-state-text">No projects yet. Create one to get started!</div>
        </div>
      `;
    }
  },

  /**
   * Show error message
   */
  showError(message) {
    const boardEl = document.querySelector('.board-container');
    if (boardEl) {
      boardEl.innerHTML = `
        <div class="empty-state" style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
          <div class="empty-state-icon" style="font-size: 64px; color: #ef4444;">⚠️</div>
          <div class="empty-state-text" style="color: #ef4444;">${message}</div>
        </div>
      `;
    }
  },
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  Board.init();
});
