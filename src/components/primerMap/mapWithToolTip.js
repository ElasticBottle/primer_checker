import React from "react";
import ReactTooltip from "react-tooltip";

import PrimerMap from "./primerMap";
import "./primerMap.css";

const MapWithToolTip = ({
  title,
  data,
  db,
  dateRange,
  useCum,
  timeFrameBrush,
  setTimeFrameBrush,
  showModal,
  setModalInfo,
  subtitle = "",
}) => {
  const [tooltipContent, setTooltipContent] = React.useState("");

  return (
    <>
      <PrimerMap
        title={title}
        subtitle={subtitle}
        setTooltipContent={setTooltipContent}
        data={data}
        db={db}
        dateRange={dateRange}
        useCum={useCum}
        timeFrameBrush={timeFrameBrush}
        setTimeFrameBrush={setTimeFrameBrush}
        showModal={showModal}
        setModalInfo={setModalInfo}
      />
      <ReactTooltip html={true}>{tooltipContent}</ReactTooltip>
    </>
  );
};

export default MapWithToolTip;
