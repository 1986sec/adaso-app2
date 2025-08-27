const http = require('http');
const app = require('./src');
const config = require('./src/config/config');

const PORT = config.port;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});


