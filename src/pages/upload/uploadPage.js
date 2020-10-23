import React, { useState, useEffect } from "react";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Collapse from "react-bootstrap/Collapse";
import Spinner from "react-bootstrap/Spinner";
import Fade from "react-bootstrap/Fade";

import { useHistory } from "react-router-dom";

import DropZone from "../../components/dropzone/dropzone";
import TextArea from "../../components/textArea/textArea";
import FileDisplay from "../../components/fileDisplay/fileDisplay";
import primerCheckService from "../..//services/primerCheck";
import "./uploadPage.css";

const UploadPage = ({ setResults }) => {
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [displayedFiles, setDisplayedFiles] = useState([]);
  const [validFiles, setValidFiles] = useState([]);
  const [textFieldFasta, setTextFieldFasta] = useState([]);
  const [fileErrorMessage, setFileErrorMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const history = useHistory();

  const openId = "open-containers";

  useEffect(() => {
    const filteredFiles = selectedFiles.reduce((files, current) => {
      const match = files.find((file) => file.name === current.name);
      if (match) {
        return files;
      } else {
        return files.concat(current);
      }
    }, []);
    setDisplayedFiles([...filteredFiles]);
  }, [selectedFiles]);

  useEffect(() => {
    const filteredFiles = displayedFiles.reduce((files, current) => {
      return current.invalid ? files : files.concat(current);
    }, []);
    setValidFiles(filteredFiles);
  }, [displayedFiles]);

  useEffect(() => {
    if (
      (validFiles.length === displayedFiles.length &&
        validFiles.length !== 0 &&
        textFieldFasta.length === 0) ||
      (textFieldFasta.length !== 0 && validFiles.length === 0)
    ) {
      console.log(validFiles);
      setErrorMessage("");
      return setShowSubmit(true);
    } else if (textFieldFasta.length !== 0 && validFiles.length !== 0) {
      setShowSubmit(false);
      setErrorMessage(
        "Either upload a single sequence through input or select files to upload! Not Both!"
      );
    }
    setShowSubmit(false);
  }, [validFiles, displayedFiles, textFieldFasta]);

  const resetStates = () => {
    setShowSubmit(false);
    setSelectedFiles([]);
    setTextFieldFasta([]);
    setFileErrorMessage("");
    setErrorMessage("");
  };
  const submitForm = () => {
    console.log(validFiles, textFieldFasta);
    setOpen(!open);
    setIsLoading(true);
    setTimeout(() => {
      primerCheckService
        .checkFiles(validFiles.length === 0 ? textFieldFasta : validFiles)
        .then((response) => {
          resetStates();
          setIsLoading(false);
          console.log("response is", response);
          setResults(JSON.stringify(response.data));
          history.push("/results/Overview");
        })
        .catch((e) => console.log(e));
    }, 500);
  };
  return (
    <div>
      <Collapse id={openId} in={open}>
        <div className="collapse-container">
          <Container>
            <Form noValidate>
              <TextArea setTextFieldFasta={setTextFieldFasta} />
              <p className="alternative-upload">OR</p>
              <DropZone
                selectedFiles={selectedFiles}
                setSelectedFiles={setSelectedFiles}
                setErrorMessage={setFileErrorMessage}
              />
            </Form>
            <Container className="file-display-container">
              {displayedFiles.map((file, index) => (
                <FileDisplay
                  file={file}
                  errorMessage={fileErrorMessage}
                  setSelectedFiles={setSelectedFiles}
                  key={index}
                />
              ))}
            </Container>
          </Container>
        </div>
      </Collapse>
      <Container>
        <Row className="upload-error-message">{errorMessage}</Row>
        {showSubmit ? (
          <Fade in={open}>
            <Button
              id={openId}
              aria-controls={openId}
              aria-expanded={open}
              onClick={submitForm}
              disabled={isLoading}
            >
              {isLoading ? (
                <Spinner
                  as="span"
                  className="loader"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
              ) : null}
              {isLoading ? "Loading..." : "Submit"}
            </Button>
          </Fade>
        ) : null}
        {isLoading ? (
          <Fade in={!open}>
            <Container className="loading-container">
              <Spinner
                id={openId}
                as="span"
                animation="border"
                role="status"
                variant="dark"
              />
            </Container>
          </Fade>
        ) : null}
      </Container>
    </div>
  );
};

export default UploadPage;
