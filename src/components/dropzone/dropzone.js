import React from 'react';
import './dropzone.css';
import { validateFormat } from '../util';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';


const DropZone = ({ selectedFiles, setSelectedFiles, setErrorMessage }) => {

    const dragOver = (e) => {
        e.preventDefault();
    }
    const dragEnter = (e) => {
        e.preventDefault();
    }
    const dragLeave = (e) => {
        e.preventDefault();
    }
    const fileDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer
        const files = data.files;
        checkFiles(files)
    }

    const filesSelected = async (e) => {
        const files = e.target.files;
        await checkFiles(files)
    }
    const checkFiles = async (files) => {
        let to_store = []
        for (let file of files) {
            to_store = to_store.concat(await handleFile(file))
        }
        setSelectedFiles(selectedFiles.concat(...to_store))
    }
    const handleFile = async (file) => {
        try {
            const to_return = await readFile(file)
            return to_return
        } catch (e) {
            console.warn(e.message)
        }
    }

    const readFile = (file) => {
        const reader = new FileReader();
        console.log(file)
        return new Promise((resolve, reject) => {
            reader.onload = function (event) {
                if (validateFormat(event.target.result)) {
                    file['invalid'] = false
                    file['content'] = event.target.result
                    file['id'] = file.name
                } else {
                    console.log('file loaded but invalid format');
                    setErrorMessage('File not a recognized format. Please check')
                    file['invalid'] = true
                }
                resolve(file);
            }
            reader.onerror = function () {
                reader.abort()
                reject(new DOMException("Problem parsing input file."));
            }

            reader.readAsText(file, "UTF-8");
        });
    };




    return (
        <Form.Group controlId='fasta-sequence'>
            <label htmlFor='fasta-input' id='fasta-input-label'>
                <Container className='drop-container' onDragOver={dragOver}
                    onDragEnter={dragEnter}
                    onDragLeave={dragLeave}
                    onDrop={fileDrop}>
                    <div className="drop-message">
                        <div className="upload-icon"></div>
                        Drag & Drop files here or click to upload
                    </div>
                    <input
                        className="file-input"
                        id="fasta-input"
                        type="file"
                        onChange={filesSelected}
                        multiple
                    />
                </Container>
            </label>
        </Form.Group>
    );
}

export default DropZone;