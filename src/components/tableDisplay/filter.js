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
  isHelpOn = true,
}) {
  const count = preGlobalFilteredRows.length;
  const [value, setValue] = React.useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

  return (
    <div className="general-search">
      <Form.Row>
        <Form.Label column sm={12} lg={2}>
          General Search
        </Form.Label>
        <Col sm={12} lg={10}>
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
      {isHelpOn ? (
        <Form.Row>
          <Form.Label column sm={0} lg={2}></Form.Label>
          <Col sm={12} lg={10}>
            <Form.Text className="text-muted">
              This does not affect plot data. If you want to set filters, set
              the options above.
            </Form.Text>
          </Col>
        </Form.Row>
      ) : null}
    </div>
  );
}

// This is a custom UI for our 'between' or number range
// filter. It uses two number boxes and filters rows to
// ones that have values between the two
// export function NumberRangeFilter({
//   column: { filterValue = [], preFilteredRows, setFilter, id, Header },
// }) {
//   const [min, max] = React.useMemo(() => {
//     let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
//     let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
//     preFilteredRows.forEach((row) => {
//       min = Math.min(row.values[id], min);
//       max = Math.max(row.values[id], max);
//     });
//     return [min, max];
//   }, [id, preFilteredRows]);
//   const debounceFilter = useAsyncDebounce((val) => {
//     setFilter((old = []) => [val ? parseInt(val, 10) : undefined, old[1]]);
//   }, 200);

//   return (
//     <Form className="filter">
//       <Form.Row>
//         <Col>
//           <Form.Control
//             as="input"
//             value={filterValue[0] || ""}
//             type="number"
//             onChange={(e) => {
//               const val = e.target.value;
//               debounceFilter(val);
//             }}
//             placeholder={`Min (${min})`}
//             size="sm"
//             min={0}
//             max={200}
//           />
//         </Col>
//         <Col>
//           <Form.Control
//             value={filterValue[1] || ""}
//             type="number"
//             onChange={(e) => {
//               const val = e.target.value;
//               setFilter((old = []) => [
//                 old[0],
//                 val ? parseInt(val, 10) : undefined,
//               ]);
//             }}
//             placeholder={`Max (${max})`}
//             size="sm"
//           />
//         </Col>
//       </Form.Row>
//     </Form>
//   );
// }

// Define a default UI for filtering
// export function CountryColumnFilter({
//   column: { filterValue, preFilteredRows, setFilter },
// }) {
//   //   const count = preFilteredRows.length;

//   return (
//     <Form.Control
//       className="filter"
//       value={filterValue || ""}
//       onChange={(e) => {
//         setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
//       }}
//       placeholder={`Filter Country`}
//     />
//   );
// }

// // This is a custom filter UI for selecting
// // a unique option from a list
// export function SelectColumnFilter({
//   column: { filterValue, setFilter, preFilteredRows, id, Header },
// }) {
//   // Calculate the options for filtering
//   // using the preFilteredRows
//   const options = React.useMemo(() => {
//     const unique = new Set();
//     preFilteredRows.forEach((row) => {
//       unique.add(row.values[id]);
//     });
//     const options = [...unique.values()].map((val) => {
//       return { value: val, label: val };
//     });
//     return [{ value: "", label: "All" }, ...options];
//   }, [id, preFilteredRows]);

//   // Render a multi-select box
//   return (
//     <SelectDropdown
//       onChange={(e) => {
//         const toFilter = e || [];
//         const isAll = toFilter.find((val) => val.value === "");
//         if (isAll || toFilter.length === 0) {
//           setFilter(undefined);
//         } else {
//           const selection = toFilter.map((val) => val.value);
//           setFilter(selection);
//         }
//       }}
//       options={options}
//       defaultValue={[]}
//     />
//   );
// }

// This is a custom filter UI that uses a
// slider to set the filter value between a column's
// min and max values
// function SliderColumnFilter({
//   column: { filterValue, setFilter, preFilteredRows, id },
// }) {
// Calculate the min and max
// using the preFilteredRows

//   const [min, max] = React.useMemo(() => {
//     let min = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
//     let max = preFilteredRows.length ? preFilteredRows[0].values[id] : 0;
//     preFilteredRows.forEach((row) => {
//       min = Math.min(row.values[id], min);
//       max = Math.max(row.values[id], max);
//     });
//     return [min, max];
//   }, [id, preFilteredRows]);

//   return (
//     <>
//       <input
//         className="filter"
//         type="range"
//         min={min}
//         max={max}
//         value={filterValue || min}
//         onChange={(e) => {
//           setFilter(parseInt(e.target.value, 10));
//         }}
//       />
//       <button onClick={() => setFilter(undefined)}>Off</button>
//     </>
//   );
// }

// Define a custom filter filter function!
// function filterGreaterThan(rows, id, filterValue) {
//   return rows.filter((row) => {
//     const rowValue = row.values[id];
//     return rowValue >= filterValue;
//   });
// }
// export function filterContains(rows, id, filterValue) {
//   return rows.filter((row) => {
//     if (filterValue === undefined) {
//       return true;
//     }
//     const rowValue = row.values[id];
//     return filterValue.includes(rowValue);
//   });
// }

// This is an autoRemove method on the filter function that
// when given the new filter value and returns true, the filter
// will be automatically removed. Normally this is just an undefined
// check, but here, we want to remove the filter if it's not a number
// filterGreaterThan.autoRemove = (val) => typeof val !== "number";

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
