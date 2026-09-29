import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from '@dhis2/app-runtime'
import App from './App.jsx'

// The app-runtime Provider wraps the entire app.
// When installed via App Hub, DHIS2 injects the baseUrl and auth automatically.
// For local dev, set DHIS2_BASE_URL in your environment or .env file.
const appConfig = {
  baseUrl: process.env.DHIS2_BASE_URL || 'http://localhost:8080',
  apiVersion: 42,
}

ReactDOM.createRoot(document.getElementById('app')).render(
  <Provider config={appConfig}>
    <App />
  </Provider>
)
