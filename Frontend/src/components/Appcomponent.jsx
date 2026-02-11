import { BrowserRouter,Routes,Route } from "react-router-dom";
import Login from "../assets/pages/Login/login.jsx"
import Layout from "./Layout";
import { AuthProvider } from "../assets/pages/Context/AuthContext.jsx";
import { Users } from "lucide-react";

function AppComponent(){
    return(<>
        {/* <BrowserRouter> */}
        <AuthProvider>
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/dashboard" element={<Layout/>}/>
                {/* <Route path="/users" element={<Users/>}/> */}
            </Routes>  
        </AuthProvider>      
        {/* </BrowserRouter> */}
    </>);
}

export default AppComponent