import React, { memo } from "react";
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import Container from "react-bootstrap/Container";

import "./primerMap.css";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const colorScale = scaleLinear().domain([0, 1]).range(["#ffedea", "#ff5233"]);

const PrimerMap = ({
  setTooltipContent,
  data,
  db,
  toDisplay,
  timeFrameBrush,
  setTimeFrameBrush,
}) => {
  function getCountryMissCounts(data) {
    const missByCountry = data.reduce((count, data) => {
      if (count.has(data.ISO_A3)) {
        count.set(data.ISO_A3, count.get(data.ISO_A3) + 1);
      } else {
        count.set(data.ISO_A3, 1);
      }
      return count;
    }, new Map());
    return missByCountry;
  }

  const dataFilter = (value) => {
    const currDate = new Date(value.date);
    let isWithinTimeFrame = true;
    let isToDisplay = true;
    if (timeFrameBrush.length !== 0) {
      const [startDate, endDate] = timeFrameBrush;
      isWithinTimeFrame =
        currDate >= new Date(startDate) && currDate <= new Date(endDate);
    }
    if (toDisplay[0] !== "Overview") {
      isToDisplay =
        toDisplay.filter((name) => name === value.primer).length !== 0;
    }
    return isWithinTimeFrame && isToDisplay;
  };

  function handleClick(countryISO3, data) {
    const timeFrame = extent(
      data.reduce((dates, data) => {
        if (data.ISO_A3 === countryISO3) {
          dates.push(new Date(data.date));
          return dates;
        } else {
          return dates;
        }
      }, [])
    );
    if (timeFrame[0] === undefined) {
      return;
    }

    // If on a single day, expand the time frame +- 1 day
    if (timeFrame[0] === timeFrame[1]) {
      const nextDay = new Date(timeFrame[1]);
      const prevDay = new Date(timeFrame[1]);
      nextDay.setHours(nextDay.getHours() + 23);
      prevDay.setHours(prevDay.getHours() - 23);
      setTimeFrameBrush([prevDay, nextDay]);
    } else {
      setTimeFrameBrush(timeFrame);
    }
  }

  // const dataCleaned = filterData(data, timeFrameBrush, toDisplay);
  const dataCleaned = data.filter(dataFilter);
  const countryMisses = getCountryMissCounts(dataCleaned);
  const maxMiss = Math.max(...countryMisses.values());

  return (
    <Container>
      <h2>Map of viruses mutations</h2>
      <ComposableMap data-tip="" projectionConfig={{ scale: 200 }}>
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const missCount = countryMisses.has(geo.properties.ISO_A3)
                  ? countryMisses.get(geo.properties.ISO_A3)
                  : 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      const { NAME } = geo.properties;
                      setTooltipContent(`${NAME} — ${missCount} Misses`);
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    onClick={() => {
                      handleClick(geo.properties.ISO_A3, dataCleaned);
                    }}
                    style={{
                      default: {
                        fill: missCount
                          ? colorScale(missCount / maxMiss)
                          : "#D6D6DA",
                        outline: "none",
                      },
                      // default: {
                      //     fill: "#D6D6DA",
                      //     outline: "none"
                      // },
                      hover: {
                        fill: "#afca9d",
                        cursor: "pointer",
                        // TODO (EB): make pointer only if there is missed sequence here.
                        outline: "none",
                      },
                      // pressed: {
                      //   fill: "#E42",
                      //   outline: "none",
                      // },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
    </Container>
  );
};

export default memo(PrimerMap);

// function filterData(data, timeFrameBrush, toDisplay) {
//   const filteredTime = filterByTime(data, timeFrameBrush);
//   const to_return = filterByPrimers(filteredTime, toDisplay);
//   return to_return;
// }
// function filterByPrimers(toFilter, toDisplay) {
//   if (toDisplay[0] !== "Overview") {
//     const filtered = {};
//     for (const country in toFilter) {
//       filtered[country] = {};
//       for (const date of Object.keys(toFilter[country])) {
//         const primerDetails = toFilter[country][date];
//         filtered[country][date] = Object.keys(primerDetails)
//           .filter((primer) => {
//             return (
//               toDisplay.filter((display) => {
//                 return display === primer;
//               }).length !== 0
//             );
//           })
//           .reduce((filtered, currPrimer) => {
//             filtered[currPrimer] = primerDetails[currPrimer];
//             return filtered;
//           }, {});
//       }
//     }
//     return filtered;
//   }
//   return toFilter;
// }
// function filterByTime(data, timeFrameBrush) {
//   if (timeFrameBrush.length !== 0) {
//     const filtered = {};
//     for (const country in data) {
//       const countryVirus = data[country];
//       filtered[country] = Object.keys(countryVirus)
//         .filter((date) => {
//           const [startDate, endDate] = timeFrameBrush;
//           const currDate = new Date(date);
//           return (
//             currDate >= new Date(startDate) && currDate <= new Date(endDate)
//           );
//         })
//         .reduce((filtered, currDate) => {
//           filtered[currDate] = countryVirus[currDate];
//           return filtered;
//         }, {});
//     }
//     return filtered;
//   }
//   return data;
// }
