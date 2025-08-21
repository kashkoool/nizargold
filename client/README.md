# FNizar - Client Application

## 🏪 About FNizar

FNizar is a jewelry management system with separate interfaces for store owners and customers. This is the React frontend application.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your actual values

# Start development server
npm start
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## 📁 Project Structure

```
client/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   │   ├── Customer/ # Customer-facing pages
│   │   └── Owner/    # Owner/admin pages
│   ├── utils/       # Utility functions
│   └── styles/      # CSS files
├── .env.example     # Environment variables template
└── package.json     # Dependencies and scripts
```

## 🔧 Environment Variables

Copy `env.example` to `.env` and configure:

```env
REACT_APP_API_URL=http://localhost:5001
REACT_APP_BACKEND_URL=http://localhost:5001
REACT_APP_ENV=development
```

## 🎨 Features

- **Dark/Light Theme** - Toggle between themes
- **Responsive Design** - Works on all devices
- **Arabic RTL Support** - Full right-to-left layout
- **Image Management** - Product image upload and display
- **Real-time Updates** - Live product updates
- **Search & Filter** - Advanced product search
- **Pagination** - Efficient data loading

## 🔒 Security

- Environment variables for sensitive data
- JWT authentication
- CORS protection
- Input sanitization
- Secure image handling

## 📱 User Interfaces

### Customer Interface
- Product browsing
- Search and filtering
- Favorites management
- Product details
- Comments system

### Owner Interface
- Product management
- Inventory control
- Price management
- Statistics dashboard
- User management

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Railway
1. Connect your repository
2. Set environment variables
3. Deploy with Railway CLI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is part of the FNizar jewelry management system.
