const express = require('express');
const http = require('http');
const path = require('path');
const ws = require('ws');
const createApiRouter = require('./routes/api');
const { findAvailablePort } = require('./utils/port-finder');

/**
 * DashboardServer - Express + WebSocket server for the Kanban dashboard
 *
 * Constructor injection pattern:
 * - storage: storage backend instance (FileBackend, MySQLBackend, etc)
 * - taskManager: TaskManager instance
 * - projectManager: ProjectManager instance
 * - agentRouter: AgentRouter instance
 */
class DashboardServer {
  constructor(storage, taskManager, projectManager, agentRouter) {
    this.storage = storage;
    this.taskManager = taskManager;
    this.projectManager = projectManager;
    this.agentRouter = agentRouter;

    this.httpServer = null;
    this.app = null;
    this.wss = null;
    this.port = null;
  }

  /**
   * Start the server
   * @param {number} preferredPort - Preferred port (default 3000), 0 for random
   * @returns {Promise<{port, server}>}
   */
  async start(preferredPort = 3000) {
    // Determine which port to use
    let port;
    if (preferredPort === 0) {
      // Port 0 = let OS pick a random free port
      port = 0;
    } else {
      // Find available port starting from preferred
      port = await findAvailablePort(preferredPort);
    }

    // Create Express app
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Create HTTP server (shared with WebSocket)
    this.httpServer = http.createServer(this.app);

    // Create WebSocket server
    this.wss = new ws.Server({ server: this.httpServer });

    // Handle WebSocket connections
    this.wss.on('connection', (socket) => {
      // Send connected clients count
      socket.send(
        JSON.stringify({
          type: 'server-info',
          payload: { clients: this.wss.clients.size },
        })
      );
    });

    // Mount API router (broadcast function passed in)
    const apiRouter = createApiRouter(
      this.taskManager,
      this.projectManager,
      this.agentRouter,
      this.broadcast.bind(this)
    );
    this.app.use('/api', apiRouter);

    // Serve static files from public/
    const publicDir = path.join(__dirname, 'public');
    this.app.use(express.static(publicDir));

    // Fallback: serve index.html for SPA routing
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(publicDir, 'index.html'));
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', port: this.port });
    });

    // Error handling middleware
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Internal Server Error' });
    });

    // Start listening
    return new Promise((resolve, reject) => {
      const server = this.httpServer;

      const handleListening = () => {
        // Get the actual port assigned (important for port 0)
        const address = server.address();
        this.port = address.port;
        server.removeListener('error', handleError);
        resolve({ port: this.port, server });
      };

      const handleError = (err) => {
        server.removeListener('listening', handleListening);
        reject(err);
      };

      server.once('listening', handleListening);
      server.once('error', handleError);

      server.listen(port);
    });
  }

  /**
   * Stop the server
   * @returns {Promise<void>}
   */
  async stop() {
    if (this.wss) {
      // Close all WebSocket connections
      this.wss.clients.forEach((client) => {
        client.close();
      });
    }

    if (this.httpServer) {
      return new Promise((resolve, reject) => {
        this.httpServer.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }
  }

  /**
   * Broadcast a message to all connected WebSocket clients
   * @param {Object} message - Message to broadcast (will be JSON stringified)
   */
  broadcast(message) {
    if (!this.wss) return;

    const data = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(data);
      }
    });
  }
}

module.exports = DashboardServer;
