import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [students, setStudents] = useState([]);

    const [studentId, setStudentId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    // Lấy danh sách sinh viên thông qua Nginx Reverse Proxy
    const getStudents = async () => {
        try {
            const response = await fetch("/api/students");

            if (!response.ok) {
                throw new Error("Không thể lấy danh sách sinh viên");
            }

            const data = await response.json();
            setStudents(data);
            setMessage("");
        } catch (error) {
            console.error("Lỗi:", error);
            setMessage("Không thể kết nối Backend. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    // Thêm hoặc sửa sinh viên
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        const student = {
            studentId,
            name,
            email
        };

        try {
            let response;

            if (editingId) {
                response = await fetch(`/api/students/${editingId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(student)
                });
            } else {
                response = await fetch("/api/students", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(student)
                });
            }

            if (!response.ok) {
                throw new Error("Không thể lưu thông tin sinh viên");
            }

            setStudentId("");
            setName("");
            setEmail("");
            setEditingId(null);

            setMessage(
                editingId
                    ? "Cập nhật sinh viên thành công!"
                    : "Thêm sinh viên thành công!"
            );

            await getStudents();
        } catch (error) {
            console.error("Lỗi:", error);
            setMessage(error.message || "Đã xảy ra lỗi khi lưu sinh viên.");
        }
    };

    // Chọn sinh viên để sửa
    const handleEdit = (student) => {
        setStudentId(student.studentId || "");
        setName(student.name || "");
        setEmail(student.email || "");
        setEditingId(student._id);
        setMessage("");
    };

    // Hủy sửa
    const handleCancelEdit = () => {
        setStudentId("");
        setName("");
        setEmail("");
        setEditingId(null);
        setMessage("");
    };

    // Xóa sinh viên
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa sinh viên này?")) {
            return;
        }

        try {
            const response = await fetch(`/api/students/${id}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error("Không thể xóa sinh viên");
            }

            setMessage("Xóa sinh viên thành công!");
            await getStudents();
        } catch (error) {
            console.error("Lỗi:", error);
            setMessage(error.message || "Đã xảy ra lỗi khi xóa sinh viên.");
        }
    };

    return (
        <div className="page">
            <div className="container">
                <header className="app-header">
                    <div>
                        <h1>Quản lý sinh viên</h1>
                        <p>Hệ thống quản lý thông tin sinh viên</p>
                    </div>

                    <span className="version-badge">Frontend v2.0</span>
                </header>

                <div className="system-status">
                    <span className="status-dot"></span>
                    <span>Ứng dụng phiên bản 2.0</span>
                </div>

                {message && (
                    <div className="message" role="status">
                        {message}
                    </div>
                )}

                <section className="form-section">
                    <h2>
                        {editingId ? "Cập nhật sinh viên" : "Thêm sinh viên"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="MSSV"
                            value={studentId}
                            onChange={(e) => setStudentId(e.target.value)}
                            required
                        />

                        <input
                            type="text"
                            placeholder="Họ tên"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="form-actions">
                            <button type="submit">
                                {editingId
                                    ? "Cập nhật sinh viên"
                                    : "Thêm sinh viên"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                >
                                    Hủy sửa
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="student-section">
                    <div className="section-heading">
                        <h2>Danh sách sinh viên</h2>
                        <span className="student-count">
                            {students.length} sinh viên
                        </span>
                    </div>

                    {loading ? (
                        <p>Đang tải danh sách sinh viên...</p>
                    ) : (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>MSSV</th>
                                        <th>Họ tên</th>
                                        <th>Email</th>
                                        <th>Thao tác</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {students.length > 0 ? (
                                        students.map((student, index) => (
                                            <tr key={student._id}>
                                                <td>{index + 1}</td>
                                                <td>{student.studentId}</td>
                                                <td>{student.name}</td>
                                                <td>{student.email}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn-edit"
                                                        onClick={() =>
                                                            handleEdit(student)
                                                        }
                                                    >
                                                        Sửa
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="btn-delete"
                                                        onClick={() =>
                                                            handleDelete(
                                                                student._id
                                                            )
                                                        }
                                                    >
                                                        Xóa
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5">
                                                Chưa có sinh viên hoặc chưa tải
                                                được dữ liệu.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <footer className="app-footer">
                    Student Management System · Frontend v2.0
                </footer>
            </div>
        </div>
    );
}

export default App;
