import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { useAuth } from '../../auth/useAuth';
import { Heart, Trash2, Edit } from 'lucide-react';
import type { FlatData } from '../../../types/NewFlatsFormType';

interface FlatDoc extends FlatData {
  id: string;
  images: string[];
  ownerId?: string;
}

export default function AllFlats() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [flats, setFlats] = useState<FlatDoc[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // load flats + favorit
  useEffect(() => {
    const flatsQ = query(collection(db, 'Flats'), orderBy('createdAt', 'desc'));
    const unsubFlats = onSnapshot(
      flatsQ,
      snap => {
        const list = snap.docs.map(d => {
          const data = d.data() as FlatData;
          return {
            id: d.id,
            ...data,
            images: Array.isArray(data.images) ? data.images : [],
            ownerId: data.ownerId,
          };
        });
        setFlats(list);
      },
      err => {
        console.error('Error listening flats:', err);
        setError('An error occurred loading flats. Please try again.');
      }
    );

    let unsubFavs = () => {};
    if (currentUser) {
      const favQ = collection(db, 'users', currentUser.uid, 'Favorites');
      unsubFavs = onSnapshot(
        favQ,
        snap => setFavorites(new Set(snap.docs.map(d => d.id))),
        err => console.error('Error listening favorites:', err)
      );
    }

    return () => {
      unsubFlats();
      unsubFavs();
    };
  }, [currentUser]);

  const toggleFavorite = async (flatId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const favRef = doc(db, 'users', currentUser.uid, 'Favorites', flatId);
    if (favorites.has(flatId)) {
      await deleteDoc(favRef).catch(console.error);
    } else {
      await setDoc(favRef, { createdAt: new Date() }).catch(console.error);
    }
  };

  const handleDelete = async (flatId: string, ownerId: string) => {
    if (!currentUser || currentUser.uid !== ownerId) return;
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await deleteDoc(doc(db, 'Flats', flatId));
      await deleteDoc(doc(db, 'MyFlats', ownerId, 'Flats', flatId));
    } catch (err) {
      console.error('Error deleting flat:', err);
      alert('Failed to delete. Please try again.');
    }
  };

  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-blue-600 font-semibold mb-6">All flats</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {flats.map(flat => (
          <div
            key={flat.id}
            className="relative border rounded-lg overflow-hidden bg-white hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate(`/flat/${flat.id}`)}
          >
            {flat.images[0] ? (
              <img
                src={flat.images[0]}
                alt={flat.title}
                className="w-full h-48 object-cover"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}

            <div className="p-4">
              <h2 className="font-semibold text-xl mb-1">{flat.title}</h2>
              <p className="text-gray-600">{flat.city}</p>
              <p className="mt-2 font-medium">{flat.price} €</p>
            </div>

            {/* Favorite & Owner Actions */}
            <div className="absolute top-3 right-3 flex space-x-2 z-10">
              <div
                className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition"
                onClick={e => { e.stopPropagation(); toggleFavorite(flat.id); }}
              >
                <Heart
                  className={`w-6 h-6 ${
                    favorites.has(flat.id)
                      ? 'text-red-500 fill-current'
                      : 'text-gray-400'
                  }`}
                />
              </div>

              {currentUser?.uid === flat.ownerId && (
                <>
                  <div
                    className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition"
                    onClick={e => { e.stopPropagation(); navigate(`/edit/${flat.id}`); }}
                  >
                    <Edit className="w-6 h-6 text-blue-600" />
                  </div>
                  <div
                    className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition"
                    onClick={e => { e.stopPropagation(); handleDelete(flat.id, flat.ownerId!); }}
                  >
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
