DealFlow is a local lead-management and workflow app built with React, Node.js, Express, MongoDB and Mongoose.

## Local setup

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```
3. Start MongoDB locally (for example with `mongod`).
4. Start the backend server:
   ```bash
   cd ../backend
   npm run start
   ```
5. Start the frontend app:
   ```bash
   cd ../frontend
   npm run dev
   ```

## Notes

- Backend API runs on `http://localhost:4000`
- Frontend runs on `http://localhost:5173`
- Use the signup form to create the first workspace and then manage leads from the dashboard.

