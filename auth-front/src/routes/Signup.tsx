import { useState } from "react";
import DefaultLayout from "../layout/DefaultLayout";
import { useAuth } from "../auth/AuthProvider";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthResponseError } from "../types/types";

export default function Signup() {
    const [name, setName] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorResponse, setErrorResponse] = useState('')

    const auth = useAuth();
    const goTo = useNavigate();

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        try {
            const response = await fetch("http://localhost:5000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({name, username, password }),
            });
            if (response.ok) {
                console.log("User created successfully!");
                setErrorResponse('');
                goTo('/login')
            } else {
                console.log("User creation failed!");
                const json = await response.json() as AuthResponseError;
                setErrorResponse(json.body.error);
                return;
            }
        } catch (error) {
            console.log(error);
        }
    }

    if (auth.isAuthenticated) {
        <Navigate to='/dashboard' />
    }

    return (
        <>
        <DefaultLayout>
            <form onSubmit={handleSubmit} className="form" >
                <h1>SignUp</h1>
                {!!errorResponse && <div className="errorMessage">{errorResponse}</div>}
                <label>Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => {setName(e.target.value)}}
                />
                <label>Username</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => {setUsername(e.target.value)}}
                />
                <label>Password</label>
                <input 
                    type="password"
                    value={password}
                    onChange={(e) => {setPassword(e.target.value)}}
                />
                <button >Create User</button>
            </form>
        </DefaultLayout>
        </>
    );
}