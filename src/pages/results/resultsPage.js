import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";

import TableDisplay from "../../components/tableDisplay/tableDisplay";

import "./resultsPage.css";
import MutGraphs from "../../components/mutGraphs/mutGraphs";
import ItemFilters from "../../components/ItemFilter/itemFilters";

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
  const result = React.useRef(JSON.parse(results));
  console.log("result", result);
  const baseData = React.useRef(result.current[0] || {});
  const baseTableData = React.useRef(makeTableData(baseData.current));
  const dbCountDaily = React.useRef(parseDb(result.current, 1));
  const dbCountCum = React.useRef(parseDb(result.current, 0));
  const dateRange = React.useRef(Object.keys(dbCountCum.current));

  const { display } = useParams();
  const toDisplay = display.split("&");

  // Filtering for table and graph data
  const [miss, setMiss] = React.useState([]);
  const [miss3, setMiss3] = React.useState([]);
  const [match, setMatch] = React.useState([]);
  const [timeFrameBrush, setTimeFrameBrush] = React.useState([]);
  const [countries, setCountries] = React.useState([]);
  const [primers, setPrimers] = React.useState([]);
  const [pType, setPType] = React.useState([]);

  // Filtering for graph data
  const [useCum, setUseCum] = React.useState(false);
  const [countryAsTotal, setCountryAsTotal] = React.useState(false);
  const [lookBack, setLookBack] = React.useState(6);

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

  // const filter = React.useCallback(setFilteredTableData);
  if (result.current.length !== 0) {
    const graphBase = baseTableData.current.filter(
      dataFilter({
        primers: primers,
        pType: pType,
        countries: countries,
        miss: miss,
        miss3: miss3,
        match: match,
      })
    );
    const tableData = graphBase.filter(
      dataFilter({ timeFrameBrush: timeFrameBrush })
    );
    const graphOverview = makeOverview(
      graphBase,
      primers.length === 0 ? Object.keys(baseData.current) : primers,
      useCum ? dbCountCum.current : dbCountDaily.current,
      useCum,
      lookBack,
      setCountryAsTotal ? countries : []
    );

    const combinedBase = makeIntersection(
      JSON.parse(JSON.stringify(graphBase))
    );
    const tableCombined = combinedBase.filter(
      dataFilter({ timeFrameBrush: timeFrameBrush })
    );
    console.log("baseTableData :>> ", baseTableData);
    console.log("graphBase :>> ", graphBase);
    console.log("tableData :>> ", tableData);
    console.log("graphOverview :>> ", graphOverview);
    console.log("combinedBase :>> ", combinedBase);
    console.log("tableCombined :>> ", tableCombined);

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
          />
          <TableDisplay
            title={"Overview of Missed Viruses"}
            data={tableData}
            columns={overviewColumns}
            isCombined={false}
          />
          {/* <MutGraphs
            data={graphOverview}
            primers={
              primers.length === 0 ? Object.keys(baseData.current) : primers
            }
            dates={dateRange.current}
          /> */}
          <TableDisplay
            title={"Combined Missed Viruses"}
            data={tableCombined}
            columns={combinedCols}
            isCombined={true}
          />

          {/* <VisualizationDisplay
            toDisplay={toDisplay}
            overviewData={overviewData}
            combinedOverview={combinedOverview}
            mapData={filteredTableData}
            dbCount={useCum ? dbCountCum : dbCountDaily}
            timeFrameBrush={timeFrameBrush}
            setTimeFrameBrush={setTimeFrameBrush}
          /> */}
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
}) => (value) => {
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
      currDate >= new Date(startDate) && currDate <= new Date(endDate);
  }
  if (primers.length !== 0) {
    isPrimer = primers.includes(value.primer);
  }
  if (pType.length !== 0) {
    isPType = pType.includes(value.type);
  }
  if (countries.length !== 0) {
    isCountry = countries.map((val) => val.label).includes(value.country_name);
  }
  if (miss.length !== 0) {
    console.log("miss :>> ", miss);
    isMiss = value.misses >= (miss[0] || 0) && value.misses <= (miss[1] || 100);
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
  console.log("tableData :>> ", tableData);
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
  console.log("primerDetails", primerDetails);
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

function getRangeDbCount(dbCount, lookBack) {
  /**
   * Calculates a rolling window for database
   * @param {Object} dbCount: Contains the virus numbers in date -> country -> count order
   * @param {Number} lookBack: the lookBack period. Only has effect if [useCum] is false
   */
  // TODO: Optimise maybe, remove repeated calculation each sliding window
  const dates = Object.keys(dbCount);
  const dateWindowCum = {};

  for (const date of dates) {
    const now = new Date(date);
    const start = new Date(date);
    start.setDate(start.getDate() - lookBack);
    let dateCumCount = {};
    for (let d = start; d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      dateCumCount = addObject(dateCumCount, dbCount[dateStr] || {});
    }
    dateWindowCum[date] = dateCumCount;
  }

  return dateWindowCum;
}

function getCountriesTotal(dbCount, countries, date) {
  countries.reduce((prevVal, country) => {
    prevVal += dbCount[date][country];
    return prevVal;
  }, 0);
}

function makeOverview(
  primerDetails,
  primerNames,
  dbCount,
  useCum,
  lookBack,
  countries = []
) {
  /**
   * Creates  data points used to plat overview graph
   * @param {Array} primerDetails: Contains the list of missed virus
   * @param {Array} primerNames: Contains the list primer names
   * @param {Object} dbCount: Contains the virus numbers in date -> country -> count order
   * @param {bool} useCum: if the dbCount represents cumulated or daily values
   * @param {Number} lookBack: the lookBack period. Only has effect if [useCum] is false
   * @param {Array} countries: List of countries who should form the new total
   * @returns {Array} List of Map containing "date", "primerName", "mutation_pct", and "mutation3_pct"
   */
  const overviewData = [];

  for (const primerName of primerNames) {
    const dates = Object.keys(dbCount);
    let dbRolling = useCum ? {} : getRangeDbCount(dbCount, lookBack, countries);
    overviewData.push(
      ...dates.map((date) => {
        const mutationAbs = primerDetails.filter(
          (value) => value.date === date && value.primer === primerName
        ).length;
        const mutation3Abs = primerDetails.filter((value) => {
          return (
            value.date === date &&
            value.primer === primerName &&
            parseInt(value.misses3) !== 0
          );
        }).length;

        const databaseTotal = useCum
          ? countries.length === 0
            ? dbCount[date].total
            : getCountriesTotal(dbCount, countries, date)
          : countries.length === 0
          ? dbRolling[date].total
          : getCountriesTotal(dbRolling, countries, date);
        return {
          date: new Date(date),
          name: primerName,
          mutation_pct: (mutationAbs / databaseTotal) * 100,
          mutation3_pct: (mutation3Abs / databaseTotal) * 100,
          mutation_abs: mutationAbs,
          mutation3_abs: mutation3Abs,
          submission_count: databaseTotal,
          look_back: useCum ? null : lookBack,
          countries_considered: countries,
        };
      })
    );
  }
  return overviewData;
}

// function getDBAndPrimerNames(rawData) {
//   const keys = Object.keys(rawData);

//   const dbName = keys[keys.length - 1];
//   const dbCount = rawData[dbName];

//   const primerNames = keys.slice(0, keys.length - 1);
//   return [dbCount, primerNames];
// }

// function makeOverview(primerDetails, dbCount) {
//   console.log("making overview data");
//   const overviewData = [];

//   const [dbCount, primerNames] = getDBAndPrimerNames(rawData);

//   for (const primerName of primerNames) {
//     const primerDetails = rawData[primerName];

//     const dates = Object.keys(dbCount);

//     overviewData.push(
//       ...dates.map((date) => {
//         return {
//           date: new Date(date),
//           name: primerName,
//           mutation_pct:
//             (primerDetails.filter((value) => value.date === date).length /
//               dbCount[date].total) *
//             100,
//           mutation3_pct:
//             (primerDetails.filter((value) => {
//               return value.date === date && parseInt(value.misses3) !== 0;
//             }).length /
//               dbCount[date].total) *
//             100,
//         };
//       })
//     );
//   }

//   return overviewData;
// }

// function makeCombinedOverview(dbCount, tableData, primerNames) {
//   const combinedOverview = [];

//   const dates = Object.keys(dbCount);

//   combinedOverview.push(
//     ...dates.map((date) => {
//       return {
//         date: new Date(date),
//         name: primerNames.join(", "),
//         total_mut_pct:
//           (tableData.filter((value) => value.date === date).length /
//             dbCount[date].total) *
//           100,
//         total_mut3_pct:
//           (tableData.filter(
//             (value) => value.date === date && parseInt(value.misses3) !== 0
//           ).length /
//             dbCount[date].total) *
//           100,
//       };
//     })
//   );

//   return combinedOverview;
// }
