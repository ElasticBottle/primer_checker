import React, { useState } from 'react';
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer, Cell } from 'recharts';




const PrimerMissesChart = ({ data }) => {
    const [activeIndex, setActiveIndex] = useState(null);
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#8884d8'];

    const mouseEnter = (data, index) => {
        setActiveIndex(index);
    };

    const mouseLeave = () => {
        setActiveIndex(null)
    }

    return (
        <ResponsiveContainer aspect={16 / 9} maxHeight={350}>
            <BarChart
                syncId="primer"
                data={data}
                margin={{
                    top: 20, right: 30, left: 20, bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar
                    dataKey="value"
                    onMouseEnter={mouseEnter}
                    onMouseLeave={mouseLeave}
                >
                    {
                        data.map((entry, index) =>
                            <Cell
                                key={`cell-${index}`}
                                fill={index !== activeIndex ? COLORS[index % COLORS.length] : COLORS[3]}

                            />)
                    }
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );

}

export default PrimerMissesChart;