import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CategoriesPage } from "./pages/CategoriesPage";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    <Route
                        path="/categories"
                        element={
                            <ProtectedRoute>
                                <CategoriesPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="/" element={<Navigate to="/categories" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;