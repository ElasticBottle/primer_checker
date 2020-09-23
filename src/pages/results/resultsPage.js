import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";

import DropdownMenu from "../../components/dropdown/dropdown";
import VisualizationDisplay from "../../components/VisualizationDisplay/visualizationDisplay";
import TableDisplay from "../../components/tableDisplay/tableDisplay";

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

const ResultPage = ({ results }) => {
  const { display } = useParams();
  const toDisplay = display.split("&");

  function getDBAndPrimerNames(rawData) {
    const keys = Object.keys(rawData);

    const dbName = keys[keys.length - 1];
    const dbCount = rawData[dbName];

    const primerNames = keys.slice(0, keys.length - 1);
    return [dbCount, primerNames];
  }

  function makeOverview(rawData) {
    console.log("making overview data");
    const overviewData = [];

    const [dbCount, primerNames] = getDBAndPrimerNames(rawData);

    for (const primerName of primerNames) {
      const primerDetails = rawData[primerName];

      const dates = Object.keys(dbCount);

      overviewData.push(
        ...dates.map((date) => {
          return {
            date: new Date(date),
            name: primerName,
            mutation_pct:
              (primerDetails.filter((value) => value.date === date).length /
                dbCount[date].total) *
              100,
            mutation_pct3:
              (primerDetails.filter(
                (value) => value.date === date && value.misses3 !== 0
              ).length /
                dbCount[date].total) *
              100,
          };
        })
      );
    }

    return overviewData;
  }

  function makeTableData(rawData) {
    console.log("making table data");
    function addName(primer) {
      return (value) => {
        value.primer = primer;
        return value;
      };
    }
    const primers = getDBAndPrimerNames(rawData)[1];
    const toReturn = [];
    for (const primer of primers) {
      toReturn.push(...rawData[primer].map(addName(primer)));
    }
    return toReturn;
  }

  const overviewData = makeOverview(results);
  const tableData = makeTableData(results);
  const dbCount = getDBAndPrimerNames(results)[0];

  if (Object.keys(results).length !== 0) {
    return (
      <div>
        <Container>
          <DropdownMenu
            displayOptions={Object.keys(results)}
            resultToDisplay={toDisplay}
          />
          <VisualizationDisplay
            toDisplay={toDisplay}
            overviewData={overviewData}
            mapData={tableData}
            dbCount={dbCount}
          />
          <TableDisplay data={tableData} />
        </Container>
      </div>
    );
  }

  return <InputData />;
};

export default ResultPage;
