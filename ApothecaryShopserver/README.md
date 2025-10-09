# Apothecary Shop Server

A comprehensive backend application for managing an apothecary/pharmacy shop inventory system.

## Features

- **User Authentication**
  - User registration with role-based access (admin/staff)
  - Secure login with JWT authentication
  - Password encryption using bcrypt

- **Product Management**
  - Create, read, update, and delete products
  - Search and filter products by various attributes
  - Track stock levels with automatic alerts for reordering
  - Manage product expiration dates
  - Automatically generate SKU codes for new products

- **Inventory Management**
  - Update product stock quantities
  - Record reasons for stock adjustments
  - Monitor products below reorder levels
  - Track stock movement history with detailed audit trail

- **Stock Movement Management**
  - Record all stock ins and outs with timestamps
  - Document reasons for each inventory adjustment
  - Track previous and new stock levels for each movement
  - Associate movements with specific users for accountability

- **Security**
  - JWT-based authentication with Bearer token support
  - Role-based access control
  - Secure API endpoints

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token for authentication
- **bcrypt** - Password hashing
- **Jest** - Testing framework
- **Supertest** - HTTP assertions for testing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB instance (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ApothecaryShop.git
   cd ApothecaryShop/ApothecaryShopserver
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. You will need to make a account in google cloud console for the Oauth2 authentication.
   ```
   1. Create Credentials in Google Cloud Console
    Go to the Google Cloud Console, create a new project, and navigate to APIs & Services.
   
   2. Go to the OAuth consent screen.
    Choose External user type.
    Add your App name, Support email, and your own email as a Test user.
   
   3. Go to the Credentials tab.
    Click + Create Credentials > OAuth client ID.
    Select Web application as the type.
    Add an Authorized redirect URI, which will be your GOOGLE_CALLBACK_URL (e.g., http://localhost:5000/api/auth/google/callback). make sure this matches with the callback provided in passport.config

    4. Get the GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from the console and add it in the .env
   ```

4. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   GOOGLE_CALLBACK_URL=your-google-callback-url
   GOOGLE_CALLBACK_FAIL_URL=your-google-callback-fail-url
   FACEBOOK_APP_ID=your_actual_app_id_here
   FACEBOOK_APP_SECRET=your_actual_app_secret_here
   FACEBOOK_CALLBACK_URL=your-facebook-callback-url
   FACEBOOK_CALLBACK_FAIL_URL=your-facebook-callback-fail-url
   ```

5. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication

#### Register User
- **URL**: `/api/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "User Name",
    "email": "user@example.com",
    "password": "securepassword",
    "role": "staff"  // "admin" or "staff"
  }
  ```
- **Response**: `201 Created` with success message

#### Login
- **URL**: `/api/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Response**: `200 OK` with JWT token and user details

### Products

#### Get All Products
- **URL**: `/api/products`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Response**: `200 OK` with array of products

#### Get Product by ID
- **URL**: `/api/products/:id`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Response**: `200 OK` with product details

#### Create Product
- **URL**: `/api/products`
- **Method**: `POST`
- **Authentication**: Required (Bearer Token)
- **Body**:
  ```json
  {
    "name": "Product Name",
    "genericName": "Generic Name",
    "category": "Category",
    "manufacturer": "Manufacturer",
    "batchNumber": "BATCH123",
    "expiryDate": "2025-12-31",
    "stockQuantity": 100,
    "unitPrice": 9.99,
    "reorderLevel": 20,
    "description": "Optional product description"
  }
  ```
- **Response**: `201 Created` with created product

#### Update Product
- **URL**: `/api/products/:id`
- **Method**: `PUT`
- **Authentication**: Required (Bearer Token)
- **Body**: Any product fields to update
- **Response**: `200 OK` with updated product

#### Delete Product
- **URL**: `/api/products/:id`
- **Method**: `DELETE`
- **Authentication**: Required (Bearer Token)
- **Response**: `200 OK` with success message

#### Update Stock Quantity
- **URL**: `/api/products/:id/stock`
- **Method**: `PATCH`
- **Authentication**: Required (Bearer Token)
- **Body**:
  ```json
  {
    "adjustment": 50,  // positive to increase, negative to decrease
    "reason": "New shipment received"
  }
  ```
- **Response**: `200 OK` with updated product

### Stock Movement

