import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import PostAd from './pages/PostAd';
import Favorites from './pages/Favorites';
import MyListings from './pages/MyListings';
import EditListing from './pages/EditListing';
import Inbox from './pages/Inbox';
import CompareListings from './pages/CompareListings';
import OwnerLeadCRM from './pages/OwnerLeadCRM';
import AdminUserEdit from './pages/AdminUserEdit';
import AdminScrapingPanel from './pages/AdminScrapingPanel';
import AdminScrapedListings from './pages/AdminScrapedListings';
import AdminMarketReport from './pages/AdminMarketReport';
import AdminScrapingSettings from './pages/AdminScrapingSettings';
import NotFound from './pages/NotFound';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/listings/:id" element={<ListingDetail />} />
              <Route path="/compare" element={<CompareListings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/post-ad" element={<ProtectedRoute><PostAd /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
              <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
              <Route path="/owner/leads" element={<ProtectedRoute><OwnerLeadCRM /></ProtectedRoute>} />
              <Route path="/admin/users/:id" element={<ProtectedRoute><AdminUserEdit /></ProtectedRoute>} />

              {/* Scraping Routes */}
              <Route path="/admin/scraping" element={<ProtectedRoute><AdminScrapingPanel /></ProtectedRoute>} />
              <Route path="/admin/scraping/listings" element={<ProtectedRoute><AdminScrapedListings /></ProtectedRoute>} />
              <Route path="/admin/scraping/market" element={<ProtectedRoute><AdminMarketReport /></ProtectedRoute>} />
              <Route path="/admin/scraping/settings" element={<ProtectedRoute><AdminScrapingSettings /></ProtectedRoute>} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
