import { useEffect, useState } from "react";
import {
    createCustomerCard,
    deleteCustomerCard,
    getCustomerCards,
} from "../api/customerCardsApi";
import { useAuth } from "../context/AuthContext";
import styles from "../components/common.module.css";

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
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

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

    const loadCards = async (sur?: string, per?: string) => {
        try {
            setLoading(true);
            setError("");
            const data = await getCustomerCards(
                sur ?? (surnameFilter.trim() || undefined),
                per ?? (percentFilter.trim() || undefined)
            );
            setCards(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to load customer cards");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCards();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadCards();
    };

    const handleResetFilters = () => {
        setSurnameFilter("");
        setPercentFilter("");
        loadCards("", "");
    };

    const isValidNameField = (value: string) =>
        /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$/.test(value);

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
            setCardNumber(""); setSurname(""); setName("");
            setPatronymic(""); setPhone(""); setCity("");
            setStreet(""); setZipCode(""); setPercent("");
            setShowForm(false);
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
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>Customer Cards</h1>

            <div className={styles.filterBar} style={{ marginTop: 16 }}>
                <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, flex: 1, flexWrap: "wrap" }}>
                    <input
                        className={styles.searchInput}
                        placeholder="Search by surname..."
                        value={surnameFilter}
                        onChange={(e) => setSurnameFilter(e.target.value)}
                    />
                    <input
                        className={styles.searchInput}
                        type="number"
                        placeholder="Filter by percent..."
                        min="0"
                        max="100"
                        style={{ maxWidth: 180 }}
                        value={percentFilter}
                        onChange={(e) => setPercentFilter(e.target.value)}
                    />
                    <button type="submit" className={`${styles.btn} ${styles.btnSecondary}`}>
                        Search
                    </button>
                    <button type="button" onClick={handleResetFilters} className={`${styles.btn} ${styles.btnSecondary}`}>
                        Reset
                    </button>
                </form>
                <button
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    onClick={() => setShowForm((v) => !v)}
                >
                    {showForm ? "Cancel" : "+ Add Card"}
                </button>
            </div>

            {showForm && (
                <div className={styles.card} style={{ marginTop: 16 }}>
                    <h3 className={styles.modalTitle}>New Customer Card</h3>
                    <form onSubmit={handleCreate}>
                        <div className={styles.formRow}>
                            <div className={styles.field}>
                                <label className={styles.label}>Card number *</label>
                                <input className={styles.input} placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Surname *</label>
                                <input className={styles.input} placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Name *</label>
                                <input className={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Patronymic</label>
                                <input className={styles.input} placeholder="Patronymic" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Phone *</label>
                                <input className={styles.input} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>City</label>
                                <input className={styles.input} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Street</label>
                                <input className={styles.input} placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Zip code</label>
                                <input className={styles.input} placeholder="Zip code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>Discount % *</label>
                                <input className={styles.input} type="number" placeholder="0" min="0" max="100" value={percent} onChange={(e) => setPercent(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create</button>
                        </div>
                    </form>
                </div>
            )}

            {error && <div className={styles.errorMsg} style={{ marginTop: 12, marginBottom: 12 }}>{error}</div>}

            {loading ? (
                <div className={styles.loading}>Loading...</div>
            ) : cards.length === 0 ? (
                <div className={styles.empty}><p>No customer cards found</p></div>
            ) : (
                <div className={styles.tableWrap} style={{ marginTop: 24 }}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Card Number</th>
                                <th>Surname</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>City</th>
                                <th>Discount</th>
                                {isManager && <th style={{ textAlign: "right" }}>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {cards.map((card) => (
                                <tr key={card.card_number}>
                                    <td><code style={{ fontSize: 13 }}>{card.card_number}</code></td>
                                    <td>{card.surname}</td>
                                    <td>{card.name}</td>
                                    <td>{card.phone}</td>
                                    <td>{card.city ?? "—"}</td>
                                    <td>
                                        <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                                            {card.percent}%
                                        </span>
                                    </td>
                                    {isManager && (
                                        <td style={{ textAlign: "right" }}>
                                            <button
                                                className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`}
                                                onClick={() => handleDelete(card.card_number)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};