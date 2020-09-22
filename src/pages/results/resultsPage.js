import React from "react";
import DropdownMenu from "../../components/dropdown/dropdown";
import ResultDisplay from "../../components/resultDisplay/resultDisplay";

import Container from "react-bootstrap/Container";
import { useParams } from "react-router-dom";

const ResultPage = ({ results }) => {
  const { display } = useParams();
  const toDisplay = display.split("&");

  return (
    <div>
      <Container>
        <DropdownMenu
          displayOptions={Object.keys(results)}
          resultToDisplay={toDisplay}
        />
        <ResultDisplay toDisplay={toDisplay} data={results} />
      </Container>
    </div>
  );
};

export default ResultPage;
