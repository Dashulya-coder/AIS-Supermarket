import { useState } from "react";
import { createReceipt, getMyReceipts, getReceiptByNumber } from "../api/receiptsApi";
import { getStoreProducts } from "../api/storeProductsApi";
import { getCustomerCards } from "../api/customerCardsApi";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

type ReceiptItemInput = {
    upc: string;
    product_number: number;
};

type Receipt = {
    receipt_number: string;
    cashier_id: string;
    card_number: string | null;
    print_date: string;
    sum_total: number;
    vat: number;
};

type ReceiptFull = {
    receipt_number: string;
    cashier_id: string;
    card_number: string | null;
    print_date: string;
    sum_total: number;
    vat: number;
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

export const ReceiptsPage = () => {
    const [cardNumber, setCardNumber] = useState("");
    const [items, setItems] = useState<ReceiptItemInput[]>([
        { upc: "", product_number: 1 },
    ]);
    const { user } = useAuth();
    const isCashier = user?.role === "Cashier";

    const [from, setFrom] = useState("2026-04-01 00:00:00");
    const [to, setTo] = useState("2026-04-30 23:59:59");

    const [receiptNumber, setReceiptNumber] = useState("");

    const [createdReceipt, setCreatedReceipt] = useState<Receipt | null>(null);
    const [myReceipts, setMyReceipts] = useState<Receipt[]>([]);
    const [receiptDetails, setReceiptDetails] = useState<ReceiptFull | null>(null);
    const [error, setError] = useState("");

    const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
    const [customerCards, setCustomerCards] = useState<CustomerCard[]>([]);

    const handleItemChange = (index: number, field: keyof ReceiptItemInput, value: string | number) => {
        const updated = [...items];
        updated[index] = {
            ...updated[index],
            [field]: field === "product_number" ? Number(value) : value,
        };
        setItems(updated);
    };

    const addItemRow = () => {
        setItems([...items, { upc: "", product_number: 1 }]);
    };

    const removeItemRow = (index: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    useEffect(() => {
        const loadOptions = async () => {
            try {
                const [storeProductsData, customerCardsData] = await Promise.all([
                    getStoreProducts(),
                    getCustomerCards(),
                ]);

                setStoreProducts(Array.isArray(storeProductsData) ? storeProductsData : []);
                setCustomerCards(Array.isArray(customerCardsData) ? customerCardsData : []);
            } catch (err: any) {
                setError(err?.response?.data?.error || "Failed to load form options");
            }
        };

        loadOptions();
    }, []);

    const handleCreateReceipt = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            setError("Receipt must contain at least one item");
            return;
        }

        for (const item of items) {
            if (!item.upc.trim() || item.product_number <= 0) {
                setError("Each item must have valid upc and product number");
                return;
            }
        }
        const upcs = items.map((item) => item.upc.trim());
        const uniqueUpcs = new Set(upcs);

        if (uniqueUpcs.size !== upcs.length) {
            setError("The same UPC cannot be added twice");
            return;
        }

        try {
            setError("");
            const data = await createReceipt(
                cardNumber.trim() ? cardNumber.trim() : null,
                items
            );
            setCreatedReceipt(data);
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

        if (!receiptNumber.trim()) {
            setError("Receipt number is required");
            return;
        }

        try {
            setError("");
            const data = await getReceiptByNumber(receiptNumber.trim());
            setReceiptDetails(data);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load receipt details");
        }
    };

    return (
        <div>
            <h1>Receipts</h1>

            {error && <p style={{ color: "red" }}>{error}</p>}

            {isCashier && (
                <section style={{ marginBottom: 32 }}>
                    <h2>Create Receipt</h2>

                <form onSubmit={handleCreateReceipt}>
                    <div style={{ display: "grid", gap: 8, maxWidth: 700 }}>
                        <select
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                        >
                            <option value="">No card</option>
                            {customerCards.map((card) => (
                                <option key={card.card_number} value={card.card_number}>
                                    {card.card_number} - {card.surname} {card.name}
                                </option>
                            ))}
                        </select>

                        {items.map((item, index) => (
                            <div key={index} style={{ display: "flex", gap: 8 }}>
                                <select
                                    value={item.upc}
                                    onChange={(e) => handleItemChange(index, "upc", e.target.value)}
                                >
                                    <option value="">Select UPC</option>
                                    {storeProducts.map((sp) => (
                                        <option key={sp.upc} value={sp.upc}>
                                            {sp.upc} ({sp.promotional_product ? "Promo" : "Regular"}) - price: {sp.selling_price} - qty: {sp.products_number}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="number"
                                    placeholder="Product number"
                                    value={item.product_number}
                                    onChange={(e) => handleItemChange(index, "product_number", e.target.value)}
                                />
                                <button type="button" onClick={() => removeItemRow(index)}>
                                    Remove
                                </button>
                            </div>
                        ))}

                        <button type="button" onClick={addItemRow}>
                            Add Item
                        </button>

                        <button type="submit">Create Receipt</button>
                    </div>
                </form>

                {createdReceipt && (
                    <div style={{ marginTop: 16 }}>
                        <h3>Created Receipt</h3>
                        <p>Receipt Number: {createdReceipt.receipt_number}</p>
                        <p>Cashier ID: {createdReceipt.cashier_id}</p>
                        <p>Card Number: {createdReceipt.card_number ?? "-"}</p>
                        <p>Print Date: {createdReceipt.print_date}</p>
                        <p>Sum Total: {createdReceipt.sum_total}</p>
                        <p>VAT: {createdReceipt.vat}</p>
                    </div>
                )}
                </section>
            )}

            {isCashier && (
                <section style={{ marginBottom: 32 }}>
                    <h2>My Receipts</h2>

                <form onSubmit={handleGetMyReceipts} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                        placeholder="From"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                    />
                    <input
                        placeholder="To"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                    />
                    <button type="submit">Load My Receipts</button>
                </form>

                {myReceipts.length === 0 ? (
                    <p>No receipts found</p>
                ) : (
                    <table>
                        <thead>
                        <tr>
                            <th>Receipt Number</th>
                            <th>Cashier ID</th>
                            <th>Card Number</th>
                            <th>Print Date</th>
                            <th>Sum Total</th>
                            <th>VAT</th>
                        </tr>
                        </thead>
                        <tbody>
                        {myReceipts.map((receipt) => (
                            <tr key={receipt.receipt_number}>
                                <td>{receipt.receipt_number}</td>
                                <td>{receipt.cashier_id}</td>
                                <td>{receipt.card_number ?? "-"}</td>
                                <td>{receipt.print_date}</td>
                                <td>{receipt.sum_total}</td>
                                <td>{receipt.vat}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
                </section>
            )}

            <section>
                <h2>Receipt Details</h2>

                <form onSubmit={handleGetReceiptByNumber} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input
                        placeholder="Receipt number"
                        value={receiptNumber}
                        onChange={(e) => setReceiptNumber(e.target.value)}
                    />
                    <button type="submit">Get Receipt</button>
                </form>

                {receiptDetails && (
                    <div style={{ marginTop: 16 }}>
                        <p>Receipt Number: {receiptDetails.receipt_number}</p>
                        <p>Cashier ID: {receiptDetails.cashier_id}</p>
                        <p>Card Number: {receiptDetails.card_number ?? "-"}</p>
                        <p>Print Date: {receiptDetails.print_date}</p>
                        <p>Sum Total: {receiptDetails.sum_total}</p>
                        <p>VAT: {receiptDetails.vat}</p>

                        <h3>Items</h3>
                        <table>
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>UPC</th>
                                <th>Product Number</th>
                                <th>Selling Price</th>
                            </tr>
                            </thead>
                            <tbody>
                            {receiptDetails.items.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.upc}</td>
                                    <td>{item.product_number}</td>
                                    <td>{item.selling_price}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
};