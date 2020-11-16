import React from "react";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

function NumberRangeFilter({
  data,
  id,
  value,
  minVal,
  maxVal,
  step,
  setFilter,
}) {
  const [min, max] = React.useMemo(() => {
    const primerDetails = Object.values(data);
    const combinedList = primerDetails.reduce((combined, currVal) => {
      combined.push(...currVal);
      return combined;
    }, []);
    let min = combinedList.length ? combinedList[0][id] : 0;
    let max = combinedList.length ? combinedList[0][id] : 0;
    combinedList.forEach((row) => {
      min = Math.min(row[id], min);
      max = Math.max(row[id], max);
    });
    return [min, max];
  }, [data, id]);

  const debounceFilter = (val, isMin) => {
    isMin
      ? setFilter((old = []) => [val, old[1]])
      : setFilter((old = []) => [old[0], val]);
  };

  return (
    <Form className="filter">
      <Form.Row>
        <Col className="pr-md-0" sm={12} md={6} lg={12}>
          <Form.Control
            as="input"
            value={value[0] || ""}
            type="number"
            onChange={(e) => {
              const val = step.isInteger
                ? parseInt(e.target.value, 10) || 0
                : parseFloat(e.target.value || 0);
              debounceFilter(val, true);
            }}
            placeholder={`Min (${min})`}
            size="sm"
            min={minVal}
            max={maxVal}
            step={step}
          />
        </Col>
        <Col className="pr-md-0" sm={12} md={6} lg={12}>
          <Form.Control
            value={value[1] || ""}
            type="number"
            onChange={(e) => {
              const val = step.isInteger
                ? parseInt(e.target.value, 10) || 0
                : parseFloat(e.target.value || 0);
              debounceFilter(val, false);
            }}
            placeholder={`Max (${max})`}
            size="sm"
            min={minVal}
            max={maxVal}
            step={step}
          />
        </Col>
      </Form.Row>
    </Form>
  );
}

export default NumberRangeFilter;
