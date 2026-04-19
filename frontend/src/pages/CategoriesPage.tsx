import { useEffect, useState } from "react";
import { createCategory, deleteCategory, getCategories } from "../api/categoriesApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

type Category = {
    id: number;
    name: string;
};

export const CategoriesPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Category name cannot be empty");
            return;
        }

        try {
            setError("");
            await createCategory(name.trim());
            setName("");
            await loadCategories();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create category");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            setError("");
            await deleteCategory(id);
            await loadCategories();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to delete category");
        }
    };

    const isManager = user?.role === "Manager";

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24,
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>Categories</h1>
                    <p style={{ margin: "8px 0 0 0" }}>
                        Logged in as: <strong>{user?.username}</strong> ({user?.role})
                    </p>
                </div>

                <button onClick={handleLogout}>Logout</button>
            </div>

            {isManager && (
                <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
                    <h3>Add category</h3>
                    <div style={{ display: "flex", gap: 12 }}>
                        <input
                            type="text"
                            placeholder="Category name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ flex: 1, padding: 8 }}
                        />
                        <button type="submit">Create</button>
                    </div>
                </form>
            )}

            {error && (
                <div
                    style={{
                        marginBottom: 16,
                        padding: 12,
                        background: "#ffe5e5",
                        border: "1px solid #ffb3b3",
                        color: "#990000",
                    }}
                >
                    {error}
                </div>
            )}

            <h3>Category list</h3>

            {loading ? (
                <p>Loading...</p>
            ) : categories.length === 0 ? (
                <p>No categories found</p>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        border: "1px solid #ddd",
                    }}
                >
                    <thead>
                    <tr>
                        <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "left" }}>ID</th>
                        <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "left" }}>Name</th>
                        {isManager && (
                            <th style={{ border: "1px solid #ddd", padding: 10, textAlign: "left" }}>
                                Actions
                            </th>
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {categories.map((category) => (
                        <tr key={category.id}>
                            <td style={{ border: "1px solid #ddd", padding: 10 }}>{category.id}</td>
                            <td style={{ border: "1px solid #ddd", padding: 10 }}>{category.name}</td>
                            {isManager && (
                                <td style={{ border: "1px solid #ddd", padding: 10 }}>
                                    <button onClick={() => handleDelete(category.id)}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};