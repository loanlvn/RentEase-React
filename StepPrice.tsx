import { useState } from "react";
import { useWizard } from "../../Config/NewFlatWizardContext";
import type { StepProps } from "../../../../../types/NewFlatsFormType";
import WizardNavButtons from "../../../../../components/ButtonNewFlats";
import validateField from "../../Config/ValidateStep";
import InputMotion from "../../../../../components/InputMotion";

export default function StepPrice({ onNext, onBack }: StepProps) {
  const { data, setField } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    const { success, error } = await validateField("price", data.price);
    if (!success) return setError(error || "Invalid price");

    setError(null);
    onNext();
  };

  const totalPrice = (data.price || 0) + (data.charges || 0);

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">How much do you want to rent your property for?</h1>
        <p className="text-sm text-gray-600 mb-6">* Required information</p>

        <h2 className="text-lg font-semibold mb-4">Calculate your rent</h2>

        <div className="bg-gray-50 border rounded-lg p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Base rent (excluding charges) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <InputMotion
                type="number"
                min={0}
                value={data.price || ""}
                onChange={(e) => setField("price", Number(e.target.value))}
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€/month</span>
            </div>
          </div>

          {/* Charges */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Monthly charges <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <InputMotion
                type="number"
                min={0}
                value={data.charges || ""}
                onChange={(e) => setField("charges", Number(e.target.value))}
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">€/month</span>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="text-center mb-8">
          <p className="text-xl font-semibold">
            {totalPrice} € CC/month
          </p>
          <p className="text-sm text-gray-600">Total rent displayed in the ad</p>
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <WizardNavButtons
          onBack={onBack}
          onNext={handleNext}
          disableNext={typeof data.price !== "number" || data.price <= 0}
          nextLabel="Submit"
        />
      </div>
    </div>
  );
}
