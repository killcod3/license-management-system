# License Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Click%20Here-blue?style=for-the-badge)](https://license-management-system-sand.vercel.app/)

A comprehensive solution for software license management with secure verification capabilities. This system provides separate portals for administrators and users, along with a robust API for license verification in client applications.

![License Management System](https://i.postimg.cc/pVY5JrLM/chrome-ZJIMhmch3f.png)

## Features

### Admin Portal

- **Dashboard**: Get a comprehensive overview of your license system with statistics on total users, licenses, active users, and licenses expiring soon.
- **User Management**: Create, view, and manage users with unique user hashes for authentication.
- **License Management**: Generate and manage software licenses with detailed controls:
  - License key generation
  - Expiration dates
  - Hardware binding options
  - License revocation capabilities
  - Software assignment
- **Secure Authentication**: Admin authentication with role-based permissions.

### User Portal

- **License Dashboard**: Users can view all their licenses in one place.
- **License Details**: Detailed view of each license with key information:
  - License key
  - Software name
  - Expiration date
  - Hardware binding status
  - Usage instructions
- **Secure Authentication**: Simple authentication using a unique user hash.

### License Verification API

- **Secure Communication**: All API requests and responses are encrypted using AES.
- **Hardware Binding**: Optional hardware ID binding for enhanced security.
- **Comprehensive Validation**: Checks for license validity, expiration, revocation, and hardware binding.

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: AES encryption for API communication, reCAPTCHA for form protection
- **Charts**: Recharts for data visualization

## Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/killcod3/license-management-system.git
cd license-management-system
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables by creating a `.env` file:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/license_management"

# JWT Secret (generate a secure random string)
JWT_SECRET="your-secure-jwt-secret-key"

# AES Secret for License Verification API (generate a secure random string)
AES_SECRET_KEY="your-secure-aes-secret-key"

# Google reCAPTCHA (register at https://www.google.com/recaptcha)
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="your-recaptcha-site-key"
RECAPTCHA_SECRET_KEY="your-recaptcha-secret-key"
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
# or
yarn dev
```

6. Visit `http://localhost:3000` in your browser to access the application.

### First-time Login

When you first run the system and try to login to the admin portal, it will automatically create an owner account with the credentials you provide. This only happens if no admin accounts exist in the system.

## Deployment

### Build for Production

```bash
npm run build
# or
yarn build
```

### Start Production Server

```bash
npm start
# or
yarn start
```

## License Verification API

The system includes a secure API for verifying licenses in your software applications. See [API Documentation](documentation.md) for detailed documentation and examples.

## Security Considerations

- All passwords are securely hashed using bcrypt
- JWT tokens are used for authentication and have an 8-hour expiration
- reCAPTCHA protection is implemented on all login forms
- License verification API uses AES encryption for all communication
- Hardware binding adds an additional layer of protection against unauthorized license sharing

## Database Schema

### Admin Table

- `id`: Unique identifier (CUID)
- `username`: Admin username (unique)
- `password`: Hashed password
- `role`: Admin role ('owner' or 'admin')
- `createdAt`: Timestamp of account creation
- `updatedAt`: Timestamp of last update

### User Table

- `id`: Unique identifier (CUID)
- `username`: User's name
- `userHash`: Unique hash used for authentication
- `createdAt`: Timestamp of account creation
- `updatedAt`: Timestamp of last update
- `licenses`: Relation to License table

### License Table

- `id`: Unique identifier (CUID)
- `licenseKey`: Unique license key
- `userId`: Foreign key to User table
- `softwareName`: Name of the software
- `expirationDate`: License expiration date
- `hardwareId`: Optional hardware identifier for binding
- `hardwareBindingEnabled`: Whether hardware binding is enabled
- `status`: License status ('active' or 'revoked')
- `createdAt`: Timestamp of license creation
- `updatedAt`: Timestamp of last update

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
