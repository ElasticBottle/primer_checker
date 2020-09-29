import React from "react";
import { usePagination, useTable } from "react-table";
import Table from "react-bootstrap/Table";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { CSVLink } from "react-csv";

import "./tableDisplay.css";

function TableDisplay({ data }) {
  //   const memoizedData = React.useMemo(() => data);
  const columns = React.useMemo(
    () => [
      {
        Header: "Primer",
        accessor: "primer",
      },
      {
        Header: "Accession ID",
        accessor: "accession_id", // accessor is the "key" in the data
      },
      {
        Header: "Virus Name",
        accessor: "virus_name",
      },
      {
        Header: "Diagram",
        accessor: "match_diag",
      },
      {
        Header: "Primer Type",
        accessor: "type",
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
        Header: "Date Submitted",
        accessor: "date",
      },
      {
        Header: "Location",
        accessor: "country_name",
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
        key: "primer_match_idx",
      },
    ]
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
  } = useTable(
    { columns, data, initialState: { pageIndex: 0 } },
    usePagination
  );

  return (
    <Container>
      <h2 className="table-title">Overview of Missed Viruses</h2>
      <Table
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
      </Table>
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
