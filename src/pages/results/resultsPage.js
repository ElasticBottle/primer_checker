import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";

import "./resultsPage.css";
import ItemFilters from "../../components/ItemFilter/itemFilters";
import DataTable from "../../components/tableDisplay/tableDisplay";
import LineGraph from "../../components/mutGraphs/lineGraph";
import BarGraph from "../../components/mutGraphs/barGraph";
import MapWithToolTip from "../../components/primerMap/mapWithToolTip";

import worker from "workerize-loader!./dataFilter"; // eslint-disable-line import/no-webpack-loader-syntax

import { debounce, addName } from "../../components/util";

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
  const baseData = React.useRef(result.current[0] || {});
  const instance = React.useRef(worker());
  const baseTableData = React.useRef(makeTableData(baseData.current));
  const baseGraphData = React.useRef(makeBaseGraphData(baseData.current));

  const dbCountDaily = React.useRef(parseDb(result.current, 1));
  const dbCountCum = React.useRef(parseDb(result.current, 0));
  const dateRange = React.useRef(Object.keys(dbCountCum.current) || []);

  const { display } = useParams();
  const toDisplay = display.split("&");

  // Data to display
  const [dbActual, setDbActual] = React.useState([]);
  const [tableDataset, setTableDataset] = React.useState([]);
  const [lineData, setLineData] = React.useState([]);
  const [barData, setBarData] = React.useState([]);
  const [combinedBase, setCombinedBase] = React.useState([]);
  const [combinedName, setCombinedName] = React.useState([]);
  const [lineCombinedData, setLineCombinedData] = React.useState([]);
  const [tableCombined, setTableCombined] = React.useState([]);

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
  const [countryAsTotal, setCountryAsTotal] = React.useState(true);
  const [lookBack, setLookBack] = React.useState(6);
  const [isBar, setIsBar] = React.useState(true);
  const [daysBetweenComparison, setDaysBetweenComparison] = React.useState(
    lookBack
  );
  const [numberOfBars, setNumberOfBars] = React.useState(1);
  const [showAbsDiff, setShowAbsDiff] = React.useState(true);

  // Detail Modal
  const [showModal, setShowModal] = React.useState(false);
  const [modalInfo, setModalInfo] = React.useState({
    date: null,
    lookBack: null,
    country: null,
    primer: null,
  });
  const closeModalCb = () => setShowModal(false);
  const showModalCb = React.useCallback(() => setShowModal(true), []);

  // Misc items
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isProcessingGraphs, setIsProcessingGraphs] = React.useState(false);
  const updateLineData = React.useCallback(
    debounce(
      ({
        primers,
        pType,
        countries,
        miss,
        miss3,
        match,
        useCum,
        countryAsTotal,
        lookBack,
      }) => {
        let start = performance.now();
        instance.current
          .getTotalSubmission({
            dbCum: dbCountCum.current,
            dbDaily: dbCountDaily.current,
            dateRange: dateRange.current,
            countries: countries,
            countryAsTotal: countryAsTotal,
            useCum: useCum,
            lookBack: lookBack,
          })
          .then((totalSubmission) => {
            setDbActual(totalSubmission);
            instance.current
              .getLineGraphData({
                baseData: baseGraphData.current,
                dateRange: dateRange.current,
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
                setLineData(result);
              });
          });
      },
      500
    ),
    []
  );
  const updateBarData = React.useCallback(
    debounce(
      (lineData, timeFrameBrush, daysBetweenComparison, numberOfBars) => {
        let start = performance.now();
        instance.current
          .makeBarData({
            graphOverview: lineData,
            dates: dateRange.current,
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
      },
      500
    ),
    []
  );
  const updateTableData = React.useCallback(
    debounce(
      (primers, pType, countries, miss, miss3, match, timeFrameBrush) => {
        let start = performance.now();
        instance.current
          .filterTable({
            baseTableData: baseTableData.current,
            primers: primers,
            pType: pType,
            countries: countries,
            miss: miss,
            miss3: miss3,
            match: match,
            timeFrameBrush: timeFrameBrush,
          })
          .then((data) => {
            setIsProcessing(false);
            setTableDataset(data);
            console.log(
              `Time taken for filtering table data: ${(
                performance.now() - start
              ).toFixed(5)} milliseconds`
            );
          });
      },
      500
    ),
    []
  );
  const updateCombinedData = React.useCallback(
    debounce(
      (primers, pType, countries, miss, miss3, match, timeFrameBrush) => {
        let start = performance.now();
        instance.current
          .filterTable({
            baseTableData: baseTableData.current,
            primers: primers,
            pType: pType,
            countries: countries,
            miss: miss,
            miss3: miss3,
            match: match,
            timeFrameBrush: timeFrameBrush,
          })
          .then((data) => {
            const result = data.reduce((prevVal, currVal) => {
              const temp = prevVal[currVal.primer] || [];
              temp.push(currVal);
              prevVal[currVal.primer] = temp;
              return prevVal;
            }, {});
            instance.current
              .makeIntersection(
                JSON.parse(JSON.stringify(result)),
                primers.length === 0 ? Object.keys(baseData) : primers
              )
              .then((result) => {
                console.log(
                  `Time taken for creating combined data: ${(
                    performance.now() - start
                  ).toFixed(5)} milliseconds`
                );
                setCombinedBase(result[0]);
                setCombinedName(result[1]);
              });
          });
      },
      500
    ),
    []
  );
  const updateCombinedLine = React.useCallback(
    debounce(
      (
        combinedBase,
        combinedName,
        pType,
        countries,
        miss,
        miss3,
        match,
        dbActual,
        useCum,
        lookBack
      ) => {
        let start = performance.now();

        instance.current
          .getCombinedLineData(
            makeBaseGraphData({ [combinedName]: combinedBase }),
            [combinedName] || [],
            dateRange.current,
            pType,
            countries,
            miss,
            miss3,
            match,
            dbActual,
            useCum,
            lookBack
          )
          .then((result) => {
            setLineCombinedData(result);
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
    setDaysBetweenComparison(lookBack === 0 ? 1 : lookBack);
  }, [lookBack]);

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

  React.useEffect(() => {
    setIsProcessing(true);
    updateTableData(
      primers,
      pType,
      countries,
      miss,
      miss3,
      match,
      timeFrameBrush
    );
  }, [
    updateTableData,
    primers,
    pType,
    countries,
    miss,
    miss3,
    match,
    timeFrameBrush,
  ]);

  React.useEffect(() => {
    if (result.current.length !== 0) {
      setIsProcessingGraphs(true);
      updateLineData({
        primers: primers,
        pType: pType,
        countries: countries,
        miss: miss,
        miss3: miss3,
        match: match,
        useCum: useCum,
        countryAsTotal: countryAsTotal,
        lookBack: lookBack,
      });
    }
  }, [
    updateLineData,
    primers,
    pType,
    countries,
    miss,
    miss3,
    match,
    useCum,
    countryAsTotal,
    lookBack,
  ]);

  React.useEffect(() => {
    if (result.current.length !== 0) {
      updateBarData(
        lineData,
        timeFrameBrush,
        daysBetweenComparison,
        numberOfBars
      );
    }
  }, [
    updateBarData,
    lineData,
    timeFrameBrush,
    daysBetweenComparison,
    numberOfBars,
  ]);

  const modalData = React.useMemo(
    () =>
      showModal
        ? tableDataset.filter((value) => {
            let isSameDate = true;
            let isWithinFrame = true;
            let isPrimer = true;
            let isCountry = true;
            if (modalInfo["date"] !== null) {
              isSameDate = value.date === modalInfo[0];
            }
            if (
              modalInfo["lookBack"] !== null ||
              modalInfo["lookBack"] !== -1
            ) {
              const selectedDate = new Date(modalInfo["date"]);
              const startDate = new Date(selectedDate);
              startDate.setDate(startDate.getDate() - modalInfo["lookBack"]);
              isWithinFrame =
                value.date >= startDate.toISOString().slice(0, 10) &&
                value.date <= modalInfo["date"];
            }
            if (modalInfo["primer"] !== null) {
              isPrimer = value.primer === modalInfo["primer"];
            }
            if (modalInfo["country"] !== null) {
              isCountry = value.ISO_A3 === modalInfo["country"];
            }
            return (isSameDate || isWithinFrame) && isPrimer && isCountry;
          })
        : [],
    [showModal, tableDataset, modalInfo]
  );

  React.useEffect(() => {
    if (baseTableData.current.length !== 0) {
      updateCombinedData(primers, pType, countries, miss, miss3, match, []);
    }
  }, [updateCombinedData, primers, pType, countries, miss, miss3, match]);

  React.useEffect(() => {
    if (combinedBase.length !== 0) {
      updateCombinedLine(
        combinedBase,
        combinedName,
        pType,
        countries,
        miss,
        miss3,
        match,
        dbActual,
        useCum,
        lookBack
      );
    }
  }, [
    updateCombinedLine,
    combinedBase,
    combinedName,
    pType,
    countries,
    miss,
    miss3,
    match,
    dbActual,
    useCum,
    lookBack,
  ]);
  React.useEffect(() => {
    if (combinedBase.length !== 0) {
      instance.current
        .filterTable({
          baseTableData: combinedBase,
          timeFrameBrush: timeFrameBrush,
        })
        .then((result) => {
          setTableCombined(result);
        });
    }
  }, [combinedBase, timeFrameBrush]);

  if (result.current.length !== 0) {
    const endDate = new Date(
      timeFrameBrush[1] || dateRange.current[dateRange.current.length - 1]
    );
    const startDate = new Date(
      timeFrameBrush[1] || dateRange.current[dateRange.current.length - 1]
    );
    startDate.setDate(startDate.getDate() - lookBack);
    return (
      <div className="display-page">
        <Container>
          <ItemFilters
            baseData={baseData.current}
            dateRange={dateRange.current}
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
            isProcessing={isProcessing || isProcessingGraphs}
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
            data={tableDataset}
            columns={overviewColumns}
            isCombined={false}
            isCollapsable={true}
            className="mb-5"
          />
          <Row className="mb-5">
            <Col
              xs={12}
              lg={
                primers.length === 1 ||
                Object.keys(baseData.current).length === 1
                  ? 6
                  : 12
              }
            >
              <LineGraph
                title={"Genomes with mutation"}
                title2={"Genomes with mutation in 3' end"}
                data={lineData}
                primers={
                  primers.length === 0 ? Object.keys(baseData.current) : primers
                }
                dates={dateRange.current}
                setPrimers={setPrimers}
                timeFrameBrush={timeFrameBrush}
                setTimeFrameBrush={setTimeFrameBrush}
                showModal={showModalCb}
                setModalInfo={setModalInfo}
              />
            </Col>
            {primers.length === 1 ||
            Object.keys(baseData.current).length === 1 ? (
              <Col xs={12} lg={6}>
                <MapWithToolTip
                  title={"Map of Virus Missed"}
                  subtitle={
                    !useCum
                      ? `From ${startDate
                          .toISOString()
                          .slice(0, 10)} to ${endDate
                          .toISOString()
                          .slice(0, 10)}`
                      : "Cumulative"
                  }
                  data={tableDataset}
                  lookBack={!useCum ? lookBack : -1}
                  db={dbActual}
                  timeFrameBrush={timeFrameBrush}
                  setTimeFrameBrush={setTimeFrameBrush}
                  showModal={showModalCb}
                  setModalInfo={setModalInfo}
                />
              </Col>
            ) : null}
          </Row>
          {isBar ? (
            <BarGraph
              title={"Genomes with mutation"}
              title2={"Percent of genomes with mutation in 3' end"}
              data={barData}
              showAbsDiff={showAbsDiff}
              className="mb-5"
            />
          ) : null}
          <Collapse in={combinedBase.length !== 0}>
            <div>
              <Row className="mb-5">
                <Col xs={12} lg={6}>
                  <LineGraph
                    title={"Genomes with mutation (Combined)"}
                    title2={"Genomes with mutation in 3' end (Combined)"}
                    data={lineCombinedData}
                    primers={
                      primers.length === 0
                        ? [Object.keys(baseData.current).join(", ")]
                        : [primers.join(", ")]
                    }
                    dates={dateRange.current}
                    setPrimers={setPrimers}
                    timeFrameBrush={timeFrameBrush}
                    setTimeFrameBrush={setTimeFrameBrush}
                    showModal={showModalCb}
                    setModalInfo={setModalInfo}
                  />
                </Col>
                <Col xs={12} lg={6}>
                  <MapWithToolTip
                    title={"Map of Virus Missed (Combined)"}
                    subtitle={
                      !useCum
                        ? `From ${startDate
                            .toISOString()
                            .slice(0, 10)} to ${endDate
                            .toISOString()
                            .slice(0, 10)}`
                        : "Cumulative"
                    }
                    data={tableCombined}
                    lookBack={!useCum ? lookBack : -1}
                    db={dbActual}
                    timeFrameBrush={timeFrameBrush}
                    setTimeFrameBrush={setTimeFrameBrush}
                    showModal={showModalCb}
                    setModalInfo={setModalInfo}
                  />
                </Col>
              </Row>
              <DataTable
                title={"Missed Viruses (Combined)"}
                data={tableCombined}
                columns={combinedCols}
                isCombined={true}
                isCollapsable={true}
                className="mb-5"
              />
            </div>
          </Collapse>
        </Container>
        <Modal
          show={showModal}
          onHide={closeModalCb}
          dialogClassName="modal-90w"
          aria-labelledby="missed-details-modal"
        >
          <Modal.Header closeButton id="missed-details-modal">
            <Modal.Title>Missed Viruses</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <DataTable
              id="detail-table"
              title={""}
              data={modalData}
              columns={overviewColumns}
              isCombined={false}
              isCollapsable={false}
              className="mb-5"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModalCb}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }

  return <InputData />;
};

export default ResultPage;

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

function makeBaseGraphData(baseData) {
  /**
   * Converts the incoming {primerName: Missed virus} to
   * {primerName: Date: Missed Virus}
   *
   * @param {Object} baseData: contains the primerDetails
   * @returns {Object}: Mapping from {primerName: Date: Missed Virus}
   */

  const toReturn = {};
  for (const primerName of Object.keys(baseData)) {
    const result = {};
    for (const details of baseData[primerName]) {
      const toAdd = result[details.date] || [];
      toAdd.push(addName(primerName)(details));
      result[details.date] = toAdd;
    }
    toReturn[primerName] = result;
  }
  return toReturn;
}

function makeTableData(primerDetails) {
  /**
   * Converts all the incoming data into a table format for subsequent data structure to be built off
   * @param {Object} primerDetails: contains the primerDetails
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
