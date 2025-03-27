# EmployWise Assignment - User Management System

This project is a React-based user management system that integrates with the Reqres API. It includes authentication, user listing, and user management features.

## Features

1. Authentication Screen
   - Login functionality using Reqres API
   - Token-based authentication
   - Protected routes

2. Users List
   - Paginated list of users
   - Card-based layout with user avatars
   - Responsive design

3. User Management
   - Edit user details
   - Delete users
   - Success/error notifications

## Technologies Used

- React 18
- TypeScript
- Material-UI (MUI)
- React Router v6
- Axios
- React Toastify

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd employwise-assignment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Default Login Credentials

- Email: eve.holt@reqres.in
- Password: cityslicka

## Project Structure

```
src/
  ├── components/        # React components
  ├── contexts/         # Context providers
  ├── services/         # API services
  ├── types/           # TypeScript interfaces
  └── App.tsx          # Main application component
```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Notes

- The application uses the Reqres API (https://reqres.in/) for demonstration purposes
- All API operations are simulated (create, update, delete)
- The token is stored in localStorage for persistence
- The UI is fully responsive and works on both desktop and mobile devices
