import { useState } from "react";
import api from "../services/api";

function UploadExcel() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/upload", formData);

    console.log(response.data);

    alert("Upload Successful");
  };

  return (
    <div>

      <h2>Upload LMS Excel</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={upload}>
        Upload
      </button>

    </div>
  );
}

export default UploadExcel;