#### Get Stock Movements for a Product
- **URL**: `/api/stockMovements/product/:productId`
- **Method**: `GET`
- **Authentication**: Required (Bearer Token)
- **Response**: `200 OK` with array of stock movements for the specified product

#### Add New Stock Movement
- **URL**: `/api/stockMovements`
- **Method**: `POST`
- **Authentication**: Required (Bearer Token)
- **Body**:
  ```json
  {
    "productId": "60d21b4667d0d8992e610c85", // MongoDB ID of the product
    "type": "in",  // "in" for stock addition, "out" for stock removal
    "quantity": 50,  // Number of items to add/remove
    "reason": "Initial inventory"  // Reason for the stock movement
  }
  ```
- **Response**: `201 Created` with the created stock movement and updated product

## Authentication Details

All protected endpoints require a valid Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Testing

Run the test suite with:

```
npm test
```

The tests cover:
- Authentication endpoints
- Product CRUD operations
- Stock management functionality
- Stock movement endpoints

## Release 2.0

### New Features

- **Supplier Management**
  - Create, read, update, and delete suppliers
  - Track supplier details including contact information, address, tax ID
  - Rate suppliers and track payment terms
  - Mark suppliers as Jan Aushadhi partners
  - Role-based access control for supplier operations

- **Purchase Order Management**
  - Create and track purchase orders with unique PO numbers 
  - Associate purchase orders with suppliers
  - Track order status (draft, submitted, approved, shipped, received, etc.)
  - Manage expected and actual delivery dates
  - Calculate order totals, taxes, and discounts
  - Support for payment tracking and invoice management
  - Automatically generate sequential PO numbers

- **Purchase Receipt Management**
  - Record receipt of purchased items with unique GRN numbers
  - Link receipts to purchase orders
  - Track received quantities vs ordered quantities
  - Conduct and record quality checks
  - Automatically update product stock quantities
  - Automatically generate stock movement records
  - Create new products from received items if they don't exist
  - Automatically generate sequential GRN numbers

- **External Product Integration**
  - Connect to Jan Aushadhi external API
  - Search and fetch product data from external sources
  - Integrate external products into purchase orders
  - Automatic token management for API access
  - Cache mechanism to optimize API requests

### New API Endpoints

#### Suppliers

- **Get All Suppliers**
  - **URL**: `/api/suppliers`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Access**: Staff and Admin
  - **Response**: `200 OK` with array of suppliers

- **Get Supplier by ID**
  - **URL**: `/api/suppliers/:id`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Access**: Staff and Admin
  - **Response**: `200 OK` with supplier details

- **Create Supplier**
  - **URL**: `/api/suppliers`
  - **Method**: `POST`
  - **Authentication**: Required (Bearer Token)
  - **Access**: Admin only
  - **Body**: Supplier details
  - **Response**: `201 Created` with created supplier

- **Update Supplier**
  - **URL**: `/api/suppliers/:id`
  - **Method**: `PUT`
  - **Authentication**: Required (Bearer Token)
  - **Access**: Admin only
  - **Body**: Any supplier fields to update
  - **Response**: `200 OK` with updated supplier

- **Delete Supplier**
  - **URL**: `/api/suppliers/:id`
  - **Method**: `DELETE`
  - **Authentication**: Required (Bearer Token)
  - **Access**: Admin only
  - **Response**: `200 OK` with success message

#### Purchase Orders

- **Get All Purchase Orders**
  - **URL**: `/api/purchase-orders`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Response**: `200 OK` with array of purchase orders

- **Get Purchase Order by ID**
  - **URL**: `/api/purchase-orders/:id`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Response**: `200 OK` with purchase order details

- **Create Purchase Order**
  - **URL**: `/api/purchase-orders`
  - **Method**: `POST`
  - **Authentication**: Required (Bearer Token)
  - **Body**: Purchase order details
  - **Response**: `201 Created` with created purchase order

- **Update Purchase Order**
  - **URL**: `/api/purchase-orders/:id`
  - **Method**: `PUT`
  - **Authentication**: Required (Bearer Token)
  - **Body**: Any purchase order fields to update
  - **Response**: `200 OK` with updated purchase order

- **Delete Purchase Order**
  - **URL**: `/api/purchase-orders/:id`
  - **Method**: `DELETE`
  - **Authentication**: Required (Bearer Token)
  - **Response**: `200 OK` with success message

