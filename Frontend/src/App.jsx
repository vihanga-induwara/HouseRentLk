import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';

// Pages are code-split so the home page does not download admin, map or chart code
const Browse = lazy(() => import('./pages/Browse'));
const ListingDetail = lazy(() => import('./pages/ListingDetail'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PostAd = lazy(() => import('./pages/PostAd'));
const Favorites = lazy(() => import('./pages/Favorites'));
const MyListings = lazy(() => import('./pages/MyListings'));
const EditListing = lazy(() => import('./pages/EditListing'));
const Inbox = lazy(() => import('./pages/Inbox'));
const CompareListings = lazy(() => import('./pages/CompareListings'));
const OwnerLeadCRM = lazy(() => import('./pages/OwnerLeadCRM'));
const AdminUserEdit = lazy(() => import('./pages/AdminUserEdit'));
const AdminScrapingPanel = lazy(() => import('./pages/AdminScrapingPanel'));
const AdminScrapedListings = lazy(() => import('./pages/AdminScrapedListings'));
const AdminMarketReport = lazy(() => import('./pages/AdminMarketReport'));
const AdminScrapingSettings = lazy(() => import('./pages/AdminScrapingSettings'));
const Brokers = lazy(() => import('./pages/Brokers'));
const BrokerProfile = lazy(() => import('./pages/BrokerProfile'));
const RentBudgetPlannerPage = lazy(() => import('./pages/RentBudgetPlannerPage'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const SafetyTips = lazy(() => import('./pages/SafetyTips'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));

const ADMIN = ['admin'];

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/listings/:id" element={<ListingDetail />} />
                <Route path="/compare" element={<CompareListings />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/verify-email/:token" element={<VerifyEmail />} />
                <Route path="/brokers" element={<Brokers />} />
                <Route path="/brokers/:id" element={<BrokerProfile />} />
                <Route path="/rent-planner" element={<RentBudgetPlannerPage />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/safety" element={<SafetyTips />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected Routes */}
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/post-ad" element={<ProtectedRoute><PostAd /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
                <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
                <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                <Route path="/owner/leads" element={<ProtectedRoute><OwnerLeadCRM /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute roles={ADMIN}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users/:id" element={<ProtectedRoute roles={ADMIN}><AdminUserEdit /></ProtectedRoute>} />
                <Route path="/admin/scraping" element={<ProtectedRoute roles={ADMIN}><AdminScrapingPanel /></ProtectedRoute>} />
                <Route path="/admin/scraping/listings" element={<ProtectedRoute roles={ADMIN}><AdminScrapedListings /></ProtectedRoute>} />
                <Route path="/admin/scraping/market" element={<ProtectedRoute roles={ADMIN}><AdminMarketReport /></ProtectedRoute>} />
                <Route path="/admin/scraping/settings" element={<ProtectedRoute roles={ADMIN}><AdminScrapingSettings /></ProtectedRoute>} />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
