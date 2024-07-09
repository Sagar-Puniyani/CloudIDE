// eslint-disable-next-line react/prop-types
const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
    const isDirectory = !!nodes;
    return (
        <div onClick={(e) => {
            e.stopPropagation();
            if(isDirectory) return;

            onSelect(path)
        }} style={{marginLeft: "20px"}}>
            <p className={isDirectory ? '': 'file-node'} >{fileName}</p>
            {nodes && <ul>
                {Object.keys(nodes).map(child => (
                    <li key={child}>
                        <FileTreeNode
                            onSelect={onSelect}
                            path={path+'/'+child}
                            fileName={child}
                            nodes={nodes[child]}
                        />
                    </li>
                ))}
            </ul>}
        </div>
    )
}

// eslint-disable-next-line react/prop-types
const FileTree = ({ tree , onSelect}) => {
    return (
        <FileTreeNode
            fileName="/"
            onSelect={onSelect}
            path=''
            nodes={tree}
        />
    )
}

export default FileTree;