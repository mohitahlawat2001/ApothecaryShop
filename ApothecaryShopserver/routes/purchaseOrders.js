const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/purchaseOrder');
//const Product = require('../models/product');
const auth = require('../middleware/auth');
const { adminOnly, staffAccess } = require('../middleware/roleCheck');

/**
 * @api {get} /purchase-orders Get all purchase orders
 * @apiName GetPurchaseOrders
 * @apiGroup PurchaseOrder
 * @apiPermission staff
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiExample {curl} Example usage:
 *     curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." http://localhost:5000/api/purchase-orders
 * 
 * @apiSuccess {Object[]} purchaseOrders List of purchase orders
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "_id": "64a2b7cc87c345a123456789",
 *         "poNumber": "PO-2307-0001",
 *         "supplier": {
 *           "_id": "64a1a5cc87c345a123456789",
 *           "name": "MediSupply Inc.",
 *           "contactPerson": "John Smith"
 *         },
 *         "status": "draft",
 *         "items": [
 *           {
 *             "product": {
 *               "_id": "64a1a5cc87c345a123456780",
 *               "name": "Ibuprofen 200mg",
 *               "sku": "IBU-200"
 *             },
 *             "quantity": 100,
 *             "unitPrice": 0.5,
 *             "discount": 0,
 *             "tax": 5,
 *             "totalPrice": 52.5
 *           }
 *         ],
 *         "subtotal": 52.5,
 *         "totalAmount": 52.5,
 *         "createdBy": {
 *           "_id": "64a1a5cc87c345a123456700",
 *           "name": "Admin User"
 *         },
 *         "createdAt": "2023-07-03T14:22:52.838Z"
 *       }
 *     ]
 */
router.get('/', auth, staffAccess, async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find()
      .populate('supplier', 'name contactPerson')
      .populate('items.product', 'name sku')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(purchaseOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @api {get} /purchase-orders/:id Get a single purchase order
 * @apiName GetPurchaseOrder
 * @apiGroup PurchaseOrder
 * @apiPermission staff
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id Purchase order ID
 * 
 * @apiExample {curl} Example usage:
 *     curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." http://localhost:5000/api/purchase-orders/64a2b7cc87c345a123456789
 * 
 * @apiSuccess {Object} purchaseOrder Purchase order data
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "64a2b7cc87c345a123456789",
 *       "poNumber": "PO-2307-0001",
 *       "supplier": {
 *         "_id": "64a1a5cc87c345a123456789",
 *         "name": "MediSupply Inc.",
 *         "contactPerson": "John Smith",
 *         "email": "john@medisupply.com",
 *         "phone": "123-456-7890"
 *       },
 *       "status": "draft",
 *       "orderDate": "2023-07-03T14:22:52.838Z",
 *       "expectedDeliveryDate": "2023-07-10T00:00:00.000Z",
 *       "items": [
 *         {
 *           "product": {
 *             "_id": "64a1a5cc87c345a123456780",
 *             "name": "Ibuprofen 200mg",
 *             "sku": "IBU-200",
 *             "description": "Pain reliever"
 *           },
 *           "genericName": "Ibuprofen",
 *           "quantity": 100,
 *           "unitPrice": 0.5,
 *           "discount": 0,
 *           "tax": 5,
 *           "totalPrice": 52.5,
 *           "receivedQuantity": 0
 *         }
 *       ],
 *       "subtotal": 52.5,
 *       "totalAmount": 52.5,
 *       "createdBy": {
 *         "_id": "64a1a5cc87c345a123456700",
 *         "name": "Admin User"
 *       }
 *     }
 */
router.get('/:id', auth, staffAccess, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('supplier')
      .populate('items.product')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');
      
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    res.status(200).json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @api {post} /purchase-orders Create a new purchase order
 * @apiName CreatePurchaseOrder
 * @apiGroup PurchaseOrder
 * @apiPermission staff
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} supplier Supplier ID
 * @apiParam {Date} [expectedDeliveryDate] Expected delivery date
 * @apiParam {Object[]} items Items to purchase
 * @apiParam {String} [items.product] Product ID (optional if using external product)
 * @apiParam {Number} [items.externalProductId] External product ID (optional)
 * @apiParam {String} items.genericName Generic name of the product
 * @apiParam {Number} [items.drugCode] Drug code
 * @apiParam {String} [items.groupName] Group name
 * @apiParam {String} [items.unitSize] Unit size
 * @apiParam {Number} items.quantity Quantity to purchase
 * @apiParam {Number} items.unitPrice Price per unit
 * @apiParam {Number} [items.discount=0] Discount percentage
 * @apiParam {Number} [items.tax=0] Tax percentage
 * @apiParam {Number} [shippingCost=0] Shipping cost
 * @apiParam {Number} [discountAmount=0] Additional discount amount
 * @apiParam {String} [notes] Additional notes
 * @apiParam {String} [paymentTerms] Payment terms
 * 
 * @apiExample {curl} Example usage:
 *     curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -d '
 *     {
 *       "supplier": "64a1a5cc87c345a123456789",
 *       "expectedDeliveryDate": "2023-07-15T00:00:00.000Z",
 *       "items": [
 *         {
 *           "product": "64a1a5cc87c345a123456780",
 *           "genericName": "Ibuprofen",
 *           "quantity": 100,
 *           "unitPrice": 0.5,
 *           "discount": 0,
 *           "tax": 5
 *         },
 *         {
 *           "genericName": "Acetaminophen",
 *           "externalProductId": 12345,
 *           "drugCode": 1001,
 *           "groupName": "Pain Relievers",
 *           "unitSize": "500mg",
 *           "quantity": 200,
 *           "unitPrice": 0.3,
 *           "discount": 5,
 *           "tax": 5
 *         }
 *       ],
 *       "shippingCost": 10,
 *       "discountAmount": 5,
 *       "notes": "Urgent order",
 *       "paymentTerms": "Net 30"
 *     }' http://localhost:5000/api/purchase-orders
 * 
 * @apiSuccess {Object} purchaseOrder Created purchase order
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "poNumber": "PO-2307-0002",
 *       "supplier": "64a1a5cc87c345a123456789",
 *       "status": "draft",
 *       "items": [...],
 *       "subtotal": 112.35,
 *       "totalAmount": 117.35,
 *       "_id": "64a3c8cc87c345a123456793",
 *       "createdAt": "2023-07-04T09:15:30.123Z"
 *     }
 */
