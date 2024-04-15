import { useState } from "react";
import { Fragment } from "react";

interface ListGroupProps {
    items: string[];
    heading: string;
}

function ListGroup({ items, heading }: ListGroupProps) {
    const [selectedIdx, setSelectedIdx] = useState(-1)

    const message = items.length === 0 && <p>No items found</p>;

    return (
        <Fragment>
            <h1>{heading}</h1>
            {message}
            <ul className="list-group">
                {items.map((item, idx) => {
                    return (
                        <li className={ selectedIdx === idx ? "list-group-item active" : "list-group-item" }
                            key={idx}
                            onClick={() => { setSelectedIdx(idx); }}
                        >
                            {item}
                        </li>
                    )
                })}
            </ul>
        </Fragment>
    );
}

export default ListGroup;