// Uploads handover packet documents (PDF/DOCX/XLSX) straight from the browser to Cloudinary,
// using an UNSIGNED upload preset — no backend/Cloud Function needed for this step.
//
// Setup on the Cloudinary side (one-time):
// 1. Cloudinary dashboard -> Settings -> Upload -> Add upload preset
// 2. Set "Signing Mode" to "Unsigned"
// 3. (Recommended) Restrict "Folder" to something like "legacylead/handover-docs"
// 4. Copy the preset name and your cloud name into .env.local

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",       // .xlsx
];

export function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only PDF, DOCX, or XLSX files are accepted.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "File is larger than 10MB.";
  }
  return null; // valid
}

/**
 * Uploads a single file to Cloudinary and returns the metadata to store in Firestore.
 * @param {File} file
 * @returns {Promise<{name: string, url: string, publicId: string, uploadedAt: string}>}
 */
export async function uploadDocument(file) {
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary isn't configured — set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "legacylead/handover-docs");

  // resource_type "raw" is required for non-image files like PDF/DOCX/XLSX
  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`;

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody?.error?.message || "Upload to Cloudinary failed.");
  }

  const data = await response.json();

  return {
    name: file.name,
    url: data.secure_url,
    publicId: data.public_id,
    uploadedAt: new Date().toISOString(),
  };
}

/**
 * Uploads multiple files in parallel. Returns settled results so one failed
 * file doesn't block the others.
 * @param {File[]} files
 */
export async function uploadDocuments(files) {
  const results = await Promise.allSettled(files.map(uploadDocument));

  const uploaded = [];
  const errors = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      uploaded.push(result.value);
    } else {
      errors.push({ file: files[i].name, message: result.reason.message });
    }
  });

  return { uploaded, errors };
}