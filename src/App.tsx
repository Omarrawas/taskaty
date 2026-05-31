import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Services from './pages/Services'
import ServiceDetails from './pages/ServiceDetails'
import Sellers from './pages/Sellers'
import SellerProfile from './pages/SellerProfile'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import OrderDetails from './pages/OrderDetails'
import HowItWorks from './pages/HowItWorks'
import ContactUs from './pages/ContactUs'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import FAQ from './pages/FAQ'
import About from './pages/About'
import SellerTerms from './pages/SellerTerms'
import ForgotPassword from './pages/ForgotPassword'
import FloatingChat from './components/chat/FloatingChat'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:slug" element={<ServiceDetails />} />
        <Route path="/sellers" element={<Sellers />} />
        <Route path="/sellers/:id" element={<SellerProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/about" element={<About />} />
        <Route path="/seller-terms" element={<SellerTerms />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <FloatingChat />
    </>
  )
}
