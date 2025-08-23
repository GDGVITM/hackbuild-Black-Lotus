import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// CONTEXT
import { CallProvider, useCall } from "@/context/CallContext";
import TransactionVerifier from "./pages/TransactionVerifier";
// UI COMPONENTS
import Navbar from "@/components/blocks/Navbar/Navbar";
import Footer from "@/components/Footer";
import ChatBotButton from "@/components/ChatBotButton";
import { Toaster } from "sonner";

// PAGES - Auth
import Login from "@/pages/Login";
import GetStartedPage from "@/pages/GetStartedPage";
import RegisterStudent from "@/pages/StudentSignUp";
import RegisterBusiness from "@/pages/BusinessSignUp";

// PAGES - Dashboard
import StudentDashboard from "@/pages/StudentDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import MCQTest from "./pages/MCQTest";
import RateBenchmark from "./pages/RateBenchmark";
import CommunityDashboard from "./pages/Community";

// PAGES - Jobs
import JobDetails from "./pages/JobDetails";
import JobListing from "./pages/JobListing";
import NewProjectForm from "@/pages/NewProjectForm";
import ManageProjects from "./pages/ManageProjects";
import FindWork from "./pages/FindWork";

// PAGES - Others
import HomePage from "@/pages/HomePage";
import ContactPage from "@/pages/ContactUs";
import UserProfile from "@/pages/UserProfile";
import PaymentPage from "@/pages/PaymentPage";
import ChatPage from "./pages/ChatPage";
import Chats from "./pages/Chats";
import ContractsPage from "./pages/ContractsPage";
import FindTalent from "./pages/FindTalent";

const hiddenLayoutRoutes = [
  "/login",
  "/signup-student",
  "/signup-business",
  "/get-started",
];

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
            {/* Home */}
            <Route path="/" element={<HomePage />} />

            {/* Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/get-started" element={<GetStartedPage />} />
            <Route path="/signup-student" element={<RegisterStudent />} />
            <Route path="/signup-business" element={<RegisterBusiness />} />
            <Route path="/user-profile/:id" element={<UserProfile />} />
            <Route
              path="/transaction-verify"
              element={<TransactionVerifier />}
            />
            {/* Job Routes */}
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/job-listing" element={<JobListing />} />
            <Route path="/job-posting" element={<NewProjectForm />} />
            <Route path="/manage-projects" element={<ManageProjects />} />
            <Route path="/find-work" element={<FindWork />} />
            <Route path="/findwork" element={<FindWork />} />
            <Route path="/post-project" element={<NewProjectForm />} />

            {/* Dashboard */}
            <Route path="/dashboard-student" element={<StudentDashboard />} />
            <Route path="/dashboard-business" element={<BusinessDashboard />} />
            <Route path="/rate-benchmark" element={<RateBenchmark />} />
            <Route path="/mcq-test" element={<MCQTest />} />

            <Route path="/community" element={<CommunityDashboard />} />

            {/* Payments */}
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/:roomId" element={<PaymentPage />} />

            {/* Chat */}
            <Route path="/chat" element={<Chats />} />
            <Route path="/chat/:id" element={<ChatPage />} />

            {/* Contracts */}
            <Route path="/contracts" element={<ContractsPage />} />
            <Route path="/find-talent" element={<FindTalent />} />

            {/* Contact */}
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </Layout>
      </Router>
    </CallProvider>
  );
}

export default App;
