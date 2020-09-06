import React, { useState, useEffect } from 'react';
import './dropzone.css';
import FileDisplay from '../fileDisplay/fileDisplay'
import { validateFormat } from '../util';


const DropZone = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [validFiles, setValidFiles] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const dragOver = (e) => {
        e.preventDefault();
    }
    const dragEnter = (e) => {
        e.preventDefault();
    }
    const dragLeave = (e) => {
        e.preventDefault();
    }
    const fileDrop = async (e) => {
        e.preventDefault();
        const data = e.dataTransfer
        const files = data.files;
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

        return new Promise((resolve, reject) => {
            reader.onload = function (event) {
                if (validateFormat(event.target.result)) {
                    file['invalid'] = false
                    file['content'] = event.target.result
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

    useEffect(() => {
        const filteredFiles = selectedFiles.reduce((files, current) => {
            const match = files.find((file) => file.name === current.name)
            if (match) {
                return files
            } else {
                return files.concat(current)
            }
        }, [])
        setValidFiles([...filteredFiles])
    }, [selectedFiles])

    return (<>
        <div className='container'>
            <div className='drop-container' onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={fileDrop}>
                <div className="drop-message">
                    <div className="upload-icon"></div>
                    Drag & Drop files here or click to upload
                </div>
            </div>
            <div className="file-display-container">
                {
                    validFiles.map(
                        (file, index) => {
                            return <FileDisplay file={file} errorMessage={errorMessage} setSelectedFiles={setSelectedFiles} key={index} />
                        }
                    )
                }
            </div>
        </div>
    </>);
}

export default DropZone;