# Shohel Pharmacy Management System

A comprehensive pharmacy management system built with React frontend and Node.js/Express backend with MongoDB database.

## Features

### Dashboard Layout (Medicine Version)
- **Today's Update Cards**: Daily sales, purchases, and total dues
- **2×4 Grid Feature Buttons**:
  - 🛒 নতুন বিক্রি (New Sale)
  - 📥 নতুন ক্রয় (New Purchase)
  - 💊 পণ্য লিস্ট (Medicine List)
  - 🧾 ডিউ লিস্ট (Due List)
  - 💵 এক্সপেন্স (Expenses)
  - ⏳ Expiry Alert
  - ⚙️ সেটিংস (Settings)
  - 📊 রিপোর্ট (Reports)

### Bottom Navigation Bar (4-5 Tabs)
- হোম (Home)
- বিক্রি (Sales)
- পণ্য (Products)
- ডিউ (Dues)
- রিপোর্ট (Reports)

## Technology Stack

### Frontend
- React 18
- React Router DOM
- Axios for API calls
- React Toastify for notifications
- Styled Components
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Express Validator
- CORS enabled

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd shohel-pharmacy-management
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Setup

Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shohel_pharmacy
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env file
```

### 5. Run the application

#### Development Mode (Both frontend and backend)
```bash
npm run dev
```

#### Or run separately:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

### 6. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Login Credentials
- Username: `admin`
- Password: `password`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify token

### Dashboard
- `GET /api/dashboard/summary` - Dashboard summary data
- `GET /api/dashboard/activities` - Recent activities
- `GET /api/dashboard/top-medicines` - Top selling medicines

### Medicines
- `GET /api/medicines` - Get all medicines
- `POST /api/medicines` - Create new medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine
- `GET /api/medicines/alerts/low-stock` - Low stock alerts
- `GET /api/medicines/alerts/expiring` - Expiring medicines

### Sales
- `GET /api/sales` - Get all sales
- `POST /api/sales` - Create new sale
- `GET /api/sales/summary/today` - Today's sales summary
- `GET /api/sales/analytics/period` - Sales analytics

### Purchases
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases` - Create new purchase
- `GET /api/purchases/summary/today` - Today's purchases summary

### Dues
- `GET /api/dues` - Get all dues
- `POST /api/dues/:id/payment` - Record payment
- `GET /api/dues/summary/total` - Dues summary
- `GET /api/dues/alerts/overdue` - Overdue dues

### Expenses
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/summary/today` - Today's expenses summary

## Project Structure

```
shohel-pharmacy-management/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── index.js            # Server entry point
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Features Implemented

### ✅ Completed
- [x] Project structure setup
- [x] Backend API with all routes
- [x] Database models (Medicine, Sale, Purchase, Due, Expense)
- [x] Authentication system
- [x] Dashboard layout with today's update cards
- [x] 2×4 grid feature buttons
- [x] Bottom navigation bar
- [x] Responsive design
- [x] Bengali language support in UI
- [x] Dependencies updated to latest versions
- [x] Security vulnerabilities addressed

### 🚧 In Progress
- [ ] Complete medicine management functionality
- [ ] Sales system with cart and billing
- [ ] Purchase management system
- [ ] Due tracking and management
- [ ] Expiry date alerts
- [ ] Comprehensive reporting system

## Development

### Adding New Features
1. Create API routes in `server/routes/`
2. Add corresponding models in `server/models/`
3. Create React components in `client/src/pages/`
4. Update navigation and routing as needed

### Database Schema
The system uses MongoDB with the following main collections:
- `medicines` - Medicine inventory
- `sales` - Sales transactions
- `purchases` - Purchase transactions
- `dues` - Customer dues
- `expenses` - Business expenses

## Recent Updates

### Version 1.0.1 (Latest)
- Updated all dependencies to latest compatible versions
- Enhanced security by updating vulnerable packages
- Improved project documentation
- Fixed compatibility issues with newer Node.js versions

### Dependency Updates
- React: 18.2.0 → 18.3.1
- React Router DOM: 6.8.1 → 6.30.1
- Axios: 1.6.2 → 1.12.2
- React Icons: 4.12.0 → 5.5.0
- React Toastify: 9.1.3 → 11.0.5
- Express: 4.18.2 → 4.21.2
- Mongoose: 8.0.3 → 8.18.1
- Concurrently: 8.2.2 → 9.2.1

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License
MIT License

## Support
For support and questions, please contact the development team.