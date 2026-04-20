import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Navbar.module.css";

export const Navbar = () => {
    const { user, logout } = useAuth();
    const isManager = user?.role === "Manager";

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <img src="/logo_2.jpg" alt="logo" width={120} height={40} />
            </div>

            <NavLink to="/categories" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                Categories
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                Products
            </NavLink>
            <NavLink to="/store-products" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                Store Products
            </NavLink>
            <NavLink to="/customer-cards" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                Customer Cards
            </NavLink>
            <NavLink to="/receipts" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                Receipts
            </NavLink>
            {isManager && <NavLink to="/reports" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                Reports
            </NavLink>}
            {isManager && <NavLink to="/employees" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                Employees
            </NavLink>}
            {!isManager && (
                <NavLink to="/profile" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ""}`}>
                    Profile
                </NavLink>
            )}

            <div className={styles.spacer} />

            <div className={styles.user}>
                <span className={styles.userName}>{user?.username}</span>
                <span className={styles.userRole}>{user?.role}</span>
            </div>
            <button className={styles.logoutBtn} onClick={logout}>Logout</button>
        </nav>
    );
};