router.post('/', auth, staffAccess, async (req, res) => {
  try {
    // Calculate totals
    const items = req.body.items;
    let subtotal = 0;
    
    for (let item of items) {
      item.totalPrice = item.quantity * item.unitPrice * (1 - item.discount / 100) * (1 + item.tax / 100);
      subtotal += item.totalPrice;
    }
    
    const totalAmount = subtotal + req.body.shippingCost - req.body.discountAmount;
    
    // Generate PO Number with timestamp for uniqueness
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString().substr(-2);
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    
    // Add timestamp component for uniqueness
    const timestamp = Math.floor(Date.now() % 10000);
    
    const lastPO = await PurchaseOrder.findOne({}, {}, { sort: { 'poNumber': -1 } });
    let number = 1;
    
    if (lastPO && lastPO.poNumber) {
      const lastNumber = parseInt(lastPO.poNumber.split('-')[2], 10);
      if (!isNaN(lastNumber)) {
        number = lastNumber + 1;
      }
    }
    
    const poNumber = `PO-${year}${month}-${timestamp}-${number.toString().padStart(4, '0')}`;
    
    const purchaseOrder = new PurchaseOrder({
      ...req.body,
      poNumber,
      subtotal,
      totalAmount,
      createdBy: req.user.id
    });
    
    const newPurchaseOrder = await purchaseOrder.save();
    
    res.status(201).json(newPurchaseOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @api {put} /purchase-orders/:id Update a purchase order
 * @apiName UpdatePurchaseOrder
 * @apiGroup PurchaseOrder
 * @apiPermission staff (draft orders) or admin (any order)
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id Purchase order ID
 * @apiParam {Date} [expectedDeliveryDate] Expected delivery date
 * @apiParam {Object[]} [items] Items to purchase
 * @apiParam {Number} [shippingCost] Shipping cost
 * @apiParam {Number} [discountAmount] Additional discount amount
 * @apiParam {String} [notes] Additional notes
 * 
 * @apiExample {curl} Example usage:
 *     curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -d '
 *     {
 *       "expectedDeliveryDate": "2023-07-20T00:00:00.000Z",
 *       "items": [
 *         {
 *           "product": "64a1a5cc87c345a123456780",
 *           "genericName": "Ibuprofen",
 *           "quantity": 150,
 *           "unitPrice": 0.5,
 *           "discount": 0,
 *           "tax": 5
 *         }
 *       ],
 *       "shippingCost": 15,
 *       "notes": "Updated delivery date and quantity"
 *     }' http://localhost:5000/api/purchase-orders/64a3c8cc87c345a123456793
 * 
 * @apiSuccess {Object} purchaseOrder Updated purchase order
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "64a3c8cc87c345a123456793",
 *       "poNumber": "PO-2307-0002",
 *       "status": "draft",
 *       "items": [...],
 *       "subtotal": 78.75,
 *       "totalAmount": 88.75,
 *       "updatedAt": "2023-07-04T10:30:45.789Z"
 *     }
 */
router.put('/:id', auth, staffAccess, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    // Only allow updates if in draft status or if admin
    if (purchaseOrder.status !== 'draft' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Cannot update purchase order that is not in draft status' });
    }
    
    // Calculate totals if items changed
    let updatedData = { ...req.body };
    if (req.body.items) {
      let subtotal = 0;
      for (let item of req.body.items) {
        item.totalPrice = item.quantity * item.unitPrice * (1 - item.discount / 100) * (1 + item.tax / 100);
        subtotal += item.totalPrice;
      }
      
      updatedData.subtotal = subtotal;
      updatedData.totalAmount = subtotal + (req.body.shippingCost || purchaseOrder.shippingCost) - 
                               (req.body.discountAmount || purchaseOrder.discountAmount);
    }
    
    const updatedPO = await PurchaseOrder.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json(updatedPO);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * @api {patch} /purchase-orders/:id/status Update purchase order status
 * @apiName UpdatePurchaseOrderStatus
 * @apiGroup PurchaseOrder
 * @apiPermission staff (most statuses) or admin (approval)
 * 
 * @apiHeader {String} Authorization Bearer token
 * 
 * @apiParam {String} id Purchase order ID
 * @apiParam {String} status New status value
 * 
 * @apiDescription Valid status transitions:
 *   - From 'draft': Can move to 'submitted' or 'cancelled'
 *   - From 'submitted': Can move to 'approved' or 'cancelled'
 *   - From 'approved': Can move to 'shipped' or 'cancelled'
 *   - From 'shipped': Can move to 'received', 'partially_received', or 'cancelled'
 *   - From 'partially_received': Can move to 'received'
 *   - Only administrators can change a purchase order status to 'approved'
 * 
 * @apiExample {curl} Example usage:
 *     curl -X PATCH -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." -d '
 *     {
 *       "status": "submitted"
 *     }' http://localhost:5000/api/purchase-orders/64a3c8cc87c345a123456793/status
 * 
 * @apiSuccess {Object} purchaseOrder Updated purchase order
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "_id": "64a3c8cc87c345a123456793",
 *       "poNumber": "PO-2307-0002",
 *       "status": "submitted",
 *       "items": [...],
 *       "updatedAt": "2023-07-04T11:45:20.456Z"
 *     }
 */
router.patch('/:id/status', auth, staffAccess, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Purchase order not found' });
    }
    
    // For approval, only admins can approve
    if (status === 'approved' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'you not have permission to approve purchase orders' });
    }
    
    // Status validation logic
    const validTransitions = {
      'draft': ['submitted', 'cancelled'],
      'submitted': ['approved', 'cancelled'],
      'approved': ['shipped', 'cancelled'],
      'shipped': ['received', 'partially_received', 'cancelled'],
      'partially_received': ['received']
    };
    
    if (!validTransitions[purchaseOrder.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${purchaseOrder.status} to ${status}`
      });
    }
    
    // Special handling for approval
    if (status === 'approved') {
      purchaseOrder.approvedBy = req.user.id;
      purchaseOrder.approvalDate = Date.now();
    }
    
    purchaseOrder.status = status;
    await purchaseOrder.save();
    
    res.status(200).json(purchaseOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;