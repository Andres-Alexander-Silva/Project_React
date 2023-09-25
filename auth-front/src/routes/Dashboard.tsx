import { useAuth } from "../auth/AuthProvider";
import PortalLayout from "../layout/PortalLayout";

export default function Dashboard() {
    const auth = useAuth();
    return (
        <PortalLayout>
            <h1>Dashboard {auth.getUser()?.name}</h1>
        </PortalLayout>
    );
}