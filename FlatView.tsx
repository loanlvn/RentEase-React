import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../services/firebaseConfig";
import type { FlatData } from "../../../types/NewFlatsFormType";
import ButtonMotion from "../../../components/ButtonMotion";
import MessageBox from "../../../components/MessageBox";
import FullPageLoader from "../../../components/FullPageLoader";

interface FlatDoc extends FlatData {
  ownerId: string;
  flatId: string;
}

export default function FlatView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [flat, setFlat] = useState<FlatDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchFlat = async () => {
      setLoading(true);
      try {
        const ref = doc(db, "Flats", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          // Récupère data et cast pour inclure ownerId
          const data = snap.data() as FlatData & { ownerId: string };
          setFlat({
            ...data,
            flatId: snap.id,
          });
        } else {
          setError("Annonce introuvable.");
        }
      } catch (err) {
        console.error("Erreur loading flat:", err);
        setError("An error occured during loading flats.");
      } finally {
        setLoading(false);
      }
    };
    fetchFlat();
  }, [id]);

  if (loading) return <FullPageLoader />;
  if (error)   return <p className="text-red-500">{error}</p>;
  if (!flat)  return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ButtonMotion
        onClick={() => navigate(-1)}
        className="mb-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
      >
        ← Back
      </ButtonMotion>
      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Détails du flat */}
        <div className="lg:w-2/3">
          <h1 className="text-3xl font-bold mb-4">{flat.title}</h1>
          <p className="text-gray-600 mb-2">
            {flat.city} - {flat.address}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {flat.images.map((url, idx) => (
              <img
                key={idx}
                src={url}
                alt={`${flat.title}-${idx}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            ))}
          </div>
          <div className="space-y-2 mb-6">
            <p><strong>Type:</strong> {flat.type}</p>
            <p><strong>Mode:</strong> {flat.mode}</p>
            <p><strong>Aera:</strong> {flat.surface} m²</p>
            <p><strong>Rooms:</strong> {flat.rooms}</p>
            <p><strong>Meublé:</strong> {flat.furnished ? "Oui" : "Non"}</p>
            <p><strong>AC:</strong> {flat.airConditioned ? "Oui" : "Non"}</p>
            <p><strong>Construction Year:</strong> {flat.constructionYear}</p>
            <p><strong>DPE:</strong> {flat.notSubjectToDpe ? "Non soumis" : flat.dpe}</p>
            <p><strong>Consumption:</strong> {flat.consumption} kWhEP/m²/an</p>
            <p><strong>Emission:</strong> {flat.emission} kgCO₂/m²/an</p>
            <p><strong>Price:</strong> {flat.price} €</p>
            <p><strong>Charges:</strong> {flat.charges} €</p>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-800 whitespace-pre-wrap">{flat.description}</p>
          </div>
        </div>

        {/* MessageBox */}
        <div className="lg:w-1/3 mt-8 lg:mt-0">
          <MessageBox flatId={flat.flatId} ownerId={flat.ownerId} />
        </div>
      </div>
    </div>
  );
}
