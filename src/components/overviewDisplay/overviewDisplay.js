import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Tooltip, XAxis, YAxis, Bar, CartesianGrid, Cell } from 'recharts';
import './overviewDisplay.css'
import Container from 'react-bootstrap/Container';
import { useHistory } from 'react-router-dom';

const OverviewDisplay = ({ data }) => {
    const [active, setActive] = useState(null);
    const history = useHistory();

    const formatData = (toPlot) => {
        const plotData = []
        for (const key in toPlot) {
            plotData.push({ 'x': key, 'mutation %': toPlot[key] })
        }
        return plotData
    }
    const getPlotData = (data) => {
        const plotDatas = []

        for (const key in data) {
            const toPlot = data[key]
            const plotData = formatData(toPlot)
            plotDatas.push(plotData)
        }
        return plotDatas;
    }

    const handleClick = (data) => {
        const dataLabel = data.payload.x;
        history.push(`/results/${dataLabel}`)
    }

    const handleMouseEnter = (data, index) => {
        setActive(index)
    }
    const handleMouseLeave = () => {
        setActive(null)
    }
    const plotData = getPlotData(data)
    const labels = ["Percent of genomes with mutation in primer region", "Percent of genomes with mutation in primer region 3' end"]
    return (
        <Container>
            {plotData.map((pData, index) => {
                return (
                    <div className="graph-container" key={index}>
                        <h3 className='chart-title'>{labels[index]}</h3>
                        <ResponsiveContainer aspect={16 / 9} maxHeight={400}>
                            <BarChart
                                width={730}
                                height={250}
                                data={pData}
                                syncId="synced"
                                margin={{
                                    top: 10, right: 30, left: 20, bottom: 10,
                                }}

                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="x" />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    onClick={handleClick}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                    dataKey="mutation %"
                                    maxBarSize={25}
                                >
                                    {
                                        pData.map((data, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                cursor="pointer"
                                                fill={index === active ? '#82ca9d' : '#8774d8'}
                                            />
                                        ))
                                    }
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );
            })}
        </Container >
    );
}

export default OverviewDisplay