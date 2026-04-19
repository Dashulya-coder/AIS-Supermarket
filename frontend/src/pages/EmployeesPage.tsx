import { useEffect, useState } from "react";
import { createEmployee, deleteEmployee, getCashiers, getEmployees } from "../api/employeesApi";
import { useAuth } from "../context/AuthContext";
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

export const EmployeesPage = () => {
    const { user } = useAuth();
    const isManager = user?.role === "Manager";

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showCashiersOnly, setShowCashiersOnly] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [id, setId] = useState("");
    const [surname, setSurname] = useState("");
    const [name, setName] = useState("");
    const [patronymic, setPatronymic] = useState("");
    const [position, setPosition] = useState("Cashier");
    const [salary, setSalary] = useState<number | "">("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [dateOfStart, setDateOfStart] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [zipCode, setZipCode] = useState("");

    const isValidNameField = (value: string) =>
        /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$/.test(value);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            setError("");
            const data = showCashiersOnly ? await getCashiers() : await getEmployees();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load employees");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isManager) loadEmployees();
    }, [showCashiersOnly, isManager]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id.trim() || !surname.trim() || !name.trim() || salary === "" ||
            !dateOfBirth.trim() || !dateOfStart.trim() || !phone.trim() ||
            !city.trim() || !street.trim() || !zipCode.trim()) {
            setError("All required fields must be filled");
            return;
        }
        if (!isValidNameField(surname.trim())) { setError("Surname must contain only letters"); return; }
        if (!isValidNameField(name.trim())) { setError("Name must contain only letters"); return; }
        if (patronymic.trim() && !isValidNameField(patronymic.trim())) { setError("Patronymic must contain only letters"); return; }
        if (phone.trim().length > 13) { setError("Phone must not be longer than 13 characters"); return; }
        if (Number(salary) < 0) { setError("Salary cannot be negative"); return; }

        try {
            setError("");
            await createEmployee(
                id.trim(), surname.trim(), name.trim(),
                patronymic.trim() || null, position, Number(salary),
                dateOfBirth.trim(), dateOfStart.trim(), phone.trim(),
                city.trim(), street.trim(), zipCode.trim()
            );
            setId(""); setSurname(""); setName(""); setPatronymic("");
            setPosition("Cashier"); setSalary(""); setDateOfBirth("");
            setDateOfStart(""); setPhone(""); setCity(""); setStreet(""); setZipCode("");
            setShowForm(false);
            await loadEmployees();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create employee");
        }
    };

    const handleDelete = async (employeeId: string) => {
        try {
            setError("");
            await deleteEmployee(employeeId);
            await loadEmployees();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to delete employee");
        }
    };

    if (!isManager) {
        return (
            <div className={styles.page}>
                <div className={styles.empty}><p>Access denied</p></div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>Employees</h1>

            <div className={styles.filterBar} style={{ marginTop: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input
                        type="checkbox"
                        checked={showCashiersOnly}
                        onChange={(e) => setShowCashiersOnly(e.target.checked)}
                    />
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>
                        Show cashiers only
                    </span>
                </label>
                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => setShowForm((v) => !v)}
                >
                    {showForm ? "Cancel" : "+ Add Employee"}
                </button>
            </div>

            {showForm && (
                <div className={styles.card} style={{ marginTop: 16 }}>
                    <h3 className={styles.modalTitle}>New Employee</h3>
                    <form onSubmit={handleCreate}>
                        <div className={styles.formRow}>
                            <div className={styles.field}>
                                <label className={styles.label}>ID *</label>
                                <input className={styles.input} placeholder="E001" value={id} onChange={(e) => setId(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Surname *</label>
                                <input className={styles.input} placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Name *</label>
                                <input className={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Patronymic</label>
                                <input className={styles.input} placeholder="Patronymic" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Position *</label>
                                <select className={styles.select} value={position} onChange={(e) => setPosition(e.target.value)}>
                                    <option value="Cashier">Cashier</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Salary *</label>
                                <input className={styles.input} type="number" min="0" placeholder="0" value={salary} onChange={(e) => setSalary(Number(e.target.value))} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Date of birth *</label>
                                <input className={styles.input} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Date of start *</label>
                                <input className={styles.input} type="date" value={dateOfStart} onChange={(e) => setDateOfStart(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Phone *</label>
                                <input className={styles.input} placeholder="+380..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>City *</label>
                                <input className={styles.input} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Street *</label>
                                <input className={styles.input} placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Zip code *</label>
                                <input className={styles.input} placeholder="01001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create Employee</button>
                        </div>
                    </form>
                </div>
            )}

            {error && <div className={styles.errorMsg} style={{ marginTop: 12, marginBottom: 12 }}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : employees.length === 0 ? (
                <div className={styles.empty}><p>No employees found</p></div>
            ) : (
                <div className={styles.tableWrap} style={{ marginTop: 24 }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Surname</th>
                                <th>Name</th>
                                <th>Position</th>
                                <th>Salary</th>
                                <th>Phone</th>
                                <th>City</th>
                                <th>Start Date</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id}>
                                    <td><code style={{ fontSize: 13 }}>{emp.id}</code></td>
                                    <td>{emp.surname}</td>
                                    <td>{emp.name}</td>
                                    <td>
                                        <span className={`${styles.badge} ${emp.position === "Manager" ? styles.badgeAccent : styles.badgeSuccess}`}>
                                            {emp.position}
                                        </span>
                                    </td>
                                    <td>{Number(emp.salary).toLocaleString()} ₴</td>
                                    <td>{emp.phone}</td>
                                    <td>{emp.city}</td>
                                    <td>{emp.date_of_start?.split("T")[0]}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <button
                                            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                            onClick={() => handleDelete(emp.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};