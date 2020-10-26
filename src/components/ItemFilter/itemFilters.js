import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Collapse from "react-bootstrap/Collapse";
import InputGroup from "react-bootstrap/InputGroup";
import { useHistory } from "react-router-dom";

import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import SelectDropdown from "../selectDropdown/selectDropdown";
import NumberRangeFilter from "./minMaxFilter";

import "./itemFilter.css";

const Switch = ({
  id,
  className,
  checked,
  onChange,
  ariaControls = "",
  ariaExpanded = "",
}) => {
  return (
    <label
      id={id}
      className={`switch ${className}`}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
    >
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  );
};

function getFilterName(colNames) {
  return (id) => {
    const result = colNames.filter((val) => val.accessor === id);
    return result[0].Header;
  };
}
const ItemFilters = ({
  baseData,
  colNames,
  timeFrameBrush,
  setTimeFrameBrush,
  lookBack,
  setLookBack,
  useCum,
  setUseCum,
  miss,
  setMiss,
  miss3,
  setMiss3,
  match,
  setMatch,
  countryAsTotal,
  setCountryAsTotal,
  setCountries,
  primers,
  setPrimers,
  setPType,
  isProcessing,
  setIsProcessing,
  isBar,
  setIsBar,
  daysBetweenComparison,
  setDaysBetweenComparison,
  numberOfBars,
  setNumberOfBars,
  showAbsDiff,
  setShowAbsDiff,
  showDailyGraph,
  setShowDailyGraph,
}) => {
  const history = useHistory();
  const filterHeader = {
    primers: "primer",
    type: "type",
    miss: "misses",
    miss3: "misses3",
    match: "match_pct",
    country: "country_name",
    iso: "ISO_A3",
  };
  const getLabel = getFilterName(colNames);

  const dateChange = (e) => {
    console.log("e :>> ", e);
    setTimeFrameBrush(e || []);
  };

  function primerChange(setSelectedPrimers) {
    return (selection) => {
      setIsProcessing(true);
      const toFilter = selection || [];
      if (toFilter.length === 0) {
        setSelectedPrimers(toFilter);
        history.push(`/results/Overview`);
      } else {
        const selection = toFilter.map((val) => val.value);
        setSelectedPrimers(selection);
        history.push(`/results/${selection.join("&")}`);
      }
    };
  }

  function selectionChange(setSelection) {
    return (selection) => {
      setIsProcessing(true);
      const toFilter = selection || [];
      console.log(selection);
      if (toFilter.length === 0) {
        setSelection(toFilter);
      } else {
        const selection = toFilter.map((val) => {
          if (val.value === val.label) return val.value;
          return val;
        });
        console.log(selection);
        setSelection(selection);
      }
    };
  }

  return (
    <div>
      <Row>
        <Col xs={12} lg={7} className="mb-3">
          <Row>
            <Col sm={12} lg={2} className="mr-0 pr-lg-0">
              <InputGroup.Text>
                {`${getLabel(filterHeader.primers)}`}
              </InputGroup.Text>
            </Col>
            <Col sm={12} lg={10} className="pl-lg-0">
              <SelectDropdown
                value={primers}
                onChange={primerChange(setPrimers)}
                options={React.useMemo(() => {
                  return Object.keys(baseData).map((val) => {
                    return { label: val, value: val };
                  });
                }, [baseData])}
                placeholder={"Select Primer to Display"}
                isLoading={isProcessing}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={5} className="mb-3">
          <Row>
            <Col sm={12} lg={4} className="mr-0 pr-lg-0">
              <InputGroup.Text>
                {`${getLabel(filterHeader.type)}`}
              </InputGroup.Text>
            </Col>
            <Col sm={12} lg={8} className="pl-lg-0">
              <SelectDropdown
                onChange={selectionChange(setPType)}
                options={React.useMemo(
                  () => [
                    { label: "fwd", value: "fwd" },
                    { label: "rev", value: "rev" },
                    { label: "prb", value: "prb" },
                  ],
                  []
                )}
                placeholder={"Specify Type"}
                isLoading={isProcessing}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col className="mb-3 pr-lg-0" xs={12} lg={4}>
          <InputGroup size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text>{`${getLabel(
                filterHeader.miss
              )}`}</InputGroup.Text>
            </InputGroup.Prepend>
            <NumberRangeFilter
              data={baseData}
              minVal={0}
              maxVal={100}
              step={1}
              value={miss}
              setFilter={setMiss}
              id={filterHeader.miss}
            />
          </InputGroup>
        </Col>
        <Col className="mb-3 pr-lg-0 pl-lg-0" xs={12} lg={4}>
          <InputGroup size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text>{`${getLabel(
                filterHeader.miss3
              )}`}</InputGroup.Text>
            </InputGroup.Prepend>
            <NumberRangeFilter
              data={baseData}
              minVal={0}
              maxVal={100}
              step={1}
              value={miss3}
              setFilter={setMiss3}
              id={filterHeader.miss3}
            />
          </InputGroup>
        </Col>
        <Col className="mb-3 pl-lg-0" xs={12} lg={4}>
          <InputGroup size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text>{`${getLabel(
                filterHeader.match
              )}`}</InputGroup.Text>
            </InputGroup.Prepend>
            <NumberRangeFilter
              data={baseData}
              minVal={0}
              maxVal={100}
              step={0.01}
              value={match}
              setFilter={setMatch}
              id={filterHeader.match}
            />
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={5} className="pr-lg-0">
          <InputGroup className="mb-3 " size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text>Date Range</InputGroup.Text>
            </InputGroup.Prepend>
            <DateRangePicker
              onChange={dateChange}
              value={timeFrameBrush.length === 0 ? null : timeFrameBrush}
            />
          </InputGroup>
        </Col>

        <Col xs={12} lg={3} className="pr-lg-0 pl-lg-0">
          <InputGroup className="mb-3" size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text htmlFor="cumulative">
                Daily Submissions as Total
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Switch
              id="cumulative"
              className="use-cumulative"
              checked={!useCum}
              onChange={(e) => {
                setUseCum(!e.target.checked);
              }}
            />
          </InputGroup>
        </Col>

        <Col xs={12} lg={4} className="pl-lg-0">
          <InputGroup className="mb-3 " size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text>Look Back</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              value={lookBack.toString()}
              disabled={useCum}
              as="input"
              type="number"
              min={0}
              max={200}
              step={1}
              onChange={(e) => {
                const val = e.target.value;
                setLookBack(parseInt(val, 10) || 0);
              }}
            />
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12} lg={8} className="mb-3">
          <Row>
            <Col sm={12} lg={2} className="mr-0 pr-lg-0">
              <InputGroup.Text>{`${getLabel(
                filterHeader.country
              )}`}</InputGroup.Text>
            </Col>
            <Col sm={12} lg={10} className="pl-lg-0">
              <SelectDropdown
                className="country-picker"
                onChange={selectionChange(setCountries)}
                options={React.useMemo(() => {
                  const unique = new Set();
                  const options = Object.values(baseData).reduce(
                    (options, currVal) => {
                      const countries = currVal.reduce((countries, virus) => {
                        if (unique.has(virus.country_name)) {
                          return countries;
                        }
                        unique.add(virus.country_name);
                        countries.push({
                          label: virus.country_name,
                          value: virus.ISO_A3,
                        });
                        return countries;
                      }, []);
                      options.push(...countries);
                      return options;
                    },
                    []
                  );
                  return options;
                }, [baseData])}
                placeholder={"Filter Countries"}
                isLoading={isProcessing}
              />
            </Col>
          </Row>
        </Col>

        <Col sm={12} lg={4}>
          <InputGroup className="mb-3" size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text htmlFor="country">
                Selected Countries as Total
              </InputGroup.Text>
            </InputGroup.Prepend>
            <Switch
              id="country"
              className="use-country"
              checked={countryAsTotal}
              onChange={(e) => {
                setCountryAsTotal(e.target.checked);
              }}
            />
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col sm={12} lg={2.5}>
          <InputGroup className="mb-3" size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text>Show Bar Graph</InputGroup.Text>
            </InputGroup.Prepend>
            <Switch
              type="checkbox"
              checked={isBar}
              onChange={() => setIsBar(!isBar)}
              aria-controls="use-bars"
              aria-expanded={isBar}
            />
          </InputGroup>
        </Col>
        <Col sm={12} lg={9.5}>
          <Collapse in={isBar}>
            <div id="use-bars">
              <Row>
                <Col sm={12} lg={4}>
                  <InputGroup className="mb-3" size="sm">
                    <InputGroup.Prepend>
                      <InputGroup.Text>Show Absolute Diff</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Switch
                      type="checkbox"
                      checked={showAbsDiff}
                      onChange={() => setShowAbsDiff(!showAbsDiff)}
                    />
                  </InputGroup>
                </Col>
                <Col sm={12} lg={4}>
                  <InputGroup className="mb-3" size="sm">
                    <InputGroup.Prepend>
                      <InputGroup.Text>Days between Comparison</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      value={daysBetweenComparison.toString()}
                      disabled={!isBar}
                      as="input"
                      type="number"
                      min={1}
                      max={200}
                      step={1}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDaysBetweenComparison(parseInt(val, 10) || 0);
                      }}
                    />
                  </InputGroup>
                </Col>
                <Col sm={12} lg={4}>
                  <InputGroup className="mb-3" size="sm">
                    <InputGroup.Prepend>
                      <InputGroup.Text>Number of bars</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                      value={numberOfBars.toString()}
                      disabled={!isBar}
                      as="input"
                      type="number"
                      min={1}
                      max={20}
                      step={1}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNumberOfBars(parseInt(val, 10) || 0);
                      }}
                    />
                  </InputGroup>
                </Col>
              </Row>
            </div>
          </Collapse>
        </Col>
      </Row>
      <Row>
        <Col sm={12} lg={4}>
          <InputGroup className="mb-3" size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text>Use Daily Count for Map</InputGroup.Text>
            </InputGroup.Prepend>
            <Switch
              type="checkbox"
              checked={showDailyGraph}
              onChange={() => setShowDailyGraph(!showDailyGraph)}
            />
          </InputGroup>
        </Col>
      </Row>
    </div>
  );
};

export default ItemFilters;
