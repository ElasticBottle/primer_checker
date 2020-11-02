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

import FilterGroup from "./filterGroup";
import "./itemFilter.css";

const Switch = ({
  id,
  className,
  checked,
  onChange,
  ariaControls = "",
  ariaExpanded = "",
  disabled = false,
}) => {
  return (
    <label
      id={id}
      className={`switch ${className}`}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="slider round"></span>
    </label>
  );
};

const MissDefinition = ({
  baseData,
  miss,
  setMiss,
  miss3,
  setMiss3,
  match,
  setMatch,
  filterHeader,
  getLabel,
}) => {
  return (
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
  );
};

const BarGraphSettings = ({
  isBar,
  setIsBar,
  daysBetweenComparison,
  setDaysBetweenComparison,
  numberOfBars,
  setNumberOfBars,
  showAbsDiff,
  setShowAbsDiff,
}) => {
  return (
    <Row>
      <Col sm={12} lg={2}>
        <InputGroup className="mb-3" size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text>Show</InputGroup.Text>
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
      <Col sm={12} lg={3}>
        <InputGroup className="mb-3" size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text>Absolute Diff</InputGroup.Text>
          </InputGroup.Prepend>
          <Switch
            type="checkbox"
            checked={showAbsDiff}
            onChange={() => setShowAbsDiff(!showAbsDiff)}
            disabled={!isBar}
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
      <Col sm={12} lg={3}>
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
  );
};

const LineGraphSettings = ({ countryAsTotal, setCountryAsTotal }) => {
  return (
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
  );
};
const GraphMapSetting = ({
  isBar,
  setIsBar,
  daysBetweenComparison,
  setDaysBetweenComparison,
  numberOfBars,
  setNumberOfBars,
  showAbsDiff,
  setShowAbsDiff,
  countryAsTotal,
  setCountryAsTotal,
  setTimeFrameBrush,
  timeFrameBrush,
  lookBack,
  setLookBack,
  useCum,
  setUseCum,
  variant,
}) => {
  const dateChange = (e) => {
    console.log("e :>> ", e);
    setTimeFrameBrush(e || []);
  };

  return (
    <Col>
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
              <InputGroup.Text htmlFor="cumulative">Cumulative</InputGroup.Text>
            </InputGroup.Prepend>
            <Switch
              id="cumulative"
              className="use-cumulative"
              checked={useCum}
              onChange={(e) => {
                setUseCum(e.target.checked);
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
      <FilterGroup
        variant={variant}
        buttonText={"Bar Graph Setting"}
        groupId={"bar-graph-setting"}
        component={
          <BarGraphSettings
            isBar={isBar}
            setIsBar={setIsBar}
            daysBetweenComparison={daysBetweenComparison}
            setDaysBetweenComparison={setDaysBetweenComparison}
            numberOfBars={numberOfBars}
            setNumberOfBars={setNumberOfBars}
            showAbsDiff={showAbsDiff}
            setShowAbsDiff={setShowAbsDiff}
          />
        }
      />
      <FilterGroup
        variant={variant}
        buttonText={"Line Graph Settings"}
        groupId={"line-graph-settings"}
        component={
          <LineGraphSettings
            countryAsTotal={countryAsTotal}
            setCountryAsTotal={setCountryAsTotal}
          />
        }
      />
    </Col>
  );
};

const AdvanceFilters = ({
  baseData,
  filterHeader,
  getLabel,
  isProcessing,
  selectionChange,
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
  setPType,
  isBar,
  setIsBar,
  daysBetweenComparison,
  setDaysBetweenComparison,
  numberOfBars,
  setNumberOfBars,
  showAbsDiff,
  setShowAbsDiff,
}) => {
  const variant = "primary";
  return (
    <FilterGroup
      variant={variant}
      buttonText={"More Settings"}
      groupId="Advance-settings"
      component={
        <>
          <Row>
            <FilterGroup
              variant={variant}
              groupId={"filter-primers"}
              buttonText={"Filter Primer Types"}
              component={
                <Row className="mb-3">
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
              }
            />
          </Row>
          <Row>
            <FilterGroup
              variant={variant}
              buttonText={"Adjust Miss Definition"}
              groupId={"miss-definitions"}
              component={
                <MissDefinition
                  getLabel={getLabel}
                  filterHeader={filterHeader}
                  baseData={baseData}
                  miss={miss}
                  setMiss={setMiss}
                  miss3={miss3}
                  setMiss3={setMiss3}
                  match={match}
                  setMatch={setMatch}
                />
              }
            />
          </Row>
          <Row>
            <FilterGroup
              variant={variant}
              buttonText={"Graph and Map Settings"}
              groupId={"graph-map-setting"}
              component={
                <GraphMapSetting
                  isBar={isBar}
                  setIsBar={setIsBar}
                  daysBetweenComparison={daysBetweenComparison}
                  setDaysBetweenComparison={setDaysBetweenComparison}
                  numberOfBars={numberOfBars}
                  setNumberOfBars={setNumberOfBars}
                  showAbsDiff={showAbsDiff}
                  setShowAbsDiff={setShowAbsDiff}
                  countryAsTotal={countryAsTotal}
                  setCountryAsTotal={setCountryAsTotal}
                  setTimeFrameBrush={setTimeFrameBrush}
                  timeFrameBrush={timeFrameBrush}
                  lookBack={lookBack}
                  setLookBack={setLookBack}
                  useCum={useCum}
                  setUseCum={setUseCum}
                  variant={variant}
                />
              }
            />
          </Row>
        </>
      }
    />
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
        <Col xs={12} lg={6} className="mb-3">
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
        <Col sm={12} lg={6} className="mb-3">
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
      </Row>
      <Row>
        <AdvanceFilters
          baseData={baseData}
          filterHeader={filterHeader}
          getLabel={getLabel}
          isProcessing={isProcessing}
          selectionChange={selectionChange}
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
          setPType={setPType}
          isBar={isBar}
          setIsBar={setIsBar}
          daysBetweenComparison={daysBetweenComparison}
          setDaysBetweenComparison={setDaysBetweenComparison}
          numberOfBars={numberOfBars}
          setNumberOfBars={setNumberOfBars}
          showAbsDiff={showAbsDiff}
          setShowAbsDiff={setShowAbsDiff}
        />
      </Row>
    </div>
  );
};

export default ItemFilters;
