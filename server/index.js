import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import pty from 'node-pty';


const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
const  ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD + '/user',
    env: process.env
});


const app = express();
const server = http.createServer(app);
const io = new Server({
    cors: '*'
});

io.attach(server);

io.on('connection' , (socket)=>{
    console.log(`socket connected : ` , socket.id);

    socket.on('terminal:write' , (data)=>{
        ptyProcess.write(data);
    })
});



server.listen(9000, ()=>console.log(`🐳 Docker server running on port 9000`));