#### Purchase Receipts

- **Get All Purchase Receipts**
  - **URL**: `/api/purchase-receipts`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Response**: `200 OK` with array of purchase receipts

- **Get Purchase Receipt by ID**
  - **URL**: `/api/purchase-receipts/:id`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Response**: `200 OK` with purchase receipt details

- **Create Purchase Receipt**
  - **URL**: `/api/purchase-receipts`
  - **Method**: `POST`
  - **Authentication**: Required (Bearer Token)
  - **Body**: Purchase receipt details
  - **Response**: `201 Created` with created purchase receipt

#### External Products

- **Get External Products**
  - **URL**: `/api/external-products`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Query Parameters**: 
    - `pageIndex` (default: 0)
    - `pageSize` (default: 100)
    - `searchText` (default: "")
    - `columnName` (default: "id")
    - `orderBy` (default: "asc")
  - **Response**: `200 OK` with external products data

## Release 3.0

### New Features

- **Distribution Management**
  - Create and track distribution orders with unique DO numbers
  - Record distribution of products to patients, pharmacies, departments, and hospitals
  - Track complete distribution lifecycle with status updates (pending, processed, shipped, delivered)
  - Handle returns and cancellations with automatic inventory adjustments
  - Generate distribution reports with analytics on top recipients and products
  - Automated stock movement entries for distribution activities
  - Track shipping information including addresses and contact details

- **MaoMao AI Pharmaceutical Assistant**
  - AI-powered pharmaceutical knowledge assistant using Google's Generative AI
  - Maintains conversation history for contextual responses
  - Configurable output formats (text, list, HTML, etc.)
  - Support for structured JSON responses for integration with other systems
  - Specialized medical information formatting options
  - Personalized interactions based on user context and role
  - Provides evidence-based pharmaceutical and herbal medicine information

### New API Endpoints

#### Distribution Management

- **Create Distribution Order**
  - **URL**: `/api/distributions`
  - **Method**: `POST`
  - **Authentication**: Required (Bearer Token)
  - **Body**:
    ```json
    {
      "recipient": "Patient Name or Organization",
      "recipientType": "patient", // Options: "patient", "pharmacy", "department", "hospital"
      "items": [
        {
          "product": "60d21b4667d0d8992e610c85", // Product ID
          "quantity": 5,
          "batchNumber": "BATCH123",
          "expiryDate": "2025-12-31"
        }
      ],
      "shippingInfo": {
        "address": "123 Main St",
        "contactPerson": "Contact Name",
        "contactNumber": "555-1234"
      }
    }
    ```
  - **Response**: `201 Created` with created distribution order

- **Get All Distribution Orders**
  - **URL**: `/api/distributions`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Query Parameters**: `status`, `startDate`, `endDate`, `recipient` (all optional)
  - **Response**: `200 OK` with array of distribution orders

- **Get Distribution Order By ID**
  - **URL**: `/api/distributions/:id`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Response**: `200 OK` with distribution order details

- **Update Distribution Status**
  - **URL**: `/api/distributions/:id/status`
  - **Method**: `PATCH`
  - **Authentication**: Required (Bearer Token)
  - **Body**:
    ```json
    {
      "status": "shipped" // Options: "pending", "processed", "shipped", "delivered", "returned", "cancelled"
    }
    ```
  - **Response**: `200 OK` with updated distribution order

- **Delete Distribution Order**
  - **URL**: `/api/distributions/:id`
  - **Method**: `DELETE`
  - **Authentication**: Required (Bearer Token)
  - **Response**: `200 OK` with success message (only allowed for pending orders)

- **Generate Distribution Report**
  - **URL**: `/api/distributions/reports/summary`
  - **Method**: `GET`
  - **Authentication**: Required (Bearer Token)
  - **Query Parameters**: `startDate`, `endDate` (optional)
  - **Response**: `200 OK` with distribution statistics and analytics

#### MaoMao AI Pharmaceutical Assistant

