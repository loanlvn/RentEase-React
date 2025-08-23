/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../auth/useAuth';
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Euro,
  Square,
  Heart,
  X,
  Edit,
} from 'lucide-react';

interface Flat {
  id: string;
  title: string;
  city: string;
  price: number;
  surface: number;
  type: 'house' | 'apartment';
  mode: 'sell' | 'rent';
  images: string[];
  ownerId?: string;
  email: string;
  name: string;
}

// Major European cities list
const EUROPEAN_CITIES = [
  'Paris','London','Berlin','Madrid','Rome',
  'Amsterdam','Vienna','Prague','Barcelona','Lisbon',
  'Dublin','Stockholm','Copenhagen','Brussels','Budapest'
];

export default function SearchMenuPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [flats, setFlats] = useState<Flat[]>([]);
  const [owners, setOwners] = useState<Record<string, string>>({});
  const [ownersEmail, setOwnersEmail] = useState<Record<string, string>>({});

  // Free-text search input
  const [cityFilter, setCityFilter] = useState('');
  // Dropdown for major European cities
  const [euroCityFilter, setEuroCityFilter] = useState<string>('');

  const [typeFilter, setTypeFilter] = useState<'' | 'house' | 'apartment'>('');
  const [modeFilter, setModeFilter] = useState<'' | 'sell' | 'rent'>('');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [areaSort, setAreaSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [surfaceMin, setSurfaceMin] = useState<number | ''>('');
  const [surfaceMax, setSurfaceMax] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // 1️⃣ Load all flats
  useEffect(() => {
    getDocs(collection(db, 'Flats'))
      .then(snapshot => {
        const data = snapshot.docs.map(d => {
          const f = d.data() as any;
          return {
            id: d.id,
            title: f.title || '',
            city: f.city || '',
            price: f.price || 0,
            surface: f.surface || 0,
            type: f.type || 'apartment',
            mode: f.mode || 'rent',
            images: Array.isArray(f.images) ? f.images : [],
            ownerId: f.ownerId,
            email: f.email || '',
            name: f.name || '',
          };
        });
        setFlats(data);
      })
      .catch(err => console.error('Error loading flats:', err));
  }, []);

  // 2️⃣ Load all users into owners map
  useEffect(() => {
    getDocs(collection(db, 'users'))
      .then(snapshot => {
        const names: Record<string, string> = {};
        const emails: Record<string, string> = {};
        snapshot.docs.forEach(docSnap => {
          const u = docSnap.data() as any;
          names[docSnap.id] = `${u.firstName} ${u.lastName}`;
          emails[docSnap.id] = u.email;
        });
        setOwners(names);
        setOwnersEmail(emails);
      })
      .catch(err => console.error('Error loading users:', err));
  }, []);

  // 3️⃣ Subscribe to favorites
  useEffect(() => {
    if (!currentUser) return;
    const favCol = collection(db, 'users', currentUser.uid, 'Favorites');
    const unsub = onSnapshot(
      favCol,
      snap => setFavorites(new Set(snap.docs.map(d => d.id))),
      err => console.error('Error loading favorites:', err)
    );
    return () => unsub();
  }, [currentUser]);

  // 4️⃣ Filter & sort
  const filtered = useMemo(() => {
    let list = [...flats];

    // A) dropdown European city filter
    if (euroCityFilter) {
      const q = euroCityFilter.toLowerCase();
      list = list.filter(f => f.city.toLowerCase() === q);
    }

    // B) free-text search by city/title
    if (cityFilter.trim()) {
      const q = cityFilter.toLowerCase();
      list = list.filter(f =>
        f.city.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q)
      );
    }

    if (typeFilter) list = list.filter(f => f.type === typeFilter);
    if (modeFilter) list = list.filter(f => f.mode === modeFilter);

    if (surfaceMin !== '') list = list.filter(f => f.surface >= surfaceMin);
    if (surfaceMax !== '') list = list.filter(f => f.surface <= surfaceMax);

    if (priceSort !== 'none') {
      list.sort((a, b) =>
        priceSort === 'asc' ? a.price - b.price : b.price - a.price
      );
    }
    if (areaSort !== 'none') {
      list.sort((a, b) =>
        areaSort === 'asc' ? a.surface - b.surface : b.surface - a.surface
      );
    }
    return list;
  }, [
    flats,
    euroCityFilter,
    cityFilter,
    typeFilter,
    modeFilter,
    priceSort,
    areaSort,
    surfaceMin,
    surfaceMax,
  ]);

  // 5️⃣ Toggle favorite
  const toggleFavorite = async (flatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return navigate('/login');
    const ref = doc(db, 'users', currentUser.uid, 'Favorites', flatId);
    try {
      if (favorites.has(flatId)) {
        await deleteDoc(ref);
      } else {
        await setDoc(ref, { createdAt: new Date() });
      }
    } catch (err) {
      console.error('Error updating favorites:', err);
    }
  };

  // 6️⃣ Navigate to edit if owner
  const handleEdit = (flatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit/${flatId}`);
  };

  // 7️⃣ Reset all filters
  const resetAll = () => {
    setEuroCityFilter('');
    setCityFilter('');
    setTypeFilter('');
    setModeFilter('');
    setPriceSort('none');
    setAreaSort('none');
    setSurfaceMin('');
    setSurfaceMax('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl text-blue-600 font-semibold mb-6">Menu</h1>

      {/* Search bar above filters */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by city or title..."
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Filter & reset buttons */}
      <div className="flex justify-between mb-6 gap-4">
        <button
          onClick={() => setShowFilters(f => !f)}
          className="flex items-center px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          <Filter className="w-5 h-5 mr-1" /> Filters
        </button>
        <button
          onClick={resetAll}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          <X className="w-5 h-5 mr-1" /> Reset
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {/* European City */}
          <div>
            <label className="block mb-1">Major European City</label>
            <select
              value={euroCityFilter}
              onChange={e => setEuroCityFilter(e.target.value)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="">All Europe</option>
              {EUROPEAN_CITIES.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block mb-1">Type</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="">All</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
            </select>
          </div>

          {/* Mode */}
          <div>
            <label className="block mb-1">Mode</label>
            <select
              value={modeFilter}
              onChange={e => setModeFilter(e.target.value as any)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="">All</option>
              <option value="sell">Sell</option>
              <option value="rent">Rent</option>
            </select>
          </div>

          {/* Surface Min */}
          <div>
            <label className="block mb-1">Surface Min (m²)</label>
            <input
              type="number"
              value={surfaceMin}
              onChange={e => setSurfaceMin(e.target.value === '' ? '' : +e.target.value)}
              className="w-full border p-2 rounded-lg"
              placeholder="Min"
            />
          </div>

          {/* Surface Max */}
          <div>
            <label className="block mb-1">Surface Max (m²)</label>
            <input
              type="number"
              value={surfaceMax}
              onChange={e => setSurfaceMax(e.target.value === '' ? '' : +e.target.value)}
              className="w-full border p-2 rounded-lg"
              placeholder="Max"
            />
          </div>

          {/* Price sort */}
          <div>
            <label className="block mb-1 flex items-center gap-1">
              Price <ArrowUpDown className="w-4 h-4" />
            </label>
            <select
              value={priceSort}
              onChange={e => setPriceSort(e.target.value as any)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="none">None</option>
              <option value="asc">Low → High</option>
              <option value="desc">High → Low</option>
            </select>
          </div>

          {/* Area sort */}
          <div>
            <label className="block mb-1 flex items-center gap-1">
              Area <ArrowUpDown className="w-4 h-4" />
            </label>
            <select
              value={areaSort}
              onChange={e => setAreaSort(e.target.value as any)}
              className="w-full border p-2 rounded-lg"
            >
              <option value="none">None</option>
              <option value="asc">Small → Large</option>
              <option value="desc">Large → Small</option>
            </select>
          </div>
        </div>
      )}

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(flat => (
          <div
            key={flat.id}
            className="relative bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition cursor-pointer"
            onClick={() => navigate(`/flat/${flat.id}`)}
          >
            {/* ...rest unchanged... */}
            {flat.images[0] ? (
              <img
                src={flat.images[0]}
                alt={flat.title}
                className="w-full h-48 object-cover"
                onError={e => (e.currentTarget.style.display = 'none')}
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image</span>
              </div>
            )}
            <div className="p-4 space-y-1">
              <h2 className="text-xl font-semibold">{flat.title}</h2>
              <p className="text-sm text-gray-600">
                Owner: <span className="font-medium">{flat.name || owners[flat.ownerId!] || 'Unknown'}</span><br/>
                Email: <span className="font-medium">{flat.email || ownersEmail[flat.ownerId!] || 'Unknown'}</span>
              </p>
              <div className="flex items-center text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1" /> {flat.city}
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1 font-semibold text-green-600">
                  <Euro className="w-5 h-5" /> {flat.price.toLocaleString()} €
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Square className="w-5 h-5" /> {flat.surface} m²
                </div>
              </div>
            </div>
            <div
              className="absolute top-3 right-3 flex space-x-2 z-10"
              onClick={e => e.stopPropagation()}
            >
              <div
                className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition"
                onClick={e => toggleFavorite(flat.id, e)}
              >
                <Heart
                  className={`w-6 h-6 ${
                    favorites.has(flat.id) ? 'text-red-500 fill-current' : 'text-gray-400'
                  }`}  
                />
              </div>
              {currentUser?.uid === flat.ownerId && (
                <div
                  className="bg-white bg-opacity-80 rounded-full p-2 hover:bg-opacity-100 transition"
                  onClick={e => handleEdit(flat.id, e)}
                >
                  <Edit className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {flats.length > 0 && filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-8">
          No properties match your filters.
        </p>
      )}
    </div>
  );
}
