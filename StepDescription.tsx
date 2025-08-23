import { useState } from "react";
import { useWizard } from "../../Config/NewFlatWizardContext";
import type { StepProps } from "../../../../../types/NewFlatsFormType";
import WizardNavButtons from "../../../../../components/ButtonNewFlats";
import validateField from "../../Config/ValidateStep";
import InputMotion, { TextareaMotion } from "../../../../../components/InputMotion";

export default function StepDescription({ onNext, onBack }: StepProps) {
  const { data, setField } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    const { success, error } = await validateField("title", data.title);
    if (!success) return setError(error || "Invalid title");

    const { success: successDesc, error: errorDesc } = await validateField("description", data.description);
    if (!successDesc) return setError(errorDesc || "Invalid description");

    setError(null);
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">Describe your property</h1>
        <p className="text-sm text-gray-600 mb-6">* Required information</p>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <InputMotion
            type="text"
            value={data.title || ""}
            onChange={e => setField("title", e.target.value)}
            placeholder="Cozy apartment in the city center"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            Between 10 and 180 characters. Be clear and precise.
          </p>
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <TextareaMotion
            value={data.description || ""}
            onChange={e => setField("description", e.target.value)}
            placeholder="Describe the layout, recent renovations, neighborhood, and more."
            rows={6}
            className="w-full px-4 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-500 mt-1">
            Give buyers or renters a good reason to choose your property.
          </p>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <WizardNavButtons
          onBack={onBack}
          onNext={handleNext}
          disableNext={!data.title.trim() || !data.description.trim()}
        />
      </div>
    </div>
  );
}
