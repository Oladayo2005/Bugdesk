
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Dashboard from "./pages/Dashboard";
import BugDetails from "./pages/BugDetails";
import Bugs from "./pages/Bugs";
import MyAssignedBugs from "./pages/MyAssignedBugs";
import Activity from "./pages/Activity";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import AppLayout from "./components/AppLayout";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Routes for users who are not logged in */}
                <Route element={<GuestRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                {/* Email verification */}
                <Route
                    path="/verify-email"
                    element={<VerifyEmail />}
                />

                {/* Password recovery */}
                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

                {/* Routes for authenticated users */}
                <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>

                        <Route path="/dashboard" element={<Dashboard />} />

                        <Route path="/bugs" element={<Bugs />} />

                        <Route path="/bugs/:bugId" element={<BugDetails />} />

                        <Route
                            path="/my-bugs"
                            element={<MyAssignedBugs />}
                        />

                        <Route path="/activity" element={<Activity />} />

                        <Route path="/profile" element={<Profile />} />

                        <Route path="/settings" element={<Settings />} />

                    </Route>
                </Route>

                {/* Default route */}
                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />

                {/* Unknown routes */}
                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
