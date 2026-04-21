import { useEffect, useState } from "react";
import {
    getProductQuantity,
    getSalesByCashier,
    getSalesTotal,
    getSalesSummary,
    getClientsWithOnlyPromoProducts  
} from "../api/reportsApi";
import { useAuth } from "../context/AuthContext";
import { getStoreProducts } from "../api/storeProductsApi";
import { getEmployees } from "../api/employeesApi";
import styles from "../components/common.module.css";

type SalesByCashierResult = {
    cashier_id: string;
    from: string;
    to: string;
    total_sales: number;
};

type SalesTotalResult = {
    from: string;
    to: string;
    total_sales: number;
};

type ProductQuantityResult = {
    upc: string;
    from: string;
    to: string;
    total_quantity: number;
};

type StoreProduct = {
    upc: string;
    upc_prom: string | null;
    product_id: number;
    selling_price: number;
    products_number: number;
    promotional_product: boolean;
};

type Employee = {
    id: string;
    surname: string;
    name: string;
    role?: string;
    position?: string;
};

const ResultCard = ({
                        items,
                    }: {
    items: { label: string; value: string | number }[];
}) => (
    <div
        style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 16,
        }}
    >
        {items.map(({ label, value }) => (
            <div
                key={label}
                style={{
                    background: "var(--bg-secondary)",
                    padding: "10px 14px",
                    borderRadius: "var(--radius-md)",
                }}
            >
                <p
                    style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        marginBottom: 4,
                    }}
                >
                    {label}
                </p>
                <p style={{ fontWeight: 600, fontSize: 16 }}>{value}</p>
            </div>
        ))}
    </div>
);

