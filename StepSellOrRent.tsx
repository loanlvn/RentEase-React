// src/components/NewFlatsWizard/steps/StepSellOrRent.tsx
import { useWizard } from "../../Config/NewFlatWizardContext";
import type { StepProps } from "../../../../../types/NewFlatsFormType";
import ButtonMotion from "../../../../../components/ButtonMotion";
import WizardNavButtons from "../../../../../components/ButtonNewFlats";

const options: Array<{
  value: "sell" | "rent";
  label: string;
  icon: string;
}> = [
  { value: "sell", label: "To sell", icon: "/icon-sell.png" },
  { value: "rent", label: "To rent", icon: "/icon-rent.png" },
];

export default function StepSellOrRent({ onNext, onBack }: StepProps) {
  const { data, setField } = useWizard();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <h2 className="text-2xl font-semibold mb-8">You have a property...</h2>

      <div className="flex gap-12 mb-12">
        {options.map(({ value, label, icon }) => (
          <div key={value} className="flex flex-col items-center">
            <ButtonMotion
              onClick={() => setField("mode", value)}
              className={`
                w-56 h-56
                overflow-hidden rounded-2xl
                transition-shadow
                ${data.mode === value
                  ? "border-4 border-blue-600 shadow-xl"
                  : "border border-gray-300 hover:shadow-md"}
              `}
            >
              <img
                src={icon}
                alt={label}
                className="w-full h-full object-cover"
              />
            </ButtonMotion>
            <span className="mt-3 text-lg font-medium">{label}</span>
          </div>
        ))}
      </div>

      <WizardNavButtons
        onBack={onBack}
        onNext={onNext}
        disableNext={!data.mode}
      />
      </div>
  );
}
