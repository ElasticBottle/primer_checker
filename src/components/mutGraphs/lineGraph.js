import React from "react";
import ReactEcharts from "echarts-for-react";
import { debounce } from "../util";

const LineGraph = ({
  title,
  title2,
  data,
  primers,
  dates,
  setTimeFrameBrush,
  timeFrameBrush,
  showModal,
  setModalInfo,
  subtitle = "",
  subtitle2 = "",
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
    return index === -1 ? undefined : index;
  }
  function getStartDate(dates, date, lookBack) {
    const initDate = new Date(dates[0]);
    let startDate = new Date(date);
    startDate.setDate(startDate.getDate() - lookBack);
    if (startDate < initDate) {
      startDate = initDate;
    }
    return startDate.toISOString().slice(0, 10);
  }

  const startIndex =
    ((getDateIndex(timeFrameBrush[0], dates) || 0) * 100) / dates.length;
  const endIndex =
    ((getDateIndex(timeFrameBrush[1], dates) + 1 || dates.length) * 100) /
    dates.length;

  const mutationPlot = getMutationPlot(primers, "mutation_pct", 0, 0);
  const mutation3Plot = getMutationPlot(primers, "mutation3_pct", 1, 1);
  const datasets = buildDataSet(data, primers);
  // console.log("data :>> ", data);
  // console.log("mutationPlot :>> ", mutationPlot);
  // console.log("datasets :>> ", datasets);

  const option = {
    title: [
      {
        text: title,
        subtext: subtitle,
        left: "center",
      },
      {
        text: title2,
        subtext: subtitle2,
        left: "center",
        top: "center",
      },
    ],
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
        let startDate =
          baseDetails.lookBack === -1
            ? dates[0]
            : getStartDate(dates, date, baseDetails.lookBack);
        let submissionCount = baseDetails.submission_count;
        let countries =
          (baseDetails.countries_considered || []).length === 0
            ? "all available Countries"
            : `${baseDetails.countries_considered.length} countries`;

        let tooltip = `<div>Details from ${startDate} to ${date}<br/>Total Submissions: ${submissionCount} from ${countries}</div><br/>`;

        for (let i = 0; i < params.length / 2; i++) {
          tooltip += `<div>${params[i].data.name}
            <br/>
            <strong>Abs Mutation:</strong> ${params[i].data.mutation_abs}<br/>
            <strong>Abs Mutation in 3' end:</strong> ${
              params[i].data.mutation3_abs
            }<br/>
            <strong>Mutation %:</strong> ${params[i].data.mutation_pct.toFixed(
              3
            )}%<br/>
            <strong>Mutation % in 3' end:</strong> ${params[
              i
            ].data.mutation3_pct.toFixed(3)}%</div><br/>`;
        }
        return tooltip;
      },
      position: function (pos, params, el, elRect, size) {
        let obj = {};
        obj[["top", "bottom"][+(pos[1] < size.viewSize[1] / 2)]] = 10;
        obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
        return obj;
      },
    },
    legend: {
      data: primers,
      orient: "vertical",
      type: "scroll",
      top: "5%",
      right: 0,
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
        top: "95%",
      },
      {
        type: "inside",
        realtime: true,
        start: startIndex,
        end: endIndex,
        xAxisIndex: [0, 1],
      },
    ],
    grid: [
      { bottom: "60%", right: "15%" },
      { top: "57%", right: "15%" },
    ],
    xAxis: [
      {
        name: "date",
        nameLocation: "middle",
        nameTextStyle: {
          align: "center",
          verticalAlign: "top",
          padding: [6, 0, 0, 0],
        },
        gridIndex: 0,
        type: "category",
      },
      {
        name: "date",
        nameLocation: "middle",
        nameTextStyle: {
          align: "center",
          verticalAlign: "top",
          padding: [6, 0, 0, 0],
        },

        gridIndex: 1,
        type: "category",
      },
    ],
    yAxis: [
      {
        name: "Total Percentage (%)",
        gridIndex: 0,
        nameLocation: "middle",
        nameGap: 25,
        offset: -2,
        nameTextStyle: {
          padding: [0, 0, 15, 0],
        },
      },
      {
        name: "Total Percentage (%)",
        gridIndex: 1,
        nameLocation: "middle",
        offset: -2,
        nameGap: 25,
        nameTextStyle: {
          padding: [0, 0, 15, 0],
        },
      },
    ],
    dataset: datasets,
    series: [...mutationPlot, ...mutation3Plot],
  };

  const seeEvent = (e) => {
    // console.log(e);
    setModalInfo((prev) => {
      return {
        ...prev,
        date: e.data.date,
        lookBack: e.data.lookBack,
        primer: e.data.name,
        country: null,
      };
    });
    showModal();
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
      style={{ height: "475px", width: "100%" }}
      onEvents={onEvents}
      notMerge={false}
    />
  );
};

export default LineGraph;
