// node codes.js <api-log> [port]: the test harness for the two-phone sync flow. Serves the newest sign-in code the
// local API printed to its own log (`sign-in code for <email>: <code>`), on this computer only. It never reads a
// real inbox, and the hosted API never prints codes.
const http = require('http');
const fs = require('fs');
const [log, port = '8799'] = process.argv.slice(2);
http.createServer((req, res) => {
  const email = (new URL(req.url, 'http://localhost').searchParams.get('email') || '').toLowerCase();
  const lines = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').split('\n').reverse() : [];
  const hit = lines.map(line => line.match(/sign-in code for (\S+): (\d{6})/)).find(m => m && m[1].toLowerCase() === email);
  res.writeHead(hit ? 200 : 404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(hit ? { code: hit[2] } : { error: 'no code yet' }));
}).listen(Number(port), '127.0.0.1');
