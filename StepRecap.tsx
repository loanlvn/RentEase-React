import { useWizard } from "../../Config/NewFlatWizardContext";
import type { StepProps } from "../../../../../types/NewFlatsFormType";
import WizardNavButtons from "../../../../../components/ButtonNewFlats";
import { submitNewFlat } from "../../Config/SubmitFlatsFirebase";
import  { useAuth } from "../../../../auth/useAuth";
import { useState } from "react";
import FullPageLoader from "../../../../../components/FullPageLoader";
import { useNavigate } from "react-router-dom";

export default function StepRecap({ onBack }: StepProps) {
  const { data } = useWizard();
  const { currentUser: user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (authLoading){
    return <FullPageLoader />
  }

  const handleSubmit = async () => {
    if (!user?.uid) {
      setError("You must be logged in to submit.");
      return;
    }

    try {
      setLoading(true);
      await submitNewFlat(data, user.uid);
      navigate("/new-flat/success");
    } catch (err) {
      console.error("Error submitting flat:", err);
      setError("An error occurred while submitting the flat.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white p-6">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Final Recap</h1>
        <p className="text-sm text-gray-500 mb-8">Please check your information before submitting.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <Info label="Mode" value={data.mode} />
          <Info label="Type" value={data.type} />
          <Info label="Title" value={data.title} />
          <Info label="City" value={data.city} />
          <Info label="Address" value={data.address} />
          <Info label="Surface" value={`${data.surface} m²`} />
          <Info label="Rooms" value={data.rooms} />
          <Info label="Furnished" value={data.furnished ? "Yes" : "No"} />
          <Info label="Air Conditioned" value={data.airConditioned ? "Yes" : "No"} />
          <Info label="Year Built" value={data.constructionYear} />
          <Info label="DPE" value={data.notSubjectToDpe ? "Not subject" : data.dpe} />
          <Info label="Consumption" value={data.consumption ? `${data.consumption} kWhEP/m²/year` : "-"} />
          <Info label="Emission Consumption" value={data.emissionConsumption || "-"} />
          <Info label="Emissions" value={data.emission ? `${data.emission} kgCO₂/m²/year` : "-"} />
          <Info label="Price" value={`${data.price} €`} />
          <Info label="Charges" value={data.charges ? `${data.charges} €` : "0 €"} />
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{data.description}</p>
        </div>

        {data.images.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-semibold mb-2">Photos</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {data.images.map((file, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(file)}
                  alt={`preview-${idx}`}
                  className="object-cover w-full h-32 rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mt-6 flex justify-between">
          <WizardNavButtons
            onBack={onBack}
            onNext={handleSubmit}
            disableNext={loading}
            nextLabel={loading ? "Submitting..." : "Confirm and Submit"}
          />
        </div>
      </div>
      {loading && <FullPageLoader/>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-800">{value || "-"}</p>
    </div>
  );
}
