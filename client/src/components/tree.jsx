// eslint-disable-next-line react/prop-types
const FileTreeNode = ({ fileName, nodes }) => {
    return (
        <div style={{marginLeft: "20px"}}>
            {fileName}
            {nodes && <ul>
                {Object.keys(nodes).map(child => (
                    <li key={child}>
                        <FileTreeNode
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
const FileTree = ({ tree }) => {
    return (
        <FileTreeNode
            fileName="/"
            nodes={tree}
        />
    )
}

export default FileTree;