import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";
import AppLoader from "../AppLoader.jsx";

const SupplierDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplier = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/suppliers/${id}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load supplier details");
        }

        const data = await response.json();
        setSupplier(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplier();
  }, [id, token]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/suppliers/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: token,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete supplier");
        }

        navigate("/procurement/suppliers");
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <AppLoader message="Loading" />;
  if (error)
    return <div className="text-red-600 text-center py-8">Error: {error}</div>;
  if (!supplier)
    return <div className="text-center py-8">Supplier not found</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6">{supplier.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Contact Information</h2>
          <p>
            <strong>Contact Person:</strong> {supplier.contactPerson}
          </p>
          <p>
            <strong>Email:</strong> {supplier.email}
          </p>
          <p>
            <strong>Phone:</strong> {supplier.phone}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Address</h2>
          {supplier.address && (
            <>
              <p>{supplier.address.street}</p>
              <p>
                {supplier.address.city}, {supplier.address.state}{" "}
                {supplier.address.zipCode}
              </p>
              <p>{supplier.address.country}</p>
            </>
          )}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h2 className="text-lg font-semibold mb-2">Additional Information</h2>
        <p>
          <strong>Tax ID:</strong> {supplier.taxId || "N/A"}
        </p>
        <p>
          <strong>Payment Terms:</strong> {supplier.paymentTerms || "N/A"}
        </p>
        <p>
          <strong>Notes:</strong> {supplier.notes || "No notes available"}
        </p>
      </div>

      <div className="flex gap-4 mt-6">
        <Link
          to={`/procurement/suppliers/${id}/edit`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit Supplier
        </Link>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Supplier
        </button>
        <Link
          to="/procurement/suppliers"
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Back to Suppliers
        </Link>
      </div>
    </div>
  );
};

export default SupplierDetail;
