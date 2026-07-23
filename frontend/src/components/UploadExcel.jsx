import { useState } from "react";
import api from "../services/api";

function UploadExcel({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const upload = async () => {
    if (!file) {
      setMessage("Select an Excel file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");

    try {
      const response = await api.post("/upload", formData);
      onUploaded?.(response.data);
      setMessage(`Uploaded ${response.data.filename} successfully.`);
      setFile(null);
    } catch (error) {
      const detail = error?.response?.data?.detail || "Upload failed.";
      setMessage(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel upload-panel">
      <div className="panel-head">
        <div>
          <p className="eyebrow">Step 1</p>
          <h2>Upload LMS Excel</h2>
        </div>
        <span className="badge">Pandas + OpenPyXL</span>
      </div>

      <p className="panel-copy">
        Upload marks, attendance, and course data to generate a personalized
        mentor report.
      </p>

      <label className="file-dropzone">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <span>{file ? file.name : "Choose an Excel file or drop one here"}</span>
      </label>

      <div className="panel-actions">
        <button className="primary-btn" onClick={upload} disabled={loading}>
          {loading ? "Uploading..." : "Upload and analyze"}
        </button>
      </div>

      {message ? <p className="status-copy">{message}</p> : null}
    </section>
  );
}

export default UploadExcel;
