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
import { CSVLink } from "react-csv";

import "./primerMap.css";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const colorScale = scaleLinear().domain([0, 1]).range(["#ffedea", "#ff5233"]);

const PrimerMap = ({
  setTooltipContent,
  data,
  db,
  timeFrameBrush,
  setTimeFrameBrush,
}) => {
  const [downloadData, setDownloadData] = React.useState([]);
  const headers = [
    {
      label: "Country",
      key: "country",
    },
    {
      label: "ISO A3",
      key: "ISO_A3",
    },
    {
      label: "Missed %",
      key: "missed_pct",
    },
    {
      label: "Absolute Misses",
      key: "abs_miss",
    },
    {
      label: "Submitted Virus",
      key: "country_total",
    },

    {
      label: "Start Date",
      key: "startDate",
    },
    {
      label: "End Date",
      key: "endDate",
    },
  ];

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

  function getDates(timeFrameBrush, db) {
    return timeFrameBrush.length === 0
      ? [Object.keys(db)[0], Object.keys(db)[Object.keys(db).length - 1]]
      : [getDateString(timeFrameBrush[0]), getDateString(timeFrameBrush[1])];
  }

  function getDateString(time) {
    var date = new Date(time);
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0];
  }

  function downloadDataClick(
    countryMisses,
    countryMissesPct,
    startDate,
    endDate,
    data
  ) {
    return () => {
      const toDownload = [];
      for (const [countryISO, absMiss] of countryMisses) {
        toDownload.push({
          country: data.find((element) => element.ISO_A3 === countryISO)
            .country_name,
          ISO_A3: countryISO,
          country_total: absMiss / (countryMissesPct.get(countryISO) / 100),
          missed_pct: countryMissesPct.get(countryISO),
          abs_miss: absMiss,
          startDate: startDate,
          endDate: endDate,
        });
      }
      console.log("fired", toDownload);
      setDownloadData(toDownload);
    };
  }

  const countryMisses = getCountryMissCounts(data);
  const [startDate, endDate] = getDates(timeFrameBrush, db);
  const countryMissesPct = Array.from(countryMisses.keys()).reduce(
    (accumulated, country) => {
      accumulated.set(
        country,
        (
          (countryMisses.get(country) / (db[endDate][country] || 100)) *
          100
        ).toFixed(2)
      );
      return accumulated;
    },
    new Map()
  );
  console.log("countryMissesPct :>> ", countryMissesPct);
  console.log("countryMissesPct.values() :>> ", countryMissesPct.values());
  const maxPctMiss = Math.max(...Array.from(countryMissesPct.values()));
  console.log("maxPctMiss :>> ", maxPctMiss);
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
                const pctMiss =
                  countryMissesPct.get(geo.properties.ISO_A3) || 0;
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() => {
                      const { NAME } = geo.properties;
                      setTooltipContent(
                        `${NAME}: <br/> 
                        ${missCount} Absolute Misses.<br/> 
                        ${pctMiss}% Miss: `
                      );
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    onClick={() => {
                      handleClick(geo.properties.ISO_A3, data);
                    }}
                    style={{
                      default: {
                        fill:
                          parseInt(pctMiss) !== 0
                            ? colorScale(pctMiss / maxPctMiss)
                            : "#949494",
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
      <CSVLink
        data={downloadData}
        headers={headers}
        filename={"geo_misses.csv"}
        className="btn btn-dark"
        target="_blank"
        onClick={downloadDataClick(
          countryMisses,
          countryMissesPct,
          startDate,
          endDate,
          data
        )}
      >
        Download Map Data
      </CSVLink>
    </Container>
  );
};

export default memo(PrimerMap);
