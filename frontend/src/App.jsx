import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// CONTEXT
import { CallProvider, useCall } from "@/context/CallContext";

// UI COMPONENTS
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import ChatBotButton from "@/components/ChatBotButton";
import { Toaster } from "sonner";
import FindWork from "./pages/FindWork";
import NewProjectForm from "./components/NewProjectForm";
// PAGES
import ManageProjects from "./pages/ManageProjects";
import Login from "@/pages/Login";
import SignUp from "@/pages/StudentSignUp";
import BusinessSignUp from "@/pages/BusinessSignUp";
import { HomePage } from "@/components/HomePage";
import ContactPage from "@/pages/ContactUs";
import UserProfile from "@/pages/UserProfile";
import PaymentPage from "@/pages/PaymentPage";
import Dashboard from "@/pages/StudentDashboard";
import CommunityDashboard from "./pages/Community";
import BusinessDashboard from "./pages/BusinessDashboard";
const hiddenLayoutRoutes = ["/login", "/signup"];

const Layout = ({ children }) => {
  const location = useLocation();
  const { inCall } = useCall();
  const hideLayout = hiddenLayoutRoutes.includes(location.pathname) || inCall;

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-center" richColors />
      {!hideLayout && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideLayout && <Footer />}
      {!hideLayout && <ChatBotButton />}
    </div>
  );
};

function App() {
  return (
    <CallProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/business-signup" element={<BusinessSignUp />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/find-work" element={<FindWork />} />
            <Route path="/student/dashboard" element={<Dashboard />} />
            <Route path="/business/dashboard" element={<BusinessDashboard />} />
            <Route path="/community" element={<CommunityDashboard />} />
            <Route path="/post-project" element={<NewProjectForm />} />
            <Route path="/manage-projects" element={<ManageProjects />} />
          </Routes>
        </Layout>
      </Router>
    </CallProvider>
  );
}

export default App;
