import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

import { ArrowLeft, Search, Calendar, BadgeAlert, Banknote, BookOpen, CheckCircle } from 'lucide-react';

const IssuedBooks = () => {
    const [assignments, setAssignments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // --- Logic (No changes to your original code) ---
    const fetchAssignments = async () => {
        try {
            const res = await axios.get("http://localhost:8080/api/assignments");
            const sortedData = res.data.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
            setAssignments(sortedData);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchAssignments(); }, []);

    const getFineDetails = (dueDateStr) => {
        if (!dueDateStr) return { days: 0, fine: 0 };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDateStr);
        due.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - due.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays > 0) {
            return { days: diffDays, fine: diffDays * 20 }; 
        }
        return { days: 0, fine: 0 };
    };

    const handleReturn = async (id) => {
        const result = await Swal.fire({
            title: 'Confirm Return?',
            text: "Confirm receipt of the book and update the stock.?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Return it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/api/assignments/${id}`);
                Swal.fire('Returned!', 'Book stock has been updated.', 'success');
                fetchAssignments(); 
            } catch (err) { Swal.fire('Error', 'Could not process return', 'error'); }
        }
    };

    const totalFine = assignments.reduce((acc, as) => acc + getFineDetails(as.dueDate).fine, 0);
    const overdueCount = assignments.filter(as => getFineDetails(as.dueDate).days > 0).length;

    return (
        <div className="p-4 p-md-5 min-vh-100" style={{ backgroundColor: "#f8fafc", color: "#1e293b" }}>
            
            {/* Header Section */}
            <div className="container-fluid">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
                    <div>
                        <button className="btn btn-link text-decoration-none p-0 mb-2 d-flex align-items-center gap-2 text-primary fw-bold" onClick={() => navigate("/")}>
                            <ArrowLeft size={18}/> Back to Dashboard
                        </button>
                        <h2 className="fw-bold m-0 d-flex align-items-center gap-3">
                            <BookOpen className="text-primary" size={32}/> Issued Books Tracking
                        </h2>
                    </div>
                    
                    <div className="position-relative">
                        <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted"/>
                        <input 
                            type="text" 
                            className="form-control ps-5 border-0 shadow-sm" 
                            placeholder="Search member or book..." 
                            style={{ width: '300px', borderRadius: '12px', height: '48px' }}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Stat Cards Area */}
                <div className="row g-4 mb-5">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-primary border-5">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-muted small fw-bold text-uppercase">Active Issues</div>
                                    <h3 className="fw-bold m-0">{assignments.length}</h3>
                                </div>
                                <div className="bg-primary bg-opacity-10 p-3 rounded-3 text-primary"><BookOpen/></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-danger border-5">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-muted small fw-bold text-uppercase">Overdue Count</div>
                                    <h3 className="fw-bold m-0 text-danger">{overdueCount}</h3>
                                </div>
                                <div className="bg-danger bg-opacity-10 p-3 rounded-3 text-danger"><BadgeAlert/></div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm p-4 rounded-4 bg-white border-start border-success border-5">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <div className="text-muted small fw-bold text-uppercase">Total Fine</div>
                                    <h3 className="fw-bold m-0 text-success">Rs. {totalFine.toLocaleString()}.00</h3>
                                </div>
                                <div className="bg-success bg-opacity-10 p-3 rounded-3 text-success"><Banknote/></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                    <div className="table-responsive">
                        <table className="table align-middle mb-0">
                            <thead className="bg-light">
                                <tr className="text-muted small text-uppercase fw-bold">
                                    <th className="ps-4 py-3">Book & ID</th>
                                    <th className="py-3">Member Details</th>
                                    <th className="py-3">Timeline</th>
                                    <th className="py-3">Status / Fine</th>
                                    <th className="text-center pe-4 py-3">Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.length > 0 ? assignments
                                    .filter(as => 
                                        as.member?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                        as.book?.title.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((as) => {
                                        const { days, fine } = getFineDetails(as.dueDate);
                                        const isOverdue = days > 0;

                                        return (
                                            <tr key={as.id} className={isOverdue ? "bg-danger bg-opacity-10" : ""}>
                                                <td className="ps-4">
                                                    <div className="fw-bold text-dark">{as.book?.title}</div>
                                                    <code className="text-muted" style={{fontSize: '0.75rem'}}>ISBN: {as.book?.isbn || 'N/A'}</code>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold text-primary">{as.member?.name}</div>
                                                    <div className="small text-muted">{as.member?.email}</div>
                                                </td>
                                                <td>
                                                    <div className="d-flex flex-column gap-1">
                                                        <span className="small d-flex align-items-center gap-1">
                                                            <Calendar size={14} className="text-muted"/> Issued: {as.issueDate}
                                                        </span>
                                                        <span className={`small fw-bold d-flex align-items-center gap-1 ${isOverdue ? "text-danger" : "text-success"}`}>
                                                            <CheckCircle size={14}/> Due: {as.dueDate}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {isOverdue ? (
                                                        <div className="d-flex flex-column">
                                                            <span className="badge bg-danger text-white rounded-pill mb-1" style={{width: 'fit-content'}}>
                                                                {days} Days Late
                                                            </span>
                                                            <span className="fw-bold text-danger">Rs. {fine}.00</span>
                                                        </div>
                                                    ) : (
                                                        <span className="badge bg-success bg-opacity-10 text-success px-3 rounded-pill fw-bold">
                                                            Safe to Return
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-center pe-4">
                                                    <button 
                                                        className={`btn btn-sm px-4 rounded-pill fw-bold shadow-sm transition-all ${isOverdue ? "btn-danger" : "btn-success"}`}
                                                        onClick={() => handleReturn(as.id)}
                                                    >
                                                        Accept Return
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-5">
                                            <div className="text-muted">
                                                <BookOpen size={48} className="mb-3 opacity-25"/>
                                                <p>No active book assignments found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <style>{`
                .transition-all { transition: all 0.2s ease-in-out; }
                .transition-all:hover { transform: scale(1.05); }
                .form-control:focus {
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
                    border: 1px solid #3b82f6 !important;
                }
                .bg-light-danger { background-color: #fff5f5 !important; }
                .table tbody tr { transition: background 0.2s; border-bottom: 1px solid #f1f5f9; }
                .table tbody tr:hover { background-color: #f8fafc; }
            `}</style>
        </div>
    );
};

export default IssuedBooks;