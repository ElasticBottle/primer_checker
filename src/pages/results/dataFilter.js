import { addName } from "../../components/util";

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
   * @returns {function} A function that takes a value and filter for parameters aboves
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
      isCountry = countries.map((val) => val.value).includes(value.ISO_A3);
    }
    if (miss.length !== 0) {
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

export function filterTable({
  baseTableData,
  timeFrameBrush = [],
  primers = [],
  pType = [],
  countries = [],
  miss = [],
  miss3 = [],
  match = [],
}) {
  return baseTableData.filter(
    dataFilter({
      primers: primers,
      pType: pType,
      countries: countries,
      miss: miss,
      miss3: miss3,
      match: match,
      timeFrameBrush: timeFrameBrush,
    })
  );
}
function addObject(obj1, obj2, initialSum = 0) {
  /**
   * Adds the item in obj2 into obj1
   * @param {Object} obj1: the obj in which items will be added too.
   * @param {Object} obj2: The Object from which are retrieved to be added.
   * @param {Any} initialSum: the value to be added when Obj2 contains an item Obj1 does not.
   * @returns {Object} An object containing Obj1 + Obj2
   */
  let results = {};

  for (let key of Object.keys(obj2)) {
    results[key] = (obj1[key] || initialSum) + obj2[key];
  }
  return results;
}

function subObject(obj1, obj2) {
  /**
   * Subtracts the item in obj2 from obj1
   * @param {Object} obj1: the obj in which items will be removed from.
   * @param {Object} obj2: The Object from which items are retrieved to be removed.
   * @returns {Object} An object containing Obj1 + Obj2
   */
  let results = {};
  for (const key of Object.keys(obj2)) {
    results[key] = obj1[key] - obj2[key];
  }
  return results;
}
function getRangeDbCount(dbCount, lookBack, dates) {
  /**
   * Calculates a rolling window for database
   * @param {Object} dbCount: Contains the virus numbers in date -> country -> count order
   * @param {Number} lookBack: the lookBack period. Only has effect if [useCum] is false
   */

  const now = new Date(dates[0]);
  const start = new Date(now);
  const end = new Date(dates[dates.length - 1]);
  start.setDate(start.getDate() + lookBack);
  const nowStr = now.toISOString().slice(0, 10);
  const dateWindowCum = {};
  dateWindowCum[nowStr] = JSON.parse(JSON.stringify(dbCount[nowStr]));
  now.setDate(now.getDate() + 1);

  for (let d = now; d <= start; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);

    let prevStr = new Date(d);
    prevStr.setDate(prevStr.getDate() - 1);
    prevStr = prevStr.toISOString().slice(0, 10);

    dateWindowCum[dateStr] = addObject(
      dateWindowCum[prevStr],
      dbCount[dateStr] || {}
    );
  }

  start.setDate(start.getDate() + 1);
  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().slice(0, 10);
    let prevVal = new Date(d);
    prevVal.setDate(prevVal.getDate() - 1);
    let toRemove = new Date(prevVal);
    toRemove.setDate(toRemove.getDate() - lookBack);

    prevVal = prevVal.toISOString().slice(0, 10);
    toRemove = toRemove.toISOString().slice(0, 10);

    dateWindowCum[dateStr] = addObject(
      subObject(dateWindowCum[prevVal], dbCount[toRemove]),
      dbCount[dateStr] || {}
    );
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

export function getTotalSubmission({
  dbDaily,
  dbCum,
  dateRange,
  countries,
  countryAsTotal,
  useCum,
  lookBack,
  separate = false,
}) {
  if (useCum) {
    const result = {};
    for (const date of Object.keys(dbCum)) {
      result[date] = countryAsTotal
        ? getCountriesTotal(dbCum, countries, date)
        : dbCum[date].total;
    }
    return result;
  } else {
    const result = getRangeDbCount(dbDaily, lookBack, dateRange);
    console.log("result :>> ", result);
    console.log("dateRange :>> ", dateRange);
    console.log("dbDaily :>> ", dbDaily);
    if (separate) {
      return result;
    }
    for (const date of dateRange) {
      result[date] = countryAsTotal
        ? getCountriesTotal(result, countries, date)
        : result[date].total;
    }
    return result;
  }
}

function combineData(f, data1, data2) {
  /** combines two single graph data overview
   * @param (string) f: Either "add" or "subtract"
   * @param {Object} data1: The object we are adding to or subtracting from
   * @param {Object} data2: The data we are using to add or subtract
   * @returns {Object}: The combined result
   */
  if (f === "add") {
    const m = data1.mutation_abs + data2.mutation_abs;
    const m3 = data1.mutation3_abs + data2.mutation3_abs;
    return {
      name: data1.name,
      date: data1.date,
      mutation3_abs: m3,
      mutation3_pct: (m3 / data1.submission_count || 0) * 100,
      mutation_abs: m,
      mutation_pct: (m / data1.submission_count || 0) * 100,
      submission_count: data1.submission_count,
      countries_considered: data1.countries_considered,
      lookBack: data1.lookBack,
    };
  } else if (f === "subtract") {
    const m = data1.mutation_abs - data2.mutation_abs;
    const m3 = data1.mutation3_abs - data2.mutation3_abs;
    return {
      name: data1.name,
      date: data1.date,
      mutation3_abs: m3,
      mutation3_pct: (m3 / data1.submission_count || 0) * 100,
      mutation_abs: m,
      mutation_pct: (m / data1.submission_count || 0) * 100,
      submission_count: data1.submission_count,
      countries_considered: data1.countries_considered,
      lookBack: data1.lookBack,
    };
  } else {
    throw Error(`invalid f, expected "add" or "subtract", got ${f}`);
  }
}
function accumulate(data, lookBack) {
  /**
   * Sliding window over the list of dates for a particular primer
   * @param {Array} data: Contains a list of virus sequences missed
   * @param {Number} lookBack: the lookBack period for the calculation
   * @returns {Array}: a list of data points to be plotted for the line graph.
   */
  const result = [];
  result.push({
    name: data[0].name,
    date: data[0].date,
    mutation3_abs: data[0].mutation3_abs,
    mutation3_pct:
      (data[0].mutation3_abs / data[0].submission_count || 0) * 100,
    mutation_abs: data[0].mutation_abs,
    mutation_pct: (data[0].mutation_abs / data[0].submission_count || 0) * 100,
    submission_count: data[0].submission_count,
    countries_considered: data[0].countries_considered,
    lookBack: data[0].lookBack,
  });
  if (lookBack === -1) {
    for (let i = 1; i < data.length; i++) {
      result.push(combineData("add", data[i], result[i - 1]));
    }
  } else {
    for (let i = 1; i <= lookBack; i++) {
      result.push(combineData("add", data[i], result[i - 1]));
    }
    for (let i = lookBack + 1; i < data.length; i++) {
      result.push(
        combineData(
          "add",
          data[i],
          combineData("subtract", result[i - 1], data[i - 1 - lookBack])
        )
      );
    }
  }
  return result;
}
function buildLineGraphData({
  toPlot,
  primers,
  dateRange,
  pType,
  countries,
  miss,
  miss3,
  match,
  totalSubmission,
  useCum,
  lookBack,
}) {
  const results = [];
  for (const primer of primers) {
    results.push(
      dateRange.map((date) => {
        const filteredData = (toPlot[primer][date] || []).reduce(
          (prevVal, currVal) => {
            if (
              dataFilter({
                pType: pType,
                countries: countries,
                miss: miss,
                miss3: miss3,
                match: match,
              })(currVal)
            ) {
              prevVal[0].add(currVal.virus_name);
              if (currVal.misses3 >= 1) {
                prevVal[1].add(currVal.virus_name);
              }
            }
            return prevVal;
          },
          [new Set(), new Set()]
        );
        return {
          name: primer,
          date: date,
          mutation3_abs: filteredData[1].size,
          mutation3_pct: 0,
          mutation_abs: filteredData[0].size,
          mutation_pct: 0,
          submission_count: totalSubmission[date],
          countries_considered: countries,
          lookBack: useCum ? -1 : lookBack,
        };
      })
    );
  }

  return useCum
    ? results.map((result) => {
        return accumulate(result, -1);
      })
    : results.map((result) => {
        return accumulate(result, lookBack);
      });
}
export function getLineGraphData({
  baseData,
  dateRange,
  primers,
  pType,
  countries,
  miss,
  miss3,
  match,
  totalSubmission,
  useCum,
  lookBack,
}) {
  const toPlot = {};
  for (const primer of Object.keys(baseData)) {
    if (primers.length === 0) {
      toPlot[primer] = baseData[primer];
    } else if (primers.find((val) => val === primer)) {
      toPlot[primer] = baseData[primer];
    }
  }
  return buildLineGraphData({
    toPlot: toPlot,
    primers: primers.length === 0 ? Object.keys(baseData) : primers,
    dateRange: dateRange,
    pType: pType,
    countries: countries,
    miss: miss,
    miss3: miss3,
    match: match,
    totalSubmission: totalSubmission,
    useCum: useCum,
    lookBack: lookBack,
  });
}

export function getCombinedLineData(
  toPlot,
  primers,
  dateRange,
  pType,
  countries,
  miss,
  miss3,
  match,
  totalSubmission,
  useCum,
  lookBack
) {
  return buildLineGraphData({
    toPlot: toPlot,
    primers: primers,
    dateRange: dateRange,
    pType: pType,
    countries: countries,
    miss: miss,
    miss3: miss3,
    match: match,
    totalSubmission: totalSubmission,
    useCum: useCum,
    lookBack: lookBack,
  });
}

export function makeBarData({
  data,
  dbDaily,
  countries,
  countryAsTotal,
  dates,
  useCum,
  timeFrameBrush,
  daysBetweenComparison,
  numberOfBars,
}) {
  /**
   * Makes the bar data to be used for display
   * @param {Array} graphBase: List of List of Map containing "date", "name", "mutation_pct", "mutation3_pct", "mutation_abs", "mutation3_abs", "submission_count", and  "countries_considered". Each list correspond to a primer in primerNames of the same index
   * @param {Array} primerNames: Contains the list primer names
   * @param {Object} dbCount: Contains the virus numbers in date -> country -> count order
   * @param {Array} timeFrameBrush: Contains the minimum and maximum date of interest
   * @returns {Array} Contains a List of List. Each list corresponds to a particular primer
   */
  function getDb(db, dateRange, startDate, endDate) {
    function addObject(obj1, obj2) {
      const toReturn = { ...obj1 };
      for (const key of Object.keys(obj2)) {
        toReturn[key] = obj2[key] + (obj1[key] || 0);
      }
      return toReturn;
    }

    const result = {};
    result[endDate] = {};
    for (const date of dateRange) {
      if (date >= startDate && date <= endDate) {
        result[endDate] = addObject(result[endDate], db[date]);
      }
    }
    result[endDate] = countryAsTotal
      ? getCountriesTotal(result, countries, endDate)
      : result[endDate].total;
    return result;
  }

  if (useCum) {
    let now = timeFrameBrush[1] || dates[dates.length - 1];
    const start = timeFrameBrush[0] || dates[0];
    const endDate = new Date(now);
    now = endDate.toISOString().slice(0, 10);
    const startDate = new Date(start);
    let Difference_In_Time = endDate.getTime() - startDate.getTime();
    // To calculate the no. of days between two dates
    let differenceInDays = Difference_In_Time / (1000 * 3600 * 24);
    const currDb = getDb(
      dbDaily,
      dates,
      startDate.toISOString().slice(0, 10),
      now
    );
    // TODO: Account for scenario where the same primer but different regions have mutations
    const barData = data.reduce((result, currVal) => {
      if (result[0].has(currVal.primer)) {
        // TODO Change to account for map to set
        result[1].add(currVal.virus_name);
        if (currVal.misses3 === 0) {
          result[2].add(currVal.virus_name);
        }
        return result[0].set(currVal.primer, {
          ...result[0].get(currVal.primer),
          mutation3_abs:
            result[0].get(currVal.primer).mutation3_abs +
            (currVal.misses3 === 0 ? 0 : 1),
          mutation3_pct:
            ((result[0].get(currVal.primer).mutation3_abs +
              (currVal.misses3 === 0 ? 0 : 1)) /
              currDb[now]) *
            100,
          mutation_abs: result[0].get(currVal.primer).mutation_abs + 1,
          mutation_pct:
            ((result[0].get(currVal.primer).mutation_abs + 1) / currDb[now]) *
            100,
        });
      } else {
        return result[0].set(currVal.primer, {
          name: currVal.primer,
          date: now,
          countries_considered: countries,
          lookBack: differenceInDays,
          submission_count: currDb[now],
          mutation3_abs: currVal.misses3 === 0 ? 0 : 1,
          mutation3_pct: ((currVal.misses3 === 0 ? 0 : 1) / currDb[now]) * 100,
          mutation_abs: 1,
          mutation_pct: (1 / currDb[now]) * 100,
        });
      }
    }, [new Map(), new Map(), new Map()]());
    return [[], [...barData.values()]];
  } else {
    // TODO (EB): THIS IS NOT WORKING. The additional features for bar graph.
    // const now = timeFrameBrush[1] || new Date(dates[dates.length - 1]);
    // const start = new Date(now);
    // start.setDate(start.getDate() - daysBetweenComparison * numberOfBars);
    // while (start.getTime() < new Date(dates[0])) {
    //   start.setDate(start.getDate() + daysBetweenComparison);
    //   // setNumberOfBars((prev) => prev - 1);
    // }
    // for (
    //   let d = start;
    //   d <= now;
    //   d.setDate(d.getDate() + daysBetweenComparison)
    // ) {
    //   const primerMutations = [];
    //   for (let i = 0; i < graphOverview.length; i++) {
    //     const details = graphOverview[i].filter(
    //       (val) => val.date === d.toISOString().slice(0, 10)
    //     );
    //     primerMutations.push(...details);
    //   }
    //   dateDetails.push(primerMutations);
    // }
    // return dateDetails;
  }
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

function findListIntersection(itemList, numList, key = "accession_id") {
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

export function makeIntersection(tableData, primerNames) {
  /**
   * Creates data for intersecting values if any
   * @param {Array} tableData: contains the info on the primers to display
   * @param {Array} primerNames: Contains the list of primer names
   * @returns {Array}: List of virus that is missed by all primers
   * @returns {string}: name of the combined primers
   */
  let intersection = [];
  if (
    primerNames.length === Object.values(tableData).length &&
    primerNames.length > 1
  ) {
    const name = primerNames.join(", ");
    intersection = findListIntersection(
      Object.values(tableData),
      primerNames.length
    );
    intersection = intersection.map(addName(name));
    return [intersection, [name]];
  }
  return [intersection, ""];
}
