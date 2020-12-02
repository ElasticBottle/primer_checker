import React from "react";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
// import { useParams } from "react-router-dom";
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

  // const { display } = useParams();
  // const toDisplay = display.split("&");

  // Data to display
  const [dbActual, setDbActual] = React.useState([]);
  const [tableDataset, setTableDataset] = React.useState([]);
  const [combinedBase, setCombinedBase] = React.useState([]);
  const [combinedName, setCombinedName] = React.useState([]);
  const [tableCombined, setTableCombined] = React.useState([]);
  const [modalData, setModalData] = React.useState([]);

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
  const [showAbsDiff, setShowAbsDiff] = React.useState(false);
  const [barCum, setBarCum] = React.useState(true);

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
        Header: "Total Mutation in Primer Region",
        accessor: "misses",
      },
      {
        Header: "Mutation in Primer Region's 3' End",
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
      {
        Header: "Alpha 3 Code",
        accessor: "ISO_A3",
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
      {
        Header: "Alpha 3 Code",
        accessor: "ISO_A3",
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
    if (showModal) {
      console.log("modalInfo :>> ", modalInfo);
      let primer = modalInfo["isCombined"]
        ? primers.join(", ") === ""
          ? []
          : [primers.join(", ")]
        : primers;
      let date = modalInfo["date"];
      let startDate = null;
      let country = countries;
      let timeFrame = [];
      if (modalInfo["lookBack"] !== null && modalInfo["lookBack"] !== -1) {
        const selectedDate = new Date(modalInfo["date"]);
        startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - modalInfo["lookBack"]);
        timeFrame = [startDate, new Date(date)];
      }
      if (date !== null && startDate === null) {
        timeFrame = [new Date(dateRange.current[0]), new Date(date)];
      }
      if (modalInfo["country"] !== null) {
        country = [{ value: modalInfo["country"] }];
      }
      if (modalInfo["primer"] !== null) {
        primer = [String(modalInfo["primer"])];
      }

      const filterCb = debounce((data) => {
        let start = performance.now();
        instance.current
          .filterTable({
            baseTableData: data,
            primers: primer,
            pType: pType,
            countries: country,
            miss: miss,
            miss3: miss3,
            match: match,
            timeFrameBrush: timeFrame,
          })
          .then((data) => {
            setIsProcessing(false);
            setModalData(data);
            console.log(
              `Time taken for filtering table data: ${(
                performance.now() - start
              ).toFixed(5)} milliseconds`
            );
          });
      }, 500);
      modalInfo["isCombined"]
        ? filterCb(combinedBase)
        : filterCb(baseTableData.current);
    }
  }, [
    primers,
    pType,
    countries,
    miss,
    miss3,
    match,
    showModal,
    combinedBase,
    modalInfo,
  ]);

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
            barCum={barCum}
            setBarCum={setBarCum}
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
                countryAsTotal={countryAsTotal}
                miss={miss}
                miss3={miss3}
                match={match}
                useCum={useCum}
                lookBack={lookBack}
                timeFrameBrush={timeFrameBrush}
                setTimeFrameBrush={setTimeFrameCb}
                showModal={showModalCb}
                setModalInfo={setModalInfo}
                isCombined={false}
                title={"Genomes with mutation"}
                title2={"Genomes with mutation in 3' end"}
              />
            </Col>
            {primers.length === 1 ||
            Object.keys(baseData.current).length === 1 ? (
              <Col xs={12} lg={6}>
                <MapWithToolTip
                  title={"Map of Virus with Mutation in Primer Region"}
                  subtitle={`From ${startDate
                    .toISOString()
                    .slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}`}
                  data={tableDataset}
                  db={dbCountDaily.current}
                  dateRange={dateRange.current}
                  timeFrameBrush={timeFrameBrush}
                  showModal={showModalCb}
                  setModalInfo={setModalInfo}
                  isCombined={false}
                />
              </Col>
            ) : null}
          </Row>
          {isBar ? (
            <BarGraphWrapper
              rawData={tableDataset}
              dateRange={dateRange.current}
              dbDaily={dbCountDaily.current}
              setIsProcessingGraphs={setIsProcessingGraphCb}
              countries={countries}
              countryAsTotal={countryAsTotal}
              useCum={barCum}
              timeFrameBrush={timeFrameBrush}
              daysBetweenComparison={daysBetweenComparison}
              numberOfBars={numberOfBars}
              setNumberOfBars={setNumberOfBars}
              showAbsDiff={showAbsDiff}
              showModal={showModalCb}
              setModalInfo={setModalInfo}
              isCombined={false}
              title={"Genomes with mutation"}
              title2={"Percent of genomes with mutation in 3' end"}
              className="mb-5"
            />
          ) : null}
          <DataTable
            className="mb-5"
            id="collapse-table"
            title={"Overview of Viruses with Mutation in Primer Region"}
            data={tableDataset}
            columns={overviewColumns}
            isCombined={false}
            isCollapsable={true}
          />
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
                    isCombined={true}
                  />
                </Col>
                <Col xs={12} lg={6}>
                  <MapWithToolTip
                    title={
                      "Map of Virus with Mutation in Primer Region (Combined)"
                    }
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
                    db={dbCountDaily.current}
                    dateRange={dateRange.current}
                    useCum={useCum}
                    timeFrameBrush={timeFrameBrush}
                    showModal={showModalCb}
                    setModalInfo={setModalInfo}
                    isCombined={true}
                  />
                </Col>
              </Row>
              <DataTable
                title={"Viruses with Mutation in Primer Region (Combined)"}
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
            <Modal.Title>Viruses with Mutation in Primer Region</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <DataTable
              id="detail-table"
              title={""}
              data={modalData}
              columns={modalInfo["isCombined"] ? combinedCols : overviewColumns}
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
