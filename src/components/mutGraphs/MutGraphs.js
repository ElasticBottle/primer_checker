import React from "react";
import ReactEcharts from "echarts-for-react";
import { debounce } from "../util";

const MutGraphs = ({
  data,
  primers,
  dates,
  setPrimers,
  setTimeFrameBrush,
  timeFrameBrush,
  isBar,
}) => {
  function getMutationPlot(data, primers, dataPlot, xIndex, yIndex) {
    const plots = [];
    for (const primer of primers) {
      plots.push({
        name: `${primer}`,
        type: "line",
        hoverAnimation: false,
        xAxisIndex: xIndex,
        yAxisIndex: yIndex,
        data: data
          .filter((item) => {
            return item.name === primer;
          })
          .map((item) => item[dataPlot]),
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

  const mutationPlot = getMutationPlot(data, primers, "mutation_pct", 0, 0);
  const mutation3Plot = getMutationPlot(data, primers, "mutation3_pct", 1, 1);

  console.log("mutationPlot :>> ", mutationPlot);
  const option = isBar
    ? {
        title: {
          text: "Mutation Overview",
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
      }
    : {
        title: {
          text: "Mutation Overview",
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
          data: primers,
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
        axisPointer: {
          link: { xAxisIndex: "all" },
        },
        dataZoom: [
          {
            type: "slider",
            show: true,
            realtime: true,
            start: startIndex,
            end: endIndex,
            xAxisIndex: [0, 1],
            top: "92%",
          },
          {
            type: "inside",
            realtime: true,
            start: startIndex,
            end: endIndex,
            xAxisIndex: [0, 1],
          },
        ],
        grid: [{ bottom: "60%" }, { top: "57%" }],
        xAxis: [
          {
            name: "date",
            gridIndex: 0,
            type: "category",
            data: dates,
          },
          {
            name: "date",
            gridIndex: 1,
            type: "category",
            data: dates,
          },
        ],
        yAxis: [
          {
            name: "Overall Mutation (%)",
            gridIndex: 0,
          },
          {
            gridIndex: 1,
            name: "Mutation in 3' end (%)",
          },
        ],
        series: [...mutationPlot, ...mutation3Plot],
      };

  const seeEvent = (e) => {
    console.log(e);
  };

  function legendChange({ selected }) {
    const primers = [];
    for (const primer of Object.keys(selected)) {
      if (selected[primer]) {
        primers.push(primer);
      }
    }
    setPrimers(primers);
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
      style={{ height: "450px", width: "100%" }}
      onEvents={onEvents}

      // // notMerge={true}
      // // lazyUpdate={true}
      // // theme={"theme_name"}
      // // onChartReady={this.onChartReadyCallback}
      // // opts={}
    />
  );
};

export default MutGraphs;
