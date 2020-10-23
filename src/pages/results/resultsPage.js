import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";

import "./resultsPage.css";
import ItemFilters from "../../components/ItemFilter/itemFilters";
import DataTable from "../../components/tableDisplay/tableDisplay";
import LineGraph from "../../components/mutGraphs/lineGraph";
import BarGraph from "../../components/mutGraphs/barGraph";
import PrimerMap from "../../components/primerMap/primerMap";

Date.prototype.sameDay = function (d) {
  return (
    this.getFullYear() === d.getFullYear() &&
    this.getDate() === d.getDate() &&
    this.getMonth() === d.getMonth()
  );
};

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
  // Base results from blast
  const result = React.useRef(JSON.parse(results));
  console.log("result", result);
  const baseData = React.useRef(result.current[0] || {});
  const baseTableData = React.useRef(makeTableData(baseData.current));
  const dbCountDaily = React.useRef(parseDb(result.current, 1));
  const dbCountCum = React.useRef(parseDb(result.current, 0));
  const dateRange = React.useRef(Object.keys(dbCountCum.current) || []);

  const { display } = useParams();
  const toDisplay = display.split("&");

  // Filtering for table and graph data
  const [miss, setMiss] = React.useState([]);
  const [miss3, setMiss3] = React.useState([]);
  const [match, setMatch] = React.useState([]);
  const [timeFrameBrush, setTimeFrameBrush] = React.useState(
    React.useMemo(() => [], [])
  );
  const [countries, setCountries] = React.useState(React.useMemo(() => [], []));
  const [primers, setPrimers] = React.useState(React.useMemo(() => [], []));
  const [pType, setPType] = React.useState([]);

  // Filtering for graph data
  const [useCum, setUseCum] = React.useState(false);
  const [countryAsTotal, setCountryAsTotal] = React.useState(false);
  const [lookBack, setLookBack] = React.useState(6);
  const [isBar, setIsBar] = React.useState(false);
  const [daysBetweenComparison, setDaysBetweenComparison] = React.useState(
    lookBack
  );
  const [numberOfBars, setNumberOfBars] = React.useState(1);
  const [showAbsDiff, setShowAbsDiff] = React.useState(false);

  // Misc items
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => setIsProcessing(false), 500);
  }, [isProcessing]);

  const overviewColumns = React.useMemo(
    () => [
      {
        Header: "Primer",
        accessor: "primer",
        disableFilters: true,
      },
      {
        Header: "Accession ID",
        accessor: "accession_id",
        disableFilters: true,
      },
      {
        Header: "Virus Name",
        accessor: "virus_name",
        disableFilters: true,
        width: 200,
      },
      {
        Header: "Diagram",
        accessor: "match_diag",
        disableFilters: true,
        width: 450,
      },
      {
        Header: "Primer Type",
        accessor: "type",
        disableFilters: true,
        width: 120,
      },
      {
        Header: "Homology %",
        accessor: "match_pct",
      },
      {
        Header: "Total Miss",
        accessor: "misses",
      },
      {
        Header: "Misses In 3' End",
        accessor: "misses3",
      },
      {
        Header: "Date Collected",
        accessor: "date",
        disableFilters: true,
        width: 140,
        show: false,
      },
      {
        Header: "Country",
        accessor: "country_name",
        disableFilters: true,
      },
    ],
    []
  );
  const combinedCols = React.useMemo(
    () => [
      {
        Header: "Primer",
        accessor: "primer",
        disableFilters: true,
      },
      {
        Header: "Accession ID",
        accessor: "accession_id",
        disableFilters: true,
      },
      {
        Header: "Virus Name",
        accessor: "virus_name",
        disableFilters: true,
        width: 200,
      },
      {
        Header: "Date Collected",
        accessor: "date",
        disableFilters: true,
        width: 140,
        show: false,
      },
      {
        Header: "Country",
        accessor: "country_name",
        disableFilters: true,
      },
    ],
    []
  );

  const dbActual = React.useMemo(
    () =>
      useCum
        ? dbCountCum.current
        : getRangeDbCount(dbCountDaily.current, lookBack, dateRange.current),
    [useCum, lookBack]
  );
  console.log("dbActual  :>> ", dbActual);
  const graphBase = React.useMemo(
    () =>
      baseTableData.current.filter(
        dataFilter({
          primers: primers,
          pType: pType,
          countries: countries,
          miss: miss,
          miss3: miss3,
          match: match,
        })
      ),
    [primers, pType, countries, miss, miss3, match]
  );
  const tableData = React.useMemo(
    () => graphBase.filter(dataFilter({ timeFrameBrush: timeFrameBrush })),
    [graphBase, timeFrameBrush]
  );

  const graphOverview = React.useMemo(
    () =>
      makeOverview(
        graphBase,
        primers.length === 0 ? Object.keys(baseData.current) : primers,
        dbActual,
        dateRange.current,
        useCum,
        lookBack,
        countryAsTotal,
        countries
      ),
    [graphBase, primers, dbActual, useCum, lookBack, countryAsTotal, countries]
  );

  const barData = React.useMemo(
    () =>
      isBar
        ? makeBarData(
            graphOverview,
            dateRange.current,
            timeFrameBrush,
            daysBetweenComparison,
            numberOfBars
          )
        : {},
    [graphOverview, numberOfBars, daysBetweenComparison, timeFrameBrush, isBar]
  );

  const combinedBase = React.useMemo(
    () => makeIntersection(JSON.parse(JSON.stringify(graphBase))),
    [graphBase]
  );
  const graphCombined = React.useMemo(
    () =>
      makeOverview(
        combinedBase,
        primers.length === 0
          ? [Object.keys(baseData.current).join(", ")]
          : [primers.join(", ")],
        dbActual,
        dateRange.current,
        useCum,
        lookBack,
        countryAsTotal,
        countries
      ),
    [
      combinedBase,
      primers,
      dbActual,
      useCum,
      lookBack,
      countryAsTotal,
      countries,
    ]
  );
  const tableCombined = React.useMemo(
    () => combinedBase.filter(dataFilter({ timeFrameBrush: timeFrameBrush })),
    [combinedBase, timeFrameBrush]
  );

  // const mapData = makeMapData(tableCombined, tableData)
  if (result.current.length !== 0) {
    // console.log("baseTableData :>> ", baseTableData);
    // console.log("graphBase :>> ", graphBase);
    // console.log("tableData :>> ", tableData);
    console.log("graphOverview :>> ", graphOverview);
    console.log("barData :>> ", barData);
    // console.log("tableCombined :>> ", tableCombined);

    return (
      <div className="display-page">
        <Container>
          <ItemFilters
            baseData={baseData.current}
            colNames={overviewColumns}
            timeFrameBrush={timeFrameBrush}
            setTimeFrameBrush={setTimeFrameBrush}
            lookBack={lookBack}
            setLookBack={setLookBack}
            useCum={useCum}
            setUseCum={setUseCum}
            miss={miss}
            setMiss={setMiss}
            miss3={miss3}
            setMiss3={setMiss3}
            match={match}
            setMatch={setMatch}
            countryAsTotal={countryAsTotal}
            setCountryAsTotal={setCountryAsTotal}
            setCountries={setCountries}
            setPrimers={setPrimers}
            setPType={setPType}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            isBar={isBar}
            setIsBar={setIsBar}
            daysBetweenComparison={daysBetweenComparison}
            setDaysBetweenComparison={setDaysBetweenComparison}
            numberOfBars={numberOfBars}
            setNumberOfBars={setNumberOfBars}
            showAbsDiff={showAbsDiff}
            setShowAbsDiff={setShowAbsDiff}
          />
          <DataTable
            id="collapse-table"
            title={"Overview of Missed Viruses"}
            data={tableData}
            columns={overviewColumns}
            isCombined={false}
            isCollapsable={true}
          />
          <Row>
            <Col xs={12} xl={6}>
              <LineGraph
                title={"Mutation Overview"}
                data={graphOverview}
                primers={
                  primers.length === 0 ? Object.keys(baseData.current) : primers
                }
                dates={dateRange.current}
                setPrimers={setPrimers}
                timeFrameBrush={timeFrameBrush}
                setTimeFrameBrush={setTimeFrameBrush}
              />
              {isBar ? (
                <BarGraph
                  title={"Recent Mutation Summary"}
                  data={barData}
                  showAbsDiff={showAbsDiff}
                />
              ) : null}
            </Col>
            <Col xs={12} xl={6}>
              <PrimerMap />
            </Col>
          </Row>
          <Collapse in={combinedBase.length !== 0}>
            <div>
              <LineGraph
                title={"Combined Mutation Overview"}
                data={graphCombined}
                primers={
                  primers.length === 0
                    ? [Object.keys(baseData.current).join(", ")]
                    : [primers.join(", ")]
                }
                dates={dateRange.current}
                setPrimers={setPrimers}
                timeFrameBrush={timeFrameBrush}
                setTimeFrameBrush={setTimeFrameBrush}
              />
              <DataTable
                title={"Combined Missed Viruses"}
                data={tableCombined}
                columns={combinedCols}
                isCombined={true}
                isCollapsable={true}
              />
            </div>
          </Collapse>
        </Container>
      </div>
    );
  }

  return <InputData />;
};

