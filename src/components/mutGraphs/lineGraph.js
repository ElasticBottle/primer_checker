import React from "react";
import ReactEcharts from "echarts-for-react";
import { debounce } from "../util";

const LineGraph = ({
  title,
  data,
  primers,
  dates,
  setPrimers,
  setTimeFrameBrush,
  timeFrameBrush,
  subtitle = "",
}) => {
  function buildDataSet(data) {
    const datasets = [];
    for (const dataset of data) {
      datasets.push({
        dimensions: [
          "countries_considered",
          "date",
          "mutation3_abs",
          "mutation3_pct",
          "mutation_abs",
          "mutation_pct",
          "name",
          "submission_count",
        ],
        source: dataset,
      });
    }
    return datasets;
  }
  function getMutationPlot(primers, dataPlot, xIndex, yIndex) {
    const plots = [];
    for (let i = 0; i < primers.length; i++) {
      plots.push({
        name: `${primers[i]}`,
        type: "line",
        hoverAnimation: false,
        xAxisIndex: xIndex,
        yAxisIndex: yIndex,
        encode: {
          x: "date",
          y: dataPlot,
        },
        datasetIndex: i,
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

  const mutationPlot = getMutationPlot(primers, "mutation_pct", 0, 0);
  const mutation3Plot = getMutationPlot(primers, "mutation3_pct", 1, 1);
  const datasets = buildDataSet(data, primers);
  // console.log("data :>> ", data);
  // console.log("mutationPlot :>> ", mutationPlot);
  // console.log("datasets :>> ", datasets);

  const option = {
    title: {
      text: title,
      subtext: subtitle,
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        animation: false,
      },
      backgroundColor: "rgba(50,50,50, 0.9)",
      formatter: function (params) {
        let baseDetails = params[0].data;
        let date = baseDetails.date;
        let submissionCount = baseDetails.submission_count;

        let tooltip = `<div>Details for ${date}<br/>Total Submissions: ${submissionCount}</div><br/>`;
        for (let i = 0; i < primers.length; i++) {
          tooltip += `<div>params[i].data.name}
            <br/>
            <strong>Abs Mutation:</strong> ${params[i].data.mutation_abs}<br/>
            <strong>Abs Mutation in 3' end:</strong> ${params[i].data.mutation3_abs}<br/>
            <strong>Mutation %:</strong> ${params[i].data.mutation_pct}<br/>
            <strong>Mutation % in 3' end:</strong> ${params[i].data.mutation3_pct}</div><br/>`;
        }
        return tooltip;
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
      },
      {
        name: "date",
        gridIndex: 1,
        type: "category",
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
    dataset: datasets,
    series: [...mutationPlot, ...mutation3Plot],
  };

  const seeEvent = (e) => {
    console.log(e);
  };

  function legendChange({ selected }) {
    // TODO (Eb): Figure out how to handle legend selection
    // const primers = [];
    // for (const primer of Object.keys(selected)) {
    //   if (selected[primer]) {
    //     primers.push(primer);
    //   }
    // }
    // setPrimers(primers);
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
      notMerge={true}
    />
  );
};

export default LineGraph;
