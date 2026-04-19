import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
            navigate("/");
        } catch (err: any) {
            setError(err?.response?.data?.error || "Login failed");
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.card}>
                <div className={styles.logoWrap}>
                    <div className={styles.logoIcon}>
                        <img src="/logo.jpg" alt="logo" width={150} height={150} />
                    </div>
                    <p className={styles.subtitle}>Система управління супермаркетом</p>
                </div>

                <form className={styles.form} onSubmit={handleLogin}>
                    <div className={styles.field}>
                        <label className={styles.label}>Логін</label>
                        <input
                            className={styles.input}
                            placeholder="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Пароль</label>
                        <input
                            className={styles.input}
                            placeholder="your password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <p className={styles.error}>{error}</p>}
                    <button className={styles.submitBtn} type="submit">Увійти</button>
                </form>
            </div>
        </div>
    );
};