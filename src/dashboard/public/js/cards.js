/**
 * Task Cards - Card rendering and interactions
 */

const Cards = {
  /**
   * Render a single task card
   */
  render(task, projectId) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.draggable = true;
    cardEl.dataset.taskId = task.id;

    // Priority badge
    const priorityBadge = document.createElement('div');
    priorityBadge.className = `card-priority-badge ${task.priority.toLowerCase()}`;
    priorityBadge.textContent = PRIORITY_BADGES[task.priority] || '?';
    priorityBadge.title = task.priority;

    // Status badge
    let statusBadgeHtml = '';
    if (task.approval_status === 'approved') {
      statusBadgeHtml = '<span class="card-status-badge approved">✓ Approved</span>';
    } else if (task.approval_status === 'rejected') {
      statusBadgeHtml = '<span class="card-status-badge rejected">✗ Rejected</span>';
    } else if (task.approval_status === 'pending') {
      statusBadgeHtml = '<span class="card-status-badge pending">⏳ Pending</span>';
    }

    // Title
    const titleEl = document.createElement('div');
    titleEl.className = 'card-title';
    titleEl.textContent = task.name;

    // Description
    let descriptionHtml = '';
    if (task.description) {
      descriptionHtml = `<div class="card-description">${escapeHtml(task.description)}</div>`;
    }

    // Meta
    const metaEl = document.createElement('div');
    metaEl.className = 'card-meta';
    metaEl.innerHTML = `
      <div class="card-assignee">
        ${task.assigned_to ? `<span title="${task.assigned_to}">${task.assigned_to.charAt(0).toUpperCase()}</span>` : '—'}
      </div>
      <div class="card-time">${this.formatTime(task.created_at)}</div>
    `;

    // Agent status
    let agentStatusHtml = '';
    if (task.agent_status === 'working') {
      agentStatusHtml = `
        <div class="card-agent-status">
          <div class="agent-status-spinner"></div>
          <span>${task.agent_name || 'Agent'} working...</span>
        </div>
      `;
    } else if (task.agent_status === 'error') {
      agentStatusHtml = `
        <div class="card-agent-status agent-status-error">
          <span>❌ Agent error</span>
        </div>
      `;
    }

    // Approval actions
    let approvalHtml = '';
    if (task.approval_status === 'pending') {
      approvalHtml = `
        <div class="card-approval-state">
          <div class="approval-state-icon">⏳</div>
          <div class="approval-state-text">Awaiting approval for:<br><strong>${task.stage}</strong></div>
          <div class="approval-state-actions">
            <button class="btn btn-sm btn-success approve-task-btn" data-task-id="${task.id}">Approve</button>
            <button class="btn btn-sm btn-danger reject-task-btn" data-task-id="${task.id}">Reject</button>
          </div>
        </div>
      `;
    }

    // Footer with actions
    const footerEl = document.createElement('div');
    footerEl.className = 'card-footer';
    footerEl.innerHTML = `
      <div></div>
      <div class="card-actions">
        <button class="card-action-btn edit-task-btn" data-task-id="${task.id}" title="Edit">✏️</button>
        <button class="card-action-btn delete-task-btn" data-task-id="${task.id}" title="Delete">🗑️</button>
      </div>
    `;

    // Assemble card
    cardEl.innerHTML = `
      <div class="card-header">
        ${priorityBadge.outerHTML}
        <div style="flex: 1;"></div>
        ${statusBadgeHtml}
      </div>
      ${titleEl.outerHTML}
      ${descriptionHtml}
      ${agentStatusHtml}
      ${approvalHtml}
      ${metaEl.outerHTML}
    `;

    // Add footer
    cardEl.appendChild(footerEl);

    // Event listeners
    this.attachListeners(cardEl, task, projectId);

    return cardEl;
  },

  /**
   * Attach event listeners to card
   */
  attachListeners(cardEl, task, projectId) {
    // Drag start
    cardEl.addEventListener('dragstart', (e) => {
      cardEl.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', task.id);
    });

    cardEl.addEventListener('dragend', () => {
      cardEl.classList.remove('dragging');
    });

    // Click to expand
    cardEl.addEventListener('click', (e) => {
      // Don't open modal if clicking on action buttons
      if (e.target.closest('.card-action-btn') || e.target.closest('.approval-state-actions')) {
        return;
      }
      Modals.openTaskDetail(task, projectId);
    });

    // Edit button
    const editBtn = cardEl.querySelector('.edit-task-btn');
    if (editBtn) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Modals.openEditTask(task, projectId);
      });
    }

    // Delete button
    const deleteBtn = cardEl.querySelector('.delete-task-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Modals.openDeleteConfirm(task, projectId);
      });
    }

    // Approve button
    const approveBtn = cardEl.querySelector('.approve-task-btn');
    if (approveBtn) {
      approveBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await API.approveTask(projectId, task.id);
          await Board.loadProject();
        } catch (error) {
          alert('Failed to approve task');
        }
      });
    }

    // Reject button
    const rejectBtn = cardEl.querySelector('.reject-task-btn');
    if (rejectBtn) {
      rejectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        Modals.openRejectTask(task, projectId);
      });
    }
  },

  /**
   * Format time for display
   */
  formatTime(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  },
};

/**
 * Utility: Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
