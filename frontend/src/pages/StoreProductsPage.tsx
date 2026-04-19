import { useEffect, useState } from "react";
import {
    createStoreProduct,
    deleteStoreProduct,
    getStoreProducts,
} from "../api/storeProductsApi";
import { getProducts } from "../api/productsApi";
import { useAuth } from "../context/AuthContext";

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

    const [upc, setUpc] = useState("");
    const [upcProm, setUpcProm] = useState("");
    const [productId, setProductId] = useState<number | "">("");
    const [sellingPrice, setSellingPrice] = useState<number | "">("");
    const [productsNumber, setProductsNumber] = useState<number | "">("");
    const [promotional, setPromotional] = useState(false);

    const [filterPromotional, setFilterPromotional] = useState("all");
    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            setError("");

            const promotionalParam =
                filterPromotional === "all" ? undefined : filterPromotional;

            const [storeProductsData, productsData] = await Promise.all([
                getStoreProducts(promotionalParam),
                getProducts(),
            ]);

            setStoreProducts(storeProductsData);
            setProducts(productsData);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load store products");
        }
    };

    useEffect(() => {
        loadData();
    }, [filterPromotional]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !upc.trim() ||
            !productId ||
            sellingPrice === "" ||
            productsNumber === ""
        ) {
            setError("All required fields must be filled");
            return;
        }

        if (promotional && !upcProm.trim()) {
            setError("Promotional product must have upc_prom");
            return;
        }

        try {
            setError("");
            await createStoreProduct(
                upc.trim(),
                promotional ? upcProm.trim() : null,
                Number(productId),
                Number(sellingPrice),
                Number(productsNumber),
                promotional
            );

            setUpc("");
            setUpcProm("");
            setProductId("");
            setSellingPrice("");
            setProductsNumber("");
            setPromotional(false);

            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create store product");
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

    return (
        <div>
            <h1>Store Products</h1>

            <div style={{ marginBottom: 16 }}>
                <label>Filter: </label>
                <select
                    value={filterPromotional}
                    onChange={(e) => setFilterPromotional(e.target.value)}
                >
                    <option value="all">All</option>
                    <option value="true">Promotional only</option>
                    <option value="false">Non-promotional only</option>
                </select>
            </div>

            {isManager && (
                <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
                    <div style={{ display: "grid", gap: 8, maxWidth: 700 }}>
                        <input
                            placeholder="UPC"
                            value={upc}
                            onChange={(e) => setUpc(e.target.value)}
                        />

                        <label>
                            <input
                                type="checkbox"
                                checked={promotional}
                                onChange={(e) => setPromotional(e.target.checked)}
                            />
                            Promotional product
                        </label>

                        {promotional && (
                            <input
                                placeholder="UPC_PROM"
                                value={upcProm}
                                onChange={(e) => setUpcProm(e.target.value)}
                            />
                        )}

                        <select
                            value={productId}
                            onChange={(e) => setProductId(Number(e.target.value))}
                        >
                            <option value="">Select product</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>

                        <input
                            type="number"
                            placeholder="Selling price"
                            value={sellingPrice}
                            onChange={(e) => setSellingPrice(Number(e.target.value))}
                        />

                        <input
                            type="number"
                            placeholder="Products number"
                            value={productsNumber}
                            onChange={(e) => setProductsNumber(Number(e.target.value))}
                        />

                        <button type="submit">Create</button>
                    </div>
                </form>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            <table>
                <thead>
                <tr>
                    <th>UPC</th>
                    <th>UPC_PROM</th>
                    <th>Product ID</th>
                    <th>Selling Price</th>
                    <th>Products Number</th>
                    <th>Promotional</th>
                    {isManager && <th>Actions</th>}
                </tr>
                </thead>
                <tbody>
                {storeProducts.map((sp) => (
                    <tr key={sp.upc}>
                        <td>{sp.upc}</td>
                        <td>{sp.upc_prom ?? "-"}</td>
                        <td>{sp.product_id}</td>
                        <td>{sp.selling_price}</td>
                        <td>{sp.products_number}</td>
                        <td>{sp.promotional_product ? "Yes" : "No"}</td>
                        {isManager && (
                            <td>
                                <button onClick={() => handleDelete(sp.upc)}>Delete</button>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};