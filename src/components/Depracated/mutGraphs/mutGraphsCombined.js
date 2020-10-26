import React from "react";
import ReactEcharts from "echarts-for-react";
import { debounce } from "../../util";

const MutGraphsCombined = ({
  data,
  dates,
  setTimeFrameBrush,
  timeFrameBrush,
}) => {
  function getMutationPlot(data, name, dataPlots, xIndex, yIndex) {
    const plots = [];
    for (const dataPlot of dataPlots) {
      plots.push({
        name: `${name}`,
        type: "line",
        hoverAnimation: false,
        xAxisIndex: xIndex,
        yAxisIndex: yIndex,
        data: data
          .filter((item) => {
            return item.name === name;
          })
          .map((item) => item[dataPlot]),
        // symbolSize: 8,
        // encode: {
        //   x: "date",
        //   y: "mutation_pct",
        // },
        // dimensions: [{ name: "mutation_pct", type: "float" }],
      });
    }
    return plots;
  }
  function getDateIndex(date, dates) {
    if (date === undefined) return undefined;
    const index = dates.findIndex((val) => {
      const dateString = date.toISOString().slice(0, 10);
      return dateString === val;
    });
    return index;
  }
  const startIndex =
    ((getDateIndex(timeFrameBrush[0], dates) || 0) * 100) / dates.length;
  const endIndex =
    ((getDateIndex(timeFrameBrush[1], dates) || dates.length) * 100) /
    dates.length;

  const plotNames = ["mutation", "mutation3_pct"];
  const plot = getMutationPlot(
    data,
    (data[0] || { name: "Empty" }).name,
    plotNames,
    0,
    0
  );

  console.log("plot :>> ", plot);
  const option = {
    title: {
      text: "Combined Mutation Overview",
      subtext: "Something here",
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        animation: false,
      },
      position: function (pos, params, el, elRect, size) {
        var obj = { top: 10 };
        obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
        return obj;
      },
    },
    legend: {
      data: plotNames,
      top: 10,
      right: 10,
    },
    // toolbox: {
    //   feature: {
    //     dataZoom: {
    //       yAxisIndex: "none",
    //     },
    //     restore: {},
    //     saveAsImage: {},
    //   },
    // },
    dataZoom: [
      {
        type: "slider",
        show: true,
        realtime: true,
        start: startIndex,
        end: endIndex,
        top: "87%",
      },
      {
        type: "inside",
        realtime: true,
        start: startIndex,
        end: endIndex,
      },
    ],
    grid: [{ left: "10%", top: "20%" }],
    xAxis: [
      {
        name: "date",
        gridIndex: 0,
        type: "category",
        data: dates,
      },
    ],
    yAxis: [
      {
        name: "Mutation (%)",
        gridIndex: 0,
      },
    ],
    series: [...plot],
  };

  const seeEvent = (e) => {
    console.log(e);
  };

  function legendChange({ selected }) {
    console.log("selected :>> ", selected);
  }

  const dataZoomChange = debounce((e) => {
    let data = e;
    if (e.batch !== undefined) {
      data = e.batch[0];
    }

    const startIndex = Math.floor((dates.length * data.start) / 100);
    const endIndex = Math.floor((dates.length * data.end) / 100);
    const startStringDate = dates[startIndex] || dates[0];
    const endStringDate = dates[endIndex] || dates[dates.length - 1];
    let startDate = new Date(startStringDate);
    let endDate = new Date(endStringDate);
    startDate.setDate(startDate.getDate());
    endDate.setDate(endDate.getDate());
    console.log("startDate endDate :>> ", startDate, endDate);
    setTimeFrameBrush([startDate, endDate]);
  }, 800);

  let onEvents = {
    click: seeEvent,
    legendselectchanged: legendChange,
    dataZoom: dataZoomChange,
  };

  return (
    <ReactEcharts
      option={option}
      style={{ height: "250px", width: "100%" }}
      onEvents={onEvents}

      // // notMerge={true}
      // // lazyUpdate={true}
      // // theme={"theme_name"}
      // // onChartReady={this.onChartReadyCallback}
      // // opts={}
    />
  );
};

export default MutGraphsCombined;
