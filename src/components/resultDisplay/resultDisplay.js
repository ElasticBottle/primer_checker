import React, { useEffect, useState } from "react";
import ReactTooltip from "react-tooltip";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useHistory } from "react-router-dom";

import MutGraphs from "../mutGraphs/mutGraphs";
import PrimerMap from "../primerMap/primerMap";

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

const ResultDisplay = ({ toDisplay, data }) => {
  const [timeFrameBrush, setTimeFrameBrush] = useState([]);
  const [tooltipContent, setTooltipContent] = useState("");

  function getDBPrimerNamesDates(raw_data) {
    const keys = Object.keys(raw_data);

    const dbName = keys[keys.length - 1];
    const dbCount = raw_data[dbName];

    const dates = Object.keys(dbCount);

    const primerNames = keys.slice(0, keys.length - 1);

    return [dbCount, primerNames, dates];
  }

  function makeMapData(data) {
    const mapData = {};

    const primerNames = getDBPrimerNamesDates(data)[1];
    const [countries, countryDateRange] = getCountries(primerNames, data);

    for (const country of countries) {
      mapData[country] = {};
      for (const date of countryDateRange[country]) {
        mapData[country][new Date(date)] = getPrimerVirusList(
          primerNames,
          country,
          date,
          data
        );
      }
    }

    return mapData;
  }

  function getPrimerVirusList(primerNames, country, date, data) {
    const primerVirusList = {};
    for (const primer of primerNames) {
      primerVirusList[primer] = {};
      for (const virusId of Object.keys(data[primer][date])) {
        const virus = data[primer][date][virusId];
        if (virus.ISO_A3 === country) {
          primerVirusList[primer][virusId] = virus;
        }
      }
    }
    return primerVirusList;
  }

  function getCountries(primerNames, data) {
    const countries = new Set();
    const countryDateRange = {};
    for (const primer of primerNames) {
      for (const date in data[primer]) {
        const viruses = data[primer][date];

        for (const virus of Object.values(viruses)) {
          countries.add(virus.ISO_A3);
          countryDateRange[virus.ISO_A3] = calculateDateRange(
            countryDateRange[virus.ISO_A3],
            date
          );
        }
      }
    }
    return [countries, countryDateRange];
  }

  function calculateDateRange(currentRange, date) {
    if (currentRange === undefined) {
      return [date];
    }
    currentRange.push(date);
    return currentRange;
  }

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
    const overview_data = [];

    const [dbCount, primerNames, dates] = getDBPrimerNamesDates(raw_data);

    for (const primerName of primerNames) {
      const data = raw_data[primerName];

      overview_data.push(
        ...dates.map((date) => {
          return {
            name: primerName,
            date: new Date(date),
            mutation_pct:
              (Object.keys(data[date]).length / dbCount[date]) * 100,
            mutation_pct3: (get3Mut(data[date]) / dbCount[date]) * 100,
          };
        })
      );
    }

    return overview_data;
  }

  // useEffect(() => {
  //   setTimeFrameSelection(timeFrameBrush);
  // }, [timeFrameBrush]);

  if (Object.keys(data).length !== 0) {
    const overview_data = make_overview(data);
    const mapData = makeMapData(data);
    return (
      <div className="result-display-container">
        <MutGraphs
          toDisplay={toDisplay}
          data={overview_data}
          timeFrameBrush={timeFrameBrush}
          setTimeFrameBrush={setTimeFrameBrush}
        />
        <div>
          <PrimerMap
            setTooltipContent={setTooltipContent}
            data={mapData}
            toDisplay={toDisplay}
            timeFrameBrush={timeFrameBrush}
            setTimeFrameBrush={setTimeFrameBrush}
          />
          <ReactTooltip>{tooltipContent}</ReactTooltip>
        </div>
      </div>
    );
  }
  return <InputData />;

  // return (
  //   <div className="result-display-container">
  //     {Object.keys(data).length !== 0 ? (
  //       <MutGraphs toDisplay={toDisplay} data={make_overview(data)} />
  //     ) : (
  //       <InputData />
  //     )}
  //   </div>
  // );

  // function getDefaultTimeFrame(data) {
  //   if (Object.keys(data).length !== 0) {
  //     const keys = Object.keys(data);
  //     const dates = Object.keys(data[[keys[keys.length - 1]]]);

  //     return [new Date(dates[0]), new Date(dates[dates.length - 1])];
  //   }
  //   return [];
  // }

  // function getMapListInfo(data) {
  //   const virusCountries = {};
  //   for (const date in data) {
  //     for (const virusId in data[date]) {
  //       const virus = data[date][virusId];
  //       virus.date_submitted = date;
  //       const virusCountry = data[date][virusId].ISO_A3;
  //       const virusList = virusCountries[virusCountry];
  //       if (virusList === undefined) {
  //         virusCountries[virusCountry] = {};
  //         virusCountries[virusCountry][virusId] = virus;
  //       } else {
  //         virusList[virusId] = virus;
  //         virusCountries[virusCountry] = virusList;
  //       }
  //     }
  //   }
  //   return virusCountries;
  // }
};

export default ResultDisplay;
