// src/components/NewFlatsWizard/steps/StepPropertyType.tsx
import { useWizard } from "../../Config/NewFlatWizardContext";
import type { StepProps } from "../../../../../types/NewFlatsFormType";
import ButtonMotion from "../../../../../components/ButtonMotion";
import WizardNavButtons from "../../../../../components/ButtonNewFlats";

const options: Array<{
  value: "house" | "apartment";
  label: string;
  icon: string;
}> = [
  { value: "house",       label: "House",     icon: "/public/house.png" },
  { value: "apartment",  label: "Apartment", icon: "/public/flat.png" },
];

export default function StepPropertyType({ onNext, onBack }: StepProps) {
  const { data, setField } = useWizard();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <h2 className="text-2xl font-semibold mb-8">Select property type</h2>

      <div className="flex gap-12 mb-12">
        {options.map(({ value, label, icon }) => (
          <div key={value} className="flex flex-col items-center">
            <ButtonMotion
              onClick={() => setField("type", value)}
              className={`
                w-56 h-56
                overflow-hidden rounded-2xl
                transition-shadow
                ${data.type === value
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
        disableNext={!data.type}
      />
      </div>
  );
}
