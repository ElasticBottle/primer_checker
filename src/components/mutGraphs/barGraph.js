import React from "react";
import ReactEcharts from "echarts-for-react";

const BarGraph = ({
  title,
  title2,
  data,
  showAbsDiff,
  subtitle = "",
  subtitle2 = "",
}) => {
  function getBarLabel(data, idx, toPlot) {
    const fontSize = 9;
    return {
      show: true,
      position: "insideTop",
      distance: 10,
      align: "center",
      verticalAlign: "top",
      rotate: 0,
      formatter: function (params) {
        if (!showAbsDiff) {
          return `${params.data[toPlot]}%`;
        }
        const primer = params.data.name;
        const currVal = data[idx].filter((val) => val.name === primer)[0][
          toPlot
        ];
        const prevVal = data[idx - 1].filter((val) => val.name === primer)[0][
          toPlot
        ];
        const difference = currVal - prevVal;
        let label = difference > 0 ? `{p|+` : `{n|`;
        return `${label}${difference.toFixed(2)}%}`;
      },
      fontSize: fontSize,
      backgroundColor: "#232323",
      textBorderColor: "transparent",
      padding: [4, 5, 2, 5],
      rich: {
        p: { color: "#88ff88", fontSize: fontSize },
        n: { color: "#ff8677", fontSize: fontSize },
      },
    };
  }

  function buildDataset(datasets) {
    const data = [];
    for (const dataset of datasets) {
      data.push({
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
    return data;
  }

  function buildBarPlot(data, toPlot, xAxisIndex, yAxisIndex) {
    const plots = [];
    for (let i = 1; i < data.length; i++) {
      plots.push({
        name: (data[i][0] || {}).date,
        type: "bar",
        barMaxWidth: 40,
        xAxisIndex: xAxisIndex,
        yAxisIndex: yAxisIndex,
        label: getBarLabel(data, i, toPlot),
        encode: {
          x: "name",
          y: toPlot,
        },
        datasetIndex: i,
      });
    }
    return plots;
  }

  const dataset = buildDataset(data);
  const mutation = buildBarPlot(data, "mutation_pct", 0, 0);
  const mutation3 = buildBarPlot(data, "mutation3_pct", 1, 1);
  console.log("dataset :>> ", dataset);
  console.log("mutation :>> ", mutation);
  console.log("mutation3 :>> ", mutation3);
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
        top: "middle",
      },
    ],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
        animation: false,
      },
      position: function (pos, params, el, elRect, size) {
        var obj = { top: 10 };
        obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
        return obj;
      },
    },
    axisPointer: {
      link: { xAxisIndex: "all" },
    },
    grid: [{ bottom: "60%" }, { top: "57%" }],
    xAxis: [
      {
        name: "primers",
        gridIndex: 0,
        type: "category",
      },
      {
        name: "primers",
        gridIndex: 1,
        type: "category",
      },
    ],
    yAxis: [
      {
        name: "Total Percentage (%)",
        gridIndex: 0,
        nameLocation: "middle",
        nameGap: 50,
      },
      {
        name: "Total Percentage (%)",
        gridIndex: 1,
        nameLocation: "middle",
        nameGap: 50,
      },
    ],
    dataset: dataset,
    series: [...mutation, ...mutation3],
  };
  const seeEvent = (e) => {
    console.log(e);
  };
  let onEvents = {
    click: seeEvent,
  };
  return (
    <ReactEcharts
      option={option}
      style={{ height: "500px", width: "100%" }}
      notMerge={true}
      onEvents={onEvents}
    />
  );
};

export default BarGraph;
