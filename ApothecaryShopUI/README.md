# Apothecary Shop UI

A modern pharmaceutical inventory management system built with React, featuring an intuitive user interface for efficiently tracking and managing medical products.
 
## Features

### Authentication System
- **Login Screen**: Secure authentication with email and password
- **Registration**: New user account creation with role assignment
- **JWT Authentication**: Secure token-based session management
- **Authorization**: Role-based access control for different functionalities

### Dashboard
- **Overview Statistics**:
  - Total products in inventory
  - Low stock product alerts
  - Expiring soon product alerts
  - Expired products count
  - Total inventory value
- **Recent Products**: Quick view of recently added inventory items
- **Quick Navigation**: Direct links to frequently used sections

### Inventory Management
- **Product Listing**: Complete view of all pharmaceutical products
- **Advanced Filtering**:
  - Search by name or SKU
  - Filter by stock status (All, Low Stock, In Stock)
  - Filter by expiration (Expiring Soon, Expired)
- **Stock Indicators**:
  - Visual indicators for low stock products
  - Expiration status highlighting
- **Add New Products**: Simple form to add products with all necessary details
- **Batch Management**: Track products by batch numbers
- **Product Categories**: Organize products by medical categories

### Product Details
- **Comprehensive Information Display**:
  - General product information
  - Stock levels and reorder points
  - Pricing details
  - Expiration tracking
  - Manufacturer information
- **Stock Movement History**: Track all changes to product quantity
- **Data Visualization**: Charts showing stock movement trends over time

### Stock Movement Management
- **Stock Adjustments**: Increase or decrease product quantities
- **Movement Types**: Record stock-in and stock-out events
- **Reason Tracking**: Document reasons for each inventory adjustment
- **Movement History**: Complete audit trail of all stock changes
- **Stock Movement Graph**: Visual representation of inventory changes over time

### Product Management
- **Add Products**: Create new product records with all necessary details
- **Edit Products**: Update existing product information
- **Stock Updates**: Quick stock quantity adjustments 
- **Auto-generated SKUs**: System generates SKU codes for new products
- **Expiration Date Tracking**: Monitor and highlight expiring products

### Responsive Design
- **Mobile Friendly**: Optimized for both desktop and mobile devices
- **Modern Interface**: Clean, intuitive design using Tailwind CSS
- **Dark Mode Support**: Eye-friendly interface option for different lighting conditions

### Data Visualization
- **Stock Movement Charts**: Line and bar charts for tracking inventory changes
- **Stock Level Monitoring**: Visual indicators for current stock status
- **Multiple Chart Types**: Toggle between different chart visualizations

## Technical Features

- **React 19**: Built with the latest React framework
- **Vite**: Fast development and optimized builds
- **React Router**: Seamless navigation between different sections
- **Axios**: Efficient API communication
- **Chart.js**: Interactive data visualization
- **Tailwind CSS**: Modern styling with utility-first approach
- **Context API**: Global state management for authentication
- **JWT Authentication**: Secure user sessions
- **Form Validation**: Input validation for data integrity
- **Responsive Design**: Works on all device sizes
