import {Terminal as XTerminal} from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';
import socket from '../socket';



const Terminal = () =>{

    const TerminalRef = useRef();
    const isRendered = useRef(false);

    useEffect(()=>{
        if (isRendered == true){
            console.log("Already rendered");
            return;
        }
        console.log("Init rendered");
        isRendered.current = true;

        const term = new XTerminal({
            rows: 20,
        });


        function onTerminalData(data){
            term.write(data);
        }
        term.open(TerminalRef.current);

        term.onData((data) =>{
            socket.emit("terminal:write" , data)
        })

        socket.on("terminal:data" , onTerminalData);
        
        return() => {
            socket.off("terminal:data" , onTerminalData);
        }
    } , [])

    return (
        <div  ref={TerminalRef} id='terminal' />
    )
}

export default Terminal;