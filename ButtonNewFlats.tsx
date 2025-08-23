import type { MouseEventHandler, FC } from "react";
import ButtonMotion from "./ButtonMotion";

interface WizardNavButtonsProps {
  onBack: MouseEventHandler;
  onNext: MouseEventHandler;
  disableNext?: boolean;
  backLabel?: string;
  nextLabel?: string;
}

const WizardNavButtons: FC<WizardNavButtonsProps> = ({
  onBack,
  onNext,
  disableNext = false,
  backLabel = "Go back",
  nextLabel = "Continue",
}) => (
  <div className="flex justify-between w-full max-w-md px-4">
    <ButtonMotion
      type="button"
      onClick={onBack}
      className="px-4 py-2 border rounded-lg hover:bg-gray-100"
    >
      {backLabel}
    </ButtonMotion>
    <ButtonMotion
      type="button"
      onClick={onNext}
      disabled={disableNext}
      className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 hover:opacity-90"
    >
      {nextLabel}
    </ButtonMotion>
  </div>
);

export default WizardNavButtons;
