# 🌿ApothecaryShop
Pharmaceutical Inventory System 🧑‍⚕️ Build a software application that helps manage and track the stock, procurement, and distribution of pharmaceutical products, ensuring accurate inventory control and efficient supply chain management.

## Overview
This comprehensive Pharmaceutical Inventory System helps you manage product stock, track orders, and maintain distribution records efficiently. Its robust backend (using Node.js, Express, and MongoDB) handles authentication, product management, and secure transactions, while the React UI ensures an intuitive user experience. By centralizing stock control in one interface, ApothecaryShop improves accuracy, reduces wastage, and streamlines operations for pharmacies, hospitals, and related facilities.

## Video Demo
Watch our brief overview of ApothecaryShop in action here:
[![ApothecaryShop Demo](https://i9.ytimg.com/vi/SM8juofgxy0/mqdefault.jpg?sqp=CNiD_74G-oaymwEmCMACELQB8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGBggcigyMA8=&rs=AOn4CLChiclGVroyHfiKftI9OAUIt2YWGQ)](https://youtu.be/SM8juofgxy0)

---

## Prerequisites
Before you begin, ensure you have the following installed on your system:

* **Node.js** (v18 or higher, LTS recommended)
* **MongoDB** (A running local or remote instance)
* **Google Cloud Account** (Required for Google OAuth and Gemini AI features)
* **Git**

---

## Getting Started: Local Development
Follow these steps to set up and run the project locally for development.

### 1. Clone the Repository
Clone the project repository to your local machine and navigate into the main directory.

```bash
git clone https://github.com/mohitahlawat2001/ApothecaryShop.git
cd ApothecaryShop
```

### 2. Configure Environment Variables
This is a critical step. The backend requires several secret keys and credentials to function. Please follow the detailed instructions in the [Environment Variables](#environment-variables) section below before proceeding.

### 3. Backend Setup (ApothecaryShopserver)

```bash
cd ApothecaryShopserver
npm install
npm run dev
```

 Server will be available at http://localhost:5000

### 4. Frontend Setup (ApothecaryShopUI)

```bash

cd ../ApothecaryShopUI
npm install
npm run dev
```
 Frontend will be available at http://localhost:5173

### 5. Access the Application
The application should now be accessible in your web browser.

Frontend UI: Open http://localhost:5173

Backend API: Available at http://localhost:5000

## Environment Variables
The backend requires a .env file for configuration. Always reference the provided .env.example file to ensure you have all necessary variables.

### Setup Steps
Copy the example file to create your local environment configuration:

```bash

cp ApothecaryShopserver/.env.example ApothecaryShopserver/.env
```

Open the newly created ApothecaryShopserver/.env file and update the placeholders with your actual values:


```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/apothecary-shop

# JWT Authentication
JWT_SECRET=your-secure-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_CALLBACK_URL=your-google-callback-url
GOOGLE_CALLBACK_FAIL_URL=your-google-callback-fail-url

# FaceBook OAuth
FACEBOOK_APP_ID=your_actual_app_id_here
FACEBOOK_APP_SECRET=your_actual_app_secret_here
FACEBOOK_CALLBACK_URL=your-facebook-callback-url
FACEBOOK_CALLBACK_FAIL_URL=your-facebook-callback-fail-url

# Google Gemini AI (Required for AI features)
AI_API_KEY=your-google-gemini-ai-api-key-here
```

## Key Features
- **Authentication**: Secure login, registration, and role-based access control
- **Dashboard**: At-a-glance statistics and AI-powered inventory analysis
- **Inventory**: Comprehensive product management with expiry tracking
- **Stock Movements**: Track and visualize stock changes with interactive graphs
- **Procurement**: Complete supplier and purchase order management system
- **Distribution**: Monitor product distribution to various recipient types
- **AI Integration**: Image-based product search and intelligent insights

For a comprehensive list of all features, please see [FEATURES.md](FEATURES.md).

## Why Adopt ApothecaryShop?
- **Efficiency**: Streamline inventory operations and reduce manual errors
- **Accuracy**: Maintain precise stock records with automated alerts
- **Scalability**: Suitable for pharmacies, hospitals, and large-scale distributors
- **User-Friendly**: Modern UI with responsive design for all devices
