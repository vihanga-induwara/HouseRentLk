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
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/post-ad" element={<PostAd />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/my-listings" element={<MyListings />} />
            <Route path="/edit-listing/:id" element={<EditListing />} />
            <Route path="/inbox" element={<Inbox />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
