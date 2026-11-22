// Run the API locally with `npm start`, without the Vercel CLI.
const http = require('http');
const handler = require('./api');

const { PORT = 3000 } = process.env;

http.createServer(handler).listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${PORT}`);
});
