import RoleLayout from "../../components/Layout/RoleLayout";
import { Outlet } from "react-router-dom";

function UserPage() {
  return (
    <RoleLayout role="User">
      <Outlet />
    </RoleLayout>
  );
}
export default UserPage;

