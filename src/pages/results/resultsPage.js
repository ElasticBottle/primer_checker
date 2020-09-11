import React, { useState } from 'react';
import DropdownMenu from '../../components/dropdown/dropdown';
import ResultDisplay from '../../components/resultDisplay/resultDisplay';
import Container from 'react-bootstrap/Container';

const ResultPage = ({ results }) => {
    const [toDisplay, setToDisplay] = useState('Overview')
    console.log(results);
    return (<div>
        <Container>
            <DropdownMenu displayOptions={Object.keys(results)} resultToDisplay={toDisplay} setResultToDisplay={setToDisplay} />
            <ResultDisplay toDisplay={toDisplay} displayData={results[toDisplay]} setToDisplay={setToDisplay} />
        </Container>
    </div>);
}

export default ResultPage