import { useEffect, useState } from "react";
import "./App.css";
import Terminal from './components/terminal';
import FileTree from "./components/tree";

function App() {

  const [fileTree , setFileTree ] = useState({});

  const getFileTree = async () =>{
    const response = await fetch('http://localhost:9000/files');
    const result = await response.json();
    console.log(result.tree);

    setFileTree(result.tree);
  }

  useEffect(()=>{
    getFileTree();
  } ,[])

  return (
    <div className='playground-container'>
      <div className='editor-container'>
        <div className="files">
          <FileTree tree={fileTree} />
        </div>
        <div className="editor"></div>
      </div>
      <div className='terminal-container'>
        <Terminal />
      </div>
    </div>
  )
}

export default App