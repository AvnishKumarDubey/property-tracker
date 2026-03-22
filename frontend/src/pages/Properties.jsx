import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Properties = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/properties");
      setProperties(res.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const addProperty = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/properties", {
        name,
        address,
      });
      setName("");
      setAddress("");
      fetchProperties();
    } catch (error) {
      console.error("Error adding property:", error);
    }
    setLoading(false);
  };

  const deleteProperty = async (id) => {
    if (user.role !== "admin") return;
    if (!window.confirm("Delete this property?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/properties/${id}`);
      fetchProperties();
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8">Properties</h1>

      <form
        onSubmit={addProperty}
        className="bg-white p-8 rounded-2xl shadow-lg mb-8 max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6">Add New Property</h2>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Property Name"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4"
          required
        />
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Address"
          className="w-full p-3 border border-gray-300 rounded-xl mb-4"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-semibold hover:bg-blue-600"
        >
          {loading ? "Adding..." : "Add Property"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div
            key={property._id}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h3 className="text-xl font-bold mb-2">{property.name}</h3>
            <p className="text-gray-600 mb-4">{property.address}</p>
            {user.role === "admin" && (
              <button
                onClick={() => deleteProperty(property._id)}
                className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 text-sm"
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Properties;
