import { useState } from "react";
import api from "../services/api";

function Analysis({ latestUpload }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!latestUpload?.preview?.length) {
      setResult({
        title: "No data yet",
        content: "Upload an Excel sheet first so the mentor can analyze it.",
        bullets: [],
        source: "local",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/analyze", {
        student_name: latestUpload.student_name,
        records: latestUpload.preview,
      });
      setResult(response.data);
    } catch (error) {
      setResult({
        title: "Analysis error",
        content: error?.response?.data?.detail || "Unable to analyze data.",
        bullets: [],
        source: "local",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel analysis-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Step 2</p>
          <h2>AI Performance Analysis</h2>
        </div>
        <button className="secondary-btn" onClick={analyze} disabled={loading}>
          {loading ? "Analyzing..." : "Run analysis"}
        </button>
      </div>

      <div className="analysis-body">
        <p className="panel-copy">
          {result?.content ||
            "Run an analysis to get strengths, weaknesses, risk level, and a study focus plan."}
        </p>

        {result?.bullets?.length ? (
          <ul className="bullet-list">
            {result.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        ) : null}

        {result?.source ? <span className="status-chip">{result.source}</span> : null}
      </div>
    </section>
  );
}

export default Analysis;
