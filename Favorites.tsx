/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDoc, onSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";
import { db } from "../../../services/firebaseConfig";
import { useAuth } from "../../auth/useAuth";
import FavoriteIcon from '@mui/icons-material/Favorite';
import type { FlatData } from "../../../types/NewFlatsFormType";
import FullPageLoader from "../../../components/FullPageLoader";

interface FlatDoc extends Omit<FlatData, 'images'> {
  id: string;
  images: string[];
}

export default function Favorites() {
  const { currentUser } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [flats, setFlats] = useState<FlatDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorites with real-time updates
  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    const favoritesRef = collection(db, "users", currentUser.uid, "Favorites");
    const unsubscribe = onSnapshot(
      favoritesRef,
      async (favSnapshot) => {
        try {
          const favIds = favSnapshot.docs.map(doc => doc.id);
          setFavorites(new Set(favIds));

          if (favIds.length === 0) {
            setFlats([]);
            setLoading(false);
            return;
          }

          // fetching each flat by ID
          const flatPromises = favIds.map(async (id) => {
            try {
              const flatSnap = await getDoc(doc(db, "Flats", id));
              if (flatSnap.exists()) {
                const data = flatSnap.data() as FlatData;
                return {
                  id,
                  ...data,
                  images: Array.isArray(data.images) ? data.images : []
                };
              }
              return null;
            } catch (err) {
              console.error("Error occured during delete process:", err);
              return null;
            }
          });

          const results = await Promise.all(flatPromises);
          const validFlats = results.filter((flat): flat is FlatDoc => flat !== null);
          
          setFlats(validFlats);
          setError(null);
        } catch (err: any) {
          console.error("Error during loading favorites:", err);
          setError("Error during loading favorites");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error listening favorites", err);
        setError("Error during loading favorites.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // toggle favorite removes from list
  const toggleFavorite = async (flatId: string) => {
    if (!currentUser) return;
    
    try {
      const favRef = doc(db, "users", currentUser.uid, "Favorites", flatId);
      await deleteDoc(favRef);
      // onSnapshot mettra automatiquement à jour l'état
    } catch (err) {
      console.error("Error during processus of deleting the flat:", err);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-center text-gray-500">
          You must be connected to see your favorites.
        </p>
      </div>
    );
  }

  if (loading) return <FullPageLoader />;
  if (error) return <p className="text-red-500 text-center py-8">{error}</p>;
  
  if (flats.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl text-blue-600 font-semibold mb-6">Mes Favoris</h1>
        <div className="text-center py-12">
          <FavoriteIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">You have no favorites.</p>
          <p className="text-gray-400 mt-2">
            Browse the ads and click ❤️ to add your favorites!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-blue-600 font-semibold mb-6">
        My Favorites ({flats.length})
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {flats.map(flat => (
          <div key={flat.id} className="relative border rounded-lg overflow-hidden hover:shadow-lg transition">
            <Link to={`/flat/${flat.id}`}>  
              {flat.images && flat.images.length > 0 ? (
                <img
                  src={flat.images[0]}
                  alt={flat.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    console.log("Erreur de chargement d'image:", flat.images[0]);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No pictures</span>
                </div>
              )}
              
              <div className="p-4">
                <h2 className="font-semibold text-xl mb-2">{flat.title}</h2>
                <p className="text-gray-600">{flat.city}</p>
                <p className="mt-2 font-medium">{flat.price?.toLocaleString()} €</p>
                {flat.surface && <p className="text-gray-500">{flat.surface} m²</p>}
              </div>
            </Link>
            
            <button
              onClick={() => toggleFavorite(flat.id)}
              className="absolute top-2 right-2 bg-white bg-opacity-90 p-2 rounded-full hover:bg-opacity-100 transition z-10"
              title="Retirer des favoris"
            >
              <FavoriteIcon className="w-6 h-6 text-red-500 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}