export default ResultPage;

const dataFilter = ({
  timeFrameBrush = [],
  primers = [],
  pType = [],
  countries = [],
  miss = [],
  miss3 = [],
  match = [],
}) => {
  /**
   * A filter for gisaid table data in records orientation (list of objects where column names are mapped to their value for that row)
   * @param {Array} timeFrameBrush: the min and max timeFrame for the sequence
   * @param {Array} primers: specific name for a particular primer
   * @param {Array} pType: the primer type, one of ["fwd", "rev", "prb"]
   * @param {Array} countries: the list of country that the seq must be from
   * @param {Array} miss:  the min and max misses for the sequence
   * @param {Array} miss3: the min and max misses in 3' end
   * @param {Array} match: the min and max homolog %
   * @returns {function} A function that takes a value and filter for parameters above
   */
  return (value) => {
    let isWithinTimeFrame = true;
    let isPrimer = true;
    let isPType = true;
    let isCountry = true;
    let isMiss = true;
    let isMiss3 = true;
    let isMatch = true;

    if (timeFrameBrush.length !== 0) {
      const currDate = new Date(value.date);
      const [startDate, endDate] = timeFrameBrush;
      isWithinTimeFrame =
        currDate.getTime() >= new Date(startDate).getTime() &&
        currDate.getTime() <= new Date(endDate).getTime();
    }
    if (primers.length !== 0) {
      isPrimer = primers.includes(value.primer);
    }
    if (pType.length !== 0) {
      isPType = pType.includes(value.type);
    }
    if (countries.length !== 0) {
      isCountry = countries
        .map((val) => val.label)
        .includes(value.country_name);
    }
    if (miss.length !== 0) {
      console.log("miss :>> ", miss);
      isMiss =
        value.misses >= (miss[0] || 0) && value.misses <= (miss[1] || 100);
    }
    if (miss3.length !== 0) {
      isMiss3 =
        value.misses3 >= (miss3[0] || 0) && value.misses3 <= (miss3[1] || 100);
    }
    if (match.length !== 0) {
      isMatch =
        value.match_pct >= (match[0] || 0) &&
        value.match_pct <= (match[1] || 100);
    }
    return (
      isWithinTimeFrame &&
      isPrimer &&
      isPType &&
      isCountry &&
      isMiss &&
      isMiss3 &&
      isMatch
    );
  };
};

