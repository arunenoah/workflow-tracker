/**
 * WebSocket Client - Real-time updates for dashboard
 */

const WebSocketClient = {
  socket: null,
  isConnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 10,
  reconnectDelay: 3000,
  messageHandlers: {}, // { type: [callback, callback, ...] }

  /**
   * Connect to WebSocket server
   */
  connect() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    console.log('[WebSocket] Connecting to', wsUrl);

    this.socket = new WebSocket(wsUrl);

    this.socket.addEventListener('open', () => this.onOpen());
    this.socket.addEventListener('message', (e) => this.onMessage(e));
    this.socket.addEventListener('close', () => this.onClose());
    this.socket.addEventListener('error', (e) => this.onError(e));
  },

  /**
   * Handle WebSocket open
   */
  onOpen() {
    console.log('[WebSocket] Connected');
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Update connection indicator
    this.updateConnectionIndicator();

    // Notify listeners
    this.emit('connected');
  },

  /**
   * Handle WebSocket message
   */
  onMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log('[WebSocket] Message:', message.type);

      // Call all handlers for this message type
      if (this.messageHandlers[message.type]) {
        this.messageHandlers[message.type].forEach(handler => {
          try {
            handler(message.payload);
          } catch (err) {
            console.error(`[WebSocket] Handler error for ${message.type}:`, err);
          }
        });
      }
    } catch (err) {
      console.error('[WebSocket] Parse error:', err);
    }
  },

  /**
   * Handle WebSocket close
   */
  onClose() {
    console.log('[WebSocket] Disconnected');
    this.isConnected = false;

    // Update connection indicator
    this.updateConnectionIndicator();

    // Notify listeners
    this.emit('disconnected');

    // Attempt reconnect
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(
        `[WebSocket] Reconnecting in ${this.reconnectDelay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );
      setTimeout(() => this.connect(), this.reconnectDelay);
    } else {
      console.error('[WebSocket] Max reconnection attempts reached');
    }
  },

  /**
   * Handle WebSocket error
   */
  onError(error) {
    console.error('[WebSocket] Error:', error);
    this.emit('error', error);
  },

  /**
   * Register handler for message type
   */
  on(messageType, callback) {
    if (!this.messageHandlers[messageType]) {
      this.messageHandlers[messageType] = [];
    }
    this.messageHandlers[messageType].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.messageHandlers[messageType].indexOf(callback);
      if (index > -1) {
        this.messageHandlers[messageType].splice(index, 1);
      }
    };
  },

  /**
   * Emit event (internal listeners)
   */
  emit(type, data) {
    if (this.messageHandlers[type]) {
      this.messageHandlers[type].forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[WebSocket] Handler error for ${type}:`, err);
        }
      });
    }
  },

  /**
   * Update connection indicator in UI
   */
  updateConnectionIndicator() {
    const indicator = document.querySelector('.connection-indicator');
    if (indicator) {
      if (this.isConnected) {
        indicator.classList.remove('disconnected');
      } else {
        indicator.classList.add('disconnected');
      }
    }
  },

  /**
   * Check if connected
   */
  connected() {
    return this.isConnected;
  },

  /**
   * Close connection
   */
  close() {
    if (this.socket) {
      this.socket.close();
    }
  },
};

// Auto-connect on load
document.addEventListener('DOMContentLoaded', () => {
  WebSocketClient.connect();
});
