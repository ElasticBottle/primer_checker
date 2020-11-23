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
import CombinedLineGraph from "../../components/mutGraphs/combinedLineGraph";
import BarGraphWrapper from "../../components/mutGraphs/barGraphWrapper";
import InLineGraph from "../../components/mutGraphs/inLineGraph";
import MapWithToolTip from "../../components/primerMap/mapWithToolTip";

import worker from "workerize-loader!./dataFilter"; // eslint-disable-line import/no-webpack-loader-syntax

import { debounce, addName, makeBaseGraphData } from "../../components/util";

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
  const [mapDb, setMapDb] = React.useState([]);
  const [tableDataset, setTableDataset] = React.useState([]);
  const [combinedBase, setCombinedBase] = React.useState([]);
  const [combinedName, setCombinedName] = React.useState([]);
  const [tableCombined, setTableCombined] = React.useState([]);

  // Filtering for table and graph data
  const [miss, setMiss] = React.useState(React.useMemo(() => [], []));
  const [miss3, setMiss3] = React.useState(React.useMemo(() => [], []));
  const [match, setMatch] = React.useState(React.useMemo(() => [], []));
  const [timeFrameBrush, setTimeFrameBrush] = React.useState(
    React.useMemo(() => [], [])
  );
  const setTimeFrameCb = React.useCallback(setTimeFrameBrush, []);
  const [countries, setCountries] = React.useState(React.useMemo(() => [], []));
  const [primers, setPrimers] = React.useState(React.useMemo(() => [], []));
  const [pType, setPType] = React.useState(React.useMemo(() => [], []));

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
  const setIsProcessingGraphCb = React.useCallback(setIsProcessingGraphs, []);
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
                primers.length === 0 ? Object.keys(baseData.current) : primers
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

  React.useEffect(() => {
    if (Object.keys(dbCountCum.current).length !== 0)
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
        });
  }, [countries, countryAsTotal, lookBack, useCum]);
  React.useEffect(() => {
    if (Object.keys(dbCountCum.current).length !== 0) {
      if (!useCum) {
        let date1 = new Date(timeFrameBrush[0] || dateRange.current[0]);
        let date2 = new Date(
          timeFrameBrush[1] || dateRange.current[dateRange.current.length - 1]
        );

        // To calculate the time difference of two dates
        let Difference_In_Time = date2.getTime() - date1.getTime();

        // To calculate the no. of days between two dates
        let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
        instance.current
          .getTotalSubmission({
            dbCum: dbCountCum.current,
            dbDaily: dbCountDaily.current,
            dateRange: dateRange.current,
            countries: countries,
            countryAsTotal: countryAsTotal,
            useCum: useCum,
            lookBack: Difference_In_Days,
            separate: true,
          })
          .then((totalSubmission) => {
            setMapDb(totalSubmission);
          });
      }
    }
  }, [countries, countryAsTotal, lookBack, useCum]);

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

  const modalData = React.useMemo(() => {
    if (showModal) {
      console.log("modalInfo :>> ", modalInfo);
      return combinedBase.length === 0
        ? tableDataset.filter((value) => {
            let isSameDate = true;
            let isWithinFrame = true;
            let isPrimer = true;
            let isCountry = true;
            if (modalInfo["date"] !== null) {
              isSameDate = value.date === modalInfo["date"];
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
        : combinedBase.filter((value) => {
            let isSameDate = true;
            let isWithinFrame = true;
            let isPrimer = true;
            let isCountry = true;
            if (modalInfo["date"] !== null) {
              isSameDate = value.date === modalInfo["date"];
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
              isPrimer = value.primer === modalInfo["primer"][0];
            }
            if (modalInfo["country"] !== null) {
              isCountry = value.ISO_A3 === modalInfo["country"];
            }
            return (isSameDate || isWithinFrame) && isPrimer && isCountry;
          });
    } else {
      return [];
    }
  }, [showModal, combinedBase, tableDataset, modalInfo]);

  React.useEffect(() => {
    if (baseTableData.current.length !== 0) {
      updateCombinedData(primers, pType, countries, miss, miss3, match, []);
    }
  }, [updateCombinedData, primers, pType, countries, miss, miss3, match]);

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
    const startDate = new Date(timeFrameBrush[0] || dateRange.current[0]);
    // To calculate the time difference of two dates
    let Difference_In_Time = endDate.getTime() - startDate.getTime();

    // To calculate the no. of days between two dates
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
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
            className="mb-5"
            id="collapse-table"
            title={"Overview of Missed Viruses"}
            data={tableDataset}
            columns={overviewColumns}
            isCombined={false}
            isCollapsable={true}
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
              <InLineGraph
                rawData={baseGraphData.current}
                dateRange={dateRange.current}
                totalSubmission={dbActual}
                setIsProcessingGraphs={setIsProcessingGraphCb}
                primers={
                  primers.length === 0 ? Object.keys(baseData.current) : primers
                }
                pType={pType}
                countries={countries}
                miss={miss}
                miss3={miss3}
                match={match}
                useCum={useCum}
                lookBack={lookBack}
                timeFrameBrush={timeFrameBrush}
                setTimeFrameBrush={setTimeFrameCb}
                showModal={showModalCb}
                setModalInfo={setModalInfo}
                title={"Genomes with mutation"}
                title2={"Genomes with mutation in 3' end"}
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
                  lookBack={!useCum ? Difference_In_Days : -1}
                  db={useCum ? dbCountCum.current : mapDb}
                  timeFrameBrush={timeFrameBrush}
                  setTimeFrameBrush={setTimeFrameBrush}
                  showModal={showModalCb}
                  setModalInfo={setModalInfo}
                />
              </Col>
            ) : null}
          </Row>
          {isBar ? (
            <BarGraphWrapper
              rawData={baseGraphData.current}
              dateRange={dateRange.current}
              totalSubmission={dbActual}
              setIsProcessingGraphs={setIsProcessingGraphCb}
              primers={
                primers.length === 0 ? Object.keys(baseData.current) : primers
              }
              pType={pType}
              countries={countries}
              miss={miss}
              miss3={miss3}
              match={match}
              useCum={useCum}
              lookBack={lookBack}
              timeFrameBrush={timeFrameBrush}
              daysBetweenComparison={daysBetweenComparison}
              numberOfBars={numberOfBars}
              showAbsDiff={showAbsDiff}
              showModal={showModalCb}
              setModalInfo={setModalInfo}
              title={"Genomes with mutation"}
              title2={"Percent of genomes with mutation in 3' end"}
              className="mb-5"
            />
          ) : null}
          <Collapse in={combinedBase.length !== 0}>
            <div>
              <Row className="mb-5">
                <Col xs={12} lg={6}>
                  <CombinedLineGraph
                    combinedBase={combinedBase}
                    combinedName={combinedName}
                    dateRange={dateRange.current}
                    totalSubmission={dbActual}
                    setIsProcessingGraphs={setIsProcessingGraphCb}
                    pType={pType}
                    countries={countries}
                    miss={miss}
                    miss3={miss3}
                    match={match}
                    useCum={useCum}
                    lookBack={lookBack}
                    title={"Genomes with mutation (Combined)"}
                    title2={"Genomes with mutation in 3' end (Combined)"}
                    timeFrameBrush={timeFrameBrush}
                    setTimeFrameBrush={setTimeFrameCb}
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
                    lookBack={!useCum ? Difference_In_Days : -1}
                    db={useCum ? dbCountCum.current : mapDb}
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
              columns={
                combinedBase.length === 0 ? overviewColumns : combinedCols
              }
              downloadFileName={"selected_details.csv"}
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