function parseDb(rawData, database) {
  /**
   * Retrieves that database count from [rawData]
   * @param {Array} rawData: contains the primerDetails, databaseCounts (daily and cumulative), as well as primer filenames on server.
   * @param {Number} database: 0 for cumulative, 1 for daily
   * @returns {Object} The object mapping date -> countries -> submission count
   */
  if (rawData.length !== 0) {
    return JSON.parse(JSON.stringify(rawData[1][database]));
  }
  return {};
}

function addName(primer) {
  /**
   * An annealing function that takes an object and adds [primer] to it with key under "primer"
   * @param {string} primer: value to be added
   * @returns {function} a function that takes in [value] and returns it after adding [primer] to it.
   */
  return (value) => {
    value.primer = primer;
    return value;
  };
}

function makeTableData(primerDetails) {
  /**
   * Converts all the incoming data into a table format for subsequent data structure to be built off
   * @param {Array} primerDetails: contains the primerDetails
   * @returns {Array} Each item in the array corresponds to a single entry that has been missed.
   **/
  let tableData = [];
  if (Object.keys(primerDetails).length !== 0) {
    const primerNames = Object.keys(primerDetails);
    for (const primerName of primerNames) {
      tableData.push(...primerDetails[primerName].map(addName(primerName)));
    }
  }
  return tableData;
}

