import React from "react";
import ReactTooltip from "react-tooltip";

import PrimerMap from "./primerMap";
import "./primerMap.css";

const MapWithToolTip = ({
  title,
  data,
  db,
  dateRange,
  timeFrameBrush,
  showModal,
  setModalInfo,
  isCombined,
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
        timeFrameBrush={timeFrameBrush}
        showModal={showModal}
        setModalInfo={setModalInfo}
        isCombined={isCombined}
      />
      <ReactTooltip html={true}>{tooltipContent}</ReactTooltip>
    </>
  );
};

export default MapWithToolTip;
