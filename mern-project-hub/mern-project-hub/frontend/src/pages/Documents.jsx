import React, { useEffect, useRef, useState } from "react";
import { Upload, Trash2, FileText, ExternalLink } from "lucide-react";
import api from "../api/axios.js";

const guessType = (name = "") => {
  const ext = name.split(".").pop().toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["doc", "docx"].includes(ext)) return "doc";
  return "other";
};

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();

  const load = () => api.get("/documents").then(({ data }) => setDocs(data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data: driveResult } = await api.post("/integrations/google/drive/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await api.post("/documents", {
        fileName: driveResult.fileName,
        driveFileId: driveResult.driveFileId,
        driveViewLink: driveResult.driveViewLink,
        fileType: guessType(driveResult.fileName),
        projectName,
      });
      setProjectName("");
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Connect Google Drive in Settings first");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = async (id) => { await api.delete(`/documents/${id}`); load(); };

  return (
    <div className="p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="label-eyebrow">files, synced to drive</p>
          <h1 className="font-display text-2xl font-semibold mt-1">Documents</h1>
        </div>
      </div>

      <div className="card p-5 mb-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <input
          className="input-field sm:max-w-xs" placeholder="Project name (optional)"
          value={projectName} onChange={(e) => setProjectName(e.target.value)}
        />
        <label className="btn-primary flex items-center gap-2 cursor-pointer">
          <Upload size={16} /> {uploading ? "Uploading..." : "Upload file"}
          <input ref={fileRef} type="file" hidden onChange={handleUpload} disabled={uploading} />
        </label>
        <p className="text-xs text-base-50/40">PDFs, PPTs and docs upload straight to your connected Google Drive.</p>
      </div>

      {loading ? (
        <p className="text-base-50/40 font-mono text-sm">loading...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((d) => (
            <div key={d._id} className="card p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-signal-cyan/10 text-signal-cyan flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{d.fileName}</p>
                <p className="text-xs text-base-50/40 font-mono">{d.projectName || "unassigned"} · {d.fileType}</p>
                {d.driveViewLink && (
                  <a href={d.driveViewLink} target="_blank" rel="noreferrer" className="text-xs text-signal-cyan flex items-center gap-1 mt-1">
                    <ExternalLink size={12} /> open in Drive
                  </a>
                )}
              </div>
              <button onClick={() => remove(d._id)} className="text-base-50/30 hover:text-signal-rose"><Trash2 size={15} /></button>
            </div>
          ))}
          {!docs.length && <p className="text-base-50/40">No documents uploaded yet.</p>}
        </div>
      )}
    </div>
  );
};

export default Documents;