function makeIntersection(tableData) {
  /**
   * Creates data for intersecting values if any
   * @param {Array} tableData: contains the info on the primers to display
   * @returns {Array}: List of virus that is missed by all primers
   */
  const names = new Set();
  const primerDetails = tableData.reduce((primerDetails, primer) => {
    if (names.has(primer.primer)) {
      const details = primerDetails[primer.primer];
      details.push(primer);
      primerDetails[primer.primer] = details;
      return primerDetails;
    } else {
      names.add(primer.primer);
      primerDetails[primer.primer] = [primer];
      return primerDetails;
    }
  }, {});
  let intersection = [];
  if (names.size === 1) {
    return [];
  } else if (names.size > 1) {
    const primerNames = Object.keys(primerDetails);

    intersection = findListIntersection(Object.values(primerDetails));
    intersection = intersection.map(addName(primerNames.join(", ")));
  }
  return intersection;
}

function findIntersection(list1, list2, key, intersect = true) {
  /**
   * Finds the intersection between two list
   * @param {Bool} intersect: finds the intersection of [list1] and [list2] if true
   *  otherwise, finds items in [list1] and not in [list2]
   */

  if (key) {
    let result = list1.filter(
      ((set) => (item) => {
        return intersect === set.has(item[key]);
      })(new Set(list2.map((item) => item[key])))
    );
    return result;
  } else {
    const result = list1.filter(
      ((set) => (item) => {
        return intersect === set.has(item);
      })(new Set(list2.map((item) => item)))
    );
    return result;
  }
}

function findListIntersection(itemList, key = "accession_id") {
  /**
   * Finds the intersecting items within each list
   * @param   {Array}  itemList: Contains lists which contain info to find intersection of.
   * @param   {string} keys: Optional choice to specify if items in lists are objects
   * @returns {Array} An array containing items which are common across all list.
   */
  // List only contains one list, so we return it
  let intersection = itemList[0];
  for (let i = 1; i < itemList.length; i++) {
    intersection = findIntersection(intersection, itemList[i], key);
  }
  return intersection;
}

function addObject(obj1, obj2, initialSum = 0) {
  /**
   * Adds the item in obj2 into obj1
   * @param {Object} obj1: the obj in which items will be added too.
   * @param {Object} obj2: The Object from which are retrieved to be added.
   * @param {Any} initialSum: the value to be added when Obj2 contains an item Obj1 does not.
   * @returns {Object} An object containing Obj1 + Obj2
   */
  for (let key of Object.keys(obj2)) {
    obj1[key] = (obj1[key] || initialSum) + obj2[key];
  }
  return obj1;
}

function getRangeDbCount(dbCount, lookBack, dates) {
  /**
   * Calculates a rolling window for database
   * @param {Object} dbCount: Contains the virus numbers in date -> country -> count order
   * @param {Number} lookBack: the lookBack period. Only has effect if [useCum] is false
   */
  // TODO: Optimise maybe, remove repeated calculation each sliding window
  const dateWindowCum = {};
  for (const date of dates) {
    const now = new Date(date);
    const start = new Date(date);
    start.setDate(start.getDate() - lookBack);
    let dateCumCount = { total: 0 };
    for (let d = start; d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      dateCumCount = addObject(dateCumCount, dbCount[dateStr] || {});
    }
    dateWindowCum[date] = dateCumCount;
  }

  return dateWindowCum;
}

function getCountriesTotal(dbCount, countries, date) {
  /**
   * Retrieve the total number of submissions by [countries] on [date]
   * @param {Object} dbCount: Maps date -> Object [country alpha 3 -> submission count]
   * @param {Array} countries: list of countries
   * @param {string} date: the date to obtain submission count for
   * @returns {Number} the total number of submissions by [countries] on [date]
   */
  if (countries.length === 0) {
    return dbCount[date].total;
  }
  const total = countries.reduce((prevVal, country) => {
    prevVal += dbCount[date][country.value] || 0;
    return prevVal;
  }, 0);
  return total;
}

