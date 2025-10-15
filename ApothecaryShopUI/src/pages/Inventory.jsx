import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import MaomaoVision from "../components/MaomaoVision";
import AppLoader from "../components/AppLoader";

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const apiUrl =
          import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL;
        if (!apiUrl) {
          throw new Error(
            "Missing API base URL. Please set VITE_API_BASE_URL in your environment."
          );
        }

        const response = await axios.get(`${apiUrl}/products`, {
          headers: {
            Authorization: `${token}`,
          },
        });

        setProducts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and status
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (product.sku?.toLowerCase() || "").includes(searchTerm.toLowerCase());

    if (filterStatus === "all") return matchesSearch;
    if (filterStatus === "low-stock")
      return matchesSearch && product.stockQuantity <= product.reorderLevel;
    if (filterStatus === "in-stock")
      return matchesSearch && product.stockQuantity > product.reorderLevel;

    const today = new Date();
    const expiryDate = product.expiryDate ? new Date(product.expiryDate) : null;

    if (filterStatus === "expiring-soon") {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
      return (
        matchesSearch &&
        expiryDate &&
        expiryDate <= ninetyDaysFromNow &&
        expiryDate >= today
      );
    }
    if (filterStatus === "expired")
      return matchesSearch && expiryDate && expiryDate < today;

    return matchesSearch;
  });

  // Handle product found via image search
  const handleProductFound = (productName) => {
    // Set the search term directly with the product name
    setSearchTerm(productName);

    // Show a notification
    setSnackbar({
      open: true,
      message: `Searching for: ${productName}`,
      severity: "info",
    });

    // Auto-hide the snackbar after 5 seconds
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, 5000);
  };

  if (loading) return <AppLoader message="Loading" />;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Inventory Management
      </h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="w-full sm:w-auto relative">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Products</option>
            <option value="low-stock">Low Stock</option>
            <option value="in-stock">In Stock</option>
            <option value="expiring-soon">Expiring Soon</option>
            <option value="expired">Expired</option>
          </select>

          <MaomaoVision onProductFound={handleProductFound} />

          <Link
            to="/products/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Snackbar notification */}
      {snackbar.open && (
        <div
          className={`mb-4 p-3 rounded-md ${
            snackbar.severity === "info"
              ? "bg-blue-50 text-blue-700"
              : snackbar.severity === "success"
              ? "bg-green-50 text-green-700"
              : snackbar.severity === "error"
              ? "bg-red-50 text-red-700"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {snackbar.message}
          <button
            onClick={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            className="float-right text-gray-400 hover:text-gray-500"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center w-full">
          <p className="text-gray-500">No products found</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg w-full">
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  SKU
                </th>
                <th
                  scope="col"
                  className="w-[20%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Stock
                </th>
                <th
                  scope="col"
                  className="w-[10%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th
                  scope="col"
                  className="w-[15%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="w-[12%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Expiry
                </th>
                <th
                  scope="col"
                  className="w-[8%] px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const today = new Date();
                const expiryDate = product.expiryDate
                  ? new Date(product.expiryDate)
                  : new Date();
                const isExpired = expiryDate < today;
                const isExpiringSoon =
                  !isExpired &&
                  expiryDate <= new Date(today.setDate(today.getDate() + 90));

                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td
                      className="px-3 py-4 text-sm font-medium text-gray-900 truncate"
                      title={product.sku}
                    >
                      {product.sku}
                    </td>
                    <td
                      className="px-3 py-4 text-sm text-gray-900 truncate"
                      title={product.name}
                    >
                      <Link
                        to={`/products/${product._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td
                      className="px-3 py-4 text-sm text-gray-500 truncate"
                      title={product.category}
                    >
                      {product.category}
                    </td>
                    <td
                      className="px-3 py-4 text-sm text-gray-500"
                      title={`Quantity: ${product.stockQuantity}`}
                    >
                      <span
                        className={
                          product.stockQuantity <= product.reorderLevel
                            ? "text-red-600 font-bold"
                            : ""
                        }
                      >
                        {product.stockQuantity}
                      </span>
                      {product.stockQuantity <= product.reorderLevel && (
                        <span className="ml-1 px-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Low
                        </span>
                      )}
                    </td>
                    <td
                      className="px-3 py-4 text-sm text-gray-500"
                      title={`Price: $${
                        product.unitPrice?.toFixed(2) || "0.00"
                      }`}
                    >
                      ${product.unitPrice?.toFixed(2) || "0.00"}
                    </td>
                    <td
                      className="px-3 py-4"
                      title={
                        product.stockQuantity <= product.reorderLevel
                          ? "Low Stock"
                          : "In Stock"
                      }
                    >
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.stockQuantity <= product.reorderLevel
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {product.stockQuantity <= product.reorderLevel
                          ? "Low Stock"
                          : "In Stock"}
                      </span>
                    </td>
                    <td
                      className="px-3 py-4 text-sm text-gray-500"
                      title={`Expiry Date: ${expiryDate.toLocaleDateString()}`}
                    >
                      <span
                        className={`${
                          isExpired
                            ? "text-red-600"
                            : isExpiringSoon
                            ? "text-yellow-600"
                            : "text-gray-900"
                        }`}
                      >
                        {expiryDate.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm font-medium">
                      <Link
                        to={`/products/${product._id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Inventory;
