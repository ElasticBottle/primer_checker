import React from "react";
import { scaleLinear } from "d3-scale";
import {
  ZoomableGroup,
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps";
import Container from "react-bootstrap/Container";
import { CSVLink } from "react-csv";

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-50m.json";

const colorScale = scaleLinear().domain([0, 1]).range(["#ffedea", "#ff5233"]);

const PrimerMap = ({
  title,
  setTooltipContent,
  data,
  db,
  dateRange,
  timeFrameBrush,
  showModal,
  setModalInfo,
  isCombined,
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
      label: "Mutation %",
      key: "missed_pct",
    },
    {
      label: "Absolute Mutations",
      key: "abs_miss",
    },
    {
      label: "Number of Submitted Virus",
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
  function handleClick(countryISO3, startDateStr, endDateStr, db, isCombined) {
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
    const endDate = new Date(endDateStr);
    const startDate = new Date(startDateStr);
    // To calculate the time difference of two dates
    let Difference_In_Time = endDate.getTime() - startDate.getTime();
    // To calculate the no. of days between two dates
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    if (db[endDateStr][countryISO3] !== 0) {
      showModal();
      setModalInfo((prev) => {
        return {
          ...prev,
          primer: null,
          country: countryISO3,
          isCombined: isCombined,
          lookBack: Difference_In_Days,
          date: endDateStr,
        };
      });
    }
  }

  function downloadDataClick(
    countryMisses,
    countryMissesPct,
    db,
    startDate,
    endDate,
    data
  ) {
    return () => {
      const toDownload = [];
      for (const [countryISO, absMiss] of countryMisses) {
        const countryName = data.find(
          (element) => element.ISO_A3 === countryISO
        ).country_name;
        toDownload.push({
          country: countryName,
          ISO_A3: countryISO,
          missed_pct: countryMissesPct.get(countryISO),
          abs_miss: absMiss.size,
          country_total: db[endDate][countryISO],
          startDate: startDate,
          endDate: endDate,
        });
      }
      setDownloadData(toDownload);
    };
  }

  function getCountryMissCounts(data) {
    /**
     * @param {Array} data: contains a list of missed virus Objects to be visualized on the map.
     * @returns {Map} Containing the number of misses per country.
     */
    let currData = data;
    return currData.reduce((count, currData) => {
      count.has(currData.ISO_A3)
        ? count.set(
            currData.ISO_A3,
            count.get(currData.ISO_A3).add(currData.virus_name)
          )
        : count.set(currData.ISO_A3, new Set().add(currData.virus_name));
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

  function getMapDb(db, dateRange, startDate, endDate) {
    function addObject(obj1, obj2) {
      const toReturn = { ...obj1 };
      for (const key of Object.keys(obj2)) {
        toReturn[key] = obj2[key] + (obj1[key] || 0);
      }
      return toReturn;
    }

    const mapDb = {};
    mapDb[endDate] = {};
    for (const date of dateRange) {
      if (date >= startDate && date <= endDate) {
        mapDb[endDate] = addObject(mapDb[endDate], db[date]);
      }
    }
    return mapDb;
  }

  function getCountryMissPct(countryMisses, db, endDate) {
    return Array.from(countryMisses.keys()).reduce((accumulated, country) => {
      accumulated.set(
        country,
        (
          (countryMisses.get(country).size / (db[endDate][country] || 100)) *
          100
        ).toFixed(2)
      );
      return accumulated;
    }, new Map());
  }
  const [startDate, endDate] = getDates(timeFrameBrush, db);
  const countryMisses = getCountryMissCounts(data);
  const mapDb = getMapDb(db, dateRange, startDate, endDate);
  const countryMissesPct = getCountryMissPct(countryMisses, mapDb, endDate);
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
                const missCount = (
                  countryMisses.get(geo.properties.ISO_A3) || new Set()
                ).size;
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
                            (mapDb[endDate] || [])[geo.properties.ISO_A3] || 0
                          } submissions <br/>
                          ${missCount} Absolute Mutations<br/> 
                          ${pctMiss}% Mutations<br/>
                          `
                      );
                    }}
                    onMouseLeave={() => {
                      setTooltipContent("");
                    }}
                    onClick={() => {
                      handleClick(
                        geo.properties.ISO_A3,
                        startDate,
                        endDate,
                        mapDb,
                        isCombined
                      );
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
          mapDb,
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
