const { spawn } = require('child_process');

// Start the server (main.js)
const server = spawn('node', ['main.js'], { stdio: 'inherit' });

// Wait for the server to start, then run the client (client.js)
setTimeout(() => {
  const client = spawn('node', ['client.js'], { stdio: 'inherit' });

  client.on('close', (code) => {
    console.log(`Client process exited with code ${code}`);
    // Once client is done, close the server as well
    server.kill();
  });
}, 5000); // Wait for 5 seconds before starting client

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});
