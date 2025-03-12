import React, { useState } from 'react';

const StockMovementForm = ({ productId, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: 'in',
    quantity: 1,
    reason: ''
  });
  
  const { type, quantity, reason } = formData;
  
  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({
      productId,
      type,
      quantity,
      reason
    });
    
    // Reset form
    setFormData({
      type: 'in',
      quantity: 1,
      reason: ''
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="stock-movement-form">
      <h3>Add Stock Movement</h3>
      
      <div className="form-group">
        <label>Movement Type</label>
        <select
          name="type"
          value={type}
          onChange={onChange}
          required
        >
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Quantity</label>
        <input
          type="number"
          name="quantity"
          value={quantity}
          onChange={onChange}
          min="1"
          required
        />
      </div>
      
      <div className="form-group">
        <label>Reason</label>
        <input
          type="text"
          name="reason"
          value={reason}
          onChange={onChange}
          placeholder="Purpose of movement"
          required
        />
      </div>
      
      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};

export default StockMovementForm;