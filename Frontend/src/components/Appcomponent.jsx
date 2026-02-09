import { BrowserRouter,Routes,Route } from "react-router-dom";
import Login from "../assets/pages/Login/login.jsx"
import Layout from "./Layout";

function AppComponent(){
    return(<>
        {/* <BrowserRouter> */}
            <Routes>
                <Route path="/" element={<Login/>}/>
                <Route path="/dashboard" element={<Layout/>}/>
            </Routes>        
        {/* </BrowserRouter> */}
    </>);
}

export default AppComponent