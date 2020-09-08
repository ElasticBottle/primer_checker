import React, { useState, useEffect } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Form from 'react-bootstrap/Form'
import DropZone from "./components/dropzone/dropzone";
import TextArea from './components/textArea/textArea';
import FileDisplay from './components/fileDisplay/fileDisplay';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Collapse from 'react-bootstrap/Collapse';
import Spinner from 'react-bootstrap/Spinner';


function App() {
  const [showSubmit, setShowSubmit] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [displayedFiles, setDisplayedFiles] = useState([]);
  const [validFiles, setValidFiles] = useState([]);
  const [textFieldFasta, setTextFieldFasta] = useState('')
  const [fileErrorMessage, setFileErrorMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(true)

  useEffect(() => {
    const filteredFiles = selectedFiles.reduce((files, current) => {
      const match = files.find((file) => file.name === current.name)
      if (match) {
        return files
      } else {
        return files.concat(current)
      }
    }, [])
    setDisplayedFiles([...filteredFiles])
  }, [selectedFiles])

  useEffect(() => {
    const filteredFiles = displayedFiles.reduce((files, current) => {
      return current.invalid ? files : files.concat(current)
    }, [])
    setValidFiles(filteredFiles)
  }, [displayedFiles])

  useEffect(() => {
    if ((validFiles.length === displayedFiles.length && validFiles.length !== 0 && textFieldFasta.length === 0)
      || (textFieldFasta.length !== 0 && validFiles.length === 0)) {
      console.log(validFiles,);
      setErrorMessage('')
      return setShowSubmit(true)
    }
    else if (textFieldFasta.length !== 0 && validFiles.length !== 0) {
      setShowSubmit(false)
      setErrorMessage('Either upload a single sequence through input or select files to upload! Not Both!')
    }
    setShowSubmit(false)
  }, [validFiles, displayedFiles, textFieldFasta])

  const submitForm = () => {
    console.log(validFiles, textFieldFasta);
    setOpen(!open)
  }
  return (
    <div>
      <h1 className='title'>Primer Mutation</h1>
      <Collapse id='collapsable' in={open}>
        <div className='collapse-container'>
          <Container>
            <Form noValidate>
              <TextArea setTextFieldFasta={setTextFieldFasta} />
              <p className='alternative-upload'>OR</p>
              <DropZone selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} setErrorMessage={setFileErrorMessage} />
            </Form>
            <Container className="file-display-container">
              {
                displayedFiles.map(
                  (file, index) =>
                    <FileDisplay file={file} errorMessage={fileErrorMessage} setSelectedFiles={setSelectedFiles} key={index} />
                )
              }
            </Container>
          </Container>
        </div>
      </Collapse>
      <Container>
        <Row className='upload-error-message'>
          {errorMessage}
        </Row>
        <Button variant="primary" disabled>
          <Spinner
            as="span"
            className='loader'
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
            Loading...
          </Button>
        {showSubmit ?
          < Button
            as="input"
            type="submit"
            value="Submit"
            aria-controls="collapsable"
            aria-expanded={open}
            onClick={submitForm} />
          : null
        }

      </Container>
    </div>
  );
}

export default App;