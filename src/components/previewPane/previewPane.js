import React from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'

const PreviewPane = ({ show, handleClose, content }) => {
    const formatContent = (content) => {
        const regex = /\s+/g;
        const newline_matches = [...content.matchAll(regex)]
        let result = []
        for (let i = 0; i < newline_matches.length; i++) {
            if (i === 0) {
                result = result.concat(content.slice(0, newline_matches[0].index))
            }
            else {

                result = result.concat(content.slice(newline_matches[i - 1].index + 1, newline_matches[i].index))
            }
        }
        return result
    }
    return (
        <Modal show={show} onHide={() => handleClose()}>
            <Modal.Header closeButton>
                <Modal.Title>Fasta Primer Preview</Modal.Title>
            </Modal.Header>
            <Modal.Body>{formatContent(content).map((value, index) => <p key={index}>{value}</p>)}</Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => handleClose()}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>)
}

export default PreviewPane