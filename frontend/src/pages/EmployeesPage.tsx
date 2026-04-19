import { useEffect, useState } from "react";
import {
    createEmployee,
    deleteEmployee,
    getCashiers,
    getEmployees,
} from "../api/employeesApi";
import { useAuth } from "../context/AuthContext";

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
    const [error, setError] = useState("");

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

    const loadEmployees = async () => {
        try {
            setError("");
            const data = showCashiersOnly ? await getCashiers() : await getEmployees();
            setEmployees(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load employees");
        }
    };

    useEffect(() => {
        if (isManager) {
            loadEmployees();
        }
    }, [showCashiersOnly, isManager]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !id.trim() ||
            !surname.trim() ||
            !name.trim() ||
            salary === "" ||
            !dateOfBirth.trim() ||
            !dateOfStart.trim() ||
            !phone.trim() ||
            !city.trim() ||
            !street.trim() ||
            !zipCode.trim()
        ) {
            setError("All required fields must be filled");
            return;
        }

        try {
            setError("");
            await createEmployee(
                id.trim(),
                surname.trim(),
                name.trim(),
                patronymic.trim() || null,
                position,
                Number(salary),
                dateOfBirth.trim(),
                dateOfStart.trim(),
                phone.trim(),
                city.trim(),
                street.trim(),
                zipCode.trim()
            );

            setId("");
            setSurname("");
            setName("");
            setPatronymic("");
            setPosition("Cashier");
            setSalary("");
            setDateOfBirth("");
            setDateOfStart("");
            setPhone("");
            setCity("");
            setStreet("");
            setZipCode("");

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
        return <p>Access denied</p>;
    }

    return (
        <div>
            <h1>Employees</h1>

            <div style={{ marginBottom: 16 }}>
                <label>
                    <input
                        type="checkbox"
                        checked={showCashiersOnly}
                        onChange={(e) => setShowCashiersOnly(e.target.checked)}
                    />
                    Show cashiers only
                </label>
            </div>

            <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
                <div style={{ display: "grid", gap: 8, maxWidth: 700 }}>
                    <input placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} />
                    <input placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
                    <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                    <input
                        placeholder="Patronymic"
                        value={patronymic}
                        onChange={(e) => setPatronymic(e.target.value)}
                    />

                    <select value={position} onChange={(e) => setPosition(e.target.value)}>
                        <option value="Cashier">Cashier</option>
                        <option value="Manager">Manager</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Salary"
                        value={salary}
                        onChange={(e) => setSalary(Number(e.target.value))}
                    />

                    <input
                        placeholder="Date of birth (YYYY-MM-DD)"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                    />

                    <input
                        placeholder="Date of start (YYYY-MM-DD)"
                        value={dateOfStart}
                        onChange={(e) => setDateOfStart(e.target.value)}
                    />

                    <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                    <input placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} />
                    <input placeholder="Zip code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />

                    <button type="submit">Create Employee</button>
                </div>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {employees.length === 0 ? (
                <p>No employees found</p>
            ) : (
                <table>
                    <thead>
                    <tr>
                        <th>ID</th>
                        <th>Surname</th>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Salary</th>
                        <th>Phone</th>
                        <th>City</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.id}>
                            <td>{employee.id}</td>
                            <td>{employee.surname}</td>
                            <td>{employee.name}</td>
                            <td>{employee.position}</td>
                            <td>{employee.salary}</td>
                            <td>{employee.phone}</td>
                            <td>{employee.city}</td>
                            <td>
                                <button onClick={() => handleDelete(employee.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};