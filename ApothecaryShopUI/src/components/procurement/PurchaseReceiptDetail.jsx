import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPurchaseReceipt } from "../../services/purchaseReceiptService";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import AppLoader from "../AppLoader";

function PurchaseReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    fetchPurchaseReceipt();
  }, [id]);

  const fetchPurchaseReceipt = async () => {
    try {
      const data = await getPurchaseReceipt(id);
      setReceipt(data);
    } catch (err) {
      setError("Failed to load purchase receipt");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!receipt) return;

    // Create PDF document with professional styling
    const doc = new jsPDF();

    // Add border to the entire page
    doc.setDrawColor(0, 128, 0); // Green border
    doc.setLineWidth(1);
    doc.rect(5, 5, 200, 287); // Border around the page (margins of 5mm)

    // Add header with company name - simple clean version
    doc.setFontSize(22);
    doc.setTextColor(0, 100, 0); // Dark green color
    doc.text("Apothecary Shop", 14, 15);
    doc.setDrawColor(0, 128, 0);
    doc.setLineWidth(0.5);
    doc.line(14, 18, 196, 18); // Underline below company name

    // Removed the green circle that didn't look good

    // Add title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0); // Black color
    doc.setFont(undefined, "bold");
    doc.text(`Purchase Receipt - ${receipt.receiptNumber}`, 14, 30);
    doc.setFont(undefined, "normal");

    // Add receipt info in a styled box
    doc.setFillColor(240, 248, 240); // Light green background
    doc.roundedRect(14, 35, 182, 30, 3, 3, "F");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    // Add receipt metadata
    doc.setFont(undefined, "bold");
    doc.text("PO Number:", 20, 45);
    doc.text("Receipt Date:", 90, 45);
    doc.text("Received By:", 20, 55);
    doc.setFont(undefined, "normal");
    doc.text(receipt.purchaseOrder?.poNumber || "N/A", 50, 45);
    doc.text(
      receipt.receiptDate
        ? new Date(receipt.receiptDate).toLocaleDateString()
        : "N/A",
      130,
      45
    );
    doc.text(receipt.receivedBy?.name || "N/A", 60, 55);

    // Create table for items with enhanced styling
    const tableColumn = [
      "Product",
      "Received Qty",
      "Batch #",
      "Expiry Date",
      "Unit Price",
      "Comments",
    ];
    const tableRows = [];

    (receipt.items || []).forEach((item) => {
      // Fix unit price formatting - use 'Rs.' instead of the rupee symbol to avoid encoding issues
      let formattedPrice = "N/A";
      if (item.unitPrice !== null && item.unitPrice !== undefined) {
        // Using "Rs." text instead of the rupee symbol
        formattedPrice = `Rs. ${parseFloat(item.unitPrice).toFixed(2)}`;
      }

      const itemData = [
        item.genericName || "N/A",
        item.receivedQuantity || 0,
        item.batchNumber || "",
        item.expiryDate
          ? new Date(item.expiryDate).toLocaleDateString()
          : "N/A",
        formattedPrice,
        item.comments || "",
      ];
      tableRows.push(itemData);
      console.log(item);
    });

    // Use autoTable directly with the document and enhanced styling
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: "grid",
      headStyles: {
        fillColor: [0, 100, 0],
        textColor: [255, 255, 255],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      bodyStyles: {
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [240, 248, 240],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });

    // Get the final Y position after the table is drawn
    let finalY =
      doc.lastAutoTable && doc.lastAutoTable.finalY
        ? doc.lastAutoTable.finalY + 10
        : 80;

    // Add quality check info in a styled box
    doc.setFillColor(240, 248, 240);
    doc.roundedRect(14, finalY, 85, 25, 3, 3, "F");
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Quality Check", 18, finalY + 7);
    doc.setFont(undefined, "normal");

    // Quality check status with colored indicator
    const passedStatus = receipt.qualityCheck?.passed ? "Passed" : "Failed";
    const statusColor = receipt.qualityCheck?.passed
      ? [0, 128, 0]
      : [200, 0, 0];
    doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.setFont(undefined, "bold");
    doc.text(passedStatus, 75, finalY + 7);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, "normal");

    if (receipt.qualityCheck?.notes) {
      doc.setFontSize(10);
      doc.text(`Notes: ${receipt.qualityCheck.notes}`, 18, finalY + 17);
    }

    // Add additional notes
    if (receipt.notes) {
      doc.setFillColor(240, 248, 240);
      doc.roundedRect(105, finalY, 91, 25, 3, 3, "F");
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text(`Additional Notes:`, 110, finalY + 7);
      doc.setFont(undefined, "normal");
      doc.setFontSize(10);

      // Handle multi-line notes with text wrapping
      const splitNotes = doc.splitTextToSize(receipt.notes, 80);
      doc.text(splitNotes, 110, finalY + 17);
    }

    // Add footer
    finalY = Math.max(finalY + 35, 250);
    doc.setDrawColor(0, 128, 0);
    doc.setLineWidth(0.5);
    doc.line(14, finalY, 196, finalY);

    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "Apothecary Shop | Generated on: " + new Date().toLocaleString(),
      14,
      finalY + 7
    );
    doc.text("Page 1 of 1", 180, finalY + 7);

    // Save the PDF
    doc.save(`${receipt.receiptNumber}.pdf`);
  };

  if (loading) return <AppLoader message="Loading purchase receipt data" />;
  if (error)
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  if (!receipt)
    return <div className="text-center p-4">Purchase receipt not found</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">
        Purchase Receipt: {receipt.receiptNumber}
      </h1>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">PO Number</p>
            <p className="font-medium">
              {receipt.purchaseOrder?.poNumber || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Receipt Date</p>
            <p className="font-medium">
              {receipt.receiptDate
                ? new Date(receipt.receiptDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Received By</p>
            <p className="font-medium">{receipt.receivedBy?.name || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-3">Received Items</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Received Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comments
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receipt.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.genericName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.receivedQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.batchNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.expiryDate
                      ? new Date(item.expiryDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    ₹{item.unitPrice?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.comments || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Quality Check</h2>
          <div className="mb-4">
            <span
              className={`px-2 py-1 rounded text-xs font-semibold ${
                receipt.qualityCheck?.passed
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {receipt.qualityCheck?.passed ? "PASSED" : "FAILED"}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Quality Check Notes</p>
            <p className="mt-1">{receipt.qualityCheck?.notes || "No notes"}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Additional Notes</h2>
          <p className="whitespace-pre-wrap">
            {receipt.notes || "No additional notes"}
          </p>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={generatePDF}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Download as PDF
        </button>

        <button
          onClick={() => navigate("/procurement/purchase-receipts")}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Back to List
        </button>
      </div>
    </div>
  );
}

export default PurchaseReceiptDetail;
