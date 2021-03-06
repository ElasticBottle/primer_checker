import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import ReactTooltip from "react-tooltip";
import { useHistory } from "react-router-dom";
import { AiOutlineQuestionCircle, AiTwotoneCalendar } from "react-icons/ai";
import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import Select from "react-select";
import makeAnimated from "react-select/animated";

import SelectDropdown from "../selectDropdown/selectDropdown";
import NumberRangeFilter from "./minMaxFilter";
import FilterGroup from "./filterGroup";
import "./itemFilter.css";

const help = {
  miss:
    "Sets the min and max number of mutations in primer region to be consider a mutation",
  miss3:
    "Sets the min and max number of mutations in the 3' end (last 5 nucleotides) of the virus sequence to be considered a mutation",
  match:
    "Sets the min and max percentage of match for a virus sequence to be considered a mutation",
  primer: "Select the primers to display",
  mutationType: "Choose what kind of mutations to display",
  pType: "Select which part of the primer to display",
  country:
    "Selects the countries to display. Total will be over selected countries then. To change, check extra settings",
  absDiff:
    "Show the difference from the current bar and the previous bar if enable (The last bar will be compared against another bar off charts)",
  daysBetweenCompare: "Sets the number of day which constitutes a bar",
  numBars: "Sets the number of bars to be displayed",
  barCum:
    "If enabled, uses all visible data to plot bars. Disables Absolute Difference",
  countryTotal:
    "Sets whether selected country will be used as total or all submission within said time frame will be used as total",
  cumulative:
    "Divides daily mutation count by total number of submissions thus far",
  lookBack:
    "Sets the number of days to be used when aggregating the number of submissions and mutations",
  date: "Selects the dates of interest.",
};

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
}) => {
  return (
    <Row>
      <Col className="mb-3 pr-lg-0 " xs={12} lg={4}>
        <InputGroup size="sm" className="">
          <InputGroup.Prepend>
            <InputGroup.Text>
              Total Mutation
              <AiOutlineQuestionCircle className="pl-1" data-tip={help.miss} />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <NumberRangeFilter
            data={baseData}
            minVal={0}
            maxVal={100}
            step={1}
            value={miss}
            setFilter={setMiss}
            id="misses"
          />
        </InputGroup>
      </Col>

      <Col className="mb-3 pr-lg-0 pl-lg-0" xs={12} lg={4}>
        <InputGroup size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text>
              Mutation in 3' End
              <AiOutlineQuestionCircle className="pl-1" data-tip={help.miss3} />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <NumberRangeFilter
            data={baseData}
            minVal={0}
            maxVal={100}
            step={1}
            value={miss3}
            setFilter={setMiss3}
            id="misses3"
          />
        </InputGroup>
      </Col>
      <Col className="mb-3 pl-lg-0 pr-lg-0" xs={12} lg={4}>
        <InputGroup size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text>
              Homology %
              <AiOutlineQuestionCircle className="pl-1" data-tip={help.match} />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <NumberRangeFilter
            data={baseData}
            minVal={0}
            maxVal={100}
            step={0.01}
            value={match}
            setFilter={setMatch}
            id="match_pct"
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
  barCum,
  setBarCum,
}) => {
  return (
    <Row>
      <Col sm={12} lg={1}>
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
      {/* <Col sm={12} lg={2}>
        <InputGroup className="mb-3" size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text>
              Use Visible Data
              <AiOutlineQuestionCircle
                className="pl-1"
                data-tip={help.barCum}
              />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Switch
            type="checkbox"
            checked={barCum}
            onChange={() => {
              setShowAbsDiff(false);
              setBarCum(!barCum);
            }}
            disabled={!isBar}
          />
        </InputGroup>
      </Col>
      <Col sm={12} lg={2}>
        <InputGroup className="mb-3" size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text>
              Absolute Diff
              <AiOutlineQuestionCircle
                className="pl-1"
                data-tip={help.absDiff}
              />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Switch
            type="checkbox"
            checked={showAbsDiff}
            onChange={() => {
              setBarCum(false);
              setShowAbsDiff(!showAbsDiff);
            }}
            disabled={!isBar}
          />
        </InputGroup>
      </Col>
      <Col sm={12} lg={4}>
        <InputGroup className="mb-3" size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text>
              Days Per Bar
              <AiOutlineQuestionCircle
                className="pl-1"
                data-tip={help.daysBetweenCompare}
              />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            value={daysBetweenComparison.toString()}
            disabled={!isBar || barCum}
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
            <InputGroup.Text>
              Number of bars
              <AiOutlineQuestionCircle
                className="pl-1"
                data-tip={help.numBars}
              />
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            value={numberOfBars.toString()}
            disabled={!isBar || barCum}
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
      </Col> */}
    </Row>
  );
};

