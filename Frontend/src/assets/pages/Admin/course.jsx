import {useState,useEffect} from "react";
import axios from "axios";

function Course() {
    const [data, setData] = useState([]);

    useEffect(()=>{
        try{
            const response = axios.get(
          `${import.meta.env.VITE_SERVER_APP_URL}/all-course`,
          { withCredentials: true },
        );
        setData(response.data.data.courses);
        }catch(err){
            console.log(err);
        }
    },[])
    return(<>
        <div>Courses Page</div>    
        <div>

        </div>
    </>)
}

export default Course;