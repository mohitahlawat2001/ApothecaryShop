import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPurchaseOrder } from '../../services/purchaseOrderService';
import { createPurchaseReceipt } from '../../services/purchaseReceiptService';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function PurchaseReceiptForm() {
  const { id } = useParams(); // Order ID
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  
  const [receiptItems, setReceiptItems] = useState([]);
  const [notes, setNotes] = useState('');
  const [qualityCheck, setQualityCheck] = useState({
    passed: true,
    notes: ''
  });
  const [receiptDate, setReceiptDate] = useState(() => {
    const now = new Date('2025-03-14');
    return now.toISOString().split('T')[0];
  });
  
  useEffect(() => {
    fetchPurchaseOrder();
  }, [id]);
  
  const fetchPurchaseOrder = async () => {
    try {
      const data = await getPurchaseOrder(id);
      setPurchaseOrder(data);
      
      // Initialize receipt items from PO items
      const initialItems = (data.items || []).map(item => ({
        product: item.product?._id || null,
        externalProductId: item.externalProductId || null,
        genericName: item.genericName,
        groupName: item.groupName || '',
        unitSize: item.unitSize || '',
        expectedQuantity: item.quantity,
        receivedQuantity: item.receivedQuantity ? item.quantity - item.receivedQuantity : item.quantity,
        batchNumber: '',
        expiryDate: '',
        unitPrice: item.unitPrice,
        comments: ''
      }));
      
      setReceiptItems(initialItems);
    } catch (err) {
      setError('Failed to load purchase order');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...receiptItems];
    updatedItems[index][field] = value;
    
    setReceiptItems(updatedItems);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    for (const item of receiptItems) {
      if (!item.batchNumber) {
        setError('Batch number is required for all items');
        return;
      }
      if (!item.expiryDate) {
        setError('Expiry date is required for all items');
        return;
      }
      if (item.receivedQuantity <= 0) {
        setError('Received quantity must be greater than zero');
        return;
      }
      if (item.receivedQuantity > item.expectedQuantity) {
        setError(`Received quantity cannot exceed expected quantity for ${item.genericName}`);
        return;
      }
    }
    
    try {
      setLoading(true);
      
      const receiptData = {
        purchaseOrder: id,
        receiptDate,
        items: receiptItems,
        notes,
        qualityCheck
      };
      
      await createPurchaseReceipt(receiptData);
      navigate('/procurement/purchase-receipts');
    } catch (err) {
      setError('Failed to create receipt: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Purchase Receipt - PO #${purchaseOrder?.poNumber || 'N/A'}`, 14, 22);
    
    // Add receipt info
    doc.setFontSize(12);
    doc.text(`Supplier: ${purchaseOrder?.supplier?.name || 'N/A'}`, 14, 32);
    doc.text(`Order Date: ${purchaseOrder?.orderDate ? new Date(purchaseOrder.orderDate).toLocaleDateString() : 'N/A'}`, 14, 39);
    doc.text(`Receipt Date: ${receiptDate ? new Date(receiptDate).toLocaleDateString() : 'N/A'}`, 14, 46);
    doc.text(`Total Amount: ₹${purchaseOrder?.totalAmount ? purchaseOrder.totalAmount.toFixed(2) : '0.00'}`, 14, 53);
    
    // Create table for items
    const tableColumn = ["Product", "Group", "Unit Size", "Expected Qty", "Received Qty", "Batch #", "Expiry Date", "Comments"];
    const tableRows = [];
    
    receiptItems.forEach(item => {
      const itemData = [
        item.genericName || 'N/A',
        item.groupName || 'N/A',
        item.unitSize || 'N/A',
        item.expectedQuantity || 0,
        item.receivedQuantity || 0,
        item.batchNumber || '',
        item.expiryDate || '',
        item.comments || ''
      ];
      tableRows.push(itemData);
    });
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
      theme: 'grid',
      styles: {
        fontSize: 10
      }
    });
    
    let finalY = doc.lastAutoTable.finalY + 10;
    
    // Add quality check info
    doc.text(`Quality Check: ${qualityCheck.passed ? 'Passed' : 'Failed'}`, 14, finalY);
    if (qualityCheck.notes) {
      doc.text(`Quality Notes: ${qualityCheck.notes}`, 14, finalY + 7);
      finalY += 7;
    }
    
    // Add additional notes
    if (notes) {
      doc.text(`Additional Notes:`, 14, finalY + 7);
      doc.text(notes, 14, finalY + 14);
    }
    
    // Save the PDF
    doc.save(`receipt-po-${purchaseOrder?.poNumber || 'N/A'}.pdf`);
  };

  if (loading && !purchaseOrder) return <div className="text-center p-4">Loading purchase order data...</div>;
  if (error) return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>;
  if (!purchaseOrder) return <div className="text-center p-4">Purchase order not found</div>;
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Receive Items for PO #{purchaseOrder?.poNumber || 'N/A'}</h1>
      
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Supplier</p>
            <p className="font-medium">{purchaseOrder?.supplier?.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Order Date</p>
            <p className="font-medium">{purchaseOrder?.orderDate ? new Date(purchaseOrder.orderDate).toLocaleDateString() : 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="font-medium">₹{purchaseOrder?.totalAmount ? purchaseOrder.totalAmount.toFixed(2) : '0.00'}</p>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Date *</label>
          <input
            type="date"
            value={receiptDate}
            onChange={(e) => setReceiptDate(e.target.value)}
            required
            className="w-full md:w-64 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <h2 className="text-lg font-semibold mb-3">Items to Receive</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Qty *</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch # *</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date *</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receiptItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.genericName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.groupName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.unitSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.expectedQuantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={item.receivedQuantity}
                      onChange={(e) => handleItemChange(index, 'receivedQuantity', parseInt(e.target.value) || 0)}
                      min="0"
                      max={item.expectedQuantity}
                      required
                      className="w-20 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={item.batchNumber}
                      onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                      required
                      className="w-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="date"
                      value={item.expiryDate}
                      onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                      required
                      className="w-40 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="text"
                      value={item.comments}
                      onChange={(e) => handleItemChange(index, 'comments', e.target.value)}
                      placeholder="Any issues?"
                      className="w-32 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-3">Quality Check</h2>
            
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="qualityPassed"
                checked={qualityCheck.passed}
                onChange={(e) => setQualityCheck({...qualityCheck, passed: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="qualityPassed" className="ml-2 block text-sm text-gray-700">
                Products passed quality check
              </label>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quality Check Notes</label>
              <textarea
                value={qualityCheck.notes}
                onChange={(e) => setQualityCheck({...qualityCheck, notes: e.target.value})}
                rows="3"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any quality issues here..."
              ></textarea>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3">Additional Notes</h2>
            <div className="mb-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="5"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter any additional notes about this receipt..."
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Complete Receipt'}
          </button>
          
          <button
            type="button"
            onClick={generatePDF}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download as PDF
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/procurement/purchase-orders')}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default PurchaseReceiptForm;