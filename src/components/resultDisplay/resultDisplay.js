import React from 'react';

import Row from 'react-bootstrap/Row';

import OverviewDisplay from '../overviewDisplay/overviewDisplay';
import PrimerDisplay from '../primerDisplay/primerDisplay';

import './resultDisplay.css';

const resultDisplay = ({ toDisplay, displayData, setToDisplay }) => {
    return (<div className='result-display-container'>
        <Row>
            {displayData !== undefined ?
                toDisplay === 'Overview' ?
                    <OverviewDisplay data={displayData} />
                    : <PrimerDisplay data={displayData} />
                : null
            }
        </Row>
    </div>);
}

export default resultDisplay