import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Terminal from './components/terminal';
import FileTree from "./components/tree";
import socket from "./socket";
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools";

function App() {

  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [code, setCode] = useState();

  const isSaved = selectedFileContent === code;

  const getFileTree = async () => {
    const response = await fetch('http://localhost:9000/files');
    const result = await response.json();
    console.log(result.tree);

    setFileTree(result.tree);
  }

  const getFileContent = useCallback(async () => {
    if (!selectedFile) return;
    const response = await fetch(`http://localhost:9000/file-content?path=${selectedFile}`);
    const result = await response.json();
    setSelectedFileContent(result.content);
    console.log(result.content);
  }, [selectedFile]);

  useEffect(() => {
    socket.on('file:refresh', getFileTree);
    return () => {
      socket.off('file:refresh', getFileTree);
    }
  }, [])

  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        socket.emit('file:change', {
          path: selectedFile,
          content: code
        })
      }, 15000);

      return () => {
        clearTimeout(timer)
      }

    }
  }, [code, isSaved, selectedFile]);

  useEffect(() => {
    if (selectedFile) getFileContent();
  }, [getFileContent, selectedFile])

  useEffect(() => {
    setCode('')
  }, [selectedFile])


  useEffect(() => {
    setCode(selectedFileContent)
  }, [selectedFileContent])

  return (
    <div className='playground-container'>
      <div className='editor-container'>
        <div className="files">
          <FileTree onSelect={(path) => setSelectedFile(path)}
            tree={fileTree} />
        </div>
        <div className="editor">
          {selectedFile && <p className="file-path">{selectedFile.replaceAll('/', ' > ')}</p>}
          <AceEditor
            value={code}
            onChange={e => setCode(e)}
            mode="javascript"
            theme="twilight"
            fontSize={16}
            lineHeight={19}
            showPrintMargin={true}
            showGutter={true}
            highlightActiveLine={true}
            height="60vh"
            width="85vw"
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        </div>
      </div>
      <div className='terminal-container'>
        <Terminal />
      </div>
    </div>
  )
}

export default App
