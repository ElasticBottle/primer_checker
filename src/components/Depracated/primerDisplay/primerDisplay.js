import React, { useState } from "react";
import ReactTooltip from "react-tooltip";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import { Col } from "react-bootstrap";
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip as TTip, Bar, ResponsiveContainer } from 'recharts';

import './primerDisplay.css'
import PrimerMissesChart from "../primerMissesChart/primerMissesChart"
import PrimerMap from "../primerMap/primerMap";


const formatPieChartData = (data) => {
    const to_return = [];
    const list1 = [];
    list1.push({ name: "Fwd", "value": data.overview.fwd_misses })
    list1.push({ name: "Prb", "value": data.overview.prb_misses })
    list1.push({ name: "Rev", "value": data.overview.rev_misses })
    const list2 = [];
    list2.push({ name: "Fwd", "value": data.overview.fwd_misses_3 })
    list2.push({ name: "Prb", "value": data.overview.prb_misses_3 })
    list2.push({ name: "Rev", "value": data.overview.rev_misses_3 })
    const list3 = [];
    list3.push({ name: "Fwd", "value": data.overview.fwd_misses_32 })
    list3.push({ name: "Prb", "value": data.overview.prb_misses_32 })
    list3.push({ name: "Rev", "value": data.overview.rev_misses_32 })
    to_return.push({ "Total Misses": list1 }, { "Misses in 3' end": list2 }, { ">2 Rev Misses in 3' end": list3 })
    return to_return
}
const formatBarChartData = (data) => {
    const total = data.overview.total
    const match = data.overview.matches
    return [{ "name": "Primer Overview", "Total": total, "Match": match, "Miss": total - match }]
}

const formatMapData = (data) => {
    const misses = data.misses

    for (const primerBatch in misses) {

    }
    return [{ "Australia": 10 }]
}

const PrimerDisplay = ({ data }) => {
    const [tooltipContent, setTooltipContent] = useState("");
    const pieChartDatas = formatPieChartData(data);
    const barChartData = formatBarChartData(data)
    const mapData = formatMapData(data)
    return (<Container>
        <div className='primer-overview-container'>
            <h2 className='primer-chart-title'>Primer Overview ({barChartData[0].Total} sequences validated)</h2>
            <ResponsiveContainer aspect={16 / 9} maxHeight={250}>
                <BarChart

                    data={barChartData}
                    layout="vertical"
                    margin={{
                        top: 20, right: 30, left: 20, bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" hide />
                    <TTip />
                    <Bar dataKey="Match" stackId="a" fill="#8884d8" />
                    <Bar dataKey="Miss" stackId="a" fill="#82ca9d" />
                </BarChart>
            </ResponsiveContainer>
        </div>
        <Row>
            {pieChartDatas.map((data, index) => {
                return (
                    <Col lg={4} md={6} sm={12} className='primer-misses-container' key={index}>
                        <h3 className='primer-misses-chart-title'>{Object.keys(data)}</h3>
                        <PrimerMissesChart data={Object.values(data)[0]} />
                    </Col>
                );
            })}
        </Row>
        <Row>
            <Col>
                <PrimerMap setTooltipContent={setTooltipContent} data={mapData} />
                <ReactTooltip>{tooltipContent}</ReactTooltip>
            </Col>
        </Row>
    </Container >);
}

export default PrimerDisplay
