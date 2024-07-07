import {Terminal as XTerminal} from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';
import socket from '../socket';

const Terminal = () =>{

    const TerminalRef = useRef();
    const isRendered = useRef(false);

    useEffect(()=>{
        if (isRendered == true) return;
        isRendered.current = true;

        const term = new XTerminal({
            rows: 20,
        });
        term.open(TerminalRef.current);

        term.onData((data) =>{
            socket.emit("terminal:write" , data)
        })

        socket.on("terminal:data" , (data)=>{
            term.write(data);
        })
    } , [])

    return (
        <div  ref={TerminalRef} id='terminal' />
    )
}

export default Terminal;