export const ReportsPage = () => {
    const { user } = useAuth();
    const isManager = user?.role === "Manager";

    const [cashierId, setCashierId] = useState("");
    const [cashierFrom, setCashierFrom] = useState("2026-04-01 00:00:00");
    const [cashierTo, setCashierTo] = useState("2026-04-30 23:59:59");
    const [salesByCashierResult, setSalesByCashierResult] =
        useState<SalesByCashierResult | null>(null);

    const [totalFrom, setTotalFrom] = useState("2026-04-01 00:00:00");
    const [totalTo, setTotalTo] = useState("2026-04-30 23:59:59");
    const [salesTotalResult, setSalesTotalResult] =
        useState<SalesTotalResult | null>(null);

    const [upc, setUpc] = useState("");
    const [productFrom, setProductFrom] = useState("2026-04-01 00:00:00");
    const [productTo, setProductTo] = useState("2026-04-30 23:59:59");
    const [productQuantityResult, setProductQuantityResult] =
        useState<ProductQuantityResult | null>(null);

    const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [error, setError] = useState("");

    const [summaryFrom, setSummaryFrom] = useState("2026-04-01 00:00:00");
    const [summaryTo, setSummaryTo] = useState("2026-04-30 23:59:59");
    const [summaryResult, setSummaryResult] = useState<any[]>([]);

    const [promoClientsResult, setPromoClientsResult] = useState<any[]>([]);

    useEffect(() => {
        const loadOptions = async () => {
            try {
                setError("");

                const sp = await getStoreProducts();
                setStoreProducts(Array.isArray(sp) ? sp : []);

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

    const handleSalesByCashier = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cashierId.trim()) {
            setError("Please select a cashier");
            return;
        }

        try {
            setError("");
            const data = await getSalesByCashier(
                cashierId.trim(),
                cashierFrom.trim(),
                cashierTo.trim()
            );
            setSalesByCashierResult(data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load report");
        }
    };

    const handleSalesTotal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            const data = await getSalesTotal(totalFrom.trim(), totalTo.trim());
            setSalesTotalResult(data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load report");
        }
    };

    const handleProductQuantity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!upc.trim()) {
            setError("Please select a UPC");
            return;
        }

        try {
            setError("");
            const data = await getProductQuantity(
                upc.trim(),
                productFrom.trim(),
                productTo.trim()
            );
            setProductQuantityResult(data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load report");
        }
    };

    const handleSalesSummary = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setError("");
            const data = await getSalesSummary(summaryFrom.trim(), summaryTo.trim());
            setSummaryResult(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load report");
        }
    };

    const handlePromoClients = async () => {
        try {
            setError("");
            const data = await getClientsWithOnlyPromoProducts();
            setPromoClientsResult(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load report");
        }
    };

    const cashiers = employees.filter(
        (e) => e.role === "Cashier" || e.position === "Cashier"
    );

    const handlePrint = () => {
        window.print();
    };

    if (!isManager) {
        return (
            <div className={styles.page}>
                <div className={styles.empty}>
                    <p>Access denied</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 className={styles.pageTitle}>Reports</h1>
                <button
                    className={`${styles.btn} ${styles.btnSecondary} no-print`}
                    onClick={handlePrint}
                >
                    🖨 Print all reports
                </button>
            </div>
            {error && (
                <div
                    className={styles.errorMsg}
                    style={{ marginTop: 12, marginBottom: 12 }}
                >
                    {error}
                </div>
            )}

            <div className={styles.card} style={{ marginTop: 24 }}>
                <h2 className={styles.modalTitle}>Sales by Cashier</h2>
                <form
                    onSubmit={handleSalesByCashier}
                    style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                >
                    <div className={styles.field}>
                        <label className={styles.label}>Cashier</label>
                        <select
                            className={styles.select}
                            value={cashierId}
                            onChange={(e) => setCashierId(e.target.value)}
                        >
                            <option value="">Select cashier</option>
                            {cashiers.map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.id} — {e.surname} {e.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>From</label>
                        <input
                            className={styles.input}
                            value={cashierFrom}
                            onChange={(e) => setCashierFrom(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>To</label>
                        <input
                            className={styles.input}
                            value={cashierTo}
                            onChange={(e) => setCashierTo(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        style={{ alignSelf: "flex-end" }}
                    >
                        Get Report
                    </button>
                </form>

                {salesByCashierResult && (
                    <ResultCard
                        items={[
                            { label: "Cashier ID", value: salesByCashierResult.cashier_id },
                            { label: "From", value: salesByCashierResult.from },
                            { label: "To", value: salesByCashierResult.to },
                            {
                                label: "Total Sales",
                                value: `${Number(salesByCashierResult.total_sales).toFixed(2)} ₴`,
                            },
                        ]}
                    />
                )}
            </div>

            <div className={styles.card} style={{ marginTop: 24 }}>
                <h2 className={styles.modalTitle}>Total Sales for Period</h2>
                <form
                    onSubmit={handleSalesTotal}
                    style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                >
                    <div className={styles.field}>
                        <label className={styles.label}>From</label>
                        <input
                            className={styles.input}
                            value={totalFrom}
                            onChange={(e) => setTotalFrom(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>To</label>
                        <input
                            className={styles.input}
                            value={totalTo}
                            onChange={(e) => setTotalTo(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        style={{ alignSelf: "flex-end" }}
                    >
                        Get Report
                    </button>
                </form>

                {salesTotalResult && (
                    <ResultCard
                        items={[
                            { label: "From", value: salesTotalResult.from },
                            { label: "To", value: salesTotalResult.to },
                            {
                                label: "Total Sales",
                                value: `${Number(salesTotalResult.total_sales).toFixed(2)} ₴`,
                            },
                        ]}
                    />
                )}
            </div>

            <div className={styles.card} style={{ marginTop: 24 }}>
                <h2 className={styles.modalTitle}>Product Quantity Sold</h2>
                <form
                    onSubmit={handleProductQuantity}
                    style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                >
                    <div className={styles.field}>
                        <label className={styles.label}>Product (UPC)</label>
                        <select
                            className={styles.select}
                            value={upc}
                            onChange={(e) => setUpc(e.target.value)}
                        >
                            <option value="">Select UPC</option>
                            {storeProducts.map((sp) => (
                                <option key={sp.upc} value={sp.upc}>
                                    {sp.upc} — {sp.selling_price} ₴{" "}
                                    {sp.promotional_product ? "🏷 Promo" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>From</label>
                        <input
                            className={styles.input}
                            value={productFrom}
                            onChange={(e) => setProductFrom(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>To</label>
                        <input
                            className={styles.input}
                            value={productTo}
                            onChange={(e) => setProductTo(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        style={{ alignSelf: "flex-end" }}
                    >
                        Get Report
                    </button>
                </form>

                {productQuantityResult && (
                    <ResultCard
                        items={[
                            { label: "UPC", value: productQuantityResult.upc },
                            { label: "From", value: productQuantityResult.from },
                            { label: "To", value: productQuantityResult.to },
                            {
                                label: "Total Quantity",
                                value: productQuantityResult.total_quantity,
                            },
                        ]}
                    />
                )}
            </div>
            <div className={styles.card} style={{ marginTop: 24 }}>
                <h2 className={styles.modalTitle}>Sales Summary by All Cashiers</h2>
                <form onSubmit={handleSalesSummary} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div className={styles.field}>
                        <label className={styles.label}>From</label>
                        <input className={styles.input} value={summaryFrom} onChange={(e) => setSummaryFrom(e.target.value)} />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>To</label>
                        <input className={styles.input} value={summaryTo} onChange={(e) => setSummaryTo(e.target.value)} />
                    </div>
                    <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} style={{ alignSelf: "flex-end" }}>
                        Get Report
                    </button>
                </form>

                {summaryResult.length > 0 && (
                    <div className={styles.tableWrap} style={{ marginTop: 16 }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Surname</th>
                                    <th>Name</th>
                                    <th>Total Receipts</th>
                                    <th>Total Sales</th>
                                    <th>Total VAT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryResult.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.id}</td>
                                        <td>{row.surname}</td>
                                        <td>{row.name}</td>
                                        <td>{row.total_receipts}</td>
                                        <td>{Number(row.total_sales).toFixed(2)} ₴</td>
                                        <td>{Number(row.total_vat).toFixed(2)} ₴</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {summaryResult.length === 0 && <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No data found</p>}
            </div>
            <div className={styles.card} style={{ marginTop: 24 }}>
                <h2 className={styles.modalTitle}>Clients Who Bought Only Promotional Products</h2>
                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handlePromoClients}
                >
                    Get Report
                </button>

                {promoClientsResult.length > 0 && (
                    <div className={styles.tableWrap} style={{ marginTop: 16 }}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Card Number</th>
                                    <th>Surname</th>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Discount %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promoClientsResult.map((row) => (
                                    <tr key={row.card_number}>
                                        <td>{row.card_number}</td>
                                        <td>{row.surname}</td>
                                        <td>{row.name}</td>
                                        <td>{row.phone}</td>
                                        <td>{row.percent}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {promoClientsResult.length === 0 && (
                    <p style={{ color: "var(--text-muted)", marginTop: 12 }}>No data found</p>
                )}
            </div>
        </div>
    );
};