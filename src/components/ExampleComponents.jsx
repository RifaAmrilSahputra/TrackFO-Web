import { useState } from 'react';
import { useFetch, useMutation } from '../hooks/useAPI';
import { userAPI } from '../services/apiClient';

/**
 * CONTOH PENGGUNAAN API MANAGEMENT
 * File ini adalah contoh, dapat dihapus setelah referensi selesai
 */

// ============= CONTOH 1: List dengan useFetch =============
export function UserListExample() {
  const { data: users, loading, error, refetch } = useFetch(() => userAPI.getAll());

  if (loading) return <div className="p-4">Memuat data...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Daftar User</h1>
      
      <button 
        onClick={refetch}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Data
      </button>

      <div className="space-y-2">
        {users?.data?.map(user => (
          <div key={user.id} className="p-3 border rounded">
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= CONTOH 2: Form Create dengan useMutation =============
export function CreateUserExample() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const { mutate, loading, error, isSuccess } = useMutation(userAPI.create);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mutate(formData);
      alert('User berhasil dibuat!');
      setFormData({ name: '', email: '' }); // Reset form
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <div className="p-4 border rounded max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Buat User Baru</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {error.message}
          </div>
        )}

        {isSuccess && (
          <div className="p-3 bg-green-100 text-green-700 rounded text-sm">
            Berhasil dibuat!
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </div>
  );
}

// ============= CONTOH 3: Delete dengan useMutation =============
export function DeleteUserExample({ userId, userName, onSuccess }) {
  const { mutate, loading, error } = useMutation(userAPI.delete);

  const handleDelete = async () => {
    if (window.confirm(`Hapus user "${userName}"?`)) {
      try {
        await mutate(userId);
        alert('User berhasil dihapus!');
        onSuccess?.();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:bg-gray-400"
      >
        {loading ? 'Menghapus...' : 'Hapus'}
      </button>
      {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
    </div>
  );
}

// ============= CONTOH 4: Update dengan useMutation =============
export function UpdateUserExample({ user, onSuccess }) {
  const [formData, setFormData] = useState(user);
  const { mutate, loading, error, isSuccess } = useMutation(
    (data) => userAPI.update(user.id, data)
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mutate(formData);
      alert('User berhasil diupdate!');
      onSuccess?.();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-medium mb-1">Nama</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error.message}</p>}
      {isSuccess && <p className="text-green-500 text-sm">Berhasil diupdate!</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
      >
        {loading ? 'Menyimpan...' : 'Update'}
      </button>
    </form>
  );
}

// ============= CONTOH 5: List dengan Pagination =============
export function UserListWithPaginationExample() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const { data, loading, error, refetch } = useFetch(
    () => userAPI.getAll({ page, limit })
  );

  const handleNextPage = () => {
    setPage(prev => prev + 1);
  };

  const handlePrevPage = () => {
    setPage(prev => (prev > 1 ? prev - 1 : 1));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">User List (Pagination)</h1>

      <div className="space-y-2 mb-4">
        {data?.data?.map(user => (
          <div key={user.id} className="p-3 border rounded">
            {user.name}
          </div>
        ))}
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={handlePrevPage}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
        >
          Previous
        </button>

        <span>Page {page}</span>

        <button
          onClick={handleNextPage}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}
