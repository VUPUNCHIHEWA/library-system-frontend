import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { 
    Users, Search, Trash2, ArrowLeft, Moon, Sun, Calendar 
} from 'lucide-react';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
    const navigate = useNavigate();

    const fetchMembers = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/members");
            setMembers(response.data);
        } catch (error) { console.error("Error fetching members:", error); }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    const deleteMember = async (id) => {
        Swal.fire({
            title: "Will the member be removed?",
            text: "This cannot be reversed!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete',
            background: darkMode ? '#1e293b' : '#fff',
            color: darkMode ? '#fff' : '#000'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`http://localhost:8080/api/members/${id}`);
                    fetchMembers();
                    Swal.fire("Deleted!", "Member successfully removed.", "success");
                } catch (err) { Swal.fire("Error", "Could not be removed.", "error"); }
            }
        });
    };

    const filteredMembers = members.filter(m => 
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        m.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-vh-100" style={{ 
            backgroundColor: darkMode ? "#0f172a" : "#f8fafc", 
            color: darkMode ? "#f1f5f9" : "#1e293b",
            transition: "all 0.3s ease"
        }}>
            <div className="container py-5">
                {/* Header */}
                <div className="d-flex align-items-center justify-content-between mb-5">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-outline-secondary rounded-circle p-2" onClick={() => navigate(-1)}>
                            <ArrowLeft size={20}/>
                        </button>
                        <div>
                            <h2 className="fw-bold m-0">Library Members</h2>
                            <p className="text-muted m-0">Manage your registered community</p>
                        </div>
                    </div>
                    <button className={`btn rounded-circle p-2 ${darkMode ? 'btn-outline-warning' : 'btn-outline-secondary'}`} onClick={() => setDarkMode(!darkMode)}>
                        {darkMode ? <Sun size={20}/> : <Moon size={20}/>}
                    </button>
                </div>

                {/* Search & Stats */}
                <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ background: darkMode ? "#1e293b" : "white" }}>
                    <div className="row g-3 align-items-center">
                        <div className="col-md-6">
                            <div className="position-relative">
                                <Search size={18} className="position-absolute top-50 translate-middle-y ms-3 text-muted"/>
                                <input 
                                    type="text" 
                                    className="form-control ps-5 rounded-pill border-0 bg-light bg-opacity-10" 
                                    placeholder="Search by name or email..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ background: darkMode ? '#0f172a' : '#f1f5f9', color: darkMode ? '#fff' : '#000' }}
                                />
                            </div>
                        </div>
                        <div className="col-md-6 text-md-end">
                            <span className="badge bg-primary px-3 py-2 rounded-pill">Total Members: {members.length}</span>
                        </div>
                    </div>
                </div>

                {/* Members Table */}
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: darkMode ? "#1e293b" : "white" }}>
                    <div className="table-responsive">
                        <table className={`table table-hover align-middle mb-0 ${darkMode ? "table-dark" : ""}`}>
                            <thead className="small text-muted text-uppercase">
                                <tr>
                                    <th className="px-4 py-3">Member Info</th>
                                    <th className="py-3">Email Address</th>
                                    <th className="py-3">Registered Date</th>
                                    <th className="px-4 py-3 text-end">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMembers.map((member) => (
                                    <tr key={member.id}>
                                        <td className="px-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center" style={{width: 40, height: 40}}>
                                                    <Users size={20} className="text-primary"/>
                                                </div>
                                                <div className="fw-bold">{member.name}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 text-muted">{member.email}</td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center gap-2 small">
                                                <Calendar size={14} className="text-primary"/>
                                                {member.registeredDate || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-end">
                                            <button className="btn btn-sm btn-outline-danger border-0 rounded-pill p-2" onClick={() => deleteMember(member.id)}>
                                                <Trash2 size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <style>{`
                .table-dark { --bs-table-bg: #1e293b; --bs-table-color: #f1f5f9; --bs-table-hover-bg: #334155; }
            `}</style>
        </div>
    );
};

export default Members;