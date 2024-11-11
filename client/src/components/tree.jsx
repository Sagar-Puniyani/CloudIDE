import { useState } from 'react';
import { FaFolder, FaFolderOpen, FaFile, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import './FileTree.css';

// eslint-disable-next-line react/prop-types
const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
    const isDirectory = !!nodes;
    const [collapsed, setCollapsed] = useState(true); // State for expand/collapse

    const toggleCollapse = () => setCollapsed(!collapsed);

    return (
        <div
            className="tree-node"
            onClick={(e) => {
                e.stopPropagation();
                if (isDirectory) toggleCollapse();
                else onSelect(path);
            }}
        >
            <div className="node-header">
                {isDirectory ? (
                    <>
                        <span className="collapse-icon">
                            {collapsed ? <FaChevronRight /> : <FaChevronDown />}
                        </span>
                        {collapsed ? <FaFolder className="icon-text" /> : <FaFolderOpen className="icon-text" />}
                    </>
                ) : (
                    <FaFile className="file-icon" />
                )}
                <span className="file-name">{fileName}</span>
            </div>

            {/* Render child nodes only if directory is expanded */}
            {isDirectory && !collapsed && (
                <div className="node-children">
                    {Object.keys(nodes).map((child) => (
                        <FileTreeNode
                            key={child}
                            onSelect={onSelect}
                            path={`${path}/${child}`}
                            fileName={child}
                            nodes={nodes[child]}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};



// eslint-disable-next-line react/prop-types
const FileTree = ({ tree, onSelect }) => {
    return (
        <div className="file-tree-container">
            <FileTreeNode fileName="/" onSelect={onSelect} path="" nodes={tree} />
        </div>
    );
};

export default FileTree;





// // eslint-disable-next-line react/prop-types
// const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
//     const isDirectory = !!nodes;
//     return (
//         <div onClick={(e) => {
//             e.stopPropagation();
//             if(isDirectory) return;

//             onSelect(path)
//         }} style={{marginLeft: "20px"}}>
//             <p className={isDirectory ? '': 'file-node'} >{fileName}</p>
//             {nodes && <ul>
//                 {Object.keys(nodes).map(child => (
//                     <li key={child}>
//                         <FileTreeNode
//                             onSelect={onSelect}
//                             path={path+'/'+child}
//                             fileName={child}
//                             nodes={nodes[child]}
//                         />
//                     </li>
//                 ))}
//             </ul>}
//         </div>
//     )
// }

// // eslint-disable-next-line react/prop-types
// const FileTree = ({ tree , onSelect}) => {
//     return (
//         <FileTreeNode
//             fileName="/"
//             onSelect={onSelect}
//             path=''
//             nodes={tree}
//         />
//     )
// }

// export default FileTree;
