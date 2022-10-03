const http = require('http');
const express = require('express');
const cors = require('cors');

const PORT = 4000;
const app = express();
app.use(cors());
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('hello world');
});

server.listen(PORT, () => 'listning on port' + PORT);
