
import React, { useState, useEffect } from 'react'
import './textArea.css'
import Form from 'react-bootstrap/Form'
import { validateFormat } from '../util'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

const TextArea = ({ setTextFieldFasta }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const [textAreaValue, setTextAreaValue] = useState('')
    // const [fileAttached, setFileAttached] = useState(false)
    const inputSample = `>fwd\nGTGAAATGGTCATGTGTGGCGG\n>rev\nTATGCTAATAGTGTTTTTAACATTTG\n>prb\nCAGGTGGAACCTCATCAGGAGATGC`

    useEffect(() => {
        if (validateFormat(textAreaValue)) {
            console.log('sequence oKAY!', textAreaValue);
            // const lastMod = Date.now()
            // const tempDate = new Date(lastMod)
            // const file = {
            //     "content": textAreaValue,
            //     "invalid": false,
            //     "lastModified": lastMod,
            //     "lastModifiedDate": tempDate,
            //     "name": `fasta${lastMod}`,
            //     'size': getRandomInt(80, 90)
            // }
            setTextFieldFasta([{
                "invalid": false,
                "content": textAreaValue,
                "id": "text_input_fasta",
            }])
        } else {
            console.log('Nope');
            setTextFieldFasta([])
            setErrorMessage('Sequence not recognized! Please check.')
        }
    }, [textAreaValue, setTextFieldFasta])

    const handleChange = (e) => {
        const content = e.target.value
        setTextAreaValue(content)
    }
    const enterSample = () => {
        setTextAreaValue(inputSample)
    }
    return (
        <Form.Group controlId='fasta-sequence'>
            <Row className='fasta-input-header'>
                <Col>
                    <Form.Label className='fasta-input-title'>
                        Fasta Sequence
                    </Form.Label>
                </Col>
                <Col className="sample-fasta">
                    <Button variant='secondary' size='sm' onClick={enterSample}>Sample Input</Button>
                </Col>
            </Row>
            <Form.Control
                as='textarea'
                placeholder="Input Fasta Seq here."
                onChange={handleChange}
                type="text"
                value={textAreaValue}
                className='mx-sm-lg-auto'
                aria-describedby="fastaSequenceHelpBlock"
            />
            <Form.Text id="fastaSequenceHelpBlock" muted>
                Format for the primer sequence should be as follows:{<br />}
                <strong>
                    {inputSample
                        .split('\n')
                        .map((value, i) => <p key={i}>{value}</p>)}
                </strong>
            </Form.Text>
            <Form.Control.Feedback type="invalid">
                {errorMessage}
            </Form.Control.Feedback>
        </Form.Group>

    )
}

export default TextArea