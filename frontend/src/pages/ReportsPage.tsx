import { useState } from "react";
import {
    getProductQuantity,
    getSalesByCashier,
    getSalesTotal,
} from "../api/reportsApi";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { getStoreProducts } from "../api/storeProductsApi";
import { getEmployees } from "../api/employeesApi";

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

    const [storeProducts, setStoreProducts] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [error, setError] = useState("");


    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [sp, emp] = await Promise.all([
                    getStoreProducts(),
                    getEmployees(),
                ]);

                setStoreProducts(Array.isArray(sp) ? sp : []);
                setEmployees(Array.isArray(emp) ? emp : []);
            } catch (err: any) {
                setError(err?.response?.data?.error || "Failed to load dropdown data");
            }
        };

        loadOptions();
    }, []);

    const handleSalesByCashier = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cashierId.trim() || !cashierFrom.trim() || !cashierTo.trim()) {
            setError("Cashier ID, from, and to are required");
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
            setError(err?.response?.data?.error || "Failed to load cashier sales report");
        }
    };

    const handleSalesTotal = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!totalFrom.trim() || !totalTo.trim()) {
            setError("From and to are required");
            return;
        }

        try {
            setError("");
            const data = await getSalesTotal(totalFrom.trim(), totalTo.trim());
            setSalesTotalResult(data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load total sales report");
        }
    };

    const handleProductQuantity = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!upc.trim() || !productFrom.trim() || !productTo.trim()) {
            setError("UPC, from, and to are required");
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
            setError(err?.response?.data?.error || "Failed to load product quantity report");
        }
    };

    if (!isManager) {
        return <p>Access denied</p>;
    }

    return (
        <div>
            <h1>Reports</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <section style={{ marginBottom: 32 }}>
                <h2>Sales by Cashier</h2>

                <form onSubmit={handleSalesByCashier} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
                    <select
                        value={cashierId}
                        onChange={(e) => setCashierId(e.target.value)}
                    >
                        <option value="">Select cashier</option>
                        {employees
                            .filter((e) => e.role === "Cashier")
                            .map((e) => (
                                <option key={e.id} value={e.id}>
                                    {e.id} — {e.surname} {e.name}
                                </option>
                            ))}
                    </select>
                    <input
                        placeholder="From"
                        value={cashierFrom}
                        onChange={(e) => setCashierFrom(e.target.value)}
                    />
                    <input
                        placeholder="To"
                        value={cashierTo}
                        onChange={(e) => setCashierTo(e.target.value)}
                    />
                    <button type="submit">Get Report</button>
                </form>

                {salesByCashierResult && (
                    <div style={{ marginTop: 16 }}>
                        <p>Cashier ID: {salesByCashierResult.cashier_id}</p>
                        <p>From: {salesByCashierResult.from}</p>
                        <p>To: {salesByCashierResult.to}</p>
                        <p>Total Sales: {salesByCashierResult.total_sales}</p>
                    </div>
                )}
            </section>

            <section style={{ marginBottom: 32 }}>
                <h2>Total Sales for Period</h2>

                <form onSubmit={handleSalesTotal} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
                    <input
                        placeholder="From"
                        value={totalFrom}
                        onChange={(e) => setTotalFrom(e.target.value)}
                    />
                    <input
                        placeholder="To"
                        value={totalTo}
                        onChange={(e) => setTotalTo(e.target.value)}
                    />
                    <button type="submit">Get Report</button>
                </form>

                {salesTotalResult && (
                    <div style={{ marginTop: 16 }}>
                        <p>From: {salesTotalResult.from}</p>
                        <p>To: {salesTotalResult.to}</p>
                        <p>Total Sales: {salesTotalResult.total_sales}</p>
                    </div>
                )}
            </section>

            <section>
                <h2>Product Quantity Sold</h2>

                <form onSubmit={handleProductQuantity} style={{ display: "grid", gap: 8, maxWidth: 500 }}>
                    <select
                        value={upc}
                        onChange={(e) => setUpc(e.target.value)}
                    >
                        <option value="">Select UPC</option>
                        {storeProducts.map((sp) => (
                            <option key={sp.upc} value={sp.upc}>
                                {sp.upc} — price: {sp.selling_price} — qty: {sp.products_number}
                            </option>
                        ))}
                    </select>
                    <input
                        placeholder="From"
                        value={productFrom}
                        onChange={(e) => setProductFrom(e.target.value)}
                    />
                    <input
                        placeholder="To"
                        value={productTo}
                        onChange={(e) => setProductTo(e.target.value)}
                    />
                    <button type="submit">Get Report</button>
                </form>

                {productQuantityResult && (
                    <div style={{ marginTop: 16 }}>
                        <p>UPC: {productQuantityResult.upc}</p>
                        <p>From: {productQuantityResult.from}</p>
                        <p>To: {productQuantityResult.to}</p>
                        <p>Total Quantity: {productQuantityResult.total_quantity}</p>
                    </div>
                )}
            </section>
        </div>
    );
};