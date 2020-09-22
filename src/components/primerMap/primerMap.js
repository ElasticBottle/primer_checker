import React, { memo } from "react";
import { scaleLinear } from "d3-scale";
import { extent } from "d3-array";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const colorScale = scaleLinear().domain([0, 1]).range(["#ffedea", "#ff5233"]);

const PrimerMap = ({
  setTooltipContent,
  data,
  toDisplay,
  timeFrameBrush,
  setTimeFrameBrush,
}) => {
  function getMaxMisses(data) {
    let maxMisses = 0;
    for (const countryMisses of Object.values(data)) {
      const length = recurseLength(countryMisses);
      if (length > maxMisses) {
        maxMisses = length;
      }
    }
    return maxMisses;
  }
  function recurseLength(misses) {
    let length = 0;
    for (const primer of Object.values(misses)) {
      for (const viruses of Object.values(primer)) {
        length += Object.values(viruses).length;
      }
    }

    return length;
  }
  function filterData(data, timeFrameBrush, toDisplay) {
    const filteredTime = filterByTime(data, timeFrameBrush);
    const to_return = filterByPrimers(filteredTime, toDisplay);
    return to_return;
  }
  function filterByPrimers(toFilter, toDisplay) {
    if (toDisplay[0] !== "Overview") {
      const filtered = {};
      for (const country in toFilter) {
        filtered[country] = {};
        for (const date of Object.keys(toFilter[country])) {
          const primerDetails = toFilter[country][date];
          filtered[country][date] = Object.keys(primerDetails)
            .filter((primer) => {
              return (
                toDisplay.filter((display) => {
                  return display === primer;
                }).length !== 0
              );
            })
            .reduce((filtered, currPrimer) => {
              filtered[currPrimer] = primerDetails[currPrimer];
              return filtered;
            }, {});
        }
      }
      return filtered;
    }
    return toFilter;
  }
  function filterByTime(data, timeFrameBrush) {
    if (timeFrameBrush.length !== 0) {
      const filtered = {};
      for (const country in data) {
        const countryVirus = data[country];
        filtered[country] = Object.keys(countryVirus)
          .filter((date) => {
            const [startDate, endDate] = timeFrameBrush;
            const currDate = new Date(date);
            return (
              currDate >= new Date(startDate) && currDate <= new Date(endDate)
            );
          })
          .reduce((filtered, currDate) => {
            filtered[currDate] = countryVirus[currDate];
            return filtered;
          }, {});
      }
      return filtered;
    }
    return data;
  }

  function handleClick(countryInfo) {
    const timeFrame = extent(
      Object.keys(countryInfo).map((dateStr) => new Date(dateStr))
    );
    if (timeFrame[0] === timeFrame[1]) {
      const nextDay = new Date(timeFrame[1]);
      const prevDay = new Date(timeFrame[1]);
      nextDay.setDate(nextDay.getDate() + 1);
      prevDay.setDate(prevDay.getDate() - 1);
      setTimeFrameBrush([prevDay, nextDay]);
    } else {
      setTimeFrameBrush(timeFrame);
    }
  }

  const dataCleaned = filterData(data, timeFrameBrush, toDisplay);
  const maxMisses = getMaxMisses(dataCleaned);
  return (
    <>
      <h2>Map of viruses mutations</h2>
      <ComposableMap data-tip="" projectionConfig={{ scale: 200 }}>
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                let d = dataCleaned[geo.properties.ISO_A3];
                const missCount = d === undefined ? 0 : recurseLength(d);
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
                      handleClick(d);
                    }}
                    style={{
                      default: {
                        fill: missCount
                          ? colorScale(missCount / maxMisses)
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
    </>
  );
};

export default memo(PrimerMap);
