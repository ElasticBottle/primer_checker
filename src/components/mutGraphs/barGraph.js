import React from "react";
import ReactEcharts from "echarts-for-react";

const BarGraph = ({
  title,
  title2,
  data,
  showAbsDiff,
  showModal,
  setModalInfo,
  subtitle = "",
  subtitle2 = "",
}) => {
  function getBarLabel(data, idx, toPlot) {
    const fontSize = 9;
    return {
      show: true,
      position: "insideTop",
      distance: 5,
      align: "center",
      verticalAlign: "top",
      rotate: 0,
      formatter: function (params) {
        if (!showAbsDiff) {
          return `${params.data[toPlot].toFixed(3)}%`;
        }
        const primer = params.data.name;
        const currVal = data[idx].filter((val) => val.name === primer)[0][
          toPlot
        ];
        const prevVal = data[idx - 1].filter((val) => val.name === primer)[0][
          toPlot
        ];
        const difference = (currVal - prevVal).toFixed(2);
        let label = difference > 0 ? `{p|+` : difference < 0 ? `{n|` : "{zero|";
        return `${label}${difference}%}`;
      },
      fontSize: fontSize,
      backgroundColor: "#232323",
      textBorderColor: "transparent",
      padding: [4, 5, 2, 5],
      rich: {
        p: { color: "#88ff88", fontSize: fontSize },
        n: { color: "#ff8677", fontSize: fontSize },
        zero: { color: "#eef", fontSize: fontSize },
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
  // console.log("dataset :>> ", dataset);
  // console.log("mutation :>> ", mutation);
  // console.log("mutation3 :>> ", mutation3);
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
        top: "52%",
      },
    ],
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        const data = params.slice(0, params.length / 2);
        const primerName = data[0].data.name;
        let tooltip = `<div>Details for ${primerName} (Left to Right)</div><br/>`;
        for (const item of data) {
          const submissionCount = item.data.submission_count;
          const countries =
            item.data.countries_considered.length === 0
              ? "All Countries"
              : `${item.data.countries_considered.length} countries`;
          const endDate = new Date(item.data.date);
          const startDate = new Date(item.data.date);
          startDate.setDate(startDate.getDate() - parseInt(item.data.lookBack));
          tooltip += `<div><strong>From ${startDate
            .toISOString()
            .slice(0, 10)} to ${endDate.toISOString().slice(0, 10)}:</strong> 
          <br/>
          ${submissionCount.size} Submissions from ${countries} 
          <br/>
          <strong>Abs Mutation:</strong> ${item.data.mutation_abs}<br/>
          <strong>Abs Mutation in 3' end:</strong> ${item.data.mutation3_abs}
          <br/>
          <strong>Mutation %:</strong> ${item.data.mutation_pct.toFixed(3)}%
          <br/>
          <strong>Mutation % in 3' end:</strong> ${item.data.mutation3_pct.toFixed(
            3
          )}%
          </div><br/>`;
        }
        return tooltip;
      },
      axisPointer: {
        type: "shadow",
        animation: false,
      },
      position: function (pos, params, el, elRect, size) {
        let obj = {};
        obj[["top", "bottom"][+(pos[1] < size.viewSize[1] / 2)]] = 10;
        obj["left"] = pos[0];
        return obj;
      },
    },
    axisPointer: {
      link: { xAxisIndex: "all" },
    },
    grid: [
      { top: "8%", bottom: "65%" },
      { top: "57%", bottom: "20%" },
    ],
    xAxis: [
      {
        name: "primers",
        gridIndex: 0,
        type: "category",
        axisLabel: {
          rotate: 45,
          margin: 15,
        },
      },
      {
        name: "primers",
        gridIndex: 1,
        type: "category",
        axisLabel: {
          rotate: 45,
          margin: 15,
        },
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
  let onEvents = {
    click: seeEvent,
  };
  return (
    <ReactEcharts
      option={option}
      style={{ height: "600px", width: "100%" }}
      notMerge={true}
      onEvents={onEvents}
    />
  );
};

export default BarGraph;
