const d3 = require("d3");

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

function makeIntersection(rawData, primers) {
  /**
   * Creates data for intersecting values if any
   * @param {Array} rawData: contains the primerDetails, databaseCounts (daily and cumulative), as well as primer filenames
   * @param {Array} primers: Contains the list of primer names that are of interest.
   * @returns {Array}: List of virus that is missed by all primers
   */
  let intersection = [];
  if (Object.keys(rawData).length !== 0) {
    const primerDetails = rawData[0];
    const primerNames = Object.keys(primerDetails);

    if (primers[0] === "Overview") {
      intersection = findListIntersection(Object.values(primerDetails));
      intersection = intersection.map(addName(primerNames.join(", ")));
    } else if (primers.length() !== 1) {
      intersection = findListIntersection(Object.values(primerDetails));
      intersection = intersection.map(addName(primers.join(", ")));
    }
  }
  return intersection;
}

function makeDataStartingPoint(rawData) {
  /**
   * Converts all the incoming data into a table format for subsequent data structure to be built off
   * @param {Array} rawData: contains the primerDetails, databaseCounts (daily and cumulative), as well as primer filenames on server.
   * @returns {Array} Each item in the array corresponds to a single entry that has been missed.
   **/

  let tableData = [];
  if (Object.keys(rawData).length !== 0) {
    const primerDetails = rawData[0];
    const primerNames = Object.keys(primerDetails);
    for (const primerName of primerNames) {
      tableData.push(primerDetails[primerName].map(addName(primerName)));
    }
  }
  return tableData;
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
    result = result.map((item) => {
      return {
        ...item,
        match_diag: "refer to individual primer for more details",
        misses3: "refer to individual primer for more details",
        misses: "refer to individual primer for more details",
        match_pct: "refer to individual primer for more details",
        type: "refer to individual primer for more details",
        virus_match_idx: "refer to individual primer for more details",
        query_match_idx: "refer to individual primer for more details",
      };
    });
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

  if (itemList.length === 1) return itemList;
  let intersection = itemList[0];
  for (let i = 1; i < itemList.length; i++) {
    intersection = findIntersection(intersection, itemList[i], key);
  }
  return intersection;
}
function getCountriesTotal(dbCount, countries, date) {
  countries.reduce((prevVal, country) => {
    prevVal += dbCount[date][country];
    return prevVal;
  }, 0);
}
function makeOverview(
  primerDetails,
  dbCount,
  useCum,
  lookBack,
  countries = []
) {
  /**
   * Creates  data points used to plat overview graph
   * @param {Array} primerDetails: Contains the list of missed virus
   * @param {Map} dbCount: Contains the virus numbers in date -> country -> count order
   * @param {bool} useCum: if the dbCount represents cumulated or daily values
   * @param {Number} lookBack: the lookBack period. Only has effect if [useCum] is false
   * @param {Array} countries: List of countries who should form the new total
   * @returns {Array} List of Map containing "date", "primerName", "mutation_pct", and "mutation3_pct"
   */
  const overviewData = [];

  const primerNames = Object.keys(primerDetails);

  for (const primerName of primerNames) {
    const dates = Object.keys(dbCount);

    if (useCum) {
    } else {
      dbRolling = getRangeDbCount(dbCount, lookBack, countries);
      overviewData.push(
        ...dates.map((date) => {
          const mutationAbs = primerDetails.filter(
            (value) => value.date === date && value.primer == primerName
          ).length;
          const mutation3Abs = primerDetails.filter((value) => {
            return (
              value.date === date &&
              value.primer == primerName &&
              parseInt(value.misses3) !== 0
            );
          }).length;
          return {
            date: new Date(date),
            name: primerName,
            mutation_pct: (mutationAbs / dbRolling[date]) * 100,
            mutation3_pct: (mutation3Abs / dbRolling[date]) * 100,
            mutation_abs: mutationAbs,
            mutation3_abs: mutation3Abs,
            database_count: dbRolling[date],
            countries_considered: countries,
          };
        })
      );
    }
    let dbRolling = !useCum
      ? getRangeDbCount(dbCount, lookBack, countries)
      : {};
    overviewData.push(
      ...dates.map((date) => {
        const mutationAbs = primerDetails.filter(
          (value) => value.date === date && value.primer === primerName
        ).length;
        const mutation3Abs = primerDetails.filter((value) => {
          return (
            value.date === date &&
            value.primer == primerName &&
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
          database_count: databaseTotal,
          countries_considered: countries,
        };
      })
    );
  }

  return overviewData;
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

function getRangeDbCount(dbCount, lookBack, countries) {
  /**
   * Calculates a rolling window for database
   *
   */
  // TODO: Optimise maybe, remove repeated calculation each sliding window
  const dates = Object.keys(dbCount);
  const dateWindowCum = {};

  for (const date of dates) {
    const now = new Date(date);
    const start = new Date(date);
    start.setDate(start.getDate() - lookBack + 1);
    let dateCumCount = {};
    for (let d = start; d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      dateCumCount = addObject(dateCumCount, dbCount[dateStr] || {});
    }
    console.log("dateCumCount :>> ", dateCumCount);
    dateWindowCum[date] = dateCumCount;
  }

  return dateWindowCum;
}

let toDisplay = ["Overview"];
let data = [
  {
    1: [
      {
        accession_id: "24_@",
        country_name: "SGP",
      },
      {
        accession_id: "132@",
        country_name: "SGP",
      },
    ],
    2: [
      {
        accession_id: "24_@",
        country_name: "SGP",
      },
      {
        accession_id: "132@",
        country_name: "SGP",
      },
    ],
    3: [
      {
        accession_id: "132@",
        country_name: "SGP",
      },
    ],
    4: [
      {
        accession_id: "132@",
        country_name: "SGP",
      },
      {
        accession_id: "24_@",
        country_name: "SGP",
      },
    ],
    5: [
      {
        accession_id: "132@",
        country_name: "SGP",
      },
    ],
  },
];

let result = makeDataStartingPoint(data);
let intersect = makeIntersection(data, toDisplay);
console.log("intersect", JSON.stringify(intersect, (space = 2)));
console.log("starting point", JSON.stringify(result, (space = 2)));
let test = [];
let [hi, bye] = test[1] || [[], []];
console.log(test[1]);

function makeBarData(
  graphBase,
  primerNames,
  dbCount,
  dates,
  timeFrameBrush,
  daysBetweenComparison,
  numberOfBars
) {
  /**
   * Makes the bar data to be used for display
   * @param {Array} graphBase: List of Map containing "date", "name", "mutation_pct", "mutation3_pct", "mutation_abs", "mutation3_abs", "submission_count", and  "countries_considered"
   * @param {Array} primerNames: Contains the list primer names
   * @param {Object} dbCount: Contains the virus numbers in date -> country -> count order
   * @param {Array} timeFrameBrush: Contains the minimum and maximum date of interest
   */
  const barData = { primers: primerNames };
  const dateDetails = [];

  const now = timeFrameBrush[1] || new Date(dates[dates.length - 1]);
  const start = new Date(now);
  start.setDate(start.getDate() - daysBetweenComparison * numberOfBars);

  for (
    let d = start;
    d <= now;
    d.setDate(d.getDate() + daysBetweenComparison)
  ) {
    // const dateStr = d.toISOString().slice(0, 10);
    const primerMutations = [];
    for (const primerName of primerNames) {
      const mutation = graphBase.filter(
        (val) => val.name === primerName && val.date === d
      );
      primerMutations.push(mutation);
    }
    dateDetails.push(primerMutations);
  }

  barData["dates"] = dateDetails;
  return barData;
}

makeBarData(
  [],
  ["test1", "2time"],
  {
    "2020-01-01": { CHN: 5 },
    "2020-01-02": { CHN: 3 },
    "2020-01-03": { CHN: 5 },
    "2020-01-04": { CHN: 10 },
    "2020-01-05": { CHN: 5 },
    "2020-01-06": { CHN: 3 },
    "2020-01-07": { CHN: 5 },
    "2020-01-08": { CHN: 10 },
  },
  [
    "2020-01-01",
    "2020-01-02",
    "2020-01-03",
    "2020-01-04",
    "2020-01-05",
    "2020-01-06",
    "2020-01-07",
    "2020-01-08",
  ],
  [null, new Date("2020-01-08")],
  2,
  3
);
