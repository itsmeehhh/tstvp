];

function getClientIp(req) {
const xff = req.headers['x-forwarded-for'];
if (xff) {
return xff.split(',')[0].trim();
}
return req.ip || req.connection?.remoteAddress || null;
}

app.get('/info', (req, res) => {
const now = new Date();
const uptimeSeconds = process.uptime();

const info = {
timestamp: now.toISOString(),
localDate: now.toString(),
clientIp: getClientIp(req),
method: req.method,
url: req.originalUrl,
protocol: req.protocol,
host: req.get('host'),
userAgent: req.get('user-agent') || null,
headers: req.headers,
query: req.query,
process: {
pid: process.pid,
uptimeSeconds,
memory: process.memoryUsage(),
nodeVersion: process.version,
cwd: process.cwd()
},
os: {
platform: os.platform(),
release: os.release(),
hostname: os.hostname(),
arch: os.arch(),
cpus: os.cpus().length,
totalMemory: os.totalmem(),
freeMemory: os.freemem()
}
};

if (req.accepts('html')) {
const html = `       <!doctype html>       <html>       <head><meta charset="utf-8"><title>/info</title>         <style>
          body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:20px}
          pre{background:#f6f6f6;padding:12px;border-radius:6px;overflow:auto}
          table{border-collapse:collapse;margin-top:8px}
          td,th{padding:6px 10px;border:1px solid #ddd;vertical-align:top}         </style>       </head>       <body>         <h1>/info</h1>         <p><strong>Time:</strong> ${info.localDate}</p>         <p><strong>Client IP:</strong> ${info.clientIp}</p>         <p><strong>Method & URL:</strong> ${info.method} ${info.url}</p>         <h2>Query</h2>         <pre>${JSON.stringify(info.query, null, 2)}</pre>         <h2>Process</h2>         <pre>${JSON.stringify(info.process, null, 2)}</pre>         <h2>OS</h2>         <pre>${JSON.stringify(info.os, null, 2)}</pre>         <h2>Headers</h2>         <pre>${JSON.stringify(info.headers, null, 2)}</pre>       </body>       </html>
    `;
res.type('html').send(html);
return;
}

res.json(info);
});

app.get('/', (req, res) => {
res.redirect('/info');
});

app.get('/health', (req, res) => {
res.json({ status: 'ok', uptimeSeconds: process.uptime() });
});

app.listen(PORT, () => {
console.log(`Info app listening on http://localhost:${PORT} — GET /info`);
});

const defaultHeaders = {
"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36",
"Accept-Encoding": "gzip, deflate, br, zstd",
"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
"sec-ch-ua-platform": ""Android"",
"x-requested-with": "XMLHttpRequest",
"sec-ch-ua": ""Not;A=Brand";v="99", "Android WebView";v="139", "Chromium";v="139"",
"sec-ch-ua-mobile": "?1",
"origin": "[https://www.freevpn.us](https://www.freevpn.us)",
"sec-fetch-site": "same-origin",
"sec-fetch-mode": "cors",
"sec-fetch-dest": "empty",
"referer": "[https://www.freevpn.us/](https://www.freevpn.us/)",
"accept-language": "ar-MA,ar;q=0.9,en-US;q=0.8,en;q=0.7",
"priority": "u=1, i"
};

const formData = new URLSearchParams({
action: "claimCoin",
adblock_detected: "0"
});

async function claimForCookie(cookie, idx) {
const headers = { ...defaultHeaders, Cookie: cookie };
try {
const res = await axios.post("[https://www.freevpn.us/core.json](https://www.freevpn.us/core.json)", formData, { headers, timeout: 20000 });
const masked = cookie.length > 12 ? cookie.slice(0, 6) + '...' + cookie.slice(-6) : cookie;
console.log(`✅ [${idx}] Cookie ${masked} claimed at:`, new Date().toLocaleString());
console.log(`Response [${idx}]:`, res.data);
} catch (err) {
const status = err.response?.status || 'NO_STATUS';
const data = err.response?.data || err.message;
const masked = cookie.length > 12 ? cookie.slice(0, 6) + '...' + cookie.slice(-6) : cookie;
console.error(`❌ [${idx}] Error claiming for cookie ${masked}:`, status, data);
}
}

async function claimCoins() {
if (!Array.isArray(COOKIES) || COOKIES.length === 0) {
console.log('No cookies configured to claim.');
return;
}
await Promise.all(COOKIES.map((c, i) => claimForCookie(c, i)));
}

claimCoins();
setInterval(claimCoins, 24 * 60 * 60 * 1000 + 30 * 60 * 1000);
