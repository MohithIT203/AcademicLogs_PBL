import { useState } from "react";
function Users() {
    const[users, setUsers] = useState([]);
    useEffect(async ()=>{
        try{
            const response = await axios.get(`${import.meta.env.VITE_SERVER_APP_URL}/all-students`, { withCredentials: true });
            setUsers(response.data);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    },[]);
    return(
        <>
            <h1>Manage Users</h1>
            <h2>All Students</h2>
            <ul>
                {users.map(user => (
                    <li key={user._id}>{user.name}</li>
                ))}
            </ul>
        </>
    );
}
export default Users;