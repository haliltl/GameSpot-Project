import {useEffect} from "react";

const Logout = () => {
  useEffect(() => {
    localStorage.removeItem('token');
    window.location.href = "/";
  }, []);
}

export default Logout;