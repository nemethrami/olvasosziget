import { ChangeEventHandler } from "react";
import "./Toggle.css"

interface ToggleProps {
    handleChange: ChangeEventHandler;
    isChecked: boolean;
}

function Toggle({ handleChange, isChecked }: ToggleProps) {
    return (
        <div className="toggle-container">
            <input 
                type="checkbox" 
                id="check" 
                className="toggle"
                onChange={handleChange}
                checked={isChecked}
            />
            <label htmlFor="check">{isChecked ? "Dark Mode" : "Light Mode"}</label>
        </div>
    );
}

export default Toggle;