import { useEffect, useState } from "react";
import {
    createReceipt,
    getAllReceiptsByPeriod,
    getMyReceipts,
    getReceiptByNumber,
    getReceiptsByCashierAndPeriod,
} from "../api/receiptsApi";
import { getStoreProducts } from "../api/storeProductsApi";
import { getCustomerCards } from "../api/customerCardsApi";
import { getEmployees } from "../api/employeesApi";
import { useAuth } from "../context/AuthContext";
import styles from "../components/common.module.css";

type ReceiptItemInput = { upc: string; product_number: number };

type Receipt = {
    receipt_number: string;
    cashier_id: string;
    card_number: string | null;
    print_date: string;
    sum_total: number;
    vat: number;
};

type ReceiptFull = Receipt & {
    items: {
        id: number;
        receipt_number: string;
        upc: string;
        product_number: number;
        selling_price: number;
    }[];
};

type StoreProduct = {
    upc: string;
    upc_prom: string | null;
    product_id: number;
    selling_price: number;
    products_number: number;
    promotional_product: boolean;
};

type CustomerCard = {
    card_number: string;
    surname: string;
    name: string;
    patronymic: string | null;
    phone: string;
    city: string | null;
    street: string | null;
    zip_code: string | null;
    percent: number;
};

type Employee = {
    id: string;
    surname: string;
    name: string;
    patronymic: string | null;
    position?: string;
    role?: string;
};

const formatBackendDateTime = (value: string) => {
    const normalized = value.replace("T", " ").slice(0, 19);
    const [datePart, timePart] = normalized.split(" ");
    const [year, month, day] = datePart.split("-");
    return `${day}/${month}/${year}, ${timePart}`;
};

