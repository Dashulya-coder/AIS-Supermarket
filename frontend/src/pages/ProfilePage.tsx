import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import styles from "../components/common.module.css";

type Employee = {
    id: string;
    surname: string;
    name: string;
    patronymic: string | null;
    position: string;
    salary: number;
    date_of_birth: string;
    date_of_start: string;
    phone: string;
    city: string;
    street: string;
    zip_code: string;
};

export const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Employee | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const res = await api.get("/employees/me");
                setProfile(res.data);
            } catch (err: any) {
                setError(err?.response?.data?.error || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    if (loading) return <div className={styles.page}><div className={styles.loading}>Loading...</div></div>;
    if (error) return <div className={styles.page}><div className={styles.errorMsg}>{error}</div></div>;

    return (
        <div className={styles.page} style={{ maxWidth: 700 }}>
            <h1 className={styles.pageTitle}>My Profile</h1>

            {profile && (
                <div className={styles.card} style={{ marginTop: 24 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                        {[
                            { label: "Employee ID", value: profile.id },
                            { label: "Username", value: user?.username ?? "—" },
                            { label: "Position", value: profile.position },
                            { label: "Surname", value: profile.surname },
                            { label: "Name", value: profile.name },
                            { label: "Patronymic", value: profile.patronymic ?? "—" },
                            { label: "Salary", value: `${Number(profile.salary).toLocaleString()} ₴` },
                            { label: "Date of birth", value: profile.date_of_birth?.split("T")[0] },
                            { label: "Date of start", value: profile.date_of_start?.split("T")[0] },
                            { label: "Phone", value: profile.phone },
                            { label: "City", value: profile.city },
                            { label: "Street", value: profile.street },
                            { label: "Zip code", value: profile.zip_code },
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
                                <p style={{ fontWeight: 600 }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};