function makeOverview(
  primerDetails,
  primerNames,
  dbCount,
  dates,
  useCum,
  lookBack,
  isCountryAsTotal,
  countries = []
) {
  /**
   * Creates  data points used to plat overview graph
   * @param {Array} primerDetails: Contains the list of filtered missed virus
   * @param {Array} primerNames: Contains the list primer names
   * @param {Object} dbCount: Contains the virus numbers in date -> country -> count order
   * @param {bool} useCum: if the dbCount represents cumulated or daily values
   * @param {Number} lookBack: the lookBack period. Only has effect if [useCum] is false
   * @param {Array} countries: List of countries who should form the new total
   * @returns {Array} List of Map containing "date", "name", "mutation_pct", "mutation3_pct", "mutation_abs", "mutation3_abs", "submission_count", and  "countries_considered"
   */
  const overviewData = [];
  if (primerDetails.length === 0) return overviewData;
  for (const primerName of primerNames) {
    overviewData.push(
      dates.map((date) => {
        const currDate = new Date(date);
        const minDate = new Date(date);
        minDate.setDate(minDate.getDate() - lookBack);
        const mutationAbs = primerDetails.filter((value) => {
          const primersDate = new Date(value.date);
          return useCum
            ? primersDate.getTime() <= currDate.getTime() &&
                value.primer === primerName
            : primersDate.getTime() <= currDate.getTime() &&
                primersDate.getTime() >= minDate.getTime() &&
                value.primer === primerName;
        }).length;
        const mutation3Abs = primerDetails.filter((value) => {
          const primersDate = new Date(value.date);
          return useCum
            ? primersDate.getTime() <= currDate.getTime() &&
                value.primer === primerName &&
                value.misses3 !== 0
            : primersDate.getTime() <= currDate.getTime() &&
                primersDate.getTime() >= minDate.getTime() &&
                value.primer === primerName &&
                value.misses3 !== 0;
        }).length;

        const databaseTotal = isCountryAsTotal
          ? getCountriesTotal(dbCount, countries, date)
          : dbCount[date].total;

        // console.log("date :>> ", date);
        // console.log("mutationAbs :>> ", mutationAbs);
        // console.log("primerName :>> ", primerName);
        // console.log("databaseTotal :>> ", databaseTotal);
        // console.log(
        //   "((mutationAbs / databaseTotal) * 100).toFixed(3) :>> ",
        //   ((mutationAbs / databaseTotal) * 100).toFixed(3)
        // );
        return {
          date: date,
          name: primerName,
          mutation_pct: ((mutationAbs / databaseTotal) * 100).toFixed(3),
          mutation3_pct: ((mutation3Abs / databaseTotal) * 100).toFixed(3),
          mutation_abs: mutationAbs,
          mutation3_abs: mutation3Abs,
          submission_count: databaseTotal,
          countries_considered: countries,
        };
      })
    );
  }
  return overviewData;
}

function makeBarData(
  graphOverview,
  dates,
  timeFrameBrush,
  daysBetweenComparison,
  numberOfBars
) {
  /**
   * Makes the bar data to be used for display
   * @param {Array} graphBase: List of List of Map containing "date", "name", "mutation_pct", "mutation3_pct", "mutation_abs", "mutation3_abs", "submission_count", and  "countries_considered". Each list correspond to a primer in primerNames of the same index
   * @param {Array} primerNames: Contains the list primer names
   * @param {Object} dbCount: Contains the virus numbers in date -> country -> count order
   * @param {Array} timeFrameBrush: Contains the minimum and maximum date of interest
   */
  const dateDetails = [];

  const now = timeFrameBrush[1] || new Date(dates[dates.length - 1]);
  const start = new Date(now);
  start.setDate(start.getDate() - daysBetweenComparison * numberOfBars);

  while (start.getTime() < new Date(dates[0])) {
    start.setDate(start.getDate() + daysBetweenComparison);
  }

  for (
    let d = start;
    d <= now;
    d.setDate(d.getDate() + daysBetweenComparison)
  ) {
    const primerMutations = [];
    for (let i = 0; i < graphOverview.length; i++) {
      const details = graphOverview[i].filter((val) =>
        new Date(val.date).sameDay(d)
      );
      primerMutations.push(...details);
    }
    dateDetails.push(primerMutations);
  }

  return dateDetails;
}
