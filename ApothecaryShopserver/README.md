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

- **Inventory Management**
  - Update product stock quantities
  - Record reasons for stock adjustments
  - Monitor products below reorder levels

- **Security**
  - JWT-based authentication
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

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. Start the server:
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
    "reorderLevel": 20
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

## Testing

Run the test suite with:

```
npm test
```

The tests cover:
- Authentication endpoints
- Product CRUD operations
- Stock management functionality

## License

[MIT](LICENSE)
