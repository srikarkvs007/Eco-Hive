import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import toast from 'react-hot-toast';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/users');
            setUsers(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching users:", err);
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axios.delete(`http://localhost:5001/api/users/${id}`);
                setUsers(users.filter(u => u.id !== id));
                toast.success('User deleted successfully');
            } catch (err) {
                toast.error('Failed to delete user');
            }
        }
    };

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bolder" style={{ color: 'var(--text-primary)' }}>User Management</h2>
                    <p className="text-muted mb-0">View, manage, and remove registered users.</p>
                </div>
                <span className="badge bg-primary fs-6 shadow-sm px-3 py-2 rounded-pill">{users.length} Total Users</span>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary"></div>
                </div>
            ) : (
                <div className="premium-card p-4">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="table-light text-uppercase small text-muted">
                                <tr>
                                    <th className="fw-medium px-3 py-3 border-0 rounded-start">Name</th>
                                    <th className="fw-medium px-3 py-3 border-0">Email</th>
                                    <th className="fw-medium px-3 py-3 border-0">Role</th>
                                    <th className="fw-medium px-3 py-3 border-0">Eco-Points</th>
                                    <th className="fw-medium px-3 py-3 border-0">Joined</th>
                                    <th className="fw-medium px-3 py-3 border-0 text-end rounded-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id}>
                                        <td className="px-3 py-3">
                                            <div className="fw-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</div>
                                        </td>
                                        <td className="px-3 py-3 text-muted">{user.email}</td>
                                        <td className="px-3 py-3">
                                            <span className={`badge rounded-pill px-2 py-1 ${user.role === 'Admin' ? 'bg-danger' : 'bg-success bg-opacity-25 text-success border border-success border-opacity-25'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-muted fw-medium">{user.ecoPoints || 0}</td>
                                        <td className="px-3 py-3 text-muted">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-3 py-3 text-end">
                                            <button 
                                                className="btn btn-sm btn-outline-danger rounded-pill px-3" 
                                                onClick={() => handleDeleteUser(user.id)}
                                                disabled={user.role === 'Admin'} // Cannot delete other admins from here for safety
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && (
                            <div className="text-center py-4 text-muted">No users found.</div>
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default AdminUsers;
