import { useEffect, useState } from "react";
import { createStoreProduct, deleteStoreProduct, getStoreProducts, updateStoreProduct } from "../api/storeProductsApi";
import { getProducts } from "../api/productsApi";
import { useAuth } from "../context/AuthContext";
import styles from "../components/common.module.css";

type StoreProduct = {
    upc: string;
    upc_prom: string | null;
    product_id: number;
    selling_price: number;
    products_number: number;
    promotional_product: boolean;
};

type Product = {
    id: number;
    name: string;
    category_id: number;
    producer: string;
    characteristics: string;
};

export const StoreProductsPage = () => {
    const { user } = useAuth();
    const isManager = user?.role === "Manager";

    const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [filterPromotional, setFilterPromotional] = useState("all");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Create form
    const [upc, setUpc] = useState("");
    const [upcProm, setUpcProm] = useState("");
    const [productId, setProductId] = useState<number | "">("");
    const [sellingPrice, setSellingPrice] = useState<number | "">("");
    const [productsNumber, setProductsNumber] = useState<number | "">("");
    const [promotional, setPromotional] = useState(false);

    // Edit modal
    const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
    const [editUpcProm, setEditUpcProm] = useState("");
    const [editProductId, setEditProductId] = useState<number | "">("");
    const [editSellingPrice, setEditSellingPrice] = useState<number | "">("");
    const [editProductsNumber, setEditProductsNumber] = useState<number | "">("");
    const [editPromotional, setEditPromotional] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");
            const promotionalParam = filterPromotional === "all" ? undefined : filterPromotional;
            const [storeProductsData, productsData] = await Promise.all([
                getStoreProducts(promotionalParam),
                getProducts(),
            ]);
            setStoreProducts(storeProductsData);
            setProducts(productsData);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load store products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [filterPromotional]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!upc.trim() || !productId || sellingPrice === "" || productsNumber === "") {
            setError("All required fields must be filled");
            return;
        }
        if (promotional && !upcProm.trim()) {
            setError("Promotional product must have UPC_PROM");
            return;
        }
        try {
            setError("");
            await createStoreProduct(upc.trim(), promotional ? upcProm.trim() : null, Number(productId), Number(sellingPrice), Number(productsNumber), promotional);
            setUpc(""); setUpcProm(""); setProductId(""); setSellingPrice(""); setProductsNumber(""); setPromotional(false);
            setShowForm(false);
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create store product");
        }
    };

    const handleEditStart = (sp: StoreProduct) => {
        setEditingProduct(sp);
        setEditUpcProm(sp.upc_prom ?? "");
        setEditProductId(sp.product_id);
        setEditSellingPrice(sp.selling_price);
        setEditProductsNumber(sp.products_number);
        setEditPromotional(sp.promotional_product);
        setError("");
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        if (!editProductId || editSellingPrice === "" || editProductsNumber === "") {
            setError("All required fields must be filled");
            return;
        }
        if (editPromotional && !editUpcProm.trim()) {
            setError("Promotional product must have UPC_PROM");
            return;
        }
        try {
            setError("");
            await updateStoreProduct(
                editingProduct.upc,
                editPromotional ? editUpcProm.trim() : null,
                Number(editProductId),
                Number(editSellingPrice),
                Number(editProductsNumber),
                editPromotional
            );
            setEditingProduct(null);
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to update store product");
        }
    };

    const handleDelete = async (upc: string) => {
        try {
            setError("");
            await deleteStoreProduct(upc);
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to delete store product");
        }
    };

    const getProductName = (id: number) =>
        products.find((p) => p.id === id)?.name || String(id);

    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>Store Products</h1>

            <div className={styles.filterBar} style={{ marginTop: 16 }}>
                <select
                    className={styles.select}
                    style={{ width: "auto" }}
                    value={filterPromotional}
                    onChange={(e) => setFilterPromotional(e.target.value)}
                >
                    <option value="all">All products</option>
                    <option value="true">Promotional only</option>
                    <option value="false">Non-promotional only</option>
                </select>
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
                    <h3 className={styles.modalTitle}>New Store Product</h3>
                    <form onSubmit={handleCreate}>
                        <div className={styles.formRow}>
                            <div className={styles.field}>
                                <label className={styles.label}>UPC</label>
                                <input className={styles.input} placeholder="UPC" value={upc} onChange={(e) => setUpc(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Product</label>
                                <select className={styles.select} value={productId} onChange={(e) => setProductId(Number(e.target.value))}>
                                    <option value="">Select product</option>
                                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Selling price</label>
                                <input className={styles.input} type="number" min="0" placeholder="0.00" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Quantity</label>
                                <input className={styles.input} type="number" min="0" placeholder="0" value={productsNumber} onChange={(e) => setProductsNumber(Number(e.target.value))} />
                            </div>
                        </div>
                        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
                            <input type="checkbox" id="promotional" checked={promotional} onChange={(e) => setPromotional(e.target.checked)} />
                            <label htmlFor="promotional" className={styles.label} style={{ margin: 0 }}>Promotional product</label>
                        </div>
                        {promotional && (
                            <div className={styles.field} style={{ marginTop: 12 }}>
                                <label className={styles.label}>UPC_PROM</label>
                                <input className={styles.input} placeholder="UPC_PROM" value={upcProm} onChange={(e) => setUpcProm(e.target.value)} />
                            </div>
                        )}
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
                        <h3 className={styles.modalTitle}>Edit Store Product — {editingProduct.upc}</h3>
                        <form onSubmit={handleEditSave}>
                            <div className={styles.formRow}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Product</label>
                                    <select className={styles.select} value={editProductId} onChange={(e) => setEditProductId(Number(e.target.value))}>
                                        <option value="">Select product</option>
                                        {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Selling price</label>
                                    <input className={styles.input} type="number" min="0" value={editSellingPrice} onChange={(e) => setEditSellingPrice(Number(e.target.value))} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Quantity</label>
                                    <input className={styles.input} type="number" min="0" value={editProductsNumber} onChange={(e) => setEditProductsNumber(Number(e.target.value))} />
                                </div>
                            </div>
                            <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 10 }}>
                                <input type="checkbox" id="editPromotional" checked={editPromotional} onChange={(e) => setEditPromotional(e.target.checked)} />
                                <label htmlFor="editPromotional" className={styles.label} style={{ margin: 0 }}>Promotional product</label>
                            </div>
                            {editPromotional && (
                                <div className={styles.field} style={{ marginTop: 12 }}>
                                    <label className={styles.label}>UPC_PROM</label>
                                    <input className={styles.input} placeholder="UPC_PROM" value={editUpcProm} onChange={(e) => setEditUpcProm(e.target.value)} />
                                </div>
                            )}
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
            ) : storeProducts.length === 0 ? (
                <div className={styles.empty}><p>No store products found</p></div>
            ) : (
                <div className={styles.tableWrap} style={{ marginTop: 24 }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>UPC</th>
                                <th>UPC Promo</th>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Promotional</th>
                                {isManager && <th style={{ textAlign: "right" }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {storeProducts.map((sp) => (
                                <tr key={sp.upc}>
                                    <td><code style={{ fontSize: 13 }}>{sp.upc}</code></td>
                                    <td>{sp.upc_prom ?? "—"}</td>
                                    <td><span className={`${styles.badge} ${styles.badgeAccent}`}>{getProductName(sp.product_id)}</span></td>
                                    <td>{sp.selling_price} ₴</td>
                                    <td>{sp.products_number}</td>
                                    <td>
                                        {sp.promotional_product
                                            ? <span className={`${styles.badge} ${styles.badgeSuccess}`}>Yes</span>
                                            : <span className={`${styles.badge} ${styles.badgeWarning}`}>No</span>
                                        }
                                    </td>
                                    {isManager && (
                                        <td style={{ textAlign: "right" }}>
                                            <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
                                                <button
                                                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                                                    onClick={() => handleEditStart(sp)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                    onClick={() => handleDelete(sp.upc)}
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