const LineGraphSettings = ({
  countryAsTotal,
  setCountryAsTotal,
  useCum,
  setUseCum,
  lookBack,
  setLookBack,
}) => {
  return (
    <Col>
      <Row>
        <Col xs={12} lg={3} className="pr-lg-0 pl-lg-0">
          <InputGroup className="mb-3" size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text htmlFor="cumulative">
                Cumulative
                <AiOutlineQuestionCircle
                  className="pl-1"
                  data-tip={help.cumulative}
                />
              </InputGroup.Text>
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
        <Col xs={12} lg={3} className="pr-lg-0 pl-lg-0">
          <InputGroup className="mb-3" size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text htmlFor="country">
                Selected Countries as Total
                <AiOutlineQuestionCircle
                  className="pl-1"
                  data-tip={help.countryTotal}
                />
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
        <Col xs={12} lg={6} className="pl-lg-0">
          <InputGroup className="mb-3 " size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text>
                Look Back
                <AiOutlineQuestionCircle
                  className="pl-1"
                  data-tip={help.lookBack}
                />
              </InputGroup.Text>
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
    </Col>
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
  dateRange,
  lookBack,
  setLookBack,
  useCum,
  setUseCum,
  variant,
  barCum,
  setBarCum,
  pTypeChange,
  isProcessing,
}) => {
  const dateChange = (e) => {
    console.log("e :>> ", e);
    setTimeFrameBrush((e || []).map((value) => new Date(value)) || []);
  };

  return (
    <Col>
      <Row>
        <Col xs={12} lg={6} className="pr-lg-0">
          <InputGroup className="mb-3 " size="sm">
            <InputGroup.Prepend>
              <InputGroup.Text>
                Date Range
                <AiOutlineQuestionCircle
                  className="pl-1"
                  data-tip={help.date}
                />
              </InputGroup.Text>
            </InputGroup.Prepend>
            <DateRangePicker
              maxDate={new Date(dateRange[dateRange.length - 1])}
              minDate={new Date(dateRange[0])}
              calendarIcon={<AiTwotoneCalendar />}
              onChange={dateChange}
              value={timeFrameBrush.length === 0 ? null : timeFrameBrush}
            />
          </InputGroup>
        </Col>
        <Col xs={12} lg={6}>
          <Row>
            <Col sm={12} lg={5} className="mr-0 pr-lg-0">
              <InputGroup.Text>
                Primer Type
                <AiOutlineQuestionCircle
                  className="pl-1"
                  data-tip={help.pType}
                />
              </InputGroup.Text>
            </Col>
            <Col sm={12} lg={7} className="pl-lg-0">
              <SelectDropdown
                onChange={pTypeChange}
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
            barCum={barCum}
            setBarCum={setBarCum}
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
            useCum={useCum}
            setUseCum={setUseCum}
            lookBack={lookBack}
            setLookBack={setLookBack}
          />
        }
      />
    </Col>
  );
};

const AdvanceFilters = ({
  baseData,
  dateRange,
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
  isBar,
  setIsBar,
  daysBetweenComparison,
  setDaysBetweenComparison,
  numberOfBars,
  setNumberOfBars,
  showAbsDiff,
  setShowAbsDiff,
  barCum,
  setBarCum,
  pTypeChange,
  isProcessing,
}) => {
  const variant = "light";
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
              buttonText={"Adjust Mutation Definition"}
              groupId={"miss-definitions"}
              component={
                <MissDefinition
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
                  variant={variant}
                  setTimeFrameBrush={setTimeFrameBrush}
                  timeFrameBrush={timeFrameBrush}
                  dateRange={dateRange}
                  lookBack={lookBack}
                  setLookBack={setLookBack}
                  useCum={useCum}
                  setUseCum={setUseCum}
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
                  barCum={barCum}
                  setBarCum={setBarCum}
                  pTypeChange={pTypeChange}
                  isProcessing={isProcessing}
                />
              }
            />
          </Row>
        </>
      }
    />
  );
};

