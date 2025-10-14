import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ProductForm from "../components/ProductForm";
import AppLoader from "../components/AppLoader";

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false); // Initially not loading
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch product if we're editing an existing product
    if (id && id !== "new") {
      setLoading(true);

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

          console.log(`Fetching product with ID: ${id}`);
          const response = await axios.get(`${apiUrl}/api/products/${id}`, {
            headers: {
              Authorization: `${token}`,
            },
          });

          console.log("Product fetched successfully:", response.data);
          setProduct(response.data);
          setLoading(false);
        } catch (err) {
          console.error("Error fetching product:", err);
          setError(err.message || "Failed to fetch product");
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  const saveProduct = async (formData) => {
    try {
      const token = localStorage.getItem("token");
      const apiUrl =
        import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;
      if (!apiUrl) {
        throw new Error(
          "Missing API base URL. Please set VITE_API_BASE_URL in your environment."
        );
      }

      // Debug logs
      console.log("API URL:", apiUrl);
      console.log("Form data to be submitted:", formData);

      let response;

      if (!id || id === "new") {
        // Create new product
        console.log("Creating new product");
        response = await axios.post(`${apiUrl}/products`, formData, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Product created:", response.data);
      } else {
        // Update existing product
        console.log(`Updating product with ID: ${id}`);
        response = await axios.put(`${apiUrl}/api/products/${id}`, formData, {
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Product updated:", response.data);
      }

      // Navigate back to inventory after successful save
      navigate("/inventory");
    } catch (error) {
      console.error("Error saving product:", error);
      console.error("Error response:", error.response);
      setError(error.response?.data?.message || "Failed to save product");
      alert(
        `Error: ${error.response?.data?.message || "Failed to save product"}`
      );
    }
  };

  const cancelEdit = () => {
    navigate("/inventory");
  };

  if (loading) {
    return <AppLoader message="Loading" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
      <ProductForm
        product={id === "new" ? null : product}
        saveProduct={saveProduct}
        cancelEdit={cancelEdit}
      />
    </div>
  );
};

export default ProductFormPage;
