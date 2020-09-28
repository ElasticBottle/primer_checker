import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";

import DropdownMenu from "../../components/dropdown/dropdown";
import VisualizationDisplay from "../../components/VisualizationDisplay/visualizationDisplay";
import TableDisplay from "../../components/tableDisplay/tableDisplay";

import "./resultsPage.css";

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
  const [timeFrameBrush, setTimeFrameBrush] = React.useState([]);
  const { display } = useParams();
  const toDisplay = display.split("&");

  if (Object.keys(results).length !== 0) {
    const dbCount = getDBAndPrimerNames(results)[0];
    const overviewData = makeOverview(results);
    const primerNames = overviewData.reduce((data, currData) => {
      if (data.includes(currData.name)) {
        return data;
      } else {
        data.push(currData.name);
        return data;
      }
    }, []);
    const tableData = makeTableData(results, toDisplay, timeFrameBrush);
    const combinedOverview = makeCombinedOverview(
      dbCount,
      tableData,
      primerNames
    );
    const filteredTableData = tableData.filter(dataFilter(timeFrameBrush));
    return (
      <div className="display-page">
        <Container>
          <DropdownMenu
            displayOptions={Object.keys(results)}
            resultToDisplay={toDisplay}
          />
          <VisualizationDisplay
            toDisplay={toDisplay}
            overviewData={overviewData}
            combinedOverview={combinedOverview}
            mapData={filteredTableData}
            dbCount={dbCount}
            timeFrameBrush={timeFrameBrush}
            setTimeFrameBrush={setTimeFrameBrush}
          />
          <TableDisplay data={filteredTableData} />
        </Container>
      </div>
    );
  }

  return <InputData />;
};

export default ResultPage;

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
          mutation3_pct:
            (primerDetails.filter((value) => {
              return value.date === date && parseInt(value.misses3) !== 0;
            }).length /
              dbCount[date].total) *
            100,
        };
      })
    );
  }

  return overviewData;
}

function makeCombinedOverview(dbCount, tableData, primerNames) {
  const combinedOverview = [];

  const dates = Object.keys(dbCount);

  combinedOverview.push(
    ...dates.map((date) => {
      return {
        date: new Date(date),
        name: primerNames.join(", "),
        total_mut_pct:
          (tableData.filter((value) => value.date === date).length /
            dbCount[date].total) *
          100,
        total_mut3_pct:
          (tableData.filter(
            (value) => value.date === date && parseInt(value.misses3) !== 0
          ).length /
            dbCount[date].total) *
          100,
      };
    })
  );

  return combinedOverview;
}

function findIntersection(list1, list2, union = true) {
  const result = list1.filter(
    ((set) => (item) => {
      return union === set.has(item.accession_id);
    })(new Set(list2.map((item) => item.accession_id)))
  );
  return result;
}

function findListIntersection(rawData, primers) {
  if (primers.length === 1) return new Set();
  let intersection = rawData[primers[0]];
  for (let i = 1; i < primers.length; i++) {
    intersection = findIntersection(intersection, rawData[primers[i]]);
  }
  return new Set(intersection.map((item) => item.accession_id));
}

const dataFilter = (timeFrameBrush) => (value) => {
  const currDate = new Date(value.date);
  let isWithinTimeFrame = true;
  // let isToDisplay = true;
  if (timeFrameBrush.length !== 0) {
    const [startDate, endDate] = timeFrameBrush;
    isWithinTimeFrame =
      currDate >= new Date(startDate) && currDate <= new Date(endDate);
  }
  // if (toDisplay[0] !== "Overview") {
  //   isToDisplay =
  //     toDisplay.filter((name) => name === value.primer).length !== 0;
  // }
  return isWithinTimeFrame;
};

function makeTableData(rawData, toDisplay, timeFrameBrush) {
  function addName(primer) {
    return (value) => {
      value.primer = primer;
      return value;
    };
  }
  const primers =
    toDisplay[0] !== "Overview" ? toDisplay : getDBAndPrimerNames(rawData)[1];
  const dataForDisplay = [];
  const intersection = findListIntersection(rawData, primers);
  for (const primer of primers) {
    dataForDisplay.push(
      ...rawData[primer]
        .filter((virus) => !intersection.has(virus.accession_id))
        .map(addName(primer))
    );
  }

  return dataForDisplay;
}
