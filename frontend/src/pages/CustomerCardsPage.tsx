import { useEffect, useState } from "react";
import {
    createCustomerCard,
    deleteCustomerCard,
    getCustomerCards,
} from "../api/customerCardsApi";
import { useAuth } from "../context/AuthContext";

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

export const CustomerCardsPage = () => {
    const { user } = useAuth();
    const isManager = user?.role === "Manager";

    const [cards, setCards] = useState<CustomerCard[]>([]);
    const [error, setError] = useState("");

    const [surnameFilter, setSurnameFilter] = useState("");
    const [percentFilter, setPercentFilter] = useState("");

    const [cardNumber, setCardNumber] = useState("");
    const [surname, setSurname] = useState("");
    const [name, setName] = useState("");
    const [patronymic, setPatronymic] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [percent, setPercent] = useState<number | "">("");

    const loadCards = async () => {
        try {
            setError("");
            const data = await getCustomerCards(
                surnameFilter.trim() || undefined,
                percentFilter.trim() || undefined
            );
            setCards(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load customer cards");
        }
    };

    useEffect(() => {
        loadCards();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        await loadCards();
    };

    const handleResetFilters = async () => {
        setSurnameFilter("");
        setPercentFilter("");
        try {
            setError("");
            const data = await getCustomerCards();
            setCards(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load customer cards");
        }
    };

    const isValidNameField = (value: string) => {
        return /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$/.test(value);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cardNumber.trim() || !surname.trim() || !name.trim() || !phone.trim() || percent === "") {
            setError("Required fields must be filled");
            return;
        }
        if (!isValidNameField(surname.trim())) {
            setError("Surname must contain only letters");
            return;
        }

        if (!isValidNameField(name.trim())) {
            setError("Name must contain only letters");
            return;
        }

        if (patronymic.trim() && !isValidNameField(patronymic.trim())) {
            setError("Patronymic must contain only letters");
            return;
        }

        try {
            setError("");
            await createCustomerCard(
                cardNumber.trim(),
                surname.trim(),
                name.trim(),
                patronymic.trim() || null,
                phone.trim(),
                city.trim() || null,
                street.trim() || null,
                zipCode.trim() || null,
                Number(percent)
            );

            setCardNumber("");
            setSurname("");
            setName("");
            setPatronymic("");
            setPhone("");
            setCity("");
            setStreet("");
            setZipCode("");
            setPercent("");

            await loadCards();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create customer card");
        }
    };

    const handleDelete = async (cardNumber: string) => {
        try {
            setError("");
            await deleteCustomerCard(cardNumber);
            await loadCards();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to delete customer card");
        }
    };

    return (
        <div>
            <h1>Customer Cards</h1>

            <form onSubmit={handleSearch} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input
                        placeholder="Search by surname"
                        value={surnameFilter}
                        onChange={(e) => setSurnameFilter(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Filter by percent"
                        value={percentFilter}
                        onChange={(e) => setPercentFilter(e.target.value)}
                    />

                    <button type="submit">Search</button>
                    <button type="button" onClick={handleResetFilters}>
                        Reset
                    </button>
                </div>
            </form>

            <form onSubmit={handleCreate} style={{ marginBottom: 24 }}>
                <div style={{ display: "grid", gap: 8, maxWidth: 700 }}>
                    <input
                        placeholder="Card number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                    />
                    <input
                        placeholder="Surname"
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />
                    <input
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        placeholder="Patronymic"
                        value={patronymic}
                        onChange={(e) => setPatronymic(e.target.value)}
                    />
                    <input
                        placeholder="Phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <input
                        placeholder="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                    <input
                        placeholder="Street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                    />
                    <input
                        placeholder="Zip code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Percent"
                        value={percent}
                        onChange={(e) => setPercent(Number(e.target.value))}
                    />

                    <button type="submit">Create</button>
                </div>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <table>
                <thead>
                <tr>
                    <th>Card Number</th>
                    <th>Surname</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>City</th>
                    <th>Percent</th>
                    {isManager && <th>Actions</th>}
                </tr>
                </thead>
                <tbody>
                {cards.length === 0 ? (
                    <tr>
                        <td colSpan={isManager ? 7 : 6}>No customer cards found</td>
                    </tr>
                ) : (
                    cards.map((card) => (
                        <tr key={card.card_number}>
                            <td>{card.card_number}</td>
                            <td>{card.surname}</td>
                            <td>{card.name}</td>
                            <td>{card.phone}</td>
                            <td>{card.city ?? "-"}</td>
                            <td>{card.percent}</td>
                            {isManager && (
                                <td>
                                    <button onClick={() => handleDelete(card.card_number)}>Delete</button>
                                </td>
                            )}
                        </tr>
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};