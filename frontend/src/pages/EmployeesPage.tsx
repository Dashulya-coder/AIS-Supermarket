import { useEffect, useState } from "react";
import { createEmployee, deleteEmployee, getCashiers, getEmployees, updateEmployee } from "../api/employeesApi";
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
    const [surnameSearch, setSurnameSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Create
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

    // Edit
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [editSurname, setEditSurname] = useState("");
    const [editName, setEditName] = useState("");
    const [editPatronymic, setEditPatronymic] = useState("");
    const [editPosition, setEditPosition] = useState("Cashier");
    const [editSalary, setEditSalary] = useState<number | "">("");
    const [editDateOfBirth, setEditDateOfBirth] = useState("");
    const [editDateOfStart, setEditDateOfStart] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editCity, setEditCity] = useState("");
    const [editStreet, setEditStreet] = useState("");
    const [editZipCode, setEditZipCode] = useState("");

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

    // Фільтрація за прізвищем локально
    const filteredEmployees = employees.filter((emp) =>
        emp.surname.toLowerCase().includes(surnameSearch.toLowerCase())
    );

    // Знайдений працівник для показу деталей (п.11)
    const foundEmployee = surnameSearch.trim() && filteredEmployees.length === 1
        ? filteredEmployees[0]
        : null;

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
            await createEmployee(id.trim(), surname.trim(), name.trim(),
                patronymic.trim() || null, position, Number(salary),
                dateOfBirth.trim(), dateOfStart.trim(), phone.trim(),
                city.trim(), street.trim(), zipCode.trim());
            setId(""); setSurname(""); setName(""); setPatronymic("");
            setPosition("Cashier"); setSalary(""); setDateOfBirth("");
            setDateOfStart(""); setPhone(""); setCity(""); setStreet(""); setZipCode("");
            setShowForm(false);
            await loadEmployees();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create employee");
        }
    };

    const handleEditStart = (emp: Employee) => {
        setEditingEmployee(emp);
        setEditSurname(emp.surname);
        setEditName(emp.name);
        setEditPatronymic(emp.patronymic ?? "");
        setEditPosition(emp.position);
        setEditSalary(emp.salary);
        setEditDateOfBirth(emp.date_of_birth?.split("T")[0] ?? "");
        setEditDateOfStart(emp.date_of_start?.split("T")[0] ?? "");
        setEditPhone(emp.phone);
        setEditCity(emp.city);
        setEditStreet(emp.street);
        setEditZipCode(emp.zip_code);
        setError("");
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;
        if (!editSurname.trim() || !editName.trim() || editSalary === "" ||
            !editDateOfBirth.trim() || !editDateOfStart.trim() || !editPhone.trim() ||
            !editCity.trim() || !editStreet.trim() || !editZipCode.trim()) {
            setError("All required fields must be filled");
            return;
        }
        if (!isValidNameField(editSurname.trim())) { setError("Surname must contain only letters"); return; }
        if (!isValidNameField(editName.trim())) { setError("Name must contain only letters"); return; }
        if (editPatronymic.trim() && !isValidNameField(editPatronymic.trim())) { setError("Patronymic must contain only letters"); return; }
        if (editPhone.trim().length > 13) { setError("Phone must not be longer than 13 characters"); return; }
        if (Number(editSalary) < 0) { setError("Salary cannot be negative"); return; }
        try {
            setError("");
            await updateEmployee(editingEmployee.id, editSurname.trim(), editName.trim(),
                editPatronymic.trim() || null, editPosition, Number(editSalary),
                editDateOfBirth.trim(), editDateOfStart.trim(), editPhone.trim(),
                editCity.trim(), editStreet.trim(), editZipCode.trim());
            setEditingEmployee(null);
            await loadEmployees();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to update employee");
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
        return <div className={styles.page}><div className={styles.empty}><p>Access denied</p></div></div>;
    }

    return (
        <div className={styles.page}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 className={styles.pageTitle}>Employees</h1>
                <button
                    className={`${styles.btn} ${styles.btnSecondary} no-print`}
                    onClick={() => window.print()}
                >
                    🖨 Print
                </button>
            </div>

            <div className={`${styles.filterBar} no-print`} style={{ marginTop: 16 }}>
                <input
                    className={styles.searchInput}
                    placeholder="Search by surname..."
                    value={surnameSearch}
                    onChange={(e) => setSurnameSearch(e.target.value)}
                    style={{ flex: 1 }}
                />
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" checked={showCashiersOnly} onChange={(e) => setShowCashiersOnly(e.target.checked)} />
                    <span style={{ fontSize: 14, color: "var(--text-secondary)" }}>Cashiers only</span>
                </label>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowForm((v) => !v)}>
                    {showForm ? "Cancel" : "+ Add Employee"}
                </button>
            </div>

            {/* Результат пошуку за прізвищем — телефон і адреса (п.11) */}
            {foundEmployee && (
                <div className={styles.card} style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Employee</p>
                        <p style={{ fontWeight: 600 }}>{foundEmployee.surname} {foundEmployee.name} {foundEmployee.patronymic ?? ""}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Phone</p>
                        <p style={{ fontWeight: 600 }}>{foundEmployee.phone}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>City</p>
                        <p style={{ fontWeight: 600 }}>{foundEmployee.city}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Street</p>
                        <p style={{ fontWeight: 600 }}>{foundEmployee.street}</p>
                    </div>
                    <div>
                        <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Zip code</p>
                        <p style={{ fontWeight: 600 }}>{foundEmployee.zip_code}</p>
                    </div>
                </div>
            )}

            {showForm && (
                <div className={styles.card} style={{ marginTop: 16 }}>
                    <h3 className={styles.modalTitle}>New Employee</h3>
                    <form onSubmit={handleCreate}>
                        <div className={styles.formRow}>
                            <div className={styles.field}><label className={styles.label}>ID *</label><input className={styles.input} placeholder="E001" value={id} onChange={(e) => setId(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Surname *</label><input className={styles.input} placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Name *</label><input className={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Patronymic</label><input className={styles.input} placeholder="Patronymic" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Position *</label>
                                <select className={styles.select} value={position} onChange={(e) => setPosition(e.target.value)}>
                                    <option value="Cashier">Cashier</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>
                            <div className={styles.field}><label className={styles.label}>Salary *</label><input className={styles.input} type="number" min="0" placeholder="0" value={salary} onChange={(e) => setSalary(Number(e.target.value))} /></div>
                            <div className={styles.field}><label className={styles.label}>Date of birth *</label><input className={styles.input} type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Date of start *</label><input className={styles.input} type="date" value={dateOfStart} onChange={(e) => setDateOfStart(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Phone *</label><input className={styles.input} placeholder="+380..." value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>City *</label><input className={styles.input} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Street *</label><input className={styles.input} placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Zip code *</label><input className={styles.input} placeholder="01001" value={zipCode} onChange={(e) => setZipCode(e.target.value)} /></div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create Employee</button>
                        </div>
                    </form>
                </div>
            )}

            {editingEmployee && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal} style={{ maxWidth: 640 }}>
                        <h3 className={styles.modalTitle}>Edit Employee — {editingEmployee.id}</h3>
                        <form onSubmit={handleEditSave}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div className={styles.field}><label className={styles.label}>Surname *</label><input className={styles.input} value={editSurname} onChange={(e) => setEditSurname(e.target.value)} /></div>
                                <div className={styles.field}><label className={styles.label}>Name *</label><input className={styles.input} value={editName} onChange={(e) => setEditName(e.target.value)} /></div>
                                <div className={styles.field}><label className={styles.label}>Patronymic</label><input className={styles.input} value={editPatronymic} onChange={(e) => setEditPatronymic(e.target.value)} /></div>
                                <div className={styles.field}><label className={styles.label}>Position *</label>
                                    <select className={styles.select} value={editPosition} onChange={(e) => setEditPosition(e.target.value)}>
                                        <option value="Cashier">Cashier</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>
                                <div className={styles.field}><label className={styles.label}>Salary *</label><input className={styles.input} type="number" min="0" value={editSalary} onChange={(e) => setEditSalary(Number(e.target.value))} /></div>
                                <div className={styles.field}><label className={styles.label}>Date of birth *</label><input className={styles.input} type="date" value={editDateOfBirth} onChange={(e) => setEditDateOfBirth(e.target.value)} /></div>
                                <div className={styles.field}><label className={styles.label}>Date of start *</label><input className={styles.input} type="date" value={editDateOfStart} onChange={(e) => setEditDateOfStart(e.target.value)} /></div>
                                <div className={styles.field}><label className={styles.label}>Phone *</label><input className={styles.input} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} /></div>
                                <div className={styles.field}><label className={styles.label}>City *</label><input className={styles.input} value={editCity} onChange={(e) => setEditCity(e.target.value)} /></div>
                                <div className={styles.field}><label className={styles.label}>Street *</label><input className={styles.input} value={editStreet} onChange={(e) => setEditStreet(e.target.value)} /></div>
                                <div className={styles.field}><label className={styles.label}>Zip code *</label><input className={styles.input} value={editZipCode} onChange={(e) => setEditZipCode(e.target.value)} /></div>
                            </div>
                            {error && <div className={styles.errorMsg} style={{ marginTop: 12 }}>{error}</div>}
                            <div className={styles.modalFooter}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setEditingEmployee(null)}>Cancel</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {error && !editingEmployee && <div className={styles.errorMsg} style={{ marginTop: 12, marginBottom: 12 }}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : filteredEmployees.length === 0 ? (
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
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.id}>
                                    <td><code style={{ fontSize: 13 }}>{emp.id}</code></td>
                                    <td>{emp.surname}</td>
                                    <td>{emp.name}</td>
                                    <td><span className={`${styles.badge} ${emp.position === "Manager" ? styles.badgeAccent : styles.badgeSuccess}`}>{emp.position}</span></td>
                                    <td>{Number(emp.salary).toLocaleString()} ₴</td>
                                    <td>{emp.phone}</td>
                                    <td>{emp.city}</td>
                                    <td>{emp.date_of_start?.split("T")[0]}</td>
                                    <td style={{ textAlign: "right" }}>
                                        <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
                                            <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={() => handleEditStart(emp)}>Edit</button>
                                            <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => handleDelete(emp.id)}>Delete</button>
                                        </div>
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