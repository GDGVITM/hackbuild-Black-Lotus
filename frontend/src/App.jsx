import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import BusinessDashboard from "./pages/BusinessDashboard";
// CONTEXT
import { CallProvider, useCall } from "@/context/CallContext";

// UI COMPONENTS
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import ChatBotButton from "@/components/ChatBotButton";
import { Toaster } from "sonner";
import RegisterStudent from "@/pages/StudentSignUp";
import RegisterBusiness from "@/pages/BusinessSignUp";
import NewProjectForm from "@/pages/NewProjectForm";
// PAGES
import ContractsPage from "./pages/ContractsPage";
import ChatPage from "./pages/ChatPage";
import ManageProjects from "./pages/ManageProjects";
import Login from "@/pages/Login";
import Generate from "./pages/Generate";
import { HomePage } from "@/components/HomePage";
import ContactPage from "@/pages/ContactUs";
import UserProfile from "@/pages/UserProfile";
import PaymentPage from "@/pages/PaymentPage";
import StudentDashboard from "@/pages/StudentDashboard";
import CommunityDashboard from "./pages/Community";
import FindWork from "./pages/FindWork";
import JobDetails from "./pages/JobDetails";
import JobListing from "./pages/JobListing";
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
            <Route path="/generate" element={<Generate />} />
            <Route path="/signup-student" element={<RegisterStudent />} />
            <Route path="/signup-business" element={<RegisterBusiness />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/job-listing" element={<JobListing />} />
            <Route path="/job-posting" element={<NewProjectForm />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/user-profile" element={<UserProfile />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/:roomId" element={<PaymentPage />} />
            <Route path="/find-work" element={<FindWork />} />
            <Route path="/dashboard-student" element={<StudentDashboard />} />
            <Route path="/dashboard-business" element={<BusinessDashboard />} />
            <Route path="/community" element={<CommunityDashboard />} />
            <Route path="/findwork" element={<FindWork />} />
            <Route path="/post-project" element={<NewProjectForm />} />
            <Route path="/manage-projects" element={<ManageProjects />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:roomId?" element={<ChatPage />} />
            <Route path="/contracts" element={<ContractsPage />} />
          </Routes>
        </Layout>
      </Router>
    </CallProvider>
  );
}

export default App;
