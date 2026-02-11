import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from './components/BarcodeScanner';
import { 
    LayoutDashboard, BookPlus, Users, ListChecks, LogOut, 
    Search, Camera, Moon, Sun, AlertCircle, Plus, Trash2, ExternalLink, BookOpen
} from 'lucide-react';

const Dashboard = ({ setAuth }) => {
    const GOOGLE_BOOKS_API_KEY = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY || "AIzaSyC7jlhIXXI4nJ5r4l49rNqXrwzrBJXJ1hk";
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

    const [books, setBooks] = useState([]);
    const [isbn, setIsbn] = useState('');
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState('');
    const [qty, setQty] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showScanner, setShowScanner] = useState(false);
    const [loading, setLoading] = useState(false);

    const [stats, setStats] = useState({
        totalBooks: 0,
        totalMembers: 0,
        totalAssignments: 0,
        totalReturns: 0
    });

    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
            setStats(response.data);
        } catch (error) { console.error("Stats Error:", error); }
    };

    const fetchBooks = async () => {
        try {
            const result = await axios.get(`${API_BASE_URL}/books`);
            setBooks(result.data);
        } catch (error) { console.error("Books Error:", error); }
    };

    useEffect(() => {
        fetchBooks();
        fetchStats();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        setAuth(false);
        navigate("/login");
    };

    const searchBookByIsbn = async (code) => {
        const searchCode = code || isbn;
        if (!searchCode || searchCode.trim().length < 10) {
            Swal.fire({ title: "Wait!", text: "Give a correct ISBN.", icon: "warning", background: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#000' });
            return;
        }
        
        const existingBook = books.find(b => b.isbn === searchCode.trim());
        if (existingBook) { updateStock(existingBook.id, existingBook.qty); return; }

        setLoading(true);
        try {
            const res = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=isbn:${searchCode.trim()}&key=${GOOGLE_BOOKS_API_KEY}`);
            if (res.data.items && res.data.items.length > 0) {
                const info = res.data.items[0].volumeInfo;
                setTitle(info.title || '');
                setAuthor(info.authors ? info.authors.join(', ') : 'Unknown Author');
                setCategory(info.categories ? info.categories[0] : 'General');
                setQty(1);
                const rawImg = info.imageLinks?.thumbnail || '';
                const secureImg = rawImg.replace('http://', 'https://');
                setImageUrl(secureImg || 'https://via.placeholder.com/150?text=No+Cover');
                Swal.fire({ icon: 'success', title: 'Book found!', text: info.title, timer: 1500, showConfirmButton: false, background: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#000' });
            } else { 
                Swal.fire({ title: "Not Found", text: "Please input data manually.", icon: "info", background: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#000' }); 
            }
        } catch (err) { 
            Swal.fire({ title: "Error", text: "Error in API connection!", icon: "error", background: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#000' }); 
        } finally { setLoading(false); }
    };

    const updateStock = async (bookId, currentQty) => {
        const { value: additionalQty } = await Swal.fire({
            title: 'Stock Update',
            text: `This book is already in the system. How many more will be added?`,
            input: 'number',
            inputValue: 1,
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            background: darkMode ? '#1e293b' : '#fff',
            color: darkMode ? '#fff' : '#000'
        });

        if (additionalQty) {
            try {
                const targetBook = books.find(b => b.id === bookId);
                await axios.put(`${API_BASE_URL}/books/${bookId}`, {
                    ...targetBook,
                    qty: parseInt(currentQty) + parseInt(additionalQty)
                });
                fetchBooks(); fetchStats(); setIsbn('');
                Swal.fire('Success!', 'Stock updated.', 'success');
            } catch (err) { Swal.fire('Error', 'Update failed.', 'error'); }
        }
    };

    const addBook = async () => {
        if (!title || !author || !qty) {
            Swal.fire({ title: "Warning!", text: "Complete the required information.!", icon: "warning", background: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#000' });
            return;
        }
        try {
            await axios.post(`${API_BASE_URL}/books`, { title, author, imageUrl, category, qty: parseInt(qty), isbn });
            Swal.fire({ icon: 'success', title: 'Added Successfully!', timer: 1500, showConfirmButton: false });
            setIsbn(''); setTitle(''); setAuthor(''); setImageUrl(''); setCategory(''); setQty('');
            fetchBooks(); fetchStats();
        } catch (error) { Swal.fire("Error", "Could not insert the book.", "error"); }
    };

    const onScanSuccess = (decodedText) => { setIsbn(decodedText.trim()); setShowScanner(false); searchBookByIsbn(decodedText.trim()); };
    
    const deleteBook = async (id) => {
        Swal.fire({ 
            title: "Will the book be removed?", 
            icon: "warning", 
            showCancelButton: true, 
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, Delete!',
            background: darkMode ? '#1e293b' : '#fff',
            color: darkMode ? '#fff' : '#000'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`${API_BASE_URL}/books/${id}`);
                    fetchBooks(); fetchStats();
                    Swal.fire({ title: "Deleted!", icon: "success", background: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#000' });
                } catch (err) { Swal.fire("Error", "Removal failed.", "error"); }
            }
        });
    };

    const handleAddMember = async () => {
        const { value: v } = await Swal.fire({
            title: 'Add New Member',
            html: `
                <div style="text-align: left;">
                    <label class="small fw-bold text-muted">Full Name</label>
                    <input id="n" class="swal2-input" placeholder="Name" style="width: 80%; margin: 10px auto; display: block;">
                    <label class="small fw-bold text-muted">Email Address</label>
                    <input id="e" class="swal2-input" placeholder="Email" style="width: 80%; margin: 10px auto; display: block;">
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Register',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#64748b',
            background: darkMode ? '#1e293b' : '#fff',
            color: darkMode ? '#fff' : '#000',
            preConfirm: () => {
                const name = document.getElementById('n').value;
                const email = document.getElementById('e').value;
                if (!name || !email) {
                    Swal.showValidationMessage('Please fill all fields');
                    return false;
                }
                return { 
                    name, 
                    email, 
                    registeredDate: new Date().toISOString().split('T')[0] 
                };
            }
        });
        
        if (v) { 
            try {
                await axios.post(`${API_BASE_URL}/members`, v); 
                fetchStats(); 
                Swal.fire("Success", "Member added!", "success"); 
            } catch (err) {
                Swal.fire("Error", "Failed to add member", "error");
            }
        }
    };

    const handleAssignBook = async () => {
        try {
            const [mRes, bRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/members`),
                axios.get(`${API_BASE_URL}/books`)
            ]);
            const availableBooks = bRes.data.filter(b => b.qty > 0);
            if (availableBooks.length === 0) {
                Swal.fire({ title: "Sorry", text: "No books available in stock.", icon: "info", background: darkMode ? '#1e293b' : '#fff', color: darkMode ? '#fff' : '#000' });
                return;
            }
            const { value: f } = await Swal.fire({
                title: 'Issue Book',
                background: darkMode ? '#1e293b' : '#fff',
                color: darkMode ? '#fff' : '#000',
                html: `
                    <div style="text-align: left; padding: 0 5px;">
                        <label class="small fw-bold text-muted">Select Book</label>
                        <select id="b-id" class="swal2-select" style="width: 100%; margin: 10px 0;">
                            ${availableBooks.map(b => `<option value="${b.id}">${b.title}</option>`).join('')}
                        </select>
                        <label class="small fw-bold text-muted">Select Member</label>
                        <select id="m-id" class="swal2-select" style="width: 100%; margin: 10px 0;">
                            ${mRes.data.map(m => `<option value="${m.id}">${m.name}</option>`).join('')}
                        </select>
                        <label class="small fw-bold text-muted">Return Date</label>
                        <input type="date" id="d-date" class="swal2-input" style="width: 100%; margin: 10px 0;" 
                            value="${new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0]}">
                    </div>
                `,
                showCancelButton: true, 
                cancelButtonText: 'Cancel', 
                cancelButtonColor: '#64748b', 
                confirmButtonText: 'Issue Now',
                confirmButtonColor: '#3b82f6',
                preConfirm: () => {
                    const b = document.getElementById('b-id').value;
                    const m = document.getElementById('m-id').value;
                    const d = document.getElementById('d-date').value;
                    if(!b || !m || !d) { Swal.showValidationMessage('Fill all fields'); return false; }
                    return { book: { id: parseInt(b) }, member: { id: parseInt(m) }, dueDate: d, issueDate: new Date().toISOString().split('T')[0], status: 'Issued' }
                }
            });
            if (f) {
                await axios.post(`${API_BASE_URL}/assignments`, f);
                fetchStats(); fetchBooks();
                Swal.fire("Success", "Book Issued!", "success");
            }
        } catch (err) { Swal.fire("Error", "Check Connection", "error"); }
    };

    return (
        <div className="d-flex min-vh-100" style={{ 
            backgroundColor: darkMode ? "#0f172a" : "#f8fafc", 
            color: darkMode ? "#f1f5f9" : "#1e293b",
            transition: "all 0.3s ease"
        }}>
            {/* Sidebar */}
            <div className="shadow-lg d-flex flex-column sticky-top" style={{ 
                width: "280px", height: "100vh",
                background: darkMode ? "#1e293b" : "#ffffff",
                borderRight: `1px solid ${darkMode ? "#334155" : "#e2e8f0"}`
            }}>
                <div className="p-4 fs-4 fw-bold text-primary d-flex align-items-center gap-2 border-bottom border-light border-opacity-10">
                    <BookPlus size={32} strokeWidth={2.5} /> BookFlow
                </div>
                
                <div className="p-3 flex-grow-1 d-flex flex-column gap-2 mt-3">
                    <button className="btn btn-primary d-flex align-items-center gap-3 py-2 px-3 rounded-3 shadow-sm border-0 transition-up">
                        <LayoutDashboard size={20}/> Dashboard
                    </button>
                    <button className={`btn btn-hover d-flex align-items-center gap-3 py-2 px-3 rounded-3 border-0 text-start ${darkMode ? 'text-light' : 'text-secondary'}`} onClick={() => navigate("/inventory")}>
                        <BookOpen size={20}/> Inventory
                    </button>
                    <button className={`btn btn-hover d-flex align-items-center gap-3 py-2 px-3 rounded-3 border-0 text-start ${darkMode ? 'text-light' : 'text-secondary'}`} onClick={handleAssignBook}>
                        <Plus size={20}/> Issue Book
                    </button>
                    <button className={`btn btn-hover d-flex align-items-center gap-3 py-2 px-3 rounded-3 border-0 text-start ${darkMode ? 'text-light' : 'text-secondary'}`} onClick={() => navigate("/issued")}>
                        <ExternalLink size={20}/> Issued List
                    </button>
                    <button className={`btn btn-hover d-flex align-items-center gap-3 py-2 px-3 rounded-3 border-0 text-start ${darkMode ? 'text-light' : 'text-secondary'}`} onClick={handleAddMember}>
                        <Users size={20}/> New Member
                    </button>
                    <button className={`btn btn-hover d-flex align-items-center gap-3 py-2 px-3 rounded-3 border-0 text-start ${darkMode ? 'text-light' : 'text-secondary'}`} 
                        onClick={() => navigate("/members")}>
                        <Users size={20}/> Members List
                    </button>
                </div>

                <div className="p-4 border-top border-light border-opacity-10">
                    <div className="d-flex align-items-center justify-content-between mb-4 px-2">
                        <span className="small fw-bold text-muted text-uppercase">Appearance</span>
                        <button className={`btn btn-sm rounded-circle p-1 ${darkMode ? 'btn-outline-warning' : 'btn-outline-secondary'}`} onClick={() => setDarkMode(!darkMode)}>
                            {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
                        </button>
                    </div>
                    <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 py-2" onClick={handleLogout}>
                        <LogOut size={18}/> Logout
                    </button>
                </div>
            </div>

            <div className="flex-grow-1 p-4 p-md-5 overflow-auto">
                <div className="container-fluid max-width-xl">
                    <header className="mb-5">
                        <h2 className="fw-bold m-0 h1">Main Control Hub</h2>
                        <p className={`${darkMode ? 'text-info' : 'text-muted'} opacity-75`}>Welcome back, Administrator.</p>
                    </header>

                    {/* Stats Section */}
                    <div className="row g-4 mb-5">
                        {[
                            { l: "Total Books", v: stats.totalBooks, c: "#3b82f6", i: <BookPlus/> },
                            { l: "Members", v: stats.totalMembers, c: "#10b981", i: <Users/> },
                            { l: "Books Issued", v: stats.totalAssignments, c: "#f59e0b", i: <ListChecks/> },
                            { l: "Overdue", v: stats.totalReturns, c: "#ef4444", i: <AlertCircle/> }
                        ].map((s, i) => (
                            <div key={i} className="col-md-3">
                                <div className="card border-0 shadow-sm rounded-4 p-4 h-100 transition-up" style={{ background: darkMode ? "#1e293b" : "white", color: darkMode ? "#f1f5f9" : "#1e293b" }}>
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <div className="small text-uppercase fw-bold text-muted mb-1 ls-wide" style={{fontSize: '0.7rem'}}>{s.l}</div>
                                            <h2 className="fw-bold m-0">{s.v}</h2>
                                        </div>
                                        <div className="p-3 rounded-3 shadow-sm" style={{ background: `${s.c}15`, color: s.c }}>{s.i}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="row g-4">
                        {/* Add Book Form */}
                        <div className="col-lg-4">
                            <div className="card border-0 shadow-lg rounded-4 p-4 sticky-top" style={{ top: '2rem', background: darkMode ? "#1e293b" : "white", color: darkMode ? "#f1f5f9" : "#1e293b" }}>
                                <h5 className="fw-bold mb-4 d-flex align-items-center gap-2"><Plus size={20} className="text-primary"/> Add New Item</h5>
                                <button className={`btn mb-4 w-100 d-flex align-items-center justify-content-center gap-2 py-2 rounded-3 ${showScanner ? 'btn-danger' : 'btn-primary'}`} onClick={() => setShowScanner(!showScanner)}>
                                    <Camera size={18}/> {showScanner ? "Close Scanner" : "Scan ISBN Barcode"}
                                </button>
                                {showScanner && <div className="mb-3 rounded-4 overflow-hidden border shadow-inner"><BarcodeScanner onScanSuccess={onScanSuccess} /></div>}
                                <div className="input-group mb-3 shadow-sm rounded-3 overflow-hidden">
                                    <input type="text" className="form-control border-0" placeholder="Scan or Type ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchBookByIsbn()} />
                                    <button className="btn btn-dark px-3" onClick={() => searchBookByIsbn()} disabled={loading}>
                                        {loading ? <span className="spinner-border spinner-border-sm"></span> : <Search size={18}/>}
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <input type="text" className="form-control mb-2" placeholder="Book Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                                    <input type="text" className="form-control mb-2" placeholder="Author Name" value={author} onChange={(e) => setAuthor(e.target.value)} />
                                    <select className="form-select mb-2" value={category} onChange={(e) => setCategory(e.target.value)}>
                                        <option value="">Select Category</option>
                                        <option value="Fiction">Fiction</option>
                                        <option value="Educational">Educational</option>
                                        <option value="Novel">Novel</option>
                                        <option value="Tech">Technology</option>
                                    </select>
                                    <input type="number" className="form-control mb-3" placeholder="Copies Available" value={qty} onChange={(e) => setQty(e.target.value)} />
                                    <button className="btn btn-success w-100 fw-bold py-2 shadow transition-up" onClick={addBook}>Confirm & Save</button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Inventory Table */}
                        <div className="col-lg-8">
                            <div className="card border-0 shadow-lg rounded-4 p-4" style={{ background: darkMode ? "#1e293b" : "white", color: darkMode ? "#f1f5f9" : "#1e293b" }}>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                                    <h5 className="fw-bold m-0">Recent Inventory</h5>
                                    <div className="position-relative">
                                        <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted"/>
                                        <input type="text" className="form-control ps-5 rounded-pill border-0 bg-light bg-opacity-10" placeholder="Search by title..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width: '250px'}} />
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className={`table table-hover align-middle ${darkMode ? "table-dark" : ""}`}>
                                        <thead className="small text-muted text-uppercase border-bottom">
                                            <tr>
                                                <th className="py-3">Book Info</th>
                                                <th className="py-3">Availability</th>
                                                <th className="py-3 text-end">Manage</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {books
                                                .filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .slice(0, 5) // Display only last 5
                                                .map((book) => (
                                                <tr key={book.id}>
                                                    <td className="py-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <img src={book.imageUrl || 'https://via.placeholder.com/150?text=No+Cover'} className="rounded shadow-sm" style={{ width: "45px", height: "60px", objectFit: "cover" }} alt="cover" />
                                                            <div>
                                                                <div className="fw-bold text-truncate" style={{maxWidth: "180px"}}>{book.title}</div>
                                                                <div className="small text-muted">{book.author}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {book.qty > 0 ? 
                                                            <div className="d-flex align-items-center gap-2 text-success small fw-bold">
                                                                <div className="bg-success rounded-circle" style={{width:8, height:8}}></div>
                                                                {book.qty} In Stock
                                                            </div> : 
                                                            <div className="d-flex align-items-center gap-2 text-danger small fw-bold">
                                                                <div className="bg-danger rounded-circle" style={{width:8, height:8}}></div>
                                                                Out of Stock
                                                            </div>
                                                        }
                                                    </td>
                                                    <td className="text-end">
                                                        <button className="btn btn-sm btn-light-danger rounded-pill px-3" onClick={() => deleteBook(book.id)}>
                                                            <Trash2 size={16}/>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                
                                <div className="text-center mt-4 pt-3 border-top border-light border-opacity-10">
                                    <button className="btn btn-link text-decoration-none d-inline-flex align-items-center gap-2 fw-bold" onClick={() => navigate("/inventory")} style={{ color: "#3b82f6" }}>
                                        View Full Inventory List <ExternalLink size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .transition-up { transition: all 0.3s ease; }
                .transition-up:hover { transform: translateY(-4px); }
                .btn-hover:hover { background: rgba(59, 130, 246, 0.1); color: #3b82f6 !important; }
                .form-control, .form-select { background-color: ${darkMode ? '#1e293b' : '#f8fafc'} !important; color: ${darkMode ? '#f1f5f9' : '#1e293b'} !important; border: 1px solid ${darkMode ? '#334155' : '#e2e8f0'} !important; }
                .table-dark { --bs-table-bg: #1e293b; --bs-table-color: #f1f5f9; --bs-table-hover-bg: #334155; }
                .btn-light-danger { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: none; }
                .btn-light-danger:hover { background: #ef4444; color: white; }
                .max-width-xl { max-width: 1400px; margin: 0 auto; }
            `}</style>
        </div>
    );
};

export default Dashboard;