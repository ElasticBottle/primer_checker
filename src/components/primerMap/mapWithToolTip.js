import React from "react";
import ReactTooltip from "react-tooltip";

import PrimerMap from "./primerMap";
import "./primerMap.css";

const MapWithToolTip = ({
  title,
  data,
  lookBack,
  db,
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
        lookBack={lookBack}
        db={db}
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
