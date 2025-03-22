# ApothecaryShop Features

This document provides a comprehensive list of all features available in the ApothecaryShop Pharmaceutical Inventory System.

## Authentication
- **Login**: Secure user authentication with token-based access control
- **Registration**: New user account creation with role assignment
- **Permission-based Access**: Different features available based on user role

## Dashboard
- **Overview Statistics**: At-a-glance view of inventory health metrics
- **Low Stock Alerts**: Visual indicators for products requiring replenishment
- **Expiring Products**: Tracking of products nearing or past expiration date
- **Total Inventory Value**: Real-time calculation of entire inventory worth
- **AI-Powered Analysis**: Intelligent inventory insights and recommendations
- **Recent Products**: Quick access to newly added inventory items
- **Procurement Overview**: Summary of recent and open purchase orders

## Inventory Management
- **Product Listing**: Comprehensive view of all pharmaceutical products
- **Search & Filter**: Easily locate products by name, category, or status
- **Stock Level Tracking**: Visual indicators for stock status (low, good, expired)
- **Quick Stock Adjustment**: Increment/decrement stock levels with single click
- **Product Details**: In-depth view of individual product information
- **Product Creation/Editing**: Detailed forms for adding and updating products
- **Expiry Date Monitoring**: Automatic flagging of soon-to-expire products
- **Image-based Search**: MaomaoVision AI for identifying products from images

## Stock Movements
- **Movement Tracking**: Comprehensive log of all stock changes
- **Movement Types**: Support for both stock-in and stock-out operations
- **Filtering by Product**: View movement history for specific items
- **Visual Analytics**: Interactive graphs showing stock level trends
- **Movement History**: Detailed record with date, quantity, and reasons for each movement
- **AI Analysis**: Smart insights on consumption patterns and forecasting

## Procurement
- **Supplier Management**: Create, view, and manage supplier information
- **Purchase Orders**: Complete procurement workflow from creation to receipt
- **Order Statuses**: Track orders through draft, submitted, approved, shipped, and received states
- **JanAushadhi Integration**: Special handling for government-subsidized medicines
- **Receipt Processing**: Record received items with batch numbers and expiry dates
- **PDF Generation**: Create downloadable records of procurement transactions
- **Disease Trend Suggestions**: AI-powered product recommendations based on disease trends

## Distribution
- **Distribution Orders**: Track product movement to recipients
- **Multiple Recipient Types**: Support for pharmacies, hospitals, departments, and patients
- **Status Tracking**: Monitor distribution through various stages from pending to delivered
- **Analytics Dashboard**: Visual breakdown of distribution patterns and trends
- **Top Recipients**: Identify most frequent recipients of distributed products
- **Most Distributed Products**: Track high-volume products in the distribution chain
- **Filtering and Reports**: Generate custom reports with date range filters

## User Interface
- **Responsive Design**: Seamless experience across desktop and mobile devices
- **Dynamic Navigation**: Context-aware menu that adapts to user authentication status
- **Loading Animation**: Engaging leaf animation during application initialization
- **Intuitive Layout**: Well-organized screens with consistent design patterns
- **Role-based Views**: Interface components that adapt to user permissions

## Technical Features
- **Modern React Frontend**: Built with React, React Router, and TailwindCSS
- **Node.js Backend**: RESTful API built with Express.js
- **MongoDB Database**: NoSQL database for flexible data storage
- **JWT Authentication**: Secure token-based authentication
- **Chart.js Integration**: Interactive data visualization
- **PDF Generation**: Create downloadable documents with jsPDF
- **State Management**: Context API for application state
- **Responsive Design**: Mobile-friendly UI using Tailwind CSS
- **API Integration**: External API connections for additional data sources
