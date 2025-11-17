import RoleLayout from "../../components/Layout/RoleLayout";
import { Outlet } from "react-router-dom";

function StaffPage() {
  return (
    <RoleLayout role="Staff">
      <Outlet />
    </RoleLayout>
  );
}
export default StaffPage;
