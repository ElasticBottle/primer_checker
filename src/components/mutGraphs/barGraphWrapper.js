import React from "react";
import BarGraph from "../../components/mutGraphs/barGraph";
import { debounce } from "../util";

import worker from "workerize-loader!../../pages/results/dataFilter"; // eslint-disable-line import/no-webpack-loader-syntax

const BarGraphWrapper = ({
  rawData,
  dateRange,
  totalSubmission,
  setIsProcessingGraphs,
  primers,
  pType,
  countries,
  miss,
  miss3,
  match,
  useCum,
  lookBack,
  timeFrameBrush,
  showModal,
  setModalInfo,
  showAbsDiff,
  daysBetweenComparison,
  numberOfBars,
  title,
  title2,
}) => {
  const instance = React.useRef(worker());

  const [barData, setBarData] = React.useState([]);

  const updateBarData = React.useCallback(
    debounce(
      (
        primers,
        pType,
        countries,
        miss,
        miss3,
        match,
        useCum,
        lookBack,
        totalSubmission,
        timeFrameBrush,
        daysBetweenComparison,
        numberOfBars
      ) => {
        let start = performance.now();
        setIsProcessingGraphs(true);
        instance.current
          .getLineGraphData({
            baseData: rawData,
            dateRange: dateRange,
            primers: primers,
            pType: pType,
            countries: countries,
            miss: miss,
            miss3: miss3,
            match: match,
            totalSubmission: totalSubmission,
            useCum: useCum,
            lookBack: lookBack,
          })
          .then((lineData) => {
            instance.current
              .makeBarData({
                graphOverview: lineData,
                dates: dateRange,
                timeFrameBrush: timeFrameBrush,
                daysBetweenComparison: daysBetweenComparison,
                numberOfBars: numberOfBars,
              })
              .then((result) => {
                setBarData(result);
                console.log("barData :>> ", result);
                console.log(
                  `Time taken for bar graph data: ${(
                    performance.now() - start
                  ).toFixed(5)} milliseconds`
                );
                setIsProcessingGraphs(false);
              });
          });
      },
      500
    ),
    []
  );
  React.useEffect(() => {
    updateBarData(
      primers,
      pType,
      countries,
      miss,
      miss3,
      match,
      useCum,
      lookBack,
      totalSubmission,
      timeFrameBrush,
      daysBetweenComparison,
      numberOfBars
    );
  }, [
    updateBarData,
    primers,
    pType,
    countries,
    miss,
    miss3,
    match,
    useCum,
    lookBack,
    totalSubmission,
    timeFrameBrush,
    daysBetweenComparison,
    numberOfBars,
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
    prev.lookBack === next.lookBack &&
    objEqual(prev.rawData, next.rawData) &&
    objEqual(prev.dateRange, next.dateRange) &&
    objEqual(prev.totalSubmission, next.totalSubmission) &&
    objEqual(prev.timeFrameBrush, next.timeFrameBrush) &&
    objEqual(prev.miss, next.miss) &&
    objEqual(prev.miss3, next.miss3) &&
    objEqual(prev.match, next.match) &&
    prev.useCum === next.useCum &&
    prev.lookBack === next.lookBack &&
    prev.daysBetweenComparison === next.daysBetweenComparison &&
    prev.numberOfBars === next.numberOfBars &&
    prev.showAbsDiff === next.showAbsDiff &&
    objEqual(prev.pType, next.pType) &&
    objEqual(prev.countries, next.countries) &&
    objEqual(prev.primers, next.primers)
  );
};

export default React.memo(BarGraphWrapper, areEqual);
