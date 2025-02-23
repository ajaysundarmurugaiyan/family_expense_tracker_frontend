const config = {
  development: {
    apiUrl: 'https://family-expense-tracker-backend.onrender.com'
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://family-expense-tracker-backend.onrender.com'
  }
};

const environment = process.env.NODE_ENV || 'development';
export const apiUrl = config[environment].apiUrl; 