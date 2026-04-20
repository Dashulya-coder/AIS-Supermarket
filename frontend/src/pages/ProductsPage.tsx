import { useEffect, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../api/productsApi";
import { getCategories } from "../api/categoriesApi";
import { useAuth } from "../context/AuthContext";
import styles from "../components/common.module.css";

type Product = {
    id: number;
    name: string;
    category_id: number;
    producer: string;
    characteristics: string;
};

type Category = {
    id: number;
    name: string;
};

export const ProductsPage = () => {
    const { user } = useAuth();
    const isManager = user?.role === "Manager";

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [search, setSearch] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Create form
    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [producer, setProducer] = useState("");
    const [characteristics, setCharacteristics] = useState("");

    // Edit modal
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [editName, setEditName] = useState("");
    const [editCategoryId, setEditCategoryId] = useState<number | "">("");
    const [editProducer, setEditProducer] = useState("");
    const [editCharacteristics, setEditCharacteristics] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch {
            setError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !categoryId || !producer.trim() || !characteristics.trim()) {
            setError("All fields are required");
            return;
        }
        try {
            setError("");
            await createProduct(name.trim(), Number(categoryId), producer.trim(), characteristics.trim());
            setName(""); setCategoryId(""); setProducer(""); setCharacteristics("");
            setShowForm(false);
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create product");
        }
    };

    const handleEditStart = (p: Product) => {
        setEditingProduct(p);
        setEditName(p.name);
        setEditCategoryId(p.category_id);
        setEditProducer(p.producer);
        setEditCharacteristics(p.characteristics);
        setError("");
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        if (!editName.trim() || !editCategoryId || !editProducer.trim() || !editCharacteristics.trim()) {
            setError("All fields are required");
            return;
        }
        try {
            setError("");
            await updateProduct(editingProduct.id, editName.trim(), Number(editCategoryId), editProducer.trim(), editCharacteristics.trim());
            setEditingProduct(null);
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to update product");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteProduct(id);
            await loadData();
        } catch {
            setError("Failed to delete product");
        }
    };

    const getCategoryName = (id: number) =>
        categories.find((c) => c.id === id)?.name || String(id);

    const filtered = products.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.producer.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.page}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 className={styles.pageTitle}>Products</h1>
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
                    placeholder="Search by name or producer..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ flex: 1 }}
                />
                {isManager && (
                    <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => setShowForm((v) => !v)}
                    >
                        {showForm ? "Cancel" : "+ Add Product"}
                    </button>
                )}
            </div>

            {showForm && isManager && (
                <div className={styles.card} style={{ marginTop: 16 }}>
                    <h3 className={styles.modalTitle}>New Product</h3>
                    <form onSubmit={handleCreate}>
                        <div className={styles.formRow}>
                            <div className={styles.field}>
                                <label className={styles.label}>Product name</label>
                                <input className={styles.input} placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Producer</label>
                                <input className={styles.input} placeholder="Producer" value={producer} onChange={(e) => setProducer(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Characteristics</label>
                                <input className={styles.input} placeholder="Characteristics" value={characteristics} onChange={(e) => setCharacteristics(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Category</label>
                                <select className={styles.select} value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
                                    <option value="">Select category</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Modal */}
            {editingProduct && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h3 className={styles.modalTitle}>Edit Product</h3>
                        <form onSubmit={handleEditSave}>
                            <div className={styles.formRow}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Product name</label>
                                    <input className={styles.input} value={editName} onChange={(e) => setEditName(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Producer</label>
                                    <input className={styles.input} value={editProducer} onChange={(e) => setEditProducer(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Characteristics</label>
                                    <input className={styles.input} value={editCharacteristics} onChange={(e) => setEditCharacteristics(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Category</label>
                                    <select className={styles.select} value={editCategoryId} onChange={(e) => setEditCategoryId(Number(e.target.value))}>
                                        <option value="">Select category</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {error && <div className={styles.errorMsg} style={{ marginTop: 12 }}>{error}</div>}
                            <div className={styles.modalFooter}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setEditingProduct(null)}>Cancel</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {error && !editingProduct && (
                <div className={styles.errorMsg} style={{ marginTop: 12, marginBottom: 12 }}>{error}</div>
            )}

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : filtered.length === 0 ? (
                <div className={styles.empty}><p>No products found</p></div>
            ) : (
                <div className={styles.tableWrap} style={{ marginTop: 24 }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Producer</th>
                                <th>Characteristics</th>
                                {isManager && <th style={{ textAlign: "right" }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{p.name}</td>
                                    <td><span className={`${styles.badge} ${styles.badgeAccent}`}>{getCategoryName(p.category_id)}</span></td>
                                    <td>{p.producer}</td>
                                    <td>{p.characteristics}</td>
                                    {isManager && (
                                        <td style={{ textAlign: "right" }}>
                                            <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                                    onClick={() => handleEditStart(p)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                    onClick={() => handleDelete(p.id)}
                                                >
                                                    Delete
                                                </button>
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