import RoleLayout from "../../components/Layout/RoleLayout";
import { Outlet } from "react-router-dom";

function AdminPage() {
  return (
    <RoleLayout role="Admin">
      <Outlet />
    </RoleLayout>
  );
}
export default AdminPage;
