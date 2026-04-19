import { api } from "./client";

export const getProducts = async () => {
    const res = await api.get("/products");
    return res.data;
};

export const createProduct = async (
    name: string,
    category_id: number,
    producer: string,
    characteristics: string
) => {
    const res = await api.post("/products", {
        name,
        category_id,
        producer,
        characteristics,
    });
    return res.data;
};

export const deleteProduct = async (id: number) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
};