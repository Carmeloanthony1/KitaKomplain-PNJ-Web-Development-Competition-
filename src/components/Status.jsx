
import { useNavigate } from "react-router-dom";

// PROPS
export default function Status({ status }) {
    const navigate = useNavigate();

    return (
        <div>
            <h2>Status: {status}</h2>
        </div>
    );
}