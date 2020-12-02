import React from "react";
import LineGraph from "../../components/mutGraphs/lineGraph";
import { debounce } from "../util";

import worker from "workerize-loader!../../pages/results/dataFilter"; // eslint-disable-line import/no-webpack-loader-syntax

const InLineGraph = ({
  rawData,
  dateRange,
  totalSubmission,
  setIsProcessingGraphs,
  primers,
  pType,
  countries,
  countryAsTotal,
  miss,
  miss3,
  match,
  useCum,
  lookBack,
  timeFrameBrush,
  setTimeFrameBrush,
  showModal,
  setModalInfo,
  title,
  title2,
}) => {
  const instance = React.useRef(worker());

  const [lineData, setLineData] = React.useState([]);

  const makeData = React.useCallback(
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
        totalSubmission
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
          .then((result) => {
            console.log(
              `Time taken for line graph data: ${(
                performance.now() - start
              ).toFixed(5)} milliseconds`
            );
            setIsProcessingGraphs(false);
            setLineData(result);
          });
      },
      500
    ),
    []
  );

  React.useEffect(() => {
    makeData(
      primers,
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
    primers,
    pType,
    countries,
    miss,
    miss3,
    match,
    useCum,
    lookBack,
    totalSubmission,
  ]);

  if (Object.keys(rawData).length !== 0) {
    return (
      <LineGraph
        title={title}
        title2={title2}
        data={lineData}
        primers={primers.length === 0 ? Object.keys(rawData) : primers}
        dates={dateRange}
        countryAsTotal={countryAsTotal}
        timeFrameBrush={timeFrameBrush}
        setTimeFrameBrush={setTimeFrameBrush}
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
    objEqual(prev.pType, next.pType) &&
    objEqual(prev.countries, next.countries) &&
    objEqual(prev.primers, next.primers)
  );
};
export default React.memo(InLineGraph, areEqual);
