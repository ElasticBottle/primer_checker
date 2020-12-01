import React, { useState, useEffect } from "react";

import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
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

const UploadPage = ({ setResults, setError }) => {
  const [showSubmit, setShowSubmit] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [displayedFiles, setDisplayedFiles] = useState([]);
  const [validFiles, setValidFiles] = useState([]);
  const [blastAll, setBlastAll] = useState(false);
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
        .checkFiles(
          validFiles.length === 0
            ? { files: textFieldFasta, blastAll: blastAll }
            : { files: validFiles, blastAll: blastAll }
        )
        .then((response) => {
          resetStates();
          setIsLoading(false);
          console.log("response is", response);
          setResults(JSON.stringify(response.data));
          history.push("/results/Overview");
        })
        .catch((e) => {
          console.log(e);
          setError(JSON.stringify(e.data));
          history.push("/error");
        });
    }, 500);
  };
  return (
    <div>
      <Collapse id={openId} in={open}>
        <div className="collapse-container">
          <Container>
            <h2 className="mb-3 methodology-title">Methodology</h2>
            <p className="mb-3 methodology-body">
              Primer Checker blast against all sequences from the past 3 months
              in GISAID database of high quality genomes (defined as &lt;1% Ns
              and &lt;0.05% unique non-synonymous mutations) with one or more
              mutations in either forward, probe or reverse primer region. This
              does not necessarily indicate a primer would not function but
              serves as a guide to variability of the targeted region.
            </p>
            <Accordion className="mb-3">
              <Card>
                <Accordion.Toggle as={Card.Header} eventKey="0">
                  More Settings
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0">
                  <Card.Body>
                    <Row>
                      <Col xs="12" md="6">
                        <Form.Check
                          type="checkbox"
                          label="Blast against all database"
                          onChange={(e) => setBlastAll(e.target.checked)}
                        />
                      </Col>
                      <Col xs="12" md="6" className="manual-button">
                        <Button
                          onClick={() => history.push("/manualUpload")}
                          size="sm"
                          variant="light"
                        >
                          Manual Upload
                        </Button>
                      </Col>
                    </Row>
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>

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
              <div className="mt-3">
                Do not click back or refresh while the page is loading!
              </div>
              <div>
                This will take about 4 minutes depending on server loads.
              </div>
              <div>
                If you stop seeing this, chances are, the server timed out.
              </div>
            </Container>
          </Fade>
        ) : null}
      </Container>
    </div>
  );
};

export default UploadPage;
