// src/components/NewFlatsWizard/steps/StepCharacteristics.tsx
import { useState } from "react";
import { useWizard } from "../../Config/NewFlatWizardContext";
import type { StepProps } from "../../../../../types/NewFlatsFormType";
import validateField from "../../Config/ValidateStep";
import WizardNavButtons from "../../../../../components/ButtonNewFlats";
import InputMotion from "../../../../../components/InputMotion";

export default function StepCharacteristics({ onNext, onBack }: StepProps) {
  const { data, setField } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    for (const key of ["surface", "rooms", "furnished", "constructionYear","airConditioned" ] as const) {
      const { success, error: msg } = await validateField(key, data[key]);
      if (!success) {
        setError(msg);
        return;
      }
    }
    setError(null);
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">
          Specify the main informations of your property
        </h1>
        <p className="text-sm text-gray-600 mb-6">* Mendatory informations</p>

        <h2 className="text-lg font-semibold mb-4">Informations key</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Area size range <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <InputMotion
              type="number"
              value={data.surface || ""}
              onChange={(e) =>
                setField("surface", Number(e.target.value))
              }
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
              m²
            </span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Construction year <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <InputMotion
              type="number"
              value={data.constructionYear || ""}
              onChange={(e) =>
                setField("constructionYear", Number(e.target.value))
              }
              placeholder="0"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Number of rooms <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Count all the rooms except the kitchen, the shower and the bathrooms.
          </p>
          <div className="inline-flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() =>
                setField("rooms", Math.max(1, data.rooms - 1))
              }
              className="px-3 py-2 hover:bg-gray-100"
            >
              −
            </button>
            <span className="px-6 text-center">{data.rooms}</span>
            <button
              onClick={() => setField("rooms", data.rooms + 1)}
              className="px-3 py-2 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Is your property furnished? <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="furnished"
                checked={data.furnished === true}
                onChange={() => setField("furnished", true)}
                className="mr-2"
              />
              Yes
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="furnished"
                checked={data.furnished === false}
                onChange={() => setField("furnished", false)}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>
                <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Does your property have air conditioning ? <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Radiator and heating are not taken into account.
          </p>
          <div className="flex gap-6">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="airConditioned"
                checked={data.airConditioned === true}
                onChange={() => setField("airConditioned", true)}
                className="mr-2"
              />
                Yes
            </label>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name="airConditioned"
                checked={data.airConditioned === false}
                onChange={() => setField("airConditioned", false)}
                className="mr-2"
              />
              No
            </label>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

            <WizardNavButtons
            onBack={onBack}
            onNext={handleNext}
            disableNext={false}
            />
      </div>
    </div>
  );
}

