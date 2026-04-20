import { useEffect, useMemo, useState } from "react";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../api/categoriesApi";
import { useAuth } from "../context/AuthContext";
import styles from "../components/common.module.css";

type Category = {
    id: number;
    name: string;
};

export const CategoriesPage = () => {
    const { user } = useAuth();
    const isManager = user?.role === "Manager";
    const isCashier = user?.role === "Cashier";

    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setName] = useState("");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState("");

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleCreate = async () => {
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

    const handleEditStart = (category: Category) => {
        setEditingId(category.id);
        setEditingName(category.name);
        setError("");
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingName("");
    };

    const handleEditSave = async (id: number) => {
        if (!editingName.trim()) {
            setError("Category name cannot be empty");
            return;
        }
        try {
            setError("");
            await updateCategory(id, editingName.trim());
            setEditingId(null);
            setEditingName("");
            await loadCategories();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to update category");
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

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return categories;
        return categories.filter((c) => c.name.toLowerCase().includes(query));
    }, [categories, search]);

    return (
        <div className={styles.page} style={{ maxWidth: 700 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 className={styles.pageTitle}>Categories</h1>
            <button
                className={`${styles.btn} ${styles.btnSecondary} no-print`}
                onClick={() => window.print()}
            >
                🖨 Print
            </button>
        </div>

            {isManager && (
                <div className={`${styles.filterBar} no-print`} style={{ marginTop: 16 }}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="New category name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        style={{ flex: 1 }}
                    />
                    <button
                        type="button"
                        onClick={handleCreate}
                        className={`${styles.btn} ${styles.btnPrimary}`}
                    >
                        + Add
                    </button>
                </div>
            )}

            {isCashier && (
                <div className={styles.filterBar} style={{ marginTop: 16 }}>
                    <input
                        className={styles.searchInput}
                        type="text"
                        placeholder="Search category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: 1 }}
                    />
                </div>
            )}

            {error && (
                <div className={styles.errorMsg} style={{ marginBottom: 16, marginTop: 12 }}>
                    {error}
                </div>
            )}

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : filteredCategories.length === 0 ? (
                <div className={styles.empty}><p>No categories found</p></div>
            ) : (
                <div className={styles.tableWrap} style={{ marginTop: 24 }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                {isManager && <th style={{ textAlign: "right" }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr key={category.id}>
                                    <td>{category.id}</td>
                                    <td>
                                        {editingId === category.id ? (
                                            <input
                                                className={styles.input}
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleEditSave(category.id);
                                                    if (e.key === "Escape") handleEditCancel();
                                                }}
                                                autoFocus
                                                style={{ maxWidth: 260 }}
                                            />
                                        ) : (
                                            category.name
                                        )}
                                    </td>
                                    {isManager && (
                                        <td style={{ textAlign: "right" }}>
                                            <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
                                                {editingId === category.id ? (
                                                    <>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSm}`}
                                                            onClick={() => handleEditSave(category.id)}
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                                            onClick={handleEditCancel}
                                                        >
                                                            Cancel
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                                            onClick={() => handleEditStart(category)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                            onClick={() => handleDelete(category.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};