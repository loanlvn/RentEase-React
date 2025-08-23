import { useState } from "react";
import { useWizard } from "../../Config/NewFlatWizardContext";
import type { StepProps } from "../../../../../types/NewFlatsFormType";
import WizardNavButtons from "../../../../../components/ButtonNewFlats";
import validateField from "../../Config/ValidateStep";

const ACCEPTED_FORMATS = ["image/jpeg", "image/jpg", "image/png", "image/heic"];
const MAX_IMAGES = 8;
const MAX_SIZE_MB = 10;

export default function StepImageUploader({ onNext, onBack }: StepProps) {
  const { data, setField } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        setError("Unsupported format: " + file.name);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError("File too large: " + file.name);
        return;
      }
      validFiles.push(file);
    }

    if (data.images.length + validFiles.length > MAX_IMAGES) {
      setError("Maximum of 8 images allowed.");
      return;
    }

    setField("images", [...data.images, ...validFiles]);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    const updated = data.images.filter((_, i) => i !== index);
    setField("images", updated);
  };

  const handleNext = async () => {
    const { success, error } = await validateField("images", data.images);
    if (success) {
      onNext();
    } else {
      setError(error || "Validation error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">Upload up to 8 photos of your apartment</h1>
        <p className="text-sm text-gray-600 mb-6">* Required information</p>

        <div className="mb-2">
          <label className="block text-sm font-medium mb-2">Your photos <span className="text-red-500">*</span></label>
          <p className="text-sm text-gray-500 mb-4">
            Make sure to allow access to your photos. Max file size: 10MB. Supported formats: jpeg, jpg, png, heic.
          </p>

          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border border-dashed border-gray-400 rounded-xl p-8 flex flex-col items-center text-center cursor-pointer hover:border-blue-500 transition-colors"
          >
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 16l4-4a4 4 0 015.656 0l1.757 1.757a4 4 0 005.657 0L21 10M16 8V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h8" />
            </svg>
            <p className="font-semibold">Drag & drop your files here or click to upload</p>
            <input
              type="file"
              accept={ACCEPTED_FORMATS.join(",")}
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>

          <div className="mt-2 text-right text-sm text-gray-500">
            Files: {data.images.length} / {MAX_IMAGES}
          </div>

          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>

        {/* File preview */}
        {data.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6 mb-8">
            {data.images.map((file, index) => (
              <div key={index} className="relative border rounded overflow-hidden group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className="object-cover w-full h-32"
                />
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-1 right-1 bg-white text-red-500 border border-red-500 rounded-full px-2 py-0.5 text-xs font-bold opacity-100 hover:scale-110 transition"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10">
          <WizardNavButtons
            onBack={onBack}
            onNext={handleNext}
            disableNext={data.images.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
