import { useState } from "react";
import api from "../services/api";

function Analysis() {
  const [result, setResult] = useState("");

  const analyze = async () => {
    try {
      const response = await api.post("/analyze");

      setResult(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error(error);
      setResult("Error fetching analysis.");
    }
  };

  return (
    <div>
      <h2>🤖 AI Performance Analysis</h2>

      <button onClick={analyze}>Analyze Performance</button>

      <pre
        style={{
          marginTop: "20px",
          background: "#f4f4f4",
          padding: "10px",
          borderRadius: "8px",
          overflowX: "auto",
        }}
      >
        {result}
      </pre>
    </div>
  );
}

export default Analysis;