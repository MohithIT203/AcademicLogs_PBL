import { BrowserRouter,Routes,Route } from "react-router-dom";
import Login from "../assets/pages/Login/login.jsx"
import Layout from "./Layout";
import Users from "../assets/pages/Admin/users.jsx";
import Dashboard from "../assets/pages/Admin/dashboard.jsx";


function AppComponent(){
    return(<>
        {/* <BrowserRouter> */}
        <Routes> <Route path="/" element={<Login/>}/></Routes>
        <Layout>
            <Routes>
                <Route path="/dashboard" element={<Dashboard/>}/>
                <Route path="/users" element={<Users/>}/>
            </Routes>     
        </Layout>   
        {/* </BrowserRouter> */}
    </>);
}

export default AppComponent