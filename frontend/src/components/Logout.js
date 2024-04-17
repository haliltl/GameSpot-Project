import {useEffect} from "react";

const Logout = () => {
  useEffect(() => {
    const logout = async () => {
      const response = await fetch("http://localhost:3000/auth/logout", {
        method: "POST"
      });
    }
    window.location.href = "/";
  }, []);
}

export default Logout;