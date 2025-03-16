import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { getPurchaseReceipts } from '../../services/purchaseReceiptService';

function PurchaseReceiptList() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchReceipts();
  }, []);
  
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const data = await getPurchaseReceipts();
      setReceipts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load purchase receipts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div className="text-center p-4">Loading receipts...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Receipts</h1>
      </div>
      
      {receipts.length === 0 ? (
        <p className="text-gray-500">No purchase receipts found</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality Check</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {receipts.map(receipt => (
                <tr key={receipt._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">
                    {receipt.receiptNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/procurement/purchase-orders/${receipt.purchaseOrder._id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {receipt.purchaseOrder.poNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(receipt.receiptDate), 'MMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {receipt.receivedBy.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      receipt.status === 'complete' 
                        ? 'bg-green-100 text-green-800' 
                        : receipt.status === 'partial'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {receipt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      receipt.qualityCheck.passed 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {receipt.qualityCheck.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {receipt.items.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/procurement/purchase-receipts/${receipt._id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PurchaseReceiptList;