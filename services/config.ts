
// Global Configuration for API and Backend

// 1. Set this to 'true' to use the Node.js backend
export const ENABLE_API = true; 

// 2. Use relative path "/api". 
// Since server.js serves both Frontend and Backend on the same port, 
// the browser will automatically resolve this to https://your-app.onrender.com/api
export const API_BASE_URL = "/api";

// 3. Mock Latency
export const MOCK_DELAY = 1000;
