
import React from 'react'
import './textArea.css'
import { validateFormat } from '../util'

const TextArea = () => {
    return (
        <>
            <div className="description">
                <p>
                    Format for the primer sequence should be as follows:
                    <strong>
                        <br />
                        &gt;fwd
                        <br />
                        ACAGGTACGTTAATAGTTAATAGCGT
                        <br />
                        &gt;rev
                        <br />
                        TGTGTGCGTACTGCTGCAATAT
                        <br />
                        &gt;prb
                        <br />
                        ACACTAGCCATCCTTACTGCGCTTCG
                    </strong>
                </p>
            </div>
            <textarea className='input-seq' onChange={validateFormat} placeholder="Input Fasta Seq here."></textarea>
        </>
    )
}

export default TextArea