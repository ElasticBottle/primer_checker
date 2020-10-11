// Code by React-table doc team

import React from "react";
import { useAsyncDebounce } from "react-table";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

// Define a default UI for filtering
export function GlobalFilter({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <>
      <Form.Row>
        <Form.Label column lg={2}>
          General Search
        </Form.Label>
        <Col>
          <Form.Control
            type="text"
            value={value || ""}
            onChange={(e) => {
              setValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={`Search the ${count} entries`}
          />
        </Col>
      </Form.Row>
      <Form.Row>
        <Form.Label column lg={2}></Form.Label>
        <Col>
          <Form.Text className="text-muted">
            This does not affect plot data. If you want to set filters, use the
            filter options under specific headers
          </Form.Text>
        </Col>
      </Form.Row>
    </>
  );
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
export function DefaultNumberRangeColumnFilter({
  column: { filterValue = [], preFilteredRows, setFilter, id },
}) {
  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <Form>
      <Form.Row>
        <Col>
          <Form.Control
            value={filterValue[0] || ""}
            type="number"
            onChange={(e) => {
              const val = e.target.value;
              setFilter((old = []) => [
                val ? parseInt(val, 10) : undefined,
                old[1],
              ]);
            }}
            placeholder={`Min (${min})`}
          />
        </Col>
        <Col>
          <Form.Control
            value={filterValue[1] || ""}
            type="number"
            onChange={(e) => {
              const val = e.target.value;
              setFilter((old = []) => [
                old[0],
                val ? parseInt(val, 10) : undefined,
              ]);
            }}
            placeholder={`Max (${max})`}
          />
        </Col>
      </Form.Row>
    </Form>
  );
}

// Define a default UI for filtering
export function CountryColumnFilter({
  column: { filterValue, preFilteredRows, setFilter },
}) {
  //   const count = preFilteredRows.length;

  return (
    <Form.Control
      value={filterValue || ""}
      onChange={(e) => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Filter Country`}
    />
  );
}

// This is a custom filter UI for selecting
// a unique option from a list
export function SelectColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the options for filtering
  // using the preFilteredRows
  const options = React.useMemo(() => {
    const options = new Set();
    preFilteredRows.forEach((row) => {
      options.add(row.values[id]);
    });
    return [...options.values()];
  }, [id, preFilteredRows]);

  // Render a multi-select box
  return (
    <select
      value={filterValue}
      onChange={(e) => {
        setFilter(e.target.value || undefined);
      }}
    >
      <option value="">All</option>
      {options.map((option, i) => (
        <option key={i} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

// This is a custom filter UI that uses a
// slider to set the filter value between a column's
// min and max values
function SliderColumnFilter({
  column: { filterValue, setFilter, preFilteredRows, id },
}) {
  // Calculate the min and max
  // using the preFilteredRows

  const [min, max] = React.useMemo(() => {
    let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
    preFilteredRows.forEach((row) => {
      min = Math.min(row.values[id], min);
      max = Math.max(row.values[id], max);
    });
    return [min, max];
  }, [id, preFilteredRows]);

  return (
    <>
      <input
        type="range"
        min={min}
        max={max}
        value={filterValue || min}
        onChange={(e) => {
          setFilter(parseInt(e.target.value, 10));
        }}
      />
      <button onClick={() => setFilter(undefined)}>Off</button>
    </>
  );
}

// Define a custom filter filter function!
function filterGreaterThan(rows, id, filterValue) {
  return rows.filter((row) => {
    const rowValue = row.values[id];
    return rowValue >= filterValue;
  });
}

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
filterGreaterThan.autoRemove = (val) => typeof val !== "number";

// function App() {
//   const columns = React.useMemo(
//     () => [
//       {
//         Header: "Name",
//         columns: [
//           {
//             Header: "First Name",
//             accessor: "firstName",
//           },
//           {
//             Header: "Last Name",
//             accessor: "lastName",
//             // Use our custom `fuzzyText` filter on this column
//             filter: "fuzzyText",
//           },
//         ],
//       },
//       {
//         Header: "Info",
//         columns: [
//           {
//             Header: "Age",
//             accessor: "age",
//             Filter: SliderColumnFilter,
//             filter: "equals",
//           },
//           {
//             Header: "Visits",
//             accessor: "visits",
//             Filter: NumberRangeColumnFilter,
//             filter: "between",
//           },
//           {
//             Header: "Status",
//             accessor: "status",
//             Filter: SelectColumnFilter,
//             filter: "includes",
//           },
//           {
//             Header: "Profile Progress",
//             accessor: "progress",
//             Filter: SliderColumnFilter,
//             filter: filterGreaterThan,
//           },
//         ],
//       },
//     ],
//     []
//   );

//   return (
//     <div></div>
//   );
// }
