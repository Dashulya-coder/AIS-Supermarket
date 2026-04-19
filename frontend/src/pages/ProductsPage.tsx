import { useEffect, useState } from "react";
import { getProducts, createProduct, deleteProduct } from "../api/productsApi";
import { getCategories } from "../api/categoriesApi";
import { useAuth } from "../context/AuthContext";

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

    const [producer, setProducer] = useState("");
    const [characteristics, setCharacteristics] = useState("");

    const [name, setName] = useState("");
    const [categoryId, setCategoryId] = useState<number | "">("");

    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                getProducts(),
                getCategories(),
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch {
            setError("Failed to load data");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !categoryId || !producer.trim() || !characteristics.trim()) {
            setError("All fields are required");
            return;
        }

        try {
            setError("");
            await createProduct(
                name.trim(),
                Number(categoryId),
                producer.trim(),
                characteristics.trim()
            );
            setName("");
            setCategoryId("");
            setProducer("");
            setCharacteristics("");
            await loadData();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create product");
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

    return (
        <div>
            <h1>Products</h1>

            {isManager && (
                <form onSubmit={handleCreate}>
                    <input
                        placeholder="Product name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        placeholder="Producer"
                        value={producer}
                        onChange={(e) => setProducer(e.target.value)}
                    />

                    <input
                        placeholder="Characteristics"
                        value={characteristics}
                        onChange={(e) => setCharacteristics(e.target.value)}
                    />

                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(Number(e.target.value))}
                    >
                        <option value="">Select category</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <button type="submit">Create</button>
                </form>
            )}

            {error && <p style={{ color: "red" }}>{error}</p>}

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category ID</th>
                    <th>Producer</th>
                    <th>Characteristics</th>
                    {isManager && <th>Actions</th>}
                </tr>
                </thead>
                <tbody>
                {products.map((p) => (
                    <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.category_id}</td>
                        <td>{p.producer}</td>
                        <td>{p.characteristics}</td>
                        {isManager && (
                            <td>
                                <button onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        )}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};