- **Generate AI Response**
  - **URL**: `/api/maomao-ai/generate`
  - **Method**: `POST`
  - **Authentication**: Required (Bearer Token)
  - **Body**:
    ```json
    {
      "prompt": "Tell me about herbs for headaches",
      "userName": "Pharmacist",
      "userContext": "Working at a pharmacy counter helping a customer",
      "clearHistory": false,
      "outputFormat": "text", 
      "structuredOutput": false
    }
    ```
  - **Output Format Options**: 
    - `"text"`: Plain text paragraphs (default)
    - `"list"`: Comma-separated list of items
    - `"sentence"`: Single concise sentence 
    - `"html"`: Formatted HTML content
    - `"medical"`: Medical information with uses, side effects, etc.
    - `"recipe"`: Medicinal preparation recipe with ingredients and steps
  
  - **Response**: `200 OK` with AI-generated response and conversation details

## Release 4.0

### New Features

- **Image Recognition & Analysis**
  - Upload and analyze images of pharmaceutical products using AI
  - Extract text from medicine packaging and labels automatically
  - Identify medicinal products from images with detailed information
  - Process images for inventory management and verification
  - Integration with Google's Gemini 1.5 Pro model for advanced analysis

- **Enhanced AI Capabilities**
  - Improved MaoMao AI with Gemini 2.0 integration
  - Support for multiple output formats (text, JSON, HTML)
  - Structured data output with custom schemas for system integration
  - Specialized pharmaceutical knowledge formatting
  - Persistent conversation history management
  - Contextual responses based on user role and situation

- **Transaction Optimization**
  - MongoDB transaction support for complex inventory operations
  - Atomic database operations with rollback capability
  - Improved error handling and recovery for critical processes
  - Advanced session management for multi-step operations
  - Data consistency guarantees for inventory movements

- **Unit and Batch Size Management**
  - Track and update product unit sizes during receipt
  - Automatic product categorization based on group names
  - Enhanced product description with unit size information
  - Dynamic batch number and expiry date tracking
  - Improved product creation from external sources

### New API Endpoints

#### Image Analysis

- **Analyze Product Image**
  - **URL**: `/api/vision/analyze`
  - **Method**: `POST`
  - **Authentication**: Required (Bearer Token)
  - **Content-Type**: `multipart/form-data`
  - **Body**:
    ```
    image: [binary file data]
    prompt: "Optional custom prompt for analysis"
    ```
  - **Response**: `200 OK` with AI analysis of the product image

- **Extract Text from Image**
  - **URL**: `/api/vision/extract-text`
  - **Method**: `POST`
  - **Authentication**: Required (Bearer Token)
  - **Content-Type**: `multipart/form-data`
  - **Body**:
    ```
    image: [binary file data]
    ```
  - **Response**: `200 OK` with extracted text content from the image

#### Enhanced MaoMao AI

- **Generate Structured AI Response**
  - **URL**: `/api/maomao-ai/generate`
  - **Method**: `POST`
  - **Authentication**: Required (Bearer Token)
  - **Body**:
    ```json
    {
      "prompt": "Tell me about the proper dosage of ibuprofen",
      "userName": "Pharmacist",
      "userContext": "Consulting with elderly patient",
      "clearHistory": false,
      "outputFormat": "medical",
      "structuredOutput": true
    }
    ```
  - **Additional Output Format Options**:
    - `"recipe"`: Structured medicinal preparation instructions
    - `"medical"`: Detailed medical information with predefined fields
  
  - **Response**: `200 OK` with AI-generated structured response in selected format

#### Purchase Receipt Improvements

- **Create Purchase Receipt with Unit Size Information**
  - **URL**: `/api/purchase-receipts`
  - **Method**: `POST` 
  - **Authentication**: Required (Bearer Token)
  - **Body**:
    ```json
    {
      "purchaseOrder": "60d21b4667d0d8992e610c85",
      "receiptDate": "2023-12-10T10:30:00.000Z",
      "items": [
        {
          "product": "60d21b4667d0d8992e610c86",
          "genericName": "Paracetamol",
          "groupName": "Analgesics",
          "unitSize": "10's",
          "expectedQuantity": 100,
          "receivedQuantity": 100,
          "batchNumber": "BATCH123",
          "expiryDate": "2025-10-10T00:00:00.000Z",
          "unitPrice": 5.99,
          "comments": "All items in good condition"
        }
      ],
      "qualityCheck": {
        "passed": true,
        "notes": "All products passed quality check"
      },
      "notes": "Delivery was on time"
    }
    ```
  - **Response**: `201 Created` with created purchase receipt including updated product information

## License

[MIT](LICENSE)
