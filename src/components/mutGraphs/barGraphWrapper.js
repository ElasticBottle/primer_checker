import React from "react";
import BarGraph from "../../components/mutGraphs/barGraph";
import { debounce } from "../util";

import worker from "workerize-loader!../../pages/results/dataFilter"; // eslint-disable-line import/no-webpack-loader-syntax

const BarGraphWrapper = ({
  rawData,
  dateRange,
  dbDaily,
  setIsProcessingGraphs,
  countries,
  countryAsTotal,
  useCum,
  timeFrameBrush,
  daysBetweenComparison,
  numberOfBars,
  setNumberOfBars,
  showAbsDiff,
  showModal,
  setModalInfo,
  isCombined,
  title,
  title2,
}) => {
  const instance = React.useRef(worker());
  const [barData, setBarData] = React.useState([]);

  const updateBarData = React.useCallback(
    debounce(
      (
        rawData,
        dbDaily,
        countries,
        countryAsTotal,
        dateRange,
        useCum,
        timeFrameBrush,
        daysBetweenComparison,
        numberOfBars,
        setNumberOfBars
      ) => {
        let start = performance.now();

        setIsProcessingGraphs(true);
        instance.current
          .makeBarData(
            JSON.parse(
              JSON.stringify({
                data: rawData,
                dbDaily: dbDaily,
                countries: countries,
                countryAsTotal: countryAsTotal,
                dates: dateRange,
                useCum: useCum,
                timeFrameBrush: timeFrameBrush,
                daysBetweenComparison: daysBetweenComparison,
                numberOfBars: numberOfBars,
                setNumberOfBars: setNumberOfBars,
              })
            )
          )
          .then((result) => {
            setBarData(result);
            // console.log("barData :>> ", result);
            console.log(
              `Time taken for bar graph data: ${(
                performance.now() - start
              ).toFixed(5)} milliseconds`
            );
            setIsProcessingGraphs(false);
          });
      },
      500
    ),
    []
  );
  React.useEffect(() => {
    updateBarData(
      rawData,
      dbDaily,
      countries,
      countryAsTotal,
      dateRange,
      useCum,
      timeFrameBrush,
      daysBetweenComparison,
      numberOfBars,
      setNumberOfBars
    );
  }, [
    updateBarData,
    rawData,
    dbDaily,
    countries,
    countryAsTotal,
    dateRange,
    useCum,
    timeFrameBrush,
    daysBetweenComparison,
    numberOfBars,
    setNumberOfBars,
  ]);

  if (Object.keys(rawData).length !== 0) {
    return (
      <BarGraph
        title={title}
        title2={title2}
        data={barData}
        showAbsDiff={showAbsDiff}
        showModal={showModal}
        setModalInfo={setModalInfo}
        isCombined={false}
      />
    );
  } else {
    return null;
  }
};

const objEqual = (a, b) => {
  return (
    Object.entries(a).sort().toString() === Object.entries(b).sort().toString()
  );
};
const areEqual = (prev, next) => {
  return (
    objEqual(prev.rawData, next.rawData) &&
    objEqual(prev.dbDaily, next.dbDaily) &&
    objEqual(prev.timeFrameBrush, next.timeFrameBrush) &&
    prev.useCum === next.useCum &&
    prev.daysBetweenComparison === next.daysBetweenComparison &&
    prev.numberOfBars === next.numberOfBars &&
    prev.showAbsDiff === next.showAbsDiff &&
    prev.countryAsTotal === next.countryAsTotal &&
    objEqual(prev.countries, next.countries)
  );
};

export default React.memo(BarGraphWrapper, areEqual);
