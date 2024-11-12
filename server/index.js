import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import fs from 'fs/promises';
import pty from 'node-pty';
import os from 'os';
import path from 'path';
import cors from 'cors';
import chokidar from 'chokidar';

// Set the current working directory
const currentWorkingDirectory = process.env.INIT_CWD || process.cwd();
const userDirectory = path.resolve(currentWorkingDirectory, 'user');

console.log(`Current Working Directory:`, currentWorkingDirectory);
console.log(`User Directory Path:`, userDirectory);

// Determine shell based on OS
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: userDirectory,
    env: process.env
});

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Configure CORS and static files
app.use(cors());
app.use(express.static(path.join(__dirname, 'public', 'dist')));

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Ensure `user` directory exists
async function ensureUserDirectory() {
    try {
        await fs.mkdir(userDirectory, { recursive: true });
        console.log(`Directory ensured: ${userDirectory}`);
    } catch (error) {
        console.error(`Failed to create directory ${userDirectory}:`, error);
    }
}

// Generate file tree for a given directory
async function generateFileTree(directory) {
    const tree = {};

    async function buildTree(currentDir, currentTree) {
        const files = await fs.readdir(currentDir);
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = await fs.stat(filePath);

            if (stat.isDirectory()) {
                currentTree[file] = {};
                await buildTree(filePath, currentTree[file]);
            } else {
                currentTree[file] = null;
            }
        }
    }

    await buildTree(directory, tree);
    return tree;
}

// Ensure the `user` directory is created before starting
await ensureUserDirectory();

// Watch for file changes in the `user` directory
chokidar.watch(userDirectory).on('all', (event, filePath) => {
    console.log(`File change detected: ${event} -> ${filePath}`);
    io.emit('file:refresh', filePath);
});

// Handle terminal data
ptyProcess.onData(data => {
    console.log(`Terminal output:`, data);
    io.emit('terminal:data', data);
});

// Socket.io connection
io.on('connection', (socket) => {
    console.log(`Socket connected:`, socket.id);

    // Emit initial file refresh on connection
    socket.emit('file:refresh');

    // Handle file content change from client
    socket.on('file:change', async ({ path: relativePath, content }) => {
        const fullPath = path.join(userDirectory, relativePath);
        console.log(`Updating file: ${fullPath}`);
        try {
            await fs.writeFile(fullPath, content);
            console.log(`File updated successfully.`);
        } catch (error) {
            console.error(`Failed to update file:`, error);
        }
    });

    // Handle terminal write input from client
    socket.on('terminal:write', (data) => {
        console.log(`Received terminal write input:`, data);
        ptyProcess.write(data);
    });
});

// Endpoint to get the file tree
app.get('/files', async (req, res) => {
    try {
        const fileTree = await generateFileTree(userDirectory);
        res.json({ tree: fileTree });
    } catch (error) {
        console.error('Error generating file tree:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to get file content
app.get('/file-content', async (req, res) => {
    const relativePath = req.query.path;
    const fullPath = path.join(userDirectory, relativePath);
    console.log(`Fetching content for file: ${fullPath}`);
    try {
        const content = await fs.readFile(fullPath, 'utf-8');
        res.json({ content });
    } catch (error) {
        console.error(`Failed to read file:`, error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
const PORT = process.env.PORT || 9000;
server.listen(PORT, () => console.log(`🐳 Server running on port ${PORT}`));
