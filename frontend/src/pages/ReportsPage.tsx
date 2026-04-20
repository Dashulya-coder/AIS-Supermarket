import { useEffect, useState } from "react";
import {
    getCashierSalesGrouped,
    getCustomersAllPromotional,
    getProductQuantity,
    getSalesByCashier,
    getSalesTotal,
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

type CashierSalesGroupedRow = {
    cashier_id: string;
    surname: string;
    name: string;
    receipts_count: number;
    total_sales: number;
};

type CustomersAllPromotionalRow = {
    card_number: string;
    surname: string;
    name: string;
    percent: number;
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

    const [groupedFrom, setGroupedFrom] = useState("2026-04-01 00:00:00");
    const [groupedTo, setGroupedTo] = useState("2026-04-30 23:59:59");
    const [cashierSalesGrouped, setCashierSalesGrouped] = useState<
        CashierSalesGroupedRow[]
    >([]);

    const [customersAllPromotional, setCustomersAllPromotional] = useState<
        CustomersAllPromotionalRow[]
    >([]);

    const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [error, setError] = useState("");
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

    const handleCashierSalesGrouped = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setError("");
            const data = await getCashierSalesGrouped(
                groupedFrom.trim(),
                groupedTo.trim()
            );
            setCashierSalesGrouped(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load grouped report");
        }
    };

    const handleCustomersAllPromotional = async () => {
        try {
            setError("");
            const data = await getCustomersAllPromotional();
            setCustomersAllPromotional(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(
                err?.response?.data?.error || "Failed to load double negation report"
            );
        }
    };

    const cashiers = employees.filter(
        (e) => e.role === "Cashier" || e.position === "Cashier"
    );

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
            <h1 className={styles.pageTitle}>Reports</h1>

            {error && (
                <div className={styles.errorMsg} style={{ marginTop: 12, marginBottom: 12 }}>
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
                <h2 className={styles.modalTitle}>Sales by Cashiers for Selected Period</h2>
                <form
                    onSubmit={handleCashierSalesGrouped}
                    style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
                >
                    <div className={styles.field}>
                        <label className={styles.label}>From</label>
                        <input
                            className={styles.input}
                            value={groupedFrom}
                            onChange={(e) => setGroupedFrom(e.target.value)}
                        />
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>To</label>
                        <input
                            className={styles.input}
                            value={groupedTo}
                            onChange={(e) => setGroupedTo(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        style={{ alignSelf: "flex-end" }}
                    >
                        Run Grouped Query
                    </button>
                </form>

                {cashierSalesGrouped.length === 0 ? (
                    <p style={{ marginTop: 16 }}>No data found</p>
                ) : (
                    <div style={{ overflowX: "auto", marginTop: 16 }}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Cashier ID</th>
                                <th>Surname</th>
                                <th>Name</th>
                                <th>Receipts Count</th>
                                <th>Total Sales</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cashierSalesGrouped.slice(0, 5).map((row) => (
                                <tr key={row.cashier_id}>
                                    <td>{row.cashier_id}</td>
                                    <td>{row.surname}</td>
                                    <td>{row.name}</td>
                                    <td>{row.receipts_count}</td>
                                    <td>{Number(row.total_sales).toFixed(2)} ₴</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className={styles.card} style={{ marginTop: 24 }}>
                <h2 className={styles.modalTitle}>
                    Customers Who Bought All Promotional Products
                </h2>

                <button
                    type="button"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={handleCustomersAllPromotional}
                >
                    Run Double Negation Query
                </button>

                {customersAllPromotional.length === 0 ? (
                    <p style={{ marginTop: 16 }}>No data found</p>
                ) : (
                    <div style={{ overflowX: "auto", marginTop: 16 }}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Card Number</th>
                                <th>Surname</th>
                                <th>Name</th>
                                <th>Percent</th>
                            </tr>
                            </thead>
                            <tbody>
                            {customersAllPromotional.slice(0, 5).map((row) => (
                                <tr key={row.card_number}>
                                    <td>{row.card_number}</td>
                                    <td>{row.surname}</td>
                                    <td>{row.name}</td>
                                    <td>{row.percent}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};