import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ImageUpload({ defaultImage, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(defaultImage || null);

  const uploadImage = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileName = `${Date.now()}_${file.name}`;

      // ✅ Upload to Supabase bucket
      const { error } = await supabase.storage
        .from("tintd") // ⚡ bucket name must be lowercase
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      // ✅ Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("tintd").getPublicUrl(fileName);

      setPreview(publicUrl);
      if (onUploadComplete) onUploadComplete(publicUrl); // pass URL back
    } catch (err) {
      console.error("Upload error:", err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {preview && (
        <img
          src={preview}
          alt="preview"
          className="w-24 h-24 object-cover mb-2 rounded"
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={uploadImage}
        disabled={uploading}
      />
      {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
    </div>
  );
}
