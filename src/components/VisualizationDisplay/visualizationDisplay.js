import React, { useState } from "react";
import ReactTooltip from "react-tooltip";

import MutGraphs from "../mutGraphs/mutGraphs";
import PrimerMap from "../primerMap/primerMap";

import "./visualizationDisplay.css";

const VisualizationDisplay = ({
  toDisplay,
  overviewData,
  mapData,
  dbCount,
}) => {
  const [timeFrameBrush, setTimeFrameBrush] = useState([]);
  const [tooltipContent, setTooltipContent] = useState("");

  return (
    <div className="result-display-container">
      <MutGraphs
        toDisplay={toDisplay}
        data={overviewData}
        timeFrameBrush={timeFrameBrush}
        setTimeFrameBrush={setTimeFrameBrush}
      />
      <div>
        <PrimerMap
          setTooltipContent={setTooltipContent}
          data={mapData}
          db={dbCount}
          toDisplay={toDisplay}
          timeFrameBrush={timeFrameBrush}
          setTimeFrameBrush={setTimeFrameBrush}
        />
        <ReactTooltip>{tooltipContent}</ReactTooltip>
      </div>
    </div>
  );

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

  // function get3Mut(viruses) {
  //   let count = 0;
  //   for (const detail of Object.values(viruses)) {
  //     if (detail.misses_3 !== 0) {
  //       count++;
  //     }
  //   }
  //   return count;
  // }

  // function makeMapData(data) {
  //   const mapData = {};

  //   const primerNames = getDBAndPrimerNames(data)[1];
  //   const [countries, countryDateRange] = getCountries(primerNames, data);

  //   for (const country of countries) {
  //     mapData[country] = {};
  //     for (const date of countryDateRange[country]) {
  //       mapData[country][new Date(date)] = getPrimerVirusList(
  //         primerNames,
  //         country,
  //         date,
  //         data
  //       );
  //     }
  //   }

  //   return mapData;
  // }

  // function getPrimerVirusList(primerNames, country, date, data) {
  //   const primerVirusList = {};
  //   for (const primer of primerNames) {
  //     primerVirusList[primer] = {};
  //     for (const virusId of Object.keys(data[primer][date])) {
  //       const virus = data[primer][date][virusId];
  //       if (virus.ISO_A3 === country) {
  //         primerVirusList[primer][virusId] = virus;
  //       }
  //     }
  //   }
  //   return primerVirusList;
  // }

  // function getCountries(primerNames, data) {
  //   const countries = new Set();
  //   const countryDateRange = {};
  //   for (const primer of primerNames) {
  //     for (const date in data[primer]) {
  //       const viruses = data[primer][date];

  //       for (const virus of Object.values(viruses)) {
  //         countries.add(virus.ISO_A3);
  //         countryDateRange[virus.ISO_A3] = calculateDateRange(
  //           countryDateRange[virus.ISO_A3],
  //           date
  //         );
  //       }
  //     }
  //   }
  //   return [countries, countryDateRange];
  // }

  // function calculateDateRange(currentRange, date) {
  //   if (currentRange === undefined) {
  //     return [date];
  //   }
  //   currentRange.push(date);
  //   return currentRange;
  // }
};

export default VisualizationDisplay;
