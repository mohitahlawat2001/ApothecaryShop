import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductForm from "../components/ProductForm";
import AppLoader from "../components/AppLoader";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl =
          import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;
        if (!apiUrl) {
          throw new Error(
            "Missing API base URL. Please set VITE_API_BASE_URL in your environment."
          );
        }

        const response = await axios.get(`${apiUrl}/products/${id}`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        setProduct(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError("Failed to load product details. Please try again.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSaveProduct = async (updatedProduct) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error(
          "Missing API base URL. Please set VITE_API_BASE_URL in your environment."
        );
      }

      await axios.put(`${apiUrl}/products/${id}`, updatedProduct, {
        headers: {
          Authorization: `${token}`,
        },
      });

      // Redirect back to inventory after successful update
      navigate("/inventory");
    } catch (error) {
      console.error("Error updating product:", error);
      alert(
        `Error: ${error.response?.data?.message || "Failed to update product"}`
      );
    }
  };

  const handleCancelEdit = () => {
    navigate("/inventory");
  };

  if (loading) return <AppLoader message="Loading product details" />;

  if (error)
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4">
        {error}
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductForm
        product={product}
        saveProduct={handleSaveProduct}
        cancelEdit={handleCancelEdit}
      />
    </div>
  );
};

export default EditProduct;
