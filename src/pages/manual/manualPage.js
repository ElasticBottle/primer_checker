import React from "react";

import Container from "react-bootstrap/Container";

import DropZoneResults from "../../components/dropzone/dropzoneResults";

const ManualPage = ({ setResults }) => {
  return (
    <div>
      <Container>
        <DropZoneResults setResults={setResults} />
      </Container>
    </div>
  );
};

export default ManualPage;
