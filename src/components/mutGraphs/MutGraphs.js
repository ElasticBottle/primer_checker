import React, { useEffect, useState } from "react";

import vegaEmbed from "vega-embed";
import Form from "react-bootstrap/Form";
import { debounce } from "../util";

const vl = require("vega-lite-api");

function buildGraph(lookBack, toPlot) {
  const width = 700;

  const mutation_pct = "mutation_pct";
  const mutation_pct3 = "mutation_pct3";
  const smooth_mut = "smooth_mutation_pct";
  const smooth_mut3 = "smooth_mutation_pct3";
  const brush = vl.selectInterval().encodings("x");
  const weightedAverageCalculation = [
    vl.window(vl.mean(mutation_pct).as(smooth_mut)).frame([-lookBack, 0]),
    vl.window(vl.mean(mutation_pct3).as(smooth_mut3)).frame([-lookBack, 0]),
  ];
  // if (toDisplay !== "Overview") {
  //   weightedAverageCalculation.push(
  //     vl.filter(`datum.name == text_input_fasta`)
  //   );
  // }
  const x = vl.x().fieldT("date").title(null);
  const y = vl.y();
  const color = vl.color().fieldN("name").scale({ scheme: "tableau20" });

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
        { field: mutation_pct3, type: "quantitative" },
      ])
    )
    .width(width);

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
}

const MutGraphs = ({ toDisplay, data }) => {
  const [lookBack, setLookBack] = useState(6);

  function handleChange(e) {
    setLookBack(e.target.value);
  }

  console.log(toDisplay, data);
  const toPlot = data.filter((data) => {
    if (toDisplay !== "Overview") {
      return toDisplay === data.name ? data : null;
    }
    return data;
  });

  useEffect(() => {
    const chartSpec = buildGraph(lookBack, toPlot);
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
            console.log(name, value);
          }, 280)
        );
      })
      .catch(console.warn);
  }, [lookBack, toPlot]);

  return (
    <>
      <Form>
        <Form.Group controlId="formBasicRange">
          <Form.Label>Look back period: {lookBack}</Form.Label>
          <Form.Control
            type="range"
            onChange={handleChange}
            min={1}
            max={30}
            step={1}
            value={lookBack}
          />
        </Form.Group>
      </Form>
      <div id="chart"></div>
    </>
  );
};

export default MutGraphs;
