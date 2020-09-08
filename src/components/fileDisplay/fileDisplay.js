import './fileDisplay.css';
import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import PreviewPane from '../previewPane/previewPane';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

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
        const fileType = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length)
        if (fileType.length === fileName.length) {
            return 'Fasta'
        }
        else {
            return fileType
        }
    }

    const removeFile = (fileName) => {
        setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileName))
    }
    const openPreview = (file) => {
        setPreview(file.content)
        setPreviewOpen(true)
    }

    return <Container className="file-status-bar">
        <Row>
            <div className="file-type-logo"></div>
            <div className="file-type">{fileType(file.name)}</div>
            <Col lg={5} md={12} className='file-info'>
                <div className={`file-name ${file.invalid ? 'file-error' : ''}`} onClick={file.invalid ? () => removeFile(file.name) : () => openPreview(file)}>{file.name}</div>
                <div className="file-size">({fileSize(file.size)})</div>
            </Col>
            <Col lg={4} md={8} className='file-error-message'>
                {file.invalid
                    ? <div className='file-error-message-text'>({errorMessage})</div>
                    : null}
            </Col>
            <Col lg={2} md={2} className="file-remove" >
                <Button onClick={() => removeFile(file.name)} variant='danger' size='sm'>Remove</Button>
            </Col>
        </Row>
        <PreviewPane show={previewOpen} handleClose={() => setPreviewOpen(false)} content={preview} />
    </Container >
}

export default FileDisplay;