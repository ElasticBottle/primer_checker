import React from "react";
import {
  usePagination,
  useTable,
  useFilters,
  useGlobalFilter,
} from "react-table";
import BTable from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { CSVLink } from "react-csv";

import "./tableDisplay.css";

import {
  GlobalFilter,
  DefaultNumberRangeColumnFilter,
  CountryColumnFilter,
  SelectColumnFilter,
} from "./filter.js";

function TableDisplay({ data }) {
  //   const memoizedData = React.useMemo(() => data);
  const columns = React.useMemo(
    () => [
      {
        Header: "Primer",
        accessor: "primer",
        Filter: SelectColumnFilter,
        filter: "includes",
      },
      {
        Header: "Accession ID",
        accessor: "accession_id", // accessor is the "key" in the data
        disableFilters: true,
      },
      {
        Header: "Virus Name",
        accessor: "virus_name",
        disableFilters: true,
      },
      {
        Header: "Diagram",
        accessor: "match_diag",
        disableFilters: true,
      },
      {
        Header: "Primer Type",
        accessor: "type",
        Filter: SelectColumnFilter,
        filter: "includes",
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
      },
      {
        Header: "Location",
        accessor: "country_name",
        Filter: CountryColumnFilter,
        filter: "text",
      },
    ],
    []
  );

  const headers = columns.map((header) => {
    return { label: header.Header, key: header.accessor };
  });
  headers.push(
    ...[
      {
        label: "ISO A3",
        key: "ISO_A3",
      },
      {
        label: "Virus Match Index (Start, End)",
        key: "virus_match_idx",
      },
      {
        label: "Primer Match Index (Start, End)",
        key: "query_match_idx",
      },
    ]
  );

  const filterTypes = React.useMemo(
    () => ({
      // Or, override the default text filter to use
      // "startWith"
      text: (rows, id, filterValue) => {
        return rows.filter((row) => {
          const rowValue = row.values[id];
          return rowValue !== undefined
            ? String(rowValue)
                .toLowerCase()
                .startsWith(String(filterValue).toLowerCase())
            : true;
        });
      },
    }),
    []
  );

  const defaultColumn = React.useMemo(
    () => ({
      // Let's set up our default Filter UI
      Filter: DefaultNumberRangeColumnFilter,
      filter: "between",
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,

    // pagination details
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },

    // filtering details
    state,
    // visibleColumns,
    preGlobalFilteredRows,
    setGlobalFilter,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
      defaultColumn,
      filterTypes,
    },
    useFilters, // useFilters!
    useGlobalFilter, // useGlobalFilter!
    usePagination
  );

  return (
    <Container>
      <h2 className="table-title">Overview of Missed Viruses</h2>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
      />
      <BTable
        {...getTableProps()}
        variant="light"
        //   size="lg"
        responsive
        striped
        bordered
        hover
      >
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()} className="table-header">
                  {column.render("Header")}
                  <div>{column.canFilter ? column.render("Filter") : null}</div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  console.log(cell);

                  if (cell.column.id === "match_diag") {
                    const display_str = cell.value
                      .split(" ")
                      .map((val, idx) => {
                        return val.split("");
                      });
                    return (
                      <td
                        {...cell.getCellProps()}
                        className="table-cell match-diag"
                      >
                        <div>
                          {display_str[0].map((val, idx) => {
                            return (
                              <span key={idx} className={val}>
                                {val}
                              </span>
                            );
                          })}
                        </div>
                        <span>
                          {display_str[1].map((val, idx) => {
                            return (
                              <span key={idx} className={val}>
                                {val}
                              </span>
                            );
                          })}
                        </span>
                        <div>
                          {display_str[2].map((val, idx) => {
                            return (
                              <span key={idx} className={val}>
                                {val}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td {...cell.getCellProps()} className="table-cell">
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </BTable>
      <Row className="pagination">
        <Col className="page-controls" sm={12} md={4}>
          <Button
            variant="light"
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            {"<<"}
          </Button>
          <Button
            variant="light"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            {"<"}
          </Button>
          <Button
            variant="light"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            {">"}
          </Button>
          <Button
            variant="light"
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            {">>"}
          </Button>
          <p>
            {" "}
            Page <strong>{pageIndex + 1} </strong> of{" "}
            <strong>{pageOptions.length}</strong>
          </p>
        </Col>
        <Col className="manual-page-selection" sm={12} md={4}>
          <InputGroup>
            <InputGroup.Prepend>
              <InputGroup.Text id="page-info">Go to page:</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                gotoPage(page);
              }}
              aria-label="Go To Page"
              aria-describedby="page-info"
            />
          </InputGroup>
        </Col>
        <Col className="results-per-page" sm={12} md={4}>
          <Form.Control
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
            as="select"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </Form.Control>
        </Col>
      </Row>
      <Row>
        <CSVLink
          data={data}
          headers={headers}
          filename={"sensitivity_miss.csv"}
          className="btn btn-dark"
          target="_blank"
        >
          Download Table
        </CSVLink>
      </Row>
    </Container>
  );
}
export default TableDisplay;
