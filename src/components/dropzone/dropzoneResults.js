import React from "react";
import "./dropzone.css";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import { useHistory } from "react-router-dom";

const DropZoneResults = ({ setResults }) => {
  const history = useHistory();

  const dragOver = (e) => {
    e.preventDefault();
  };
  const dragEnter = (e) => {
    e.preventDefault();
  };
  const dragLeave = (e) => {
    e.preventDefault();
  };
  const fileDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer;
    const files = data.files;
    loadFiles(files);
  };

  const filesSelected = async (e) => {
    const files = e.target.files;
    loadFiles(files);
  };

  function loadFiles(files) {
    let fr = new FileReader();

    fr.onload = function (e) {
      const result = JSON.parse(e.target.result);
      const formatted = JSON.stringify(result);
      setResults(formatted);
      history.push("/results/Overview");
    };

    fr.readAsText(files.item(0));
  }

  return (
    <Form.Group controlId="fasta-sequence">
      <label htmlFor="fasta-input" id="fasta-input-label">
        <Container
          className="drop-container"
          onDragOver={dragOver}
          onDragEnter={dragEnter}
          onDragLeave={dragLeave}
          onDrop={fileDrop}
        >
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
};

export default DropZoneResults;
