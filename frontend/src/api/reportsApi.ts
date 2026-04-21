import { api } from "./client";

export const getSalesByCashier = async (
    cashierId: string,
    from: string,
    to: string
) => {
    const res = await api.get(
        `/reports/sales-by-cashier?cashier_id=${encodeURIComponent(
            cashierId
        )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    return res.data;
};

export const getSalesTotal = async (from: string, to: string) => {
    const res = await api.get(
        `/reports/sales-total?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    return res.data;
};

export const getProductQuantity = async (
    upc: string,
    from: string,
    to: string
) => {
    const res = await api.get(
        `/reports/product-quantity?upc=${encodeURIComponent(
            upc
        )}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    return res.data;
};

export const getCashierSalesGrouped = async (from: string, to: string) => {
    const res = await api.get(
        `/reports/cashier-sales-grouped?from=${encodeURIComponent(
            from
        )}&to=${encodeURIComponent(to)}`
    );
    return res.data;
};

export const getCustomersAllPromotional = async () => {
    const res = await api.get("/reports/customers-all-promotional");
    return res.data;
};

export const getSalesSummary = async (from: string, to: string) => {
    const res = await api.get(`/reports/sales-summary?from=${from}&to=${to}`);
    return res.data;
};

export const getClientsWithOnlyPromoProducts = async () => {
    const res = await api.get("/reports/promo-clients");
    return res.data;
};