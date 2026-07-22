import { useState } from "react";
import api from "../services/api";

function UploadExcel() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    if (!file) {
      alert("Please select an Excel file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/upload", formData);

      console.log(response.data);

      alert("Upload Successful!");
    } catch (error) {
      console.error(error);
      alert("Upload Failed!");
    }
  };

  return (
    <div>
      <h2>📄 Upload LMS Excel</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={upload}>Upload</button>
    </div>
  );
}

export default UploadExcel;