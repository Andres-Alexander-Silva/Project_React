import React, { MouseEvent } from "react";
import { useAuth } from "../auth/AuthProvider";

interface PortalLayoutProps {
    children?: React.ReactNode;
}

export default function PortalLayout ( { children }: PortalLayoutProps ) {
    const auth = useAuth();

    async function handleSignOut ( e: MouseEvent ) {
        e.preventDefault();
        
        try {
            const response = await fetch("http://localhost:5000/api/signout", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + auth.getRefreshToken + ""
                },
            });
            if (response.ok){
                auth.signOut();
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <header>
                <nav>
                    <ul>
                        <li>
                            <a href="#" onClick={handleSignOut}>
                                Sign Out
                            </a>
                        </li>
                    </ul>
                </nav>
            </header>
            <main> { children } </main>
        </>
    )
}