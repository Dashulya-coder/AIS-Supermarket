import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CategoriesPage } from "./pages/CategoriesPage";
import { Layout } from "./components/Layout";
import { ProductsPage } from "./pages/ProductsPage";
import { StoreProductsPage } from "./pages/StoreProductsPage";
import { CustomerCardsPage } from "./pages/CustomerCardsPage";
import { ReceiptsPage } from "./pages/ReceiptsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { EmployeesPage } from "./pages/EmployeesPage";

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
                                <Layout>
                                    <CategoriesPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/products"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <ProductsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/store-products"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <StoreProductsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/customer-cards"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <CustomerCardsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/receipts"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <ReceiptsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <ReportsPage />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/employees"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <EmployeesPage />
                                </Layout>
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