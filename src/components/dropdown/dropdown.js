import React, { useState } from 'react';
import Dropdown from 'react-bootstrap/Dropdown';
import FormControl from 'react-bootstrap/FormControl';
import { useHistory } from 'react-router-dom';
import './dropdown.css'

const CustomMenu = React.forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
        const [value, setValue] = useState('');

        return (
            <div
                ref={ref}
                style={style}
                className={className}
                aria-labelledby={labeledBy}
            >
                <FormControl
                    autoFocus
                    className="mx-3 my-2 w-auto"
                    placeholder="Type to filter..."
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                />
                <ul className="list-unstyled">
                    {React.Children.toArray(children).filter(
                        (child) =>
                            !value || child.props.children.toLowerCase().startsWith(value),
                    )}
                </ul>
            </div>
        );
    },
);

const DropdownMenu = ({ displayOptions, resultToDisplay }) => {
    const history = useHistory();
    const handleClick = (event) => {
        const newLabel = event.target.innerText
        history.push(`/results/${newLabel}`)
    }

    return (
        <div>
            <p className='display-tag'>Displaying</p>
            <Dropdown className='dropdown'>
                <Dropdown.Toggle variant="light" id="dropdown-custom-components">
                    {resultToDisplay}
                </Dropdown.Toggle>

                <Dropdown.Menu as={CustomMenu}>
                    <Dropdown.Item as="button" onClick={handleClick} active={resultToDisplay === 'Overview'}>Overview</Dropdown.Item>
                    <Dropdown.Divider>overview</Dropdown.Divider>

                    {displayOptions.map((displayOption, index) => {
                        return (displayOption !== 'databaseCount' ?
                            <Dropdown.Item key={index} onClick={handleClick} active={resultToDisplay === displayOption}>{displayOption}</Dropdown.Item> : null
                        );

                    })}

                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

export default DropdownMenu;


