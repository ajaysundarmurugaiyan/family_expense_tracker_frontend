import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import FamilyDetails from './components/family/FamilyDetails';
import MemberExpenses from './components/expenses/MemberExpenses';
import PrivateRoute from './components/common/PrivateRoute';

// Create theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00BCD4', // Crystal blue
      light: '#4DD0E1',
      dark: '#0097A7'
    },
    secondary: {
      main: '#9C27B0', // Crystal purple
      light: '#BA68C8',
      dark: '#7B1FA2'
    },
    background: {
      default: '#0A1929',
      paper: 'rgba(13, 25, 41, 0.8)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)'
    },
    success: {
      main: '#4CAF50',
      light: '#81C784'
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'linear-gradient(135deg, #0A1929 0%, #1A1A2E 100%)',
          backgroundAttachment: 'fixed',
          '&:before': {
            content: '""',
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle at center, #00BCD450 0%, transparent 70%), radial-gradient(circle at right, #9C27B050 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
          }
        },
        containedPrimary: {
          background: 'linear-gradient(45deg, #00BCD4 30%, #4DD0E1 90%)',
        },
        containedSecondary: {
          background: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease-in-out',
          backdropFilter: 'blur(10px)',
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          height: '100%',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
            background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.15) 0%, rgba(156, 39, 176, 0.15) 100%)',
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(13, 25, 41, 0.8)',
          backdropFilter: 'blur(10px)',
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(0, 188, 212, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(13, 25, 41, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }
      }
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 500
    }
  }
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/family/:familyId"
              element={
                <PrivateRoute>
                  <FamilyDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/family/:familyId/member/:memberId"
              element={
                <PrivateRoute>
                  <MemberExpenses />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
      <ToastContainer 
        position="bottom-right" 
        theme="dark"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </ThemeProvider>
  );
}

export default App; 