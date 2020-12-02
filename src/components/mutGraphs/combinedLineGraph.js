import React from "react";
import LineGraph from "./lineGraph";
import { debounce, makeBaseGraphData } from "../util";

import worker from "workerize-loader!../../pages/results/dataFilter"; // eslint-disable-line import/no-webpack-loader-syntax

const CombinedLineGraph = ({
  combinedBase,
  combinedName,
  dateRange,
  totalSubmission,
  setIsProcessingGraphs,
  pType,
  countries,
  miss,
  miss3,
  match,
  useCum,
  lookBack,
  timeFrameBrush,
  setTimeFrameBrush,
  showModal,
  setModalInfo,
  isCombined,
  title,
  title2,
}) => {
  const instance = React.useRef(worker());

  const [lineData, setLineData] = React.useState([]);

  const makeData = React.useCallback(
    debounce(
      (
        combinedBase,
        combinedName,
        pType,
        countries,
        miss,
        miss3,
        match,
        useCum,
        lookBack,
        totalSubmission
      ) => {
        let start = performance.now();
        setIsProcessingGraphs(true);
        instance.current
          .getCombinedLineData(
            makeBaseGraphData({ [combinedName]: combinedBase }),
            [combinedName] || [],
            dateRange,
            pType,
            countries,
            miss,
            miss3,
            match,
            totalSubmission,
            useCum,
            lookBack
          )
          .then((result) => {
            setIsProcessingGraphs(false);
            setLineData(result);
            console.log(
              `Time taken for creating combined line data: ${(
                performance.now() - start
              ).toFixed(5)} milliseconds`
            );
          });
      },
      500
    ),
    []
  );

  React.useEffect(() => {
    makeData(
      combinedBase,
      combinedName,
      pType,
      countries,
      miss,
      miss3,
      match,
      useCum,
      lookBack,
      totalSubmission
    );
  }, [
    makeData,
    combinedBase,
    combinedName,
    pType,
    countries,
    miss,
    miss3,
    match,
    useCum,
    lookBack,
    totalSubmission,
  ]);

  if (Object.keys(combinedBase).length !== 0) {
    return (
      <LineGraph
        title={title}
        title2={title2}
        data={lineData}
        primers={combinedName}
        dates={dateRange}
        timeFrameBrush={timeFrameBrush}
        setTimeFrameBrush={setTimeFrameBrush}
        showModal={showModal}
        setModalInfo={setModalInfo}
        isCombined={isCombined}
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
    objEqual(prev.combinedBase, next.combinedBase) &&
    objEqual(prev.dateRange, next.dateRange) &&
    objEqual(prev.totalSubmission, next.totalSubmission) &&
    objEqual(prev.timeFrameBrush, next.timeFrameBrush) &&
    objEqual(prev.miss, next.miss) &&
    objEqual(prev.miss3, next.miss3) &&
    objEqual(prev.match, next.match) &&
    prev.useCum === next.useCum &&
    prev.combinedName === next.combinedName &&
    prev.lookBack === next.lookBack &&
    objEqual(prev.pType, next.pType) &&
    objEqual(prev.countries, next.countries)
  );
};
export default React.memo(CombinedLineGraph, areEqual);
