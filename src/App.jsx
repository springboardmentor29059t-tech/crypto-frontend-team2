import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Holdings from './pages/Holdings';
import Market from './pages/Market';
import AssetDetails from './pages/AssetDetails';
import Transactions from './pages/Transactions';
import Risk from './pages/Risk';
import Tax from './pages/Tax';
import Navbar from './components/Navbar';

const PrivateRoute = () => {
    const { user } = useAuth();
    return user ? (
        <div className="flex min-h-screen">
            <Navbar />
            <div className="flex-1 ml-64 p-8 transition-all duration-300">
                <Outlet />
            </div>
        </div>
    ) : <Navigate to="/login" />;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes with Navbar */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/holdings" element={<Holdings />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/market" element={<Market />} />
                        <Route path="/asset/:symbol" element={<AssetDetails />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/risk" element={<Risk />} />
                        <Route path="/tax" element={<Tax />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
