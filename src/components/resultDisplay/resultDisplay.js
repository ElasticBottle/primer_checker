import React from "react";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";

import MutGraphs from "../mutGraphs/MutGraphs";

const InputData = () => {
  const history = useHistory();
  return (
    <Container>
      <p className="no-data">
        Please make sure that you've uploaded some data first!
      </p>
      <Button onClick={() => history.push("/")}>Upload Data</Button>
    </Container>
  );
};

const resultDisplay = ({ toDisplay, data }) => {
  function get3Mut(viruses) {
    let count = 0;
    for (const detail of Object.values(viruses)) {
      if (detail.misses_3 !== 0) {
        count++;
      }
    }
    return count;
  }

  function make_overview(raw_data) {
    const keys = Object.keys(raw_data);

    const db_name = keys[keys.length - 1];
    const db_count = raw_data[db_name];

    const dates = Object.keys(db_count);

    const primer_names = keys.slice(0, keys.length - 1);

    const overview_data = [];

    for (const primer_name of primer_names) {
      const data = raw_data[primer_name];

      overview_data.push(
        ...dates.map((date) => {
          return {
            name: primer_name,
            date: new Date(date),
            mutation_pct:
              (Object.keys(data[date]).length / db_count[date]) * 100,
            mutation_pct3: (get3Mut(data[date]) / db_count[date]) * 100,
          };
        })
      );
    }
    return overview_data;
  }

  return (
    <div className="result-display-container">
      {Object.keys(data).length !== 0 ? (
        <MutGraphs toDisplay={toDisplay} data={make_overview(data)} />
      ) : (
        <InputData />
      )}
    </div>
  );
};

export default resultDisplay;
