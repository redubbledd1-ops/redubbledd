const http = require('http');
const fs = require('fs');
const path = require('path');

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
