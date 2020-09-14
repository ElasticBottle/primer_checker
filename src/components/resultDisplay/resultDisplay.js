import React from 'react';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import { useHistory } from 'react-router-dom';

import OverviewDisplay from '../overviewDisplay/overviewDisplay';
import PrimerDisplay from '../primerDisplay/primerDisplay';

import './resultDisplay.css';

const InputData = () => {
    const history = useHistory();
    return (<Container>
        <p className='no-data'>Please make sure that you've uploaded some data first!</p>
        <Button onClick={() => history.push('/')}>Upload Data</Button>
    </Container>);
}

const resultDisplay = ({ toDisplay, displayData }) => {
    return (<div className='result-display-container'>
        {displayData !== undefined ?
            toDisplay === 'Overview' ?
                <OverviewDisplay data={displayData} />
                : <PrimerDisplay data={displayData} />
            : <InputData />
        }
    </div>);
}

export default resultDisplay