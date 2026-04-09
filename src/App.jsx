import { Navigate, Route, Routes } from "react-router-dom";
import AdminOutlet from "./components/AdminOutlet.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import EmployeeDetail from "./pages/EmployeeDetail.jsx";
import EmployeeForm from "./pages/EmployeeForm.jsx";
import EmployeeList from "./pages/EmployeeList.jsx";
import EmployeeProfile from "./pages/EmployeeProfile.jsx";
import Login from "./pages/Login.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<EmployeeProfile />} />
        <Route path="employees" element={<AdminOutlet />}>
          <Route index element={<EmployeeList />} />
          <Route path="new" element={<EmployeeForm />} />
          <Route path=":id" element={<EmployeeDetail />} />
          <Route path=":id/edit" element={<EmployeeForm />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
