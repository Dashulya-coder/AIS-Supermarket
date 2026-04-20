import { api } from "./client";

export const getEmployees = async () => {
    const res = await api.get("/employees");
    return res.data;
};

export const getCashiers = async () => {
    const res = await api.get("/employees?cashiers=true");
    return res.data;
};

export const createEmployee = async (
    id: string, surname: string, name: string,
    patronymic: string | null, position: string, salary: number,
    date_of_birth: string, date_of_start: string, phone: string,
    city: string, street: string, zip_code: string
) => {
    const res = await api.post("/employees", {
        id, surname, name, patronymic, position, salary,
        date_of_birth, date_of_start, phone, city, street, zip_code,
    });
    return res.data;
};

export const updateEmployee = async (
    id: string, surname: string, name: string,
    patronymic: string | null, position: string, salary: number,
    date_of_birth: string, date_of_start: string, phone: string,
    city: string, street: string, zip_code: string
) => {
    const res = await api.put(`/employees/${id}`, {
        surname, name, patronymic, position, salary,
        date_of_birth, date_of_start, phone, city, street, zip_code,
    });
    return res.data;
};

export const deleteEmployee = async (id: string) => {
    const res = await api.delete(`/employees/${id}`);
    return res.data;
};