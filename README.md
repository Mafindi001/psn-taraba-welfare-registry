# PSN Taraba State Welfare Digital Registry

## Overview
A secure, web-based welfare management system for the Pharmaceutical Society of Nigeria (PSN) Taraba State Chapter. This platform enables pharmacists to self-register and receive automated reminders for important dates (birthdays, anniversaries, and other celebrations).

## Features
- ✅ Secure member self-registration
- ✅ Personal profile management
- ✅ Multiple special dates with custom labels
- ✅ Automated 24-hour advance email reminders
- ✅ Admin dashboard for welfare officers
- ✅ Reminder tracking and audit logs
- ✅ Data export functionality
- ✅ NDPA-compliant data handling

## Technology Stack
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens)
- **Email Service:** Nodemailer
- **Automation:** Node-cron
- **Security:** Helmet, Bcrypt, Express-validator

## Project Structure
```
psn-taraba-welfare-registry/
├── config/          # Configuration files
├── controllers/     # Business logic
├── middleware/      # Authentication & validation
├── models/          # Database schemas
├── routes/          # API endpoints
├── services/        # Email & reminder services
├── utils/           # Helper functions
├── public/          # Static files (CSS, JS, images)
└── views/           # HTML templates
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Git

### Setup Steps
1. Clone the repository:
```bash
   git clone https://github.com/YOUR_USERNAME/psn-taraba-welfare-registry.git
   cd psn-taraba-welfare-registry
```

2. Install dependencies:
```bash
   npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
   cp .env.example .env
```

4. Configure environment variables in `.env`

5. Run development server:
```bash
   npm run dev
```

## Environment Variables
See `.env.example` for required configuration.

## Usage
- **Members:** Register at `/register`, login at `/login`
- **Admins:** Login at `/admin/login`

## Security
- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- CORS configuration
- Security headers via Helmet

## Compliance
This system is designed to comply with:
- Nigeria Data Protection Act (NDPA)
- PSN professional ethics guidelines

## Development
```bash
npm run dev    # Development mode with auto-restart
npm start      # Production mode
```

## Contributing
This is a private project for PSN Taraba State Chapter. For questions or issues, contact the Welfare Secretary.

## License
Proprietary - PSN Taraba State Chapter

## Maintainer
PSN Taraba State Welfare Department

---
**Built with professionalism and care for PSN Taraba State pharmacists**