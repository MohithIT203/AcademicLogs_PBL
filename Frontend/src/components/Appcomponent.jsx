import { BrowserRouter } from "react-router-dom";
import Login from "../assets/pages/login";

function AppComponent(){
    return(<>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login/>}/>
            </Routes>        
        </BrowserRouter>
    </>);
}

export default AppComponent