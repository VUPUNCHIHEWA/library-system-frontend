import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Trash2, Book, Hash, Tag } from 'lucide-react';
import Swal from 'sweetalert2';

const Inventory = () => {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const darkMode = localStorage.getItem("theme") === "dark";
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

    const fetchBooks = async () => {
        try {
            const result = await axios.get(`${API_BASE_URL}/books`);
            setBooks(result.data);
        } catch (error) { console.error("Books Error:", error); }
    };

    useEffect(() => { fetchBooks(); }, []);

    const deleteBook = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This book will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            background: darkMode ? '#1e293b' : '#fff',
            color: darkMode ? '#fff' : '#000'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_BASE_URL}/books/${id}`);
                fetchBooks();
                Swal.fire("Deleted!", "Book removed from inventory.", "success");
            } catch (err) { Swal.fire("Error", "Failed to delete.", "error"); }
        }
    };

    const filteredBooks = books.filter(b => 
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.isbn?.includes(searchTerm)
    );

    return (
        <div className="min-vh-100 p-4 p-md-5" style={{ 
            backgroundColor: darkMode ? "#0f172a" : "#f8fafc", 
            color: darkMode ? "#f1f5f9" : "#1e293b" 
        }}>
            <div className="container-fluid max-width-xl">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-5 gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-outline-secondary rounded-circle p-2" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="fw-bold m-0">Global Inventory</h2>
                            <p className="text-muted m-0 small">Overview of all registered library items</p>
                        </div>
                    </div>
                    
                    <div className="position-relative" style={{ minWidth: '320px' }}>
                        <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted"/>
                        <input 
                            type="text" 
                            className="form-control ps-5 rounded-pill border-0 shadow-sm py-2" 
                            placeholder="Search Title, Author or ISBN..." 
                            style={{ background: darkMode ? "#1e293b" : "#fff", color: darkMode ? "#fff" : "#000" }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: darkMode ? "#1e293b" : "#fff" }}>
                    <div className="table-responsive">
                        <table className={`table table-hover align-middle mb-0 ${darkMode ? "table-dark" : ""}`}>
                            <thead className="bg-light bg-opacity-10 border-bottom">
                                <tr>
                                    <th className="p-4">Book Description</th>
                                    <th className="p-4"><Hash size={16} className="me-2"/>ISBN</th>
                                    <th className="p-4"><Tag size={16} className="me-2"/>Genre</th>
                                    <th className="p-4 text-center">In Stock</th>
                                    <th className="p-4 text-end">Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBooks.length > 0 ? filteredBooks.map((book) => (
                                    <tr key={book.id}>
                                        <td className="p-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <img src={book.imageUrl || 'https://via.placeholder.com/150?text=No+Cover'} className="rounded shadow-sm" style={{ width: "50px", height: "70px", objectFit: "cover" }} alt="cover" />
                                                <div>
                                                    <div className="fw-bold">{book.title}</div>
                                                    <div className="small text-muted">{book.author}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4"><code>{book.isbn || '---'}</code></td>
                                        <td className="p-4"><span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3">{book.category || 'General'}</span></td>
                                        <td className="p-4 text-center">
                                            <span className={`fw-bold ${book.qty > 0 ? 'text-success' : 'text-danger'}`}>
                                                {book.qty} Units
                                            </span>
                                        </td>
                                        <td className="p-4 text-end">
                                            <button className="btn btn-sm btn-outline-danger border-0 rounded-circle p-2" onClick={() => deleteBook(book.id)}>
                                                <Trash2 size={20}/>
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-5 text-muted">
                                            <Book size={48} className="mb-3 opacity-25" />
                                            <p>No matching inventory found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .max-width-xl { max-width: 1400px; margin: 0 auto; }
                .table-dark { --bs-table-bg: #1e293b; --bs-table-hover-bg: #334155; --bs-table-border-color: #334155; }
                .form-control:focus { box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25); border-color: #3b82f6; }
            `}</style>
        </div>
    );
};

export default Inventory;