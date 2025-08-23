/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { useAuth } from '../../auth/useAuth';
import { Edit, Trash2 } from 'lucide-react';
import type { FlatData } from '../../../types/NewFlatsFormType';
import FullPageLoader from '../../../components/FullPageLoader';

interface FlatDoc extends FlatData {
  id: string; // ID in MyFlats collection
  flatId: string; // global ID in Flats
  images: string[];
}

export default function MyFlats() {
  const navigate = useNavigate();
  const { currentUser, loading: authLoading } = useAuth();
  const [flats, setFlats] = useState<FlatDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetching current user's flats
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchMyFlats = async () => {
      setLoading(true);
      try {
        const q = collection(db, 'MyFlats', currentUser.uid, 'Flats');
        const snap = await getDocs(q);
        const list = snap.docs.map(d => {
          const data = d.data() as any;
          return {
            id: d.id,
            flatId: data.flatId,
            ...data,
            images: Array.isArray(data.images) ? data.images : [],
          };
        });
        setFlats(list);
      } catch (err: any) {
        console.error('Error fetching user flats:', err);
        setError('Failed to load your listings.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyFlats();
  }, [authLoading, currentUser, navigate]);

  // delete
  const handleDelete = async (localId: string, globalId: string) => {
    if (!currentUser) return;
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await deleteDoc(doc(db, 'Flats', globalId)); // global
      await deleteDoc(doc(db, 'MyFlats', currentUser.uid, 'Flats', localId)); // personal (+ Myflats)
      setFlats(prev => prev.filter(f => f.id !== localId));
    } catch (err) {
      console.error('Error deleting flat:', err);
      alert('Deletion failed. Please try again.');
    }
  };

  if (loading || authLoading) {
    return <FullPageLoader />
  }
  if (error) {
    return <p className="text-red-500 text-center py-4">{error}</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl text-blue-600 font-semibold mb-6">My flats</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {flats.map(flat => (
          <div
            key={flat.id}
            className="relative border rounded-lg overflow-hidden bg-white hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate(`/flat/${flat.flatId}`)}
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

            {/* Edit & Delete */}
            <div className="absolute top-3 right-3 flex space-x-2 z-10">
              <div
                className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition"
                onClick={e => { e.stopPropagation(); navigate(`/edit/${flat.flatId}`); }}
              >
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <div
                className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition"
                onClick={e => { e.stopPropagation(); handleDelete(flat.id, flat.flatId); }}
              >
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