function BasicFilters({
  baseData,
  selectionChange,
  setIsProcessing,
  isProcessing,
  setCountries,
  primers,
  setPrimers,
  mutationType,
  setMutationType,
}) {
  const history = useHistory();
  const animatedComponents = makeAnimated();

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

  return (
    <FilterGroup
      isOpen={true}
      variant="light"
      buttonText={"Basic Filters"}
      groupId="basic-settings"
      component={
        <>
          <Row className="mb-3">
            <Col xs={12} lg={6} className="mb-3">
              <Row>
                <Col sm={12} lg={3} className="mr-0 pr-lg-0">
                  <InputGroup.Text>
                    Primers
                    <AiOutlineQuestionCircle
                      className="pl-1"
                      data-tip={help.primer}
                    />
                  </InputGroup.Text>
                </Col>
                <Col sm={12} lg={9} className="pl-lg-0">
                  <SelectDropdown
                    value={primers}
                    onChange={primerChange(setPrimers)}
                    options={React.useMemo(() => {
                      return Object.keys(baseData).map((val) => {
                        return { label: val, value: val };
                      });
                    }, [baseData])}
                    placeholder={"Select Primers to Display"}
                    isLoading={isProcessing}
                  />
                </Col>
              </Row>
            </Col>
            <Col xs={12} lg={6} className="mb-3">
              <Row>
                <Col sm={12} lg={4} className="mr-0 pr-lg-0">
                  <InputGroup.Text>
                    Mutation Type
                    <AiOutlineQuestionCircle
                      className="pl-1"
                      data-tip={help.mutationType}
                    />
                  </InputGroup.Text>
                </Col>
                <Col sm={12} lg={8} className="pl-lg-0">
                  <Select
                    onChange={(e) => {
                      setMutationType(e.value);
                    }}
                    options={React.useMemo(
                      () => [
                        { label: "Mutations anywhere", value: 0 },
                        {
                          label:
                            "One or more mutations in 3' end (within last 5 positions)",
                          value: 1,
                        },
                        {
                          label:
                            "Two or more mutations in 3' end (within last 5 positions)",
                          value: 2,
                        },
                      ],
                      []
                    )}
                    placeholder={"Mutation Type"}
                    isLoading={isProcessing}
                    isSearchable
                    closeMenuOnSelect={true}
                    components={animatedComponents}
                    defaultValue={[
                      { label: "Mutations anywhere", value: mutationType },
                    ]}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col sm={12} lg={2} className="mr-0 pr-lg-0">
              <InputGroup.Text>
                Countries
                <AiOutlineQuestionCircle
                  className="pl-1"
                  data-tip={help.country}
                />
              </InputGroup.Text>
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
        </>
      }
    />
  );
}

const ItemFilters = ({
  baseData,
  dateRange,
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
  barCum,
  setBarCum,
  mutationType,
  setMutationType,
}) => {
  function selectionChange(setSelection) {
    return (selection) => {
      setIsProcessing(true);
      const toFilter = selection || [];
      if (toFilter.length === 0) {
        setSelection(toFilter);
      } else {
        const selection = toFilter.map((val) => {
          if (val.value === val.label) return val.value;
          return val;
        });
        setSelection(selection);
      }
    };
  }

  return (
    <div>
      <Row>
        <BasicFilters
          baseData={baseData}
          selectionChange={selectionChange}
          isProcessing={isProcessing}
          setIsProcessing={setIsProcessing}
          setCountries={setCountries}
          primers={primers}
          setPrimers={setPrimers}
          mutationType={mutationType}
          setMutationType={setMutationType}
        />
      </Row>
      <Row>
        <AdvanceFilters
          baseData={baseData}
          dateRange={dateRange}
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
          barCum={barCum}
          setBarCum={setBarCum}
          isProcessing={isProcessing}
          pTypeChange={selectionChange(setPType)}
        />
      </Row>
      <ReactTooltip html={true}></ReactTooltip>
    </div>
  );
};

export default ItemFilters;
