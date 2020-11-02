import React from "react";
import Button from "react-bootstrap/Button";
import Collapse from "react-bootstrap/Collapse";
import Col from "react-bootstrap/Col";

function FilterGroup({
  title,
  groupId,
  buttonText,
  component,
  variant = "light",
  isOpen = false,
}) {
  const [show, setShow] = React.useState(isOpen);
  return (
    <Col>
      <Button
        onClick={() => {
          setShow(!show);
        }}
        className="show-group mb-3 mt-3"
        aria-controls={groupId}
        aria-expanded={show}
        variant={variant}
      >
        {show
          ? `${String.fromCodePoint(parseInt("25BC", 16))} ${buttonText}`
          : `> ${buttonText}`}
      </Button>
      <Collapse in={show}>
        <div>{component}</div>
      </Collapse>
    </Col>
  );
}
export default FilterGroup;
