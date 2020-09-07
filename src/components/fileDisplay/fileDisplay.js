import './fileDisplay.css';
import React, { useState } from 'react';
import PreviewPane from '../previewPane/previewPane';

const FileDisplay = ({ file, errorMessage, setSelectedFiles }) => {
    const [preview, setPreview] = useState('')
    const [previewOpen, setPreviewOpen] = useState(false)
    const fileSize = (size) => {
        if (size === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(size) / Math.log(k));
        return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    const fileType = (fileName) => {
        // fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length) || fileName;
        return 'Fasta'
    }

    const removeFile = (fileName) => {
        setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName))
    }
    const openPreview = (file) => {
        setPreview(file.content)
        setPreviewOpen(true)
    }

    return <div className="file-status-bar">
        <div >
            <div className="file-type-logo"></div>
            <div className="file-type">{fileType(file.name)}</div>
            <span className={`file-name ${file.invalid ? 'file-error' : ''}`} onClick={file.invalid ? () => removeFile(file.name) : () => openPreview(file)}>{file.name}</span>
            <span className="file-size">({fileSize(file.size)})</span> {file.invalid && <span className='file-error-message'>({errorMessage})</span>}
        </div>
        <div className="file-remove" onClick={() => removeFile(file.name)}>X</div>
        <PreviewPane show={previewOpen} handleClose={() => setPreviewOpen(false)} content={preview} />
    </div >
}

export default FileDisplay;