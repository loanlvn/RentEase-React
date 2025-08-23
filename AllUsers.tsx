/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { db } from '../../../services/firebaseConfig';
import { useAuth } from '../../auth/useAuth';
import { Search, Filter, ArrowUpDown, User, Eye, Shield, Home, Edit, Trash2, Building, X, MapPin, Euro, 
  Square 
} from 'lucide-react';
import type { FlatData } from "../../../types/NewFlatsFormType";
import FullPageLoader from '../../../components/FullPageLoader';

interface UserData {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  createdAt: string;
  isAdmin: boolean;
  photoURL?: string;
  publishedFlatsCount: number;
}

interface FlatDoc extends FlatData {
  id: string;
  ownerId: string;
  images: string[];
}

interface FilterState {
  ageRange: string;
  flatsRange: string;
  isAdmin: string;
  searchQuery: string;
}

interface SortConfig {
  key: keyof UserData | 'birthDate';
  direction: 'asc' | 'desc';
}

export default function AllUsers() {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState<UserData[]>([]);
  const [flats, setFlats] = useState<FlatDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showFlatsModal, setShowFlatsModal] = useState(false);
  const [userFlats, setUserFlats] = useState<FlatDoc[]>([]);

  const [activeTab, setActiveTab] = useState<'users' | 'listings'>('users');

  const [filters, setFilters] = useState<FilterState>({
    ageRange: '',
    flatsRange: '',
    isAdmin: '',
    searchQuery: '',
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'desc',
  });

  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = currentUser?.uid === "2VUmFYgHvgTzwyqfm5YLVAYLsWZ2";

  const getAge = (dob: string): number => {
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const countUserFlats = async (uid: string): Promise<number> => {
    const q = query(collection(db, 'Flats'), where('ownerId', '==', uid));
    const snap = await getDocs(q);
    return snap.size;
  };

  async function deleteUser(uid: string) {
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to delete this user and all their data?")) return;
    try {
      // delete all annonce from user
      const flatsSnap = await getDocs(query(collection(db, 'Flats'), where('ownerId', '==', uid)));
      for (const flatDoc of flatsSnap.docs) {
        const flatId = flatDoc.id;
        // delete annonce globale
        await deleteDoc(doc(db, 'Flats', flatId));
        // delete from MyFlats
        await deleteDoc(doc(db, 'MyFlats', uid, 'Flats', flatId));
  
        // delete messages
        const msgSnap = await getDocs(collection(db, 'Conversations', flatId, 'Messages'));
        for (const msg of msgSnap.docs) {
          await deleteDoc(msg.ref);
        }
        await deleteDoc(doc(db, 'Conversations', flatId));
      }
  
      // delete all favorites from user
      const favSnap = await getDocs(collection(db, 'users', uid, 'Favorites'));
      for (const favDoc of favSnap.docs) {
        await deleteDoc(favDoc.ref);
      }
  
      // 3) delete user's profile 
      await deleteDoc(doc(db, 'users', uid));
  
      // 4) update Firebase
      setUsers(us => us.filter(u => u.uid !== uid));
      alert("User and all their data have been deleted.");
    } catch (e) {
      console.error("Failed to delete user and related data:", e);
      alert("Deletion failed. Check console for details.");
    }
  }
  

  // fetch users
  useEffect(() => {
    if (!isAdmin) {
      setError('Access Denied');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const snap = await getDocs(collection(db, 'users'));
        const arr: UserData[] = [];
        for (const d of snap.docs) {
          const data = d.data() as any;
          arr.push({
            uid: d.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            birthDate: data.birthDate,
            createdAt: data.createdAt,
            isAdmin: data.isAdmin,
            photoURL: data.photoURL,
            publishedFlatsCount: await countUserFlats(d.id),
          });
        }
        setUsers(arr);
      } catch (e) {
        console.error(e);
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  // listen to all flats
  useEffect(() => {
    if (!isAdmin) return;
    const q = query(collection(db, 'Flats'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const list: FlatDoc[] = snap.docs.map(d => {
        const data = d.data() as FlatData & { ownerId?: string };
        return {
          id: d.id,
          ownerId: data.ownerId!,
          ...data,
          images: Array.isArray(data.images) ? data.images : []
        };
      });
      setFlats(list);
    }, e => {
      console.error(e);
      setError('Failed to load listings');
    });
    return unsub;
  }, [isAdmin]);

  // delete a listing flat
  const deleteFlat = async (flatId: string, ownerId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Delete this listing?')) return;
    try {
      await deleteDoc(doc(db, 'Flats', flatId));
      await deleteDoc(doc(db, 'MyFlats', ownerId, 'Flats', flatId));
      setFlats(f => f.filter(x => x.id !== flatId));
      setUserFlats(f => f.filter(x => x.id !== flatId));
      setUsers(u => u.map(u2 =>
        u2.uid === ownerId
          ? { ...u2, publishedFlatsCount: Math.max(0, u2.publishedFlatsCount - 1) }
          : u2
      ));
    } catch (e) {
      console.error(e);
      alert('Deletion failed');
    }
  };

  // show a user's listings
  const openFlats = (u: UserData) => {
    setUserFlats(flats.filter(f => f.ownerId === u.uid));
    setSelectedUser(u);
    setShowFlatsModal(true);
  };

  // filter & sort users
  const displayedUsers = useMemo(() => {
    let arr = [...users];
    // searchBar
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      arr = arr.filter(u =>
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    // age range
    if (filters.ageRange) {
      const [min, max] = filters.ageRange.split('-').map(Number);
      arr = arr.filter(u => {
        const a = getAge(u.birthDate);
        return a >= min && (!max || a <= max);
      });
    }
    // listings count
    if (filters.flatsRange) {
      const [min, max] = filters.flatsRange.split('-').map(Number);
      arr = arr.filter(u =>
        u.publishedFlatsCount >= min && (!max || u.publishedFlatsCount <= max)
      );
    }
    // admin flag
    if (filters.isAdmin) {
      arr = arr.filter(u => u.isAdmin === (filters.isAdmin === 'true'));
    }
    // sorting
    arr.sort((a, b) => {
      let va: any = a[sortConfig.key];
      let vb: any = b[sortConfig.key];
      if (sortConfig.key === 'birthDate') {
        va = getAge(a.birthDate);
        vb = getAge(b.birthDate);
      }
      if (va < vb) return sortConfig.direction === 'asc' ? -1 : 1;
      if (va > vb) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }, [users, filters, sortConfig]);

  // filter listings
  const displayedFlats = useMemo(() => {
    if (!filters.searchQuery) return flats;
    const q = filters.searchQuery.toLowerCase();
    return flats.filter(f =>
      f.title.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q) ||
      f.address?.toLowerCase().includes(q) ||
      users.some(u =>
        u.uid === f.ownerId &&
        (u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q))
      )
    );
  }, [flats, filters.searchQuery, users]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-xl font-bold">Access Denied</p>
      </div>
    );
  }
  if (loading) {
    return <FullPageLoader />;
  }
  if (error) {
    return <p className="text-center py-10 text-red-500">{error}</p>;
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <span className="text-gray-500">
              {activeTab === 'users'
                ? `${displayedUsers.length}/${users.length} users`
                : `${displayedFlats.length}/${flats.length} listings`}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}>
              <User className="inline mr-1" /> Users
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`px-4 py-2 rounded ${
                activeTab === 'listings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}>
              <Building className="inline mr-1" /> Listings
            </button>
          </div>

          {/* Search & Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={activeTab === 'users' ? 'Search users…' : 'Search listings…'}
                value={filters.searchQuery}
                onChange={e => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {activeTab === 'users' && (
              <>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center"
                >
                  <Filter className="mr-1" /> Filters
                </button>
                <button
                  onClick={() => setFilters({ ageRange: '', flatsRange: '', isAdmin: '', searchQuery: '' })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
              </>
            )}
          </div>

          {/* User Filters */}
          {showFilters && activeTab === 'users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded mb-4">
              <div>
                <label className="block mb-1">Age range</label>
                <select
                  value={filters.ageRange}
                  onChange={e => setFilters(f => ({ ...f, ageRange: e.target.value }))}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">All</option>
                  <option value="18-25">18–25</option>
                  <option value="26-35">26–35</option>
                  <option value="36-45">36–45</option>
                  <option value="46-">46+</option>
                </select>
              </div>
              <div>
                <label className="block mb-1"># Listings</label>
                <select
                  value={filters.flatsRange}
                  onChange={e => setFilters(f => ({ ...f, flatsRange: e.target.value }))}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">All</option>
                  <option value="0-0">0</option>
                  <option value="1-5">1–5</option>
                  <option value="6-10">6–10</option>
                  <option value="11-">11+</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Admin?</label>
                <select
                  value={filters.isAdmin}
                  onChange={e => setFilters(f => ({ ...f, isAdmin: e.target.value }))}
                  className="w-full border rounded px-2 py-1"
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow overflow-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={() => setSortConfig(s => ({ key: 'firstName', direction: s.key === 'firstName' && s.direction === 'asc' ? 'desc' : 'asc' }))}
                      className="flex items-center"
                    >
                      First Name <ArrowUpDown className="ml-1" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={() => setSortConfig(s => ({ key: 'lastName', direction: s.key === 'lastName' && s.direction === 'asc' ? 'desc' : 'asc' }))}
                      className="flex items-center"
                    >
                      Last Name <ArrowUpDown className="ml-1" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={() => setSortConfig(s => ({ key: 'birthDate', direction: s.key === 'birthDate' && s.direction === 'asc' ? 'desc' : 'asc' }))}
                      className="flex items-center"
                    >
                      Age <ArrowUpDown className="ml-1" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    <button
                      onClick={() => setSortConfig(s => ({ key: 'publishedFlatsCount', direction: s.key === 'publishedFlatsCount' && s.direction === 'asc' ? 'desc' : 'asc' }))}
                      className="flex items-center"
                    >
                      Listings <ArrowUpDown className="ml-1" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {displayedUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap flex items-center">
                      {u.photoURL
                        ? <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full"/>
                        : <User className="w-8 h-8 text-gray-400"/>
                      }
                      <span className="ml-2">{u.firstName}</span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{u.lastName}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{getAge(u.birthDate)}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button onClick={() => openFlats(u)} className="flex items-center text-blue-600 hover:underline">
                        <Home className="mr-1"/> {u.publishedFlatsCount}
                      </button>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-center">
                      {u.isAdmin ? <Shield className="text-green-600"/> : <User className="text-gray-600"/>}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <button onClick={() => { setSelectedUser(u); setShowUserModal(true); }} className="flex items-center text-blue-600 hover:underline">
                        <Eye className="mr-1"/> View
                      </button>
                      <button
                        onClick={() => deleteUser(u.uid)}
                        className="text-red-600 hover:text-red-800 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!displayedUsers.length && <div className="p-6 text-center text-gray-500">No users found</div>}
          </div>
        )}

        {/* Listings Grid */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedFlats.map(f => (
              <div
                key={f.id}
                className="relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => window.location.href = `/flat/${f.id}`}
              >
                {f.images[0]
                  ? <img src={f.images[0]} alt={f.title} className="w-full h-48 object-cover"/>
                  : <div className="w-full h-48 bg-gray-200 flex items-center justify-center"><span className="text-gray-500">No image</span></div>
                }
                <div className="p-4">
                  <h2 className="font-semibold text-xl mb-1">{f.title}</h2>
                  <div className="flex items-center text-gray-600"><MapPin className="mr-1"/> {f.city}</div>
                  <p className="mt-2 font-bold text-green-600 flex items-center"><Euro className="mr-1"/> {f.price}</p>
                  <div className="mt-1 flex items-center text-gray-500"><Square className="mr-1"/> {f.surface}m²</div>
                </div>
                <div className="absolute top-2 right-2 flex space-x-2 z-10">
                  <Link
                    to={`/edit/${f.id}`}
                    onClick={e => e.stopPropagation()}
                    className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition"
                    title="Edit listing"
                  >
                    <Edit className="w-5 h-5 text-blue-600"/>
                  </Link>
                  <button
                    onClick={e => { e.stopPropagation(); deleteFlat(f.id, f.ownerId);}}
                    className="bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition"
                    title="Delete listing"
                  >
                    <Trash2 className="w-5 h-5 text-red-600"/>
                  </button>
                </div>
                <span className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Published</span>
              </div>
            ))}
            {!displayedFlats.length && (
              <div className="p-12 text-center text-gray-500 bg-white rounded-lg shadow">
                <Building className="mx-auto mb-4 w-12 h-12 text-gray-400"/>
                No listings found
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Profile Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg relative w-80">
            <button onClick={() => setShowUserModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"><X /></button>
            <h2 className="text-2xl font-bold mb-4">{selectedUser.firstName}'s Profile</h2>
            <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Age:</strong> {getAge(selectedUser.birthDate)}</p>
            <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
            <p><strong>Role:</strong> {selectedUser.isAdmin ? 'Admin' : 'User'}</p>
          </div>
        </div>
      )}

      {/* User Listings Modal */}
      {showFlatsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-h-[80vh] overflow-auto w-11/12 md:w-3/4 relative">
            <button onClick={() => setShowFlatsModal(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"><X /></button>
            <h2 className="text-2xl font-bold mb-4">{selectedUser.firstName}'s Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {userFlats.map(f => (
                <div key={f.id} className="border rounded-lg overflow-hidden bg-gray-50">
                  <Link to={`/flat/${f.id}`}>
                    {f.images[0]
                      ? <img src={f.images[0]} alt={f.title} className="w-full h-32 object-cover"/>
                      : <div className="w-full h-32 bg-gray-200 flex items-center justify-center"><Building className="w-8 h-8 text-gray-400"/></div>
                    }
                    <div className="p-2">
                      <h3 className="font-semibold">{f.title}</h3>
                      <p className="text-sm text-gray-600">{f.city}</p>
                    </div>
                  </Link>
                  <div className="flex justify-end space-x-2 p-2">
                    <Link to={`/edit/${f.id}`} onClick={e => e.stopPropagation()} className="bg-white p-1 rounded-full hover:bg-gray-100"><Edit className="w-4 h-4 text-blue-600"/></Link>
                    <button onClick={() => deleteFlat(f.id, f.ownerId)} className="bg-white p-1 rounded-full hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-600"/></button>
                  </div>
                </div>
              ))}
              {!userFlats.length && <p className="text-center text-gray-500 py-4">No listings published.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
