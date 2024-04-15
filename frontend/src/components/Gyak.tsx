import ListGroup from "./ListGroup";
import Alert from "./Alert";
import Button from "./Button";
import { useState } from "react";

function Gyak() {
    const items = [
        'New York',
        'Budapest',
        'London',
        'Paris',
        'Tokyo'
      ];
    
      const [alertVisible, setAlertVisibility] = useState(false);
    
      const handleClick = () => {
        setAlertVisibility(true);
      }
    
      const handleClose = () => {
        setAlertVisibility(false);
      }

      return <div>
        <ListGroup items={items} heading="Cities"></ListGroup>
        <Button onClick={() => console.log("click")} color="success">Success</Button>
        { alertVisible === true && <Alert onClose={handleClose}>My alert</Alert> }
        <Button onClick={handleClick}>Primary</Button>
      </div>

}

export default Gyak;