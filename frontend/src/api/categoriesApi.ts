import { api } from "./client";

export const getCategories = async () => {
    const res = await api.get("/categories");
    return res.data;
};

export const createCategory = async (name: string) => {
    const res = await api.post("/categories", { name });
    return res.data;
};

export const updateCategory = async (id: number, name: string) => {
    const res = await api.put(`/categories/${id}`, { name });
    return res.data;
};

export const deleteCategory = async (id: number) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
};