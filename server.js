const cors = require("cors");
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const readData = () => {
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch {
        return {};
    }
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

const collectImageFiles = (dir, base = '') => {
    const results = [];
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            if (item === 'desktop.ini') continue;
            const full = path.join(dir, item);
            const rel = base ? `${base}/${item}` : item;
            try {
                if (fs.statSync(full).isDirectory()) {
                    results.push(...collectImageFiles(full, rel));
                } else if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(item)) {
                    results.push(rel);
                }
            } catch {}
        }
    } catch {}
    return results;
};

const collectSwfFiles = (dir, base = '') => {
    const results = [];
    try {
        const items = fs.readdirSync(dir);
        for (const item of items) {
            const full = path.join(dir, item);
            const rel = base ? `${base}/${item}` : item;
            try {
                if (fs.statSync(full).isDirectory()) {
                    results.push(...collectSwfFiles(full, rel));
                } else if (/\.swf$/i.test(item)) {
                    results.push(rel);
                }
            } catch {}
        }
    } catch {}
    return results;
};

const server = http.createServer((req, res) => {
    // SAVE
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { page, html } = JSON.parse(body);

                const data = readData();
                data[page] = html; // 🔥 hier fixen we het probleem
                writeData(data);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                console.error(e);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Save failed' }));
            }
        });

        return;
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
    }


    if (req.url === '/api/swf') {
        const gamesDir = path.join(__dirname, 'Games');
        const files = collectSwfFiles(gamesDir);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(files));
        return;
    }

    if (req.url === '/api/files') {
        const baseDir = __dirname;
        function walk(dir) {
            let results = [];
            fs.readdirSync(dir).forEach(file => {
                const full = path.join(dir, file);
                if (fs.statSync(full).isDirectory()) {
                    results = results.concat(walk(full));
                } else {
                    if (file.match(/\.(jpg|png|gif|webp|svg|swf)$/i)) {
                        results.push(full.replace(baseDir, '').replace(/\\/g, '/'));
                    }
                }
            });
            return results;
        }
        try {
            const files = walk(baseDir);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(files));
        } catch (e) {
            console.error(e);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify([]));
        }
        return;
    }



    // 💾 SAVE content (per pagina)
    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const filePath = path.join(__dirname, 'content.json');

            let existing = {};
            if (fs.existsSync(filePath)) {
                try {
                    existing = JSON.parse(fs.readFileSync(filePath));
                } catch {
                    existing = {};
                }
            }

            const newData = JSON.parse(body);

            // 🔥 per pagina opslaan
            existing[newData.page] = newData.html;

            fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'saved' }));
        });

        return;
    }

    // LOAD

    // LOAD
    if (req.url === '/api/load') {
        const data = readData();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));

        return;
    }


    const decodedUrl = decodeURIComponent(req.url);
    let filePath = path.join(__dirname, decodedUrl === '/' ? 'index.html' : decodedUrl);
    
    const extname = path.extname(filePath).toLowerCase();
    let contentType = 'text/html';
    
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.swf': 'application/x-shockwave-flash',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject'
    };
    
    contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error', 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log('Server running on port', PORT);
    console.log(`Serving files from: ${__dirname}`);
});
