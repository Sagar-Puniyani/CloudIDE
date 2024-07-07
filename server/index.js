import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import pty from 'node-pty';
import os from 'os';

const currentWorkingDirectory = process.env.INIT_CWD || process.cwd();

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const  ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: currentWorkingDirectory,
    env: process.env
});

console.log(`process.env.INIT_CWD : `, process.cwd());


const app = express();
const server = http.createServer(app);
const io = new Server({
    cors: '*'
});

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



server.listen(9000, ()=>console.log(`🐳 Docker server running on port 9000`));
