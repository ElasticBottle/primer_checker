import React from "react";
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

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

const colorScale = scaleLinear().domain([0, 1]).range(["#ffedea", "#ff5233"]);

const PrimerMap = ({
  title,
  setTooltipContent,
  data,
  lookBack,
  db,
  timeFrameBrush,
  showModal,
  setModalInfo,
  subtitle = "",
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

  function handleClick(countryISO3, endDate, lookBack) {
    // const timeFrame = extent(
    //   data.reduce((dates, data) => {
    //     if (data.ISO_A3 === countryISO3) {
    //       dates.push(new Date(data.date));
    //       return dates;
    //     } else {
    //       return dates;
    //     }
    //   }, [])
    // );
    showModal();
    setModalInfo((prev) => {
      return {
        ...prev,
        primer: null,
        country: countryISO3,
        lookBack: lookBack,
        date: endDate,
      };
    });
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

  function getCountryMissCounts(data, lookBack, date) {
    /**
     * @param {Array} data: contains a list of missed virus Objects to be visualized on the map.
     * @returns {Map} Containing the number of misses per country.
     */
    let currData = data;
    if (lookBack >= 0) {
      const endDate = new Date(date);
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - lookBack);
      currData = data.filter((val) => {
        const currDate = new Date(val.date);
        return (
          currDate.getTime() <= endDate.getTime() &&
          currDate.getTime() >= startDate.getTime()
        );
      });
    }
    return currData.reduce((count, currData) => {
      count.has(currData.ISO_A3)
        ? count.set(currData.ISO_A3, count.get(currData.ISO_A3) + 1)
        : count.set(currData.ISO_A3, 1);
      return count;
    }, new Map());
  }

  function getDates(timeFrameBrush, db) {
    if (timeFrameBrush.length === 0) {
      return [Object.keys(db)[0], Object.keys(db)[Object.keys(db).length - 1]];
    } else {
      let startDate = getDateString(timeFrameBrush[0]);
      let endDate = getDateString(timeFrameBrush[1]);
      if (endDate > Object.keys(db)[Object.keys(db).length - 1]) {
        endDate = Object.keys(db)[Object.keys(db).length - 1];
      }
      if (startDate < Object.keys(db)[0]) {
        startDate = Object.keys(db)[0];
      }
      return [startDate, endDate];
    }
  }

  function getDateString(time) {
    var date = new Date(time);
    return date.toISOString().slice(0, 10);
  }
  console.log("db :>> ", db);
  const [startDate, endDate] = getDates(timeFrameBrush, db);
  const countryMisses = getCountryMissCounts(data, -1, endDate);
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

  // console.log("countryMisses :>> ", countryMisses);
  // console.log("startDate, endDate :>> ", startDate, endDate);
  // console.log("countryMissesPct :>> ", countryMissesPct);
  const maxPctMiss = Math.max(...Array.from(countryMissesPct.values()));
  // console.log("maxPctMiss :>> ", maxPctMiss);
  return (
    <Container>
      <h2 className="map-title">{title}</h2>
      <h3 className="map-title map-subtitle">{subtitle}</h3>
      <ComposableMap data-tip="" projectionConfig={{ scale: 200 }}>
        <ZoomableGroup>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const missCount = countryMisses.get(geo.properties.ISO_A3) || 0;
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
                          ${
                            db[endDate][geo.properties.ISO_A3] || 0
                          } submissions <br/>
                          ${missCount} Absolute Misses.<br/> 
                          ${pctMiss}% Miss <br/>
                          `
                      );
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    onClick={() => {
                      handleClick(geo.properties.ISO_A3, endDate, lookBack);
                    }}
                    style={{
                      default: {
                        fill:
                          parseFloat(pctMiss) !== 0
                            ? colorScale(pctMiss / maxPctMiss)
                            : "#949494",
                        outline: "none",
                      },
                      hover: {
                        fill: "#afca9d",
                        cursor: missCount ? "pointer" : "auto",
                        outline: "none",
                      },
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
export default React.memo(PrimerMap);
