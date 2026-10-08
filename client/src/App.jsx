import { useEffect, useState } from "react";
import "./App.css";

// Lấy URL Backend từ biến môi trường Vite
// Nếu chạy local mà chưa có VITE_API_URL thì dùng localhost:5000
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
    const [students, setStudents] = useState([]);

    const [studentId, setStudentId] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [editingId, setEditingId] = useState(null);

    // Lấy danh sách sinh viên
    const getStudents = async () => {
        try {
            const response = await fetch(`${API_URL}/api/students`);
            const data = await response.json();

            setStudents(data);
        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    // Thêm hoặc sửa sinh viên
    const handleSubmit = async (e) => {
        e.preventDefault();

        const student = {
            studentId: studentId,
            name: name,
            email: email
        };

        try {
            if (editingId) {
                // Sửa
                await fetch(
                    `${API_URL}/api/students/${editingId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(student)
                    }
                );
            } else {
                // Thêm
                await fetch(`${API_URL}/api/students`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(student)
                });
            }

            // Xóa dữ liệu trong form
            setStudentId("");
            setName("");
            setEmail("");
            setEditingId(null);

            // Lấy lại danh sách
            getStudents();

        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    // Chọn sinh viên để sửa
    const handleEdit = (student) => {
        setStudentId(student.studentId);
        setName(student.name);
        setEmail(student.email);

        setEditingId(student._id);
    };

    // Xóa sinh viên
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa sinh viên này?")) {
            return;
        }

        try {
            await fetch(
                `${API_URL}/api/students/${id}`,
                {
                    method: "DELETE"
                }
            );

            getStudents();

        } catch (error) {
            console.error("Lỗi:", error);
        }
    };

    return (
        <div className="page">

            <div className="container">

                <h1>Quản lý sinh viên - Version 2.0</h1>

                <h2>
                    {editingId ? "Sửa sinh viên" : "Thêm sinh viên"}
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

                    <button type="submit">
                        {editingId ? "Cập nhật sinh viên" : "Thêm sinh viên"}
                    </button>

                </form>

                <h2>Danh sách sinh viên</h2>

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

                        {students.map((student, index) => (

                            <tr key={student._id}>

                                <td>{index + 1}</td>

                                <td>{student.studentId}</td>

                                <td>{student.name}</td>

                                <td>{student.email}</td>

                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEdit(student)}
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(student._id)}
                                    >
                                        Xóa
                                    </button>
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default App;