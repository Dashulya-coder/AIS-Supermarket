import { useEffect, useState } from "react";
import { createCustomerCard, deleteCustomerCard, getCustomerCards, updateCustomerCard } from "../api/customerCardsApi";
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

    // Create
    const [cardNumber, setCardNumber] = useState("");
    const [surname, setSurname] = useState("");
    const [name, setName] = useState("");
    const [patronymic, setPatronymic] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [street, setStreet] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [percent, setPercent] = useState<number | "">("");

    // Edit
    const [editingCard, setEditingCard] = useState<CustomerCard | null>(null);
    const [editSurname, setEditSurname] = useState("");
    const [editName, setEditName] = useState("");
    const [editPatronymic, setEditPatronymic] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editCity, setEditCity] = useState("");
    const [editStreet, setEditStreet] = useState("");
    const [editZipCode, setEditZipCode] = useState("");
    const [editPercent, setEditPercent] = useState<number | "">("");

    const isValidNameField = (value: string) =>
        /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]+$/.test(value);

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

    useEffect(() => { loadCards(); }, []);

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); loadCards(); };
    const handleResetFilters = () => { setSurnameFilter(""); setPercentFilter(""); loadCards("", ""); };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardNumber.trim() || !surname.trim() || !name.trim() || !phone.trim() || percent === "") {
            setError("Required fields must be filled"); return;
        }
        if (!isValidNameField(surname.trim())) { setError("Surname must contain only letters"); return; }
        if (!isValidNameField(name.trim())) { setError("Name must contain only letters"); return; }
        if (patronymic.trim() && !isValidNameField(patronymic.trim())) { setError("Patronymic must contain only letters"); return; }
        try {
            setError("");
            await createCustomerCard(cardNumber.trim(), surname.trim(), name.trim(),
                patronymic.trim() || null, phone.trim(), city.trim() || null,
                street.trim() || null, zipCode.trim() || null, Number(percent));
            setCardNumber(""); setSurname(""); setName(""); setPatronymic("");
            setPhone(""); setCity(""); setStreet(""); setZipCode(""); setPercent("");
            setShowForm(false);
            await loadCards();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to create customer card");
        }
    };

    const handleEditStart = (card: CustomerCard) => {
        setEditingCard(card);
        setEditSurname(card.surname);
        setEditName(card.name);
        setEditPatronymic(card.patronymic ?? "");
        setEditPhone(card.phone);
        setEditCity(card.city ?? "");
        setEditStreet(card.street ?? "");
        setEditZipCode(card.zip_code ?? "");
        setEditPercent(card.percent);
        setError("");
    };

    const handleEditSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCard) return;
        if (!editSurname.trim() || !editName.trim() || !editPhone.trim() || editPercent === "") {
            setError("Required fields must be filled"); return;
        }
        if (!isValidNameField(editSurname.trim())) { setError("Surname must contain only letters"); return; }
        if (!isValidNameField(editName.trim())) { setError("Name must contain only letters"); return; }
        if (editPatronymic.trim() && !isValidNameField(editPatronymic.trim())) { setError("Patronymic must contain only letters"); return; }
        try {
            setError("");
            await updateCustomerCard(editingCard.card_number, editSurname.trim(), editName.trim(),
                editPatronymic.trim() || null, editPhone.trim(), editCity.trim() || null,
                editStreet.trim() || null, editZipCode.trim() || null, Number(editPercent));
            setEditingCard(null);
            await loadCards();
        } catch (err: any) {
            setError(err?.response?.data?.error || "Failed to update customer card");
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
                    <input className={styles.searchInput} placeholder="Search by surname..." value={surnameFilter} onChange={(e) => setSurnameFilter(e.target.value)} />
                    <input className={styles.searchInput} type="number" min="0" placeholder="Filter by percent..." style={{ maxWidth: 180 }} value={percentFilter} onChange={(e) => setPercentFilter(e.target.value)} />
                    <button type="submit" className={`${styles.btn} ${styles.btnSecondary}`}>Search</button>
                    <button type="button" onClick={handleResetFilters} className={`${styles.btn} ${styles.btnSecondary}`}>Reset</button>
                </form>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowForm((v) => !v)}>
                    {showForm ? "Cancel" : "+ Add Card"}
                </button>
            </div>

            {showForm && (
                <div className={styles.card} style={{ marginTop: 16 }}>
                    <h3 className={styles.modalTitle}>New Customer Card</h3>
                    <form onSubmit={handleCreate}>
                        <div className={styles.formRow}>
                            <div className={styles.field}><label className={styles.label}>Card number *</label><input className={styles.input} placeholder="Card number" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Surname *</label><input className={styles.input} placeholder="Surname" value={surname} onChange={(e) => setSurname(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Name *</label><input className={styles.input} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Patronymic</label><input className={styles.input} placeholder="Patronymic" value={patronymic} onChange={(e) => setPatronymic(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Phone *</label><input className={styles.input} placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>City</label><input className={styles.input} placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Street</label><input className={styles.input} placeholder="Street" value={street} onChange={(e) => setStreet(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Zip code</label><input className={styles.input} placeholder="Zip code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} /></div>
                            <div className={styles.field}><label className={styles.label}>Discount % *</label><input className={styles.input} type="number" min="0" placeholder="0" value={percent} onChange={(e) => setPercent(Number(e.target.value))} /></div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setShowForm(false)}>Cancel</button>
                            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Create</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Modal */}
            {editingCard && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal} style={{ maxWidth: 640 }}>
                        <h3 className={styles.modalTitle}>Edit Card — {editingCard.card_number}</h3>
                        <form onSubmit={handleEditSave}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                <div className={styles.field}>
                                    <label className={styles.label}>Surname *</label>
                                    <input className={styles.input} value={editSurname} onChange={(e) => setEditSurname(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Name *</label>
                                    <input className={styles.input} value={editName} onChange={(e) => setEditName(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Patronymic</label>
                                    <input className={styles.input} value={editPatronymic} onChange={(e) => setEditPatronymic(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Phone *</label>
                                    <input className={styles.input} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>City</label>
                                    <input className={styles.input} value={editCity} onChange={(e) => setEditCity(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Street</label>
                                    <input className={styles.input} value={editStreet} onChange={(e) => setEditStreet(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Zip code</label>
                                    <input className={styles.input} value={editZipCode} onChange={(e) => setEditZipCode(e.target.value)} />
                                </div>
                                <div className={styles.field}>
                                    <label className={styles.label}>Discount % *</label>
                                    <input className={styles.input} type="number" min="0" value={editPercent} onChange={(e) => setEditPercent(Number(e.target.value))} />
                                </div>
                            </div>
                            {error && <div className={styles.errorMsg} style={{ marginTop: 12 }}>{error}</div>}
                            <div className={styles.modalFooter}>
                                <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => setEditingCard(null)}>Cancel</button>
                                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {error && !editingCard && <div className={styles.errorMsg} style={{ marginTop: 12, marginBottom: 12 }}>{error}</div>}

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
                                <th style={{ textAlign: "right" }}>Actions</th>
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
                                    <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>{card.percent}%</span></td>
                                    <td style={{ textAlign: "right" }}>
                                        <div className={styles.actions} style={{ justifyContent: "flex-end" }}>
                                            <button className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`} onClick={() => handleEditStart(card)}>Edit</button>
                                            {isManager && <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSm}`} onClick={() => handleDelete(card.card_number)}>Delete</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};