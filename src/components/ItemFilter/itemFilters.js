import React from "react";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import { useHistory } from "react-router-dom";

import DateRangePicker from "@wojtekmaj/react-daterange-picker";
import SelectDropdown from "../selectDropdown/selectDropdown";
import NumberRangeFilter from "./minMaxFilter";

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
  setPrimers,
  setPType,
  isProcessing,
  setIsProcessing,
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
        <Col xs={12} lg={7}>
          <Row>
            <Form.Label column sm={12} lg={2}>
              {`${getLabel(filterHeader.primers)}`}
            </Form.Label>
            <Col sm={12} lg={10}>
              <SelectDropdown
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
        <Col xs={12} lg={5}>
          <Row>
            <Form.Label column sm={12} lg={4}>
              {`${getLabel(filterHeader.type)}`}
            </Form.Label>
            <Col sm={12} lg={8}>
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
        <Col xs={12} lg={4}>
          <Row>
            <Form.Label column sm={12} lg={4}>
              {`${getLabel(filterHeader.miss)}`}
            </Form.Label>
            <Col sm={12} lg={8}>
              <NumberRangeFilter
                data={baseData}
                minVal={0}
                maxVal={100}
                step={1}
                value={miss}
                setFilter={setMiss}
                id={filterHeader.miss}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={4}>
          <Row>
            <Form.Label column sm={12} lg={5}>
              {`${getLabel(filterHeader.miss3)}`}
            </Form.Label>
            <Col sm={12} lg={7}>
              <NumberRangeFilter
                data={baseData}
                minVal={0}
                maxVal={100}
                step={1}
                value={miss3}
                setFilter={setMiss3}
                id={filterHeader.miss3}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={4}>
          <Row>
            <Form.Label column sm={12} lg={5}>
              {`${getLabel(filterHeader.match)}`}
            </Form.Label>
            <Col sm={12} lg={7}>
              <NumberRangeFilter
                data={baseData}
                minVal={0}
                maxVal={100}
                step={0.01}
                value={match}
                setFilter={setMatch}
                id={filterHeader.match}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col xs={12} lg={5}>
          <Row>
            <Form.Label column sm={12} lg={4}>
              Date Range
            </Form.Label>
            <Col sm={12} lg={8}>
              <DateRangePicker
                onChange={dateChange}
                value={timeFrameBrush.length === 0 ? null : timeFrameBrush}
              />
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={3}>
          <Form.Label htmlFor="cumulative">
            Daily submissions as Total
          </Form.Label>
          <input
            type="checkbox"
            id="cumulative"
            className="use-cumulative"
            checked={!useCum}
            onChange={(e) => {
              setUseCum(!e.target.checked);
            }}
          />
        </Col>
        <Col xs={12} lg={4}>
          <Row>
            <Form.Label column sm={12} lg={4}>
              Look Back
            </Form.Label>
            <Col sm={12} lg={8}>
              <Form.Control
                value={lookBack.toString()}
                as="input"
                type="number"
                min={0}
                max={200}
                step={1}
                onChange={(e) => {
                  const val = e.target.value;
                  setLookBack(parseInt(val, 10) || 0);
                }}
                size="sm"
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col sm={12} lg={9}>
          <Row>
            <Form.Label column sm={12} lg={2}>
              {`${getLabel(filterHeader.country)}`}
            </Form.Label>
            <Col sm={12} lg={10}>
              <SelectDropdown
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
        <Col sm={12} lg={3}>
          <Form.Label htmlFor="country">Selected Countries as Total</Form.Label>
          <input
            type="checkbox"
            id="country"
            className="use-country"
            value={countryAsTotal}
            onChange={(e) => {
              setCountryAsTotal(e.target.checked);
            }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default ItemFilters;