const ReceiptTable = ({ receipts }: { receipts: Receipt[] }) => (
    <div className={styles.tableWrap} style={{ marginTop: 16 }}>
        <table className={styles.table}>
            <thead>
            <tr>
                <th>Receipt #</th>
                <th>Cashier ID</th>
                <th>Card</th>
                <th>Date</th>
                <th>Total</th>
                <th>VAT</th>
            </tr>
            </thead>
            <tbody>
            {receipts.map((r) => (
                <tr key={r.receipt_number}>
                    <td>
                        <code style={{ fontSize: 13 }}>{r.receipt_number}</code>
                    </td>
                    <td>{r.cashier_id}</td>
                    <td>{r.card_number ?? "—"}</td>
                    <td>{formatBackendDateTime(r.print_date)}</td>
                    <td>
                        <strong>{Number(r.sum_total).toFixed(2)} ₴</strong>
                    </td>
                    <td>{Number(r.vat).toFixed(2)} ₴</td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

export const ReceiptsPage = () => {
    const { user } = useAuth();
    const isCashier = user?.role === "Cashier";
    const isManager = user?.role === "Manager";

    const [cardNumber, setCardNumber] = useState("");
    const [items, setItems] = useState<ReceiptItemInput[]>([{ upc: "", product_number: 1 }]);

    const [from, setFrom] = useState("2026-04-01 00:00:00");
    const [to, setTo] = useState("2026-04-30 23:59:59");
    const [receiptNumber, setReceiptNumber] = useState("");
    const [managerCashierId, setManagerCashierId] = useState("");
    const [managerFrom, setManagerFrom] = useState("2026-04-01 00:00:00");
    const [managerTo, setManagerTo] = useState("2026-04-30 23:59:59");
    const [allFrom, setAllFrom] = useState("2026-04-01 00:00:00");
    const [allTo, setAllTo] = useState("2026-04-30 23:59:59");

    const [createdReceipt, setCreatedReceipt] = useState<Receipt | null>(null);
    const [myReceipts, setMyReceipts] = useState<Receipt[]>([]);
    const [managerReceipts, setManagerReceipts] = useState<Receipt[]>([]);
    const [allReceipts, setAllReceipts] = useState<Receipt[]>([]);
    const [receiptDetails, setReceiptDetails] = useState<ReceiptFull | null>(null);

    const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
    const [customerCards, setCustomerCards] = useState<CustomerCard[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadOptions = async () => {
            try {
                setError("");

                const [sp, cc] = await Promise.all([
                    getStoreProducts(),
                    getCustomerCards(),
                ]);

                setStoreProducts(Array.isArray(sp) ? sp : []);
                setCustomerCards(Array.isArray(cc) ? cc : []);

                if (isManager) {
                    const emp = await getEmployees();
                    setEmployees(Array.isArray(emp) ? emp : []);
                }
            } catch (err: any) {
                setError(err?.response?.data?.error || "Failed to load options");
            }
        };

        loadOptions();
    }, [isManager]);

    const handleItemChange = (index: number, field: keyof ReceiptItemInput, value: string | number) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: field === "product_number" ? Number(value) : value };
        setItems(updated);
    };

    const handleCreateReceipt = async (e: React.FormEvent) => {
        e.preventDefault();
        for (const item of items) {
            if (!item.upc.trim() || item.product_number <= 0) {
                setError("Each item must have valid UPC and quantity");
                return;
            }
        }
        const upcs = items.map((i) => i.upc.trim());
        if (new Set(upcs).size !== upcs.length) {
            setError("The same UPC cannot be added twice");
            return;
        }
        try {
            setError("");
            const data = await createReceipt(cardNumber.trim() || null, items);
            setCreatedReceipt(data);
            setItems([{ upc: "", product_number: 1 }]);
            setCardNumber("");
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create receipt");
        }
    };

    const handleGetMyReceipts = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            const data = await getMyReceipts(from, to);
            setMyReceipts(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load receipts");
        }
    };

    const handleGetReceiptByNumber = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!receiptNumber.trim()) { setError("Receipt number is required"); return; }
        try {
            setError("");
            const data = await getReceiptByNumber(receiptNumber.trim());
            setReceiptDetails(data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load receipt");
        }
    };

    const handleGetReceiptsByCashier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!managerCashierId.trim()) { setError("Please select a cashier"); return; }
        try {
            setError("");
            const data = await getReceiptsByCashierAndPeriod(managerCashierId.trim(), managerFrom, managerTo);
            setManagerReceipts(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load receipts");
        }
    };

    const handleGetAllReceipts = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            const data = await getAllReceiptsByPeriod(allFrom, allTo);
            setAllReceipts(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load receipts");
        }
    };

    const cashiers = employees.filter((e) => e.role === "Cashier" || e.position === "Cashier");

    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>Receipts</h1>

            {error && <div className={styles.errorMsg} style={{ marginTop: 12, marginBottom: 12 }}>{error}</div>}

            {/* ── Create Receipt (Cashier) ── */}
            {isCashier && (
                <div className={styles.card} style={{ marginTop: 24 }}>
                    <h2 className={styles.modalTitle}>Create Receipt</h2>
                    <form onSubmit={handleCreateReceipt}>
                        <div className={styles.field} style={{ marginBottom: 16 }}>
                            <label className={styles.label}>Customer Card (optional)</label>
                            <select className={styles.select} value={cardNumber} onChange={(e) => setCardNumber(e.target.value)}>
                                <option value="">No card</option>
                                {customerCards.map((card) => (
                                    <option key={card.card_number} value={card.card_number}>
                                        {card.card_number} — {card.surname} {card.name} ({card.percent}%)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <label className={styles.label}>Items</label>
                        {items.map((item, index) => (
                            <div key={index} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                                <select
                                    className={styles.select}
                                    style={{ flex: 2 }}
                                    value={item.upc}
                                    onChange={(e) => handleItemChange(index, "upc", e.target.value)}
                                >
                                    <option value="">Select UPC</option>
                                    {storeProducts.map((sp) => (
                                        <option key={sp.upc} value={sp.upc}>
                                            {sp.upc} — {sp.selling_price} ₴ (qty: {sp.products_number}) {sp.promotional_product ? "🏷 Promo" : ""}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    className={styles.input}
                                    type="number"
                                    min="1"
                                    placeholder="Qty"
                                    style={{ width: 80 }}
                                    value={item.product_number}
                                    onChange={(e) => handleItemChange(index, "product_number", e.target.value)}
                                />
                                <button
                                    type="button"
                                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                    onClick={() => items.length > 1 && setItems(items.filter((_, i) => i !== index))}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setItems([...items, { upc: "", product_number: 1 }])}>
                                + Add Item
                            </button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                                Create Receipt
                            </button>
                        </div>
                    </form>

                    {createdReceipt && (
                        <div style={{ marginTop: 20, padding: 16, background: "var(--success-dim)", borderRadius: "var(--radius-md)", border: "1px solid var(--success)" }}>
                            <p style={{ color: "var(--success)", fontWeight: 600, marginBottom: 8 }}>✓ Receipt created successfully</p>
                            <p>Number: <strong>{createdReceipt.receipt_number}</strong></p>
                            <p>Total: <strong>{Number(createdReceipt.sum_total).toFixed(2)} ₴</strong></p>
                            <p>VAT: {Number(createdReceipt.vat).toFixed(2)} ₴</p>
                            <p>Date: {formatBackendDateTime(createdReceipt.print_date)}</p>                        </div>
                    )}
                </div>
            )}

            {/* ── My Receipts (Cashier) ── */}
            {isCashier && (
                <div className={styles.card} style={{ marginTop: 24 }}>
                    <h2 className={styles.modalTitle}>My Receipts</h2>
                    <form onSubmit={handleGetMyReceipts} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <div className={styles.field}>
                            <label className={styles.label}>From</label>
                            <input className={styles.input} value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>To</label>
                            <input className={styles.input} value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ alignSelf: "flex-end" }}>
                            Load
                        </button>
                    </form>
                    {myReceipts.length > 0 && <ReceiptTable receipts={myReceipts} />}
                    {myReceipts.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No receipts found</p>}
                </div>
            )}

            {/* ── Receipts by Cashier (Manager) ── */}
            {isManager && (
                <div className={styles.card} style={{ marginTop: 24 }}>
                    <h2 className={styles.modalTitle}>Receipts by Cashier</h2>
                    <form onSubmit={handleGetReceiptsByCashier} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <div className={styles.field}>
                            <label className={styles.label}>Cashier</label>
                            <select className={styles.select} value={managerCashierId} onChange={(e) => setManagerCashierId(e.target.value)}>
                                <option value="">Select cashier</option>
                                {cashiers.map((c) => (
                                    <option key={c.id} value={c.id}>{c.id} — {c.surname} {c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>From</label>
                            <input className={styles.input} value={managerFrom} onChange={(e) => setManagerFrom(e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>To</label>
                            <input className={styles.input} value={managerTo} onChange={(e) => setManagerTo(e.target.value)} />
                        </div>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ alignSelf: "flex-end" }}>
                            Load
                        </button>
                    </form>
                    {managerReceipts.length > 0 && <ReceiptTable receipts={managerReceipts} />}
                    {managerReceipts.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No receipts found</p>}
                </div>
            )}

            {/* ── All Receipts (Manager) ── */}
            {isManager && (
                <div className={styles.card} style={{ marginTop: 24 }}>
                    <h2 className={styles.modalTitle}>All Receipts for Period</h2>
                    <form onSubmit={handleGetAllReceipts} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <div className={styles.field}>
                            <label className={styles.label}>From</label>
                            <input className={styles.input} value={allFrom} onChange={(e) => setAllFrom(e.target.value)} />
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>To</label>
                            <input className={styles.input} value={allTo} onChange={(e) => setAllTo(e.target.value)} />
                        </div>
                        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ alignSelf: "flex-end" }}>
                            Load
                        </button>
                    </form>
                    {allReceipts.length > 0 && <ReceiptTable receipts={allReceipts} />}
                    {allReceipts.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No receipts found</p>}
                </div>
            )}

            {/* ── Receipt Details ── */}
            <div className={styles.card} style={{ marginTop: 24 }}>
                <h2 className={styles.modalTitle}>Receipt Details</h2>
                <form onSubmit={handleGetReceiptByNumber} style={{ display: "flex", gap: 10 }}>
                    <input
                        className={styles.input}
                        placeholder="Receipt number..."
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Search</button>
                </form>

                {receiptDetails && (
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
                            {[
                                { label: "Receipt #", value: receiptDetails.receipt_number },
                                { label: "Cashier", value: receiptDetails.cashier_id },
                                { label: "Card", value: receiptDetails.card_number ?? "—" },
                                { label: "Date", value: formatBackendDateTime(receiptDetails.print_date) },
                                { label: "Total", value: `${Number(receiptDetails.sum_total).toFixed(2)} ₴` },
                                { label: "VAT", value: `${Number(receiptDetails.vat).toFixed(2)} ₴` },
                            ].map(({ label, value }) => (
                                <div key={label} style={{ background: "var(--bg-secondary)", padding: "10px 14px", borderRadius: "var(--radius-md)" }}>
                                    <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
                                    <p style={{ fontWeight: 600 }}>{value}</p>
                                </div>
                            ))}
                        </div>

                        <div className={styles.tableWrap}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>UPC</th>
                                        <th>Quantity</th>
                                        <th>Price</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {receiptDetails.items.map((item) => (
                                        <tr key={item.id}>
                                            <td><code style={{ fontSize: 13 }}>{item.upc}</code></td>
                                            <td>{item.product_number}</td>
                                            <td>{Number(item.selling_price).toFixed(2)} ₴</td>
                                            <td><strong>{(item.product_number * item.selling_price).toFixed(2)} ₴</strong></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};