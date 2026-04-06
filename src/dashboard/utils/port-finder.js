const net = require('net');

/**
 * Check if a port is available
 * @param {number} port
 * @returns {Promise<boolean>}
 */
async function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close();
      resolve(true);
    });

    server.listen(port);
  });
}

/**
 * Find an available port, starting from preferred
 * @param {number} preferred - Starting port (default 3000)
 * @param {number} maxAttempts - Max attempts before giving up (default 10)
 * @returns {Promise<number>} Available port number
 */
async function findAvailablePort(preferred = 3000, maxAttempts = 10) {
  let port = preferred;

  for (let i = 0; i < maxAttempts; i++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
    port++;
  }

  throw new Error(`Could not find available port after ${maxAttempts} attempts`);
}

module.exports = {
  isPortAvailable,
  findAvailablePort,
};
