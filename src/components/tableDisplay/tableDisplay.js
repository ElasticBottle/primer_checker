import React from "react";
import {
  usePagination,
  useTable,
  useGlobalFilter,
  useFlexLayout,
  useResizeColumns,
  useSortBy,
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

import { GlobalFilter } from "./filter";

function TableDisplay({ title, data, columns, isCombined }) {
  const csv_headers = columns.map((header) => {
    return { label: header.Header, key: header.accessor };
  });
  if (!isCombined) {
    csv_headers.push(
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
  }

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
      minWidth: 80,
      width: 160,
      maxWidth: 600,
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
    // filteredRows,
    // rows,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 },
      defaultColumn,
      filterTypes,
    },
    // useFilters,
    useGlobalFilter,
    useSortBy,
    usePagination,
    useFlexLayout,
    useResizeColumns
  );

  return (
    <Container>
      <h2 className="table-title">{title}</h2>
      <GlobalFilter
        preGlobalFilteredRows={preGlobalFilteredRows}
        globalFilter={state.globalFilter}
        setGlobalFilter={setGlobalFilter}
      />

      {/* <pre>
        <code>{JSON.stringify(state, null, 2)}</code>
      </pre> */}
      <BTable
        {...getTableProps()}
        variant="light"
        //   size="lg"
        responsive
        striped
        bordered
        hover
      >
        <thead className="thead">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => {
                return (
                  <th {...column.getHeaderProps()} className="table-header">
                    {column.render("Header")}
                    <span {...column.getSortByToggleProps()}>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ` ${String.fromCodePoint(parseInt("25BC", 16))}`
                          : ` ${String.fromCodePoint(parseInt("25B2", 16))}`
                        : ` ${String.fromCodePoint(
                            parseInt("25BC", 16)
                          )}${String.fromCodePoint(parseInt("25B2", 16))}`}
                    </span>
                    {column.canResize && (
                      <div
                        {...column.getResizerProps()}
                        className={`resizer ${
                          column.isResizing ? "isResizing" : ""
                        }`}
                      />
                    )}
                    {/* {column.canFilter ? (
                      <div>{column.render("Filter")}</div>
                    ) : null} */}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="tbody">
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  if (cell.column.id === "match_diag") {
                    const display_str = cell.value.split(" ").map((val) => {
                      return val.split("");
                    });
                    return (
                      <td
                        {...cell.getCellProps()}
                        className="table-cell match-diag"
                      >
                        {display_str.map((val, idx) => {
                          return (
                            <div key={idx}>
                              {val.map((char, idx) => {
                                return (
                                  <span key={idx} className={char}>
                                    {char}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })}
                      </td>
                    );
                  }
                  return (
                    <td
                      {...cell.getCellProps()}
                      className={`table-cell ${
                        cell.column.id === "country_name" ||
                        cell.column.id === "virus_name"
                          ? "text-align-start"
                          : ""
                      }`}
                    >
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          {!canNextPage ? (
            <span className="end-of-data">
              {`---------- All ${preGlobalFilteredRows.length} data displayed ----------`}
            </span>
          ) : null}
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
          headers={csv_headers}
          filename={isCombined ? "combined_miss.csv" : "sensitivity_miss.csv"}
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
