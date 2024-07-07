import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import fs from 'fs/promises';
import pty from 'node-pty';
import os from 'os';
import path from 'path';
import cors from 'cors';

const currentWorkingDirectory = process.env.INIT_CWD || process.cwd();

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const  ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: currentWorkingDirectory + '/user',
    env: process.env
});

console.log(`process.env.INIT_CWD : `, process.cwd());


const app = express();
const server = http.createServer(app);
const io = new Server({
    cors: '*'
});
app.use(cors());

io.attach(server);
ptyProcess.onData(data => {
    io.emit('terminal:data' , data)
})

io.on('connection' , (socket)=>{
    console.log(`socket connected : ` , socket.id);

    socket.on('terminal:write' , (data)=>{
        ptyProcess.write(data);
    })
});

app.get('/files' , async (req, res) => {
    const fileTree = await generateFileTree('./user');
    return res.json({tree : fileTree})
})

server.listen(9000, ()=>console.log(`🐳 Docker server running on port 9000`));

async function generateFileTree(directory){
    const tree = {};

    async function buildTree( currentDir , currentTree){
        const files = await fs.readdir(currentDir);
        
        for ( const file of files ){
            const filePath = path.join(currentDir, file);
            const stat = await fs.stat(filePath);

            if ( stat.isDirectory() ){
                currentTree[file] = {};
                await buildTree(filePath, currentTree[file]);
            }
            else{
                currentTree[file] = null;
            }
        }
    }

    await buildTree(directory, tree );
    return tree;
}
