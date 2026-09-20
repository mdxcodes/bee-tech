import { useEffect, useState } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { getProducts, createProduct, updateProduct, deleteProduct, updateProductStock } from "../services/api.js";
import { LOW_STOCK_THRESHOLD } from "../services/api.js";

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", category: "", price: "", stock: "", unit: "" });
  const [editingId, setEditingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [stockUpdateId, setStockUpdateId] = useState(null);
  const [stockValue, setStockValue] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getProducts();
        if (!cancelled) setProducts(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      try {
        const data = {};
        if (formData.name) data.name = formData.name;
        if (formData.category) data.category = formData.category;
        if (formData.price) data.price = Number(formData.price);
        if (formData.unit) data.unit = formData.unit;
        const updated = await updateProduct(editingId, data);
        setProducts((prev) => prev.map((p) => (p.id === editingId ? updated : p)));
        setEditingId(null);
        setShowForm(false);
        setFormData({ name: "", category: "", price: "", stock: "", unit: "" });
      } catch (err) {
        alert(`Failed to update product: ${err.message}`);
      }
    } else {
      try {
        const created = await createProduct({
          ...formData,
          price: Number(formData.price),
          stock: Number(formData.stock),
        });
        setProducts((prev) => [...prev, created]);
        setFormData({ name: "", category: "", price: "", stock: "", unit: "" });
        setShowForm(false);
      } catch (err) {
        alert(`Failed to add product: ${err.message}`);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
    } catch (err) {
      alert(`Failed to delete product: ${err.message}`);
    }
  };

  const handleStockUpdate = async (id) => {
    try {
      const updated = await updateProductStock(id, Number(stockValue));
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setStockUpdateId(null);
      setStockValue("");
    } catch (err) {
      alert(`Failed to update stock: ${err.message}`);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        Failed to load products: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-gray-800">Products</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: "", category: "", price: "", stock: "", unit: "" }); }}
            className="flex items-center gap-1.5 bg-ocean-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ocean-700 transition-colors"
          >
            <Plus size={16} />
            Add New Product
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">{editingId ? "Edit Product" : "Add New Product"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              required
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <input
              placeholder="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <input
              required
              type="number"
              min="0"
              placeholder="Price"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <input
              required
              type="number"
              min="0"
              placeholder="Stock"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
            <div className="flex gap-2">
              <input
                placeholder="Unit (kg/L/packet)"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
              {editingId ? (
                <>
                  <button
                    type="submit"
                    className="bg-ocean-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ocean-700"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); setEditingId(null); }}
                    className="bg-gray-200 text-gray-600 px-3 py-2 rounded-lg text-sm hover:bg-gray-300"
                  >
                    ✕
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="bg-ocean-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ocean-700"
                >
                  Add
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-400">No products found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Product</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Category</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Stock</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Unit Price</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Status</th>
                <th className="text-left px-5 py-2.5 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-2.5 font-medium text-gray-700">{product.name}</td>
                  <td className="px-5 py-2.5 text-gray-600">{product.category}</td>
                  <td className="px-5 py-2.5">
                    {stockUpdateId === product.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          value={stockValue}
                          onChange={(e) => setStockValue(e.target.value)}
                          className="w-16 border border-gray-300 rounded px-1.5 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ocean-500"
                        />
                        <button
                          onClick={() => handleStockUpdate(product.id)}
                          className="text-xs bg-ocean-600 text-white px-2 py-1 rounded hover:bg-ocean-700"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <span className={product.stock < LOW_STOCK_THRESHOLD ? "text-orange-600 font-medium" : "text-gray-700"}>
                        {product.stock} {product.unit}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-2.5 font-medium">{formatCurrency(product.price)}</td>
                  <td className="px-5 py-2.5">
                    {product.stock < LOW_STOCK_THRESHOLD ? (
                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded">Low Stock</span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded">In Stock</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingId(product.id); setFormData({ name: product.name, category: product.category, price: product.price, stock: product.stock, unit: product.unit }); setShowForm(true); }}
                        className="p-1.5 text-gray-400 hover:text-ocean-600 transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => { setConfirmDelete(product.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                      {!stockUpdateId && (
                        <button
                          onClick={() => { setStockUpdateId(product.id); setStockValue(String(product.stock)); }}
                          className="text-xs text-ocean-600 hover:text-ocean-800 font-medium"
                        >
                          Stock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
