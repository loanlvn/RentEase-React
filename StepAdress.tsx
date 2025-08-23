import { useState } from "react";
import { useWizard } from "../../Config/NewFlatWizardContext";
import type { StepProps } from "../../../../../types/NewFlatsFormType";
import validateField from "../../Config/ValidateStep";
import InputMotion from "../../../../../components/InputMotion";
import WizardNavButtons from "../../../../../components/ButtonNewFlats";

export default function StepAddress({ onNext, onBack }: StepProps) {
  const { data, setField } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    const { success, error: msg } = await validateField("address", data.address);
    if (success) {
      setError(null);
      onNext();
    } else {
      setError(msg || "Adresse invalide");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <h2 className="text-2xl font-semibold mb-8">Your full address...
      <span className="text-red-500">*</span>
      </h2>

      <div className="w-full max-w-md mb-4">
        <InputMotion
          type="text"
          placeholder="e.g. 123 Rue de Paris, 75001 Paris"
          value={data.address}
          onChange={(e) => setField("address", e.target.value)}
          className="
            w-full
            px-4 py-3
            border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-400
          "
        />
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>

      <WizardNavButtons
        onBack={onBack}
        onNext={handleNext}
        disableNext={!data.address.trim()}
      />
      
      </div>
  );
}
