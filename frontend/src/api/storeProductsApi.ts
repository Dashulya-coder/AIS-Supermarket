import { api } from "./client";

export const getStoreProducts = async (promotional?: string) => {
    const url = promotional
        ? `/store-products?promotional=${promotional}`
        : "/store-products";

    const res = await api.get(url);
    return res.data;
};

export const createStoreProduct = async (
    upc: string,
    upc_prom: string | null,
    product_id: number,
    selling_price: number,
    products_number: number,
    promotional_product: boolean
) => {
    const res = await api.post("/store-products", {
        upc,
        upc_prom,
        product_id,
        selling_price,
        products_number,
        promotional_product,
    });
    return res.data;
};

export const deleteStoreProduct = async (upc: string) => {
    const res = await api.delete(`/store-products/${upc}`);
    return res.data;
};