import { api } from "./client";

export const getCustomerCards = async (surname?: string, percent?: string) => {
    const params = new URLSearchParams();
    if (surname) params.append("surname", surname);
    if (percent) params.append("percent", percent);
    const query = params.toString();
    const res = await api.get(`/customer-cards${query ? `?${query}` : ""}`);
    return res.data;
};

export const createCustomerCard = async (
    card_number: string, surname: string, name: string,
    patronymic: string | null, phone: string, city: string | null,
    street: string | null, zip_code: string | null, percent: number
) => {
    const res = await api.post("/customer-cards", {
        card_number, surname, name, patronymic, phone, city, street, zip_code, percent,
    });
    return res.data;
};

export const updateCustomerCard = async (
    card_number: string, surname: string, name: string,
    patronymic: string | null, phone: string, city: string | null,
    street: string | null, zip_code: string | null, percent: number
) => {
    const res = await api.put(`/customer-cards/${card_number}`, {
        surname, name, patronymic, phone, city, street, zip_code, percent,
    });
    return res.data;
};

export const deleteCustomerCard = async (cardNumber: string) => {
    const res = await api.delete(`/customer-cards/${cardNumber}`);
    return res.data;
};