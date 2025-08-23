// src/components/NewFlatsWizard/steps/StepDPE.tsx
import { useState } from "react";
import { useWizard } from "../../Config/NewFlatWizardContext";
import type { StepProps } from "../../../../../types/NewFlatsFormType";
import validateField from "../../Config/ValidateStep";
import WizardNavButtons from "../../../../../components/ButtonNewFlats";
import InfoIcon from "@mui/icons-material/Info";
import ButtonMotion from "../../../../../components/ButtonMotion";
import InputMotion from "../../../../../components/InputMotion";

export default function StepDPE({ onNext, onBack }: StepProps) {
  const { data, setField } = useWizard();
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {

    if (!data.notSubjectToDpe) {

      for (const key of [
        "consumption",
        "emission",
        "dpe",
        "emissionConsumption",
      ] as const) {
        const { success, error: msg } = await validateField(key, data[key]);
        if (!success) {
          setError(msg);
          return;
        }
      }
    }
    setError(null);
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-1">
          Provide the results of your energy performance diagnosis. (DPE)
        </h1>
        <p className="text-sm text-gray-600 mb-6">* Required information</p>

        <div className="flex items-start gap-3 bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
          <InfoIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div className="text-sm text-gray-700">
            <strong>
              The DPE is a legal requirement: inform your prospective tenants.
            </strong>
            <p className="mt-2">
              Displaying the Energy Performance Diagnosis (DPE) is mandatory
              when renting or selling out your property. Failing to mention it
              may result in penalties.
            </p>
          </div>
        </div>

        <label className="inline-flex items-center mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={data.notSubjectToDpe}
            onChange={() => setField("notSubjectToDpe", !data.notSubjectToDpe)}
            className="mr-2"
          />
          My property is not subject to the Energy Performance Diagnosis (DPE).
        </label>

        {!data.notSubjectToDpe && (
          <>
            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">
                Primary energy consumption
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <InputMotion
                  type="number"
                  value={data.consumption || ""}
                  onChange={(e) =>
                    setField("consumption", Number(e.target.value))
                  }
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
                  kWhEP/m²/year
                </span>
              </div>

              <div className="mt-3 flex h-8 overflow-hidden rounded-full text-xs font-medium">
                {["A", "B", "C", "D", "E", "F", "G"].map((letter, i) => {
                  const colors = [
                    "#4caf50", // A
                    "#8bc34a", // B
                    "#cddc39", // C
                    "#ffeb3b", // D
                    "#ffc107", // E
                    "#ff9800", // F
                    "#f44336", // G
                  ];

                  const isSelected = data.dpe === letter;

                  return (
                    <ButtonMotion
                      key={letter}
                      type="button"
                      onClick={() => setField("dpe", letter as FlatData["dpe"])}
                      className={`flex-1 text-center text-white transition-all duration-200 ${isSelected
                        ? "ring-2 ring-offset-2 ring-black font-bold scale-105"
                        : "" }`}
                      style={{ backgroundColor: colors[i],}}
                    >
                      {letter}
                    </ButtonMotion>
                  );
                })}
              </div>

              <div className="flex justify-between text-xxs text-gray-500 mt-1">
                <span>Energy saving home</span>
                <span>Energy inefficent home</span>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium mb-2">
                Émissions de gaz à effet de serre{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <InputMotion
                  type="number"
                  min={0}
                  value={data.emission || ""}
                  onChange={(e) => setField("emission", Number(e.target.value))}
                  placeholder="0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-700">
                  kgCO₂/m²/year
                </span>
              </div>

              <div className="mt-3 flex h-8 overflow-hidden rounded-full text-xs font-medium">
                {["A", "B", "C", "D", "E", "F", "G"].map((letter, i) => {
                  const colors = [
                    "#e3f2fd", // A
                    "#90caf9", // B
                    "#64b5f6", // C
                    "#42a5f5", // D
                    "#1e88e5", // E
                    "#1976d2", // F
                    "#0d47a1", // G
                  ];

                  const isSelected = data.emissionConsumption === letter;

                  return (
                    <ButtonMotion
                      key={letter}
                      type="button"
                      onClick={() =>
                        setField("emissionConsumption",letter as FlatData["emissionConsumption"])}
                        className={`flex-1 text-center text-white transition-all duration-200 ${isSelected
                            ? "ring-2 ring-offset-2 ring-black font-bold scale-105"
                            : "" }`}
                        style={{ backgroundColor: colors[i] }}
                    >
                      {letter}
                    </ButtonMotion>
                  );
                })}
              </div>

              <div className="flex justify-between text-xxs text-gray-500 mt-1">
                <span>Low emissions</span>
                <span>High emissions</span>
              </div>
            </div>
          </>
        )}

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
