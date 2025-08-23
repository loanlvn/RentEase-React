/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME!;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET!;

export async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", "flats");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  try {
    const response = await axios.post(url, formData);
    return response.data.secure_url as string;
  } catch (err: any) {
    console.error("Cloudinary upload error:", err.response?.data || err.message);
    throw err;
  }
}
