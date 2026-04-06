/**
 * Modals - Dialog and form management
 */

const Modals = {
  currentModal: null,
  currentOverlay: null,

  /**
   * Get or create modal overlay
   */
  getOverlay() {
    if (!this.currentOverlay) {
      this.currentOverlay = document.querySelector('.modal-overlay');
      if (!this.currentOverlay) {
        this.currentOverlay = document.createElement('div');
        this.currentOverlay.className = 'modal-overlay';
        document.body.appendChild(this.currentOverlay);
      }

      this.currentOverlay.addEventListener('click', (e) => {
        if (e.target === this.currentOverlay) {
          this.closeModal();
        }
      });
    }
    return this.currentOverlay;
  },

  /**
   * Show modal
   */
  showModal(title, content, actions = []) {
    const overlay = this.getOverlay();
    const html = `
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">${title}</h2>
          <button class="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${actions.length > 0 ? `
          <div class="modal-footer">
            ${actions.map(action => `
              <button class="btn btn-${action.variant || 'secondary'} ${action.class || ''}" data-action="${action.id}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    overlay.innerHTML = html;
    overlay.classList.add('active');

    const modal = overlay.querySelector('.modal');
    this.currentModal = modal;

    // Close button
    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
      this.closeModal();
    });

    // Action buttons
    actions.forEach(action => {
      const btn = modal.querySelector(`[data-action="${action.id}"]`);
      if (btn && action.handler) {
        btn.addEventListener('click', action.handler);
      }
    });

    return modal;
  },

  /**
   * Close modal
   */
  closeModal() {
    const overlay = this.getOverlay();
    overlay.classList.remove('active');
    this.currentModal = null;
  },

  // ===== TASK DETAIL =====

  async openTaskDetail(task, projectId) {
    const content = `
      <div class="form-group">
        <h3 style="margin-bottom: 1rem;">${escapeHtml(task.name)}</h3>
        ${task.description ? `
          <p style="color: var(--text-secondary); margin-bottom: 1rem;">
            ${escapeHtml(task.description)}
          </p>
        ` : ''}
      </div>

      <div class="form-group">
        <label class="form-label">Priority</label>
        <div style="padding: 0.5rem; background: var(--bg-primary); border-radius: var(--radius-md);">
          <strong>${task.priority}</strong> ${PRIORITY_BADGES[task.priority] || ''}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Current Stage</label>
        <div style="padding: 0.5rem; background: var(--bg-primary); border-radius: var(--radius-md);">
          ${escapeHtml(task.stage)}
        </div>
      </div>

      ${task.assigned_to ? `
        <div class="form-group">
          <label class="form-label">Assigned To</label>
          <div style="padding: 0.5rem; background: var(--bg-primary); border-radius: var(--radius-md);">
            ${escapeHtml(task.assigned_to)}
          </div>
        </div>
      ` : ''}

      <div class="form-group">
        <label class="form-label">Created</label>
        <div style="font-size: 12px; color: var(--text-secondary);">
          ${new Date(task.created_at).toLocaleString()}
        </div>
      </div>

      ${task.activity_log && task.activity_log.length > 0 ? `
        <div class="form-group">
          <label class="form-label">Activity Log</label>
          <div style="max-height: 200px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 0.5rem;">
            ${task.activity_log.map(entry => `
              <div style="padding: 0.5rem 0; border-bottom: 1px solid var(--border-color); font-size: 12px;">
                <strong>${entry.action}</strong>
                ${entry.from_stage ? ` from <em>${entry.from_stage}</em>` : ''}
                ${entry.to_stage ? ` to <em>${entry.to_stage}</em>` : ''}
                <div style="color: var(--text-tertiary); margin-top: 0.25rem;">
                  ${new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;

    const actions = [
      { id: 'edit', label: '✏️ Edit', variant: 'primary', handler: () => {
        this.closeModal();
        this.openEditTask(task, projectId);
      }},
      { id: 'delete', label: '🗑️ Delete', variant: 'danger', handler: () => {
        this.closeModal();
        this.openDeleteConfirm(task, projectId);
      }},
      { id: 'close', label: 'Close', variant: 'secondary', handler: () => {
        this.closeModal();
      }},
    ];

    this.showModal(`Task Details`, content, actions);
  },

  // ===== EDIT TASK =====

  async openEditTask(task, projectId) {
    const content = `
      <form id="edit-task-form">
        <div class="form-group">
          <label class="form-label">Task Name</label>
          <input type="text" class="form-input" name="name" value="${escapeHtml(task.name)}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" name="description">${escapeHtml(task.description || '')}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Priority</label>
          <div class="form-radio-group">
            ${['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => `
              <label class="form-radio-item">
                <input type="radio" name="priority" value="${priority}" ${task.priority === priority ? 'checked' : ''}>
                <span class="form-radio-label">
                  <span class="radio-badge" style="background: var(--priority-${priority.toLowerCase()})"></span>
                  ${priority}
                </span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Assigned To</label>
          <input type="text" class="form-input" name="assigned_to" value="${escapeHtml(task.assigned_to || '')}" placeholder="Optional">
        </div>
      </form>
    `;

    const actions = [
      { id: 'save', label: '✓ Save', variant: 'primary', handler: async () => {
        const form = this.currentModal.querySelector('#edit-task-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
          await API.updateTask(projectId, task.id, data);
          await Board.loadProject();
          this.closeModal();
        } catch (error) {
          alert('Failed to update task');
          console.error(error);
        }
      }},
      { id: 'cancel', label: 'Cancel', variant: 'secondary', handler: () => {
        this.closeModal();
      }},
    ];

    this.showModal('Edit Task', content, actions);
  },

  // ===== CREATE TASK =====

  async openCreateTask(projectId, defaultStage) {
    const content = `
      <form id="create-task-form">
        <div class="form-group">
          <label class="form-label">Task Name</label>
          <input type="text" class="form-input" name="name" placeholder="Enter task name" required autofocus>
        </div>

        <div class="form-group">
          <label class="form-label">Description</label>
          <textarea class="form-textarea" name="description" placeholder="Optional"></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">Priority</label>
          <div class="form-radio-group">
            ${['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => `
              <label class="form-radio-item">
                <input type="radio" name="priority" value="${priority}" ${priority === 'MEDIUM' ? 'checked' : ''}>
                <span class="form-radio-label">
                  <span class="radio-badge" style="background: var(--priority-${priority.toLowerCase()})"></span>
                  ${priority}
                </span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Assigned To</label>
          <input type="text" class="form-input" name="assigned_to" placeholder="Optional">
        </div>
      </form>
    `;

    const actions = [
      { id: 'create', label: '+ Create', variant: 'primary', handler: async () => {
        const form = this.currentModal.querySelector('#create-task-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        try {
          await API.createTask(projectId, data);
          await Board.loadProject();
          this.closeModal();
        } catch (error) {
          alert('Failed to create task');
          console.error(error);
        }
      }},
      { id: 'cancel', label: 'Cancel', variant: 'secondary', handler: () => {
        this.closeModal();
      }},
    ];

    this.showModal('Create Task', content, actions);
  },

  // ===== DELETE CONFIRMATION =====

  async openDeleteConfirm(task, projectId) {
    const content = `
      <div class="alert alert-danger">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">Delete Task</div>
          <div>Are you sure you want to delete "<strong>${escapeHtml(task.name)}</strong>"? This action cannot be undone.</div>
        </div>
      </div>
    `;

    const actions = [
      { id: 'delete', label: '🗑️ Delete', variant: 'danger', handler: async () => {
        try {
          await API.deleteTask(projectId, task.id);
          await Board.loadProject();
          this.closeModal();
        } catch (error) {
          alert('Failed to delete task');
          console.error(error);
        }
      }},
      { id: 'cancel', label: 'Cancel', variant: 'secondary', handler: () => {
        this.closeModal();
      }},
    ];

    this.showModal('Confirm Delete', content, actions);
  },

  // ===== REJECT TASK =====

  async openRejectTask(task, projectId) {
    const content = `
      <form id="reject-task-form">
        <div class="form-group">
          <label class="form-label">Rejection Reason (Optional)</label>
          <textarea class="form-textarea" name="reason" placeholder="Explain why this task is being rejected..."></textarea>
        </div>
      </form>
    `;

    const actions = [
      { id: 'reject', label: '✗ Reject', variant: 'danger', handler: async () => {
        const form = this.currentModal.querySelector('#reject-task-form');
        const reason = form.querySelector('[name="reason"]').value;

        try {
          await API.rejectTask(projectId, task.id, reason);
          await Board.loadProject();
          this.closeModal();
        } catch (error) {
          alert('Failed to reject task');
          console.error(error);
        }
      }},
      { id: 'cancel', label: 'Cancel', variant: 'secondary', handler: () => {
        this.closeModal();
      }},
    ];

    this.showModal('Reject Task', content, actions);
  },

  // ===== SETTINGS PANEL =====

  async openSettings(projectId) {
    try {
      const project = await API.getProject(projectId);

      const stageListHtml = project.stages.map((stage, index) => `
        <div class="stage-item" draggable="true" data-stage-id="${stage.id}">
          <div class="stage-drag-handle">⋮⋮</div>
          <div class="stage-info">
            <div class="stage-name">${escapeHtml(stage.name)}</div>
            ${stage.agent ? `
              <div class="stage-agent">
                Agent: <strong>${escapeHtml(stage.agent)}</strong>
                ${stage.requires_approval ? ' (Approval required)' : ''}
              </div>
            ` : ''}
          </div>
          <div class="stage-actions">
            <button class="stage-action-btn edit" data-stage-id="${stage.id}" title="Edit">✏️</button>
            <button class="stage-action-btn delete" data-stage-id="${stage.id}" title="Delete">🗑️</button>
          </div>
        </div>
      `).join('');

      const panel = document.createElement('div');
      panel.className = 'settings-panel active';
      panel.innerHTML = `
        <div class="settings-header">
          <h2 style="font-size: 18px; font-weight: 700;">Workflow Settings</h2>
          <button class="modal-close-btn">✕</button>
        </div>
        <div class="settings-content">
          <div style="margin-bottom: 2rem;">
            <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-secondary);">Stages</h3>
            <div class="stage-list">
              ${stageListHtml}
            </div>
            <button class="btn btn-secondary btn-block" style="margin-top: 1rem;" data-action="add-stage">+ Add Stage</button>
          </div>
        </div>
        <div class="settings-footer">
          <button class="btn btn-secondary" data-action="close-settings">Close</button>
        </div>
      `;

      document.body.appendChild(panel);

      // Event listeners
      panel.querySelector('.modal-close-btn').addEventListener('click', () => {
        panel.remove();
      });

      panel.querySelector('[data-action="close-settings"]').addEventListener('click', () => {
        panel.remove();
      });

      panel.querySelector('[data-action="add-stage"]').addEventListener('click', () => {
        panel.remove();
        this.openAddStage(projectId);
      });

      // Edit stage
      panel.querySelectorAll('.stage-action-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => {
          const stageId = btn.dataset.stageId;
          const stage = project.stages.find(s => s.id === stageId);
          panel.remove();
          this.openEditStage(projectId, stage);
        });
      });

      // Delete stage
      panel.querySelectorAll('.stage-action-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const stageId = btn.dataset.stageId;
          const stage = project.stages.find(s => s.id === stageId);
          panel.remove();
          this.openDeleteStageConfirm(projectId, stage);
        });
      });
    } catch (error) {
      alert('Failed to load settings');
      console.error(error);
    }
  },

  // ===== ADD STAGE =====

  async openAddStage(projectId) {
    const content = `
      <form id="add-stage-form">
        <div class="form-group">
          <label class="form-label">Stage Name</label>
          <input type="text" class="form-input" name="name" placeholder="e.g., Testing, Deployment" required autofocus>
        </div>

        <div class="form-group">
          <label class="form-label">Order</label>
          <input type="number" class="form-input" name="order" placeholder="Stage position" value="1" required>
        </div>

        <div class="form-toggle">
          <input type="checkbox" id="auto-invoke-toggle" name="auto_invoke_agent">
          <span class="toggle-label">Auto-invoke agent</span>
        </div>

        <div id="agent-selector" style="display: none; margin-top: 1rem;">
          <div class="form-group">
            <label class="form-label">Agent</label>
            <select class="form-select" name="agent">
              <option value="">None</option>
              <option value="code-reviewer">Code Reviewer</option>
              <option value="security-reviewer">Security Reviewer</option>
              <option value="qa-tester">QA Tester</option>
            </select>
          </div>
        </div>

        <div class="form-toggle">
          <input type="checkbox" id="requires-approval-toggle" name="requires_approval">
          <span class="toggle-label">Requires approval</span>
        </div>
      </form>
    `;

    const actions = [
      { id: 'create', label: '+ Create', variant: 'primary', handler: async () => {
        const form = this.currentModal.querySelector('#add-stage-form');
        const formData = new FormData(form);
        const data = {
          name: formData.get('name'),
          order: parseInt(formData.get('order')),
        };

        try {
          await API.addStage(projectId, data);
          await Board.loadProject();
          this.closeModal();
        } catch (error) {
          alert('Failed to create stage');
          console.error(error);
        }
      }},
      { id: 'cancel', label: 'Cancel', variant: 'secondary', handler: () => {
        this.closeModal();
      }},
    ];

    this.showModal('Add Stage', content, actions);

    // Toggle agent selector
    setTimeout(() => {
      const toggle = this.currentModal.querySelector('#auto-invoke-toggle');
      const selector = this.currentModal.querySelector('#agent-selector');
      if (toggle) {
        toggle.addEventListener('change', () => {
          selector.style.display = toggle.checked ? 'block' : 'none';
        });
      }
    }, 0);
  },

  // ===== EDIT STAGE =====

  async openEditStage(projectId, stage) {
    const content = `
      <form id="edit-stage-form">
        <div class="form-group">
          <label class="form-label">Stage Name</label>
          <input type="text" class="form-input" name="name" value="${escapeHtml(stage.name)}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Order</label>
          <input type="number" class="form-input" name="order" value="${stage.order}" required>
        </div>

        <div class="form-toggle">
          <input type="checkbox" id="auto-invoke-toggle" name="auto_invoke_agent" ${stage.auto_invoke_agent ? 'checked' : ''}>
          <span class="toggle-label">Auto-invoke agent</span>
        </div>

        <div id="agent-selector" style="display: ${stage.auto_invoke_agent ? 'block' : 'none'}; margin-top: 1rem;">
          <div class="form-group">
            <label class="form-label">Agent</label>
            <select class="form-select" name="agent">
              <option value="">None</option>
              <option value="code-reviewer" ${stage.agent === 'code-reviewer' ? 'selected' : ''}>Code Reviewer</option>
              <option value="security-reviewer" ${stage.agent === 'security-reviewer' ? 'selected' : ''}>Security Reviewer</option>
              <option value="qa-tester" ${stage.agent === 'qa-tester' ? 'selected' : ''}>QA Tester</option>
            </select>
          </div>
        </div>

        <div class="form-toggle">
          <input type="checkbox" id="requires-approval-toggle" name="requires_approval" ${stage.requires_approval ? 'checked' : ''}>
          <span class="toggle-label">Requires approval</span>
        </div>
      </form>
    `;

    const actions = [
      { id: 'save', label: '✓ Save', variant: 'primary', handler: async () => {
        const form = this.currentModal.querySelector('#edit-stage-form');
        const formData = new FormData(form);
        const data = {
          name: formData.get('name'),
          order: parseInt(formData.get('order')),
          auto_invoke_agent: formData.get('auto_invoke_agent') === 'on',
          agent: formData.get('agent') || null,
          requires_approval: formData.get('requires_approval') === 'on',
        };

        try {
          await API.updateStage(projectId, stage.id, data);
          await Board.loadProject();
          this.closeModal();
        } catch (error) {
          alert('Failed to update stage');
          console.error(error);
        }
      }},
      { id: 'cancel', label: 'Cancel', variant: 'secondary', handler: () => {
        this.closeModal();
      }},
    ];

    this.showModal('Edit Stage', content, actions);

    // Toggle agent selector
    setTimeout(() => {
      const toggle = this.currentModal.querySelector('#auto-invoke-toggle');
      const selector = this.currentModal.querySelector('#agent-selector');
      if (toggle) {
        toggle.addEventListener('change', () => {
          selector.style.display = toggle.checked ? 'block' : 'none';
        });
      }
    }, 0);
  },

  // ===== DELETE STAGE =====

  async openDeleteStageConfirm(projectId, stage) {
    const content = `
      <div class="alert alert-danger">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <div class="alert-title">Delete Stage</div>
          <div>Are you sure you want to delete the "<strong>${escapeHtml(stage.name)}</strong>" stage? This action cannot be undone.</div>
        </div>
      </div>
    `;

    const actions = [
      { id: 'delete', label: '🗑️ Delete', variant: 'danger', handler: async () => {
        try {
          await API.deleteStage(projectId, stage.name);
          await Board.loadProject();
          this.closeModal();
        } catch (error) {
          alert('Failed to delete stage');
          console.error(error);
        }
      }},
      { id: 'cancel', label: 'Cancel', variant: 'secondary', handler: () => {
        this.closeModal();
      }},
    ];

    this.showModal('Confirm Delete', content, actions);
  },
};
