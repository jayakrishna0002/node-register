const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

const PORT = 3000;
const usersFile = 'users.json';


if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]));
}


function serveFile(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        }
    });
}

function handleRequest(req, res) {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    
    if (pathname === '/register' && req.method === 'GET') {
        serveFile(res, 'register.html', 'text/html');
    }
    
    else if (pathname === '/register' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const formData = querystring.parse(body);
            const { name, emailOrPhone, password, confirmPassword } = formData;

            
            if (password !== confirmPassword) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Passwords do not match');
                return;
            }

    
            let users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

            
            const existingUser = users.find(user => user.emailOrPhone === emailOrPhone);
            if (existingUser) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('User already exists');
                return;
            }

            
            users.push({ name, emailOrPhone, password });
            fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

            
            res.writeHead(302, { Location: '/login' });
            res.end();
        });
    }
    
    else if (pathname === '/login' && req.method === 'GET') {
        serveFile(res, 'login.html', 'text/html');
    }
    
    else if (pathname === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const { emailOrPhone, password } = querystring.parse(body);

            
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));

            
            const user = users.find(user => user.emailOrPhone === emailOrPhone && user.password === password);
            if (user) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`Successfully logged in! Welcome, ${user.name}`);
            } else {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end('Invalid credentials');
            }
        });
    }
    
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
}


const server = http.createServer(handleRequest);
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
