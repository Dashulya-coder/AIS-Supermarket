import { api } from "./client";

export const createReceipt = async (
    card_number: string | null,
    items: { upc: string; product_number: number }[]
) => {
    const res = await api.post("/receipts", {
        card_number,
        items,
    });
    return res.data;
};

export const getMyReceipts = async (from: string, to: string) => {
    const res = await api.get(`/receipts/my?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    return res.data;
};

export const getReceiptByNumber = async (receiptNumber: string) => {
    const res = await api.get(`/receipts/${receiptNumber}`);
    return res.data;
};