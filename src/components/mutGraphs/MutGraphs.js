import React, { useEffect, useState, memo } from "react";

import Container from "react-bootstrap/Container";
import vegaEmbed from "vega-embed";
import Form from "react-bootstrap/Form";

import { debounce } from "../util";
import "./mutGraphs.css";

const vl = require("vega-lite-api");

function buildGraph(
  lookBack,
  toPlot,
  combinedOverview,
  horSize,
  timeFrameBrush
) {
  const width = horSize * (4 / 5);
  const total_mut_pct = "total_mut_pct";
  const total_mut3_pct = "total_mut3_pct";
  const total_smooth_mut = "total_smooth_mut_pct";
  const total_smooth_mut3 = "total_smooth_mut3_pct";
  const mutation_pct = "mutation_pct";
  const mutation3_pct = "mutation3_pct";
  const smooth_mut = "smooth_mutation_pct";
  const smooth_mut3 = "smooth_mutation3_pct";
  const brush =
    timeFrameBrush === undefined || timeFrameBrush.length === 0
      ? vl.selectInterval().encodings("x")
      : vl
          .selectInterval()
          .encodings("x")
          .init({ x: timeFrameBrush.map((time) => time / 1) });
  const weightedAverageCalculation = [
    vl
      .window(vl.mean(total_mut_pct).as(total_smooth_mut))
      .frame([-lookBack, 0]),
    vl
      .window(vl.mean(total_mut3_pct).as(total_smooth_mut3))
      .frame([-lookBack, 0]),
    vl.window(vl.mean(mutation_pct).as(smooth_mut)).frame([-lookBack, 0]),
    vl.window(vl.mean(mutation3_pct).as(smooth_mut3)).frame([-lookBack, 0]),
  ];

  const x = vl.x().fieldT("date").title(null);
  const y = vl.y();
  const color = vl
    .color()
    .fieldN("name")
    .scale({ scheme: "tableau20" })
    .legend({ type: "symbol", orient: "top", columns: 3 });

  const navChart = vl
    .markLine()
    .select(brush)
    .transform(...weightedAverageCalculation)
    .encode(x, y.fieldQ(smooth_mut), color)
    .width(width)
    .height(60)
    .title("TimeFrame Selection");

  const baseChart = vl
    .markLine({ point: true })
    .transform(...weightedAverageCalculation)
    .encode(
      x.scale({ domain: brush }).title("Date"),
      y,
      color,
      vl.tooltip([
        { field: "name", type: "  nominal" },
        { field: "date", type: "temporal" },
        { field: smooth_mut, type: "quantitative" },
        { field: smooth_mut3, type: "quantitative" },
        { field: mutation_pct, type: "quantitative" },
        { field: mutation3_pct, type: "quantitative" },
      ])
    )
    .width(width);

  const overviewChart = baseChart.data(combinedOverview).encode(
    vl.tooltip([
      { field: "name", type: "  nominal" },
      { field: "date", type: "temporal" },
      { field: total_mut_pct, type: "quantitative" },
      { field: total_smooth_mut, type: "quantitative" },
      { field: total_mut3_pct, type: "quantitative" },
      { field: total_smooth_mut3, type: "quantitative" },
    ])
  );

  const names = toPlot.reduce((data, currData) => {
    if (data.includes(currData.name)) {
      return data;
    } else {
      data.push(currData.name);
      return data;
    }
  }, []);
  if (names.length === 1) {
    const chartSpec = vl
      .data(toPlot)
      .vconcat(
        navChart,
        baseChart.encode(y.fieldQ(smooth_mut)).title("Mutation Percentage"),
        baseChart
          .encode(y.fieldQ(smooth_mut3))
          .title("Mutation Percentage 3' end")
      );
    return chartSpec;
  } else {
    const chartSpec = vl
      .data(toPlot)
      .vconcat(
        navChart,
        vl
          .layer(
            overviewChart.encode(
              y.fieldQ(total_smooth_mut),
              vl.color({ value: "#aaee99" })
            ),
            overviewChart.encode(
              y.fieldQ(total_smooth_mut3),
              vl.color({ value: "#ff99aa" })
            )
          )
          .title("Combined Mutation Percentage"),
        baseChart.encode(y.fieldQ(smooth_mut)).title("Mutation Percentage"),
        baseChart
          .encode(y.fieldQ(smooth_mut3))
          .title("Mutation Percentage 3' end")
      );
    return chartSpec;
  }
}

const MutGraphs = ({
  toDisplay,
  data,
  combinedOverview,
  timeFrameBrush,
  setTimeFrameBrush,
}) => {
  const [lookBack, setLookBack] = useState(6);
  const parentRef = React.useRef(null);

  function handleChange(e) {
    setLookBack(e.target.value);
  }

  const toPlot = data.filter((data) => {
    if (toDisplay[0] !== "Overview") {
      return toDisplay.includes(data.name);
    }
    return data;
  });

  useEffect(() => {
    const chartSpec = buildGraph(
      lookBack,
      toPlot,
      combinedOverview,
      parentRef.current.offsetWidth,
      timeFrameBrush
    );

    let intervalSignal = "";
    vegaEmbed("#chart", chartSpec.toJSON(), {
      patch: (spec) => {
        console.log(spec);
        const signals = spec.signals;
        for (const signal of signals) {
          if (signal.name.startsWith("sel")) {
            intervalSignal = signal.name;
          }
        }
        // spec.signals.push({
        //   name: "barClick",
        //   value: "datum",
        //   on: [{ events: "*:mousedown", update: "datum" }],
        // });
        // spec.signals.push({
        //   name: "hover",
        //   on: [{ events: "*:mouseover", update: "datum" }],
        // });

        return spec;
      },
    })
      .then((result) => {
        // result.view.addSignalListener("barClick", console.log);
        // result.view.addSignalListener("hover", console.log);
        result.view.addSignalListener(
          intervalSignal,
          debounce(function (name, value) {
            const start_end_date = value.date;
            // console.log(name, value);
            if (start_end_date === undefined) {
              setTimeFrameBrush([]);
            } else {
              setTimeFrameBrush(start_end_date);
            }
          }, 200)
        );

        // let parentWidth = 120;
        // console.log(parentWidth);
        // if (parentRef.current) {
        //   parentWidth = parentRef.current.offsetWidth / 2 - 100;
        //   console.log("inside", parentWidth);
        // }

        // result.view.signal("concat_1_childWidth", parentWidth).run();
      })
      .catch(console.warn);
  }, [lookBack, toPlot, combinedOverview, timeFrameBrush, setTimeFrameBrush]);

  return (
    <>
      <Form>
        <Form.Group controlId="formBasicRange">
          <Form.Label>Look back period: {lookBack}</Form.Label>
          <Form.Control
            type="range"
            onChange={handleChange}
            min={0}
            max={30}
            step={1}
            value={lookBack}
          />
        </Form.Group>
      </Form>
      <Container id="chart" ref={parentRef}></Container>
    </>
  );
};

export default memo(MutGraphs);
