import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Navbar = () => {
    const { user } = useAuth();

    return (
        <div
            style={{
                padding: 16,
                background: "#222",
                color: "white",
                display: "flex",
                gap: 16,
            }}
        >
            <Link to="/categories" style={{ color: "white" }}>
                Categories
            </Link>

            <Link to="/products" style={{ color: "white" }}>
                Products
            </Link>

            <Link to="/receipts" style={{ color: "white" }}>
                Receipts
            </Link>

            <Link to="/store-products" style={{ color: "white" }}>
                Store Products
            </Link>

            <Link to="/customer-cards" style={{ color: "white" }}>
                Customer Cards
            </Link>

            <div style={{ marginLeft: "auto" }}>
                {user?.username} ({user?.role})
            </div>
        </div>
    );
};