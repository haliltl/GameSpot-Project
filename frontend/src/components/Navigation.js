import React from "react";
import { Link, useMatch, useResolvedPath } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Navigation() {
  const { isAuthenticated } = useAuth();

  return (
    <>
    
      <nav className="nav" >
        <Link to="/" id="title">Game Spotter</Link>
        <ul>
          <CustomLink to="/">Home</CustomLink>
          <CustomLink to="/search">Search</CustomLink>
          {isAuthenticated ? (
            <>
              <CustomLink to="/logout">Logout</CustomLink>
            </>
          ) : (
            <>
              <CustomLink to="/register">Register</CustomLink>
              <CustomLink to="/login">Login</CustomLink>
            </>
          )}

        </ul>
 
      </nav>
      
     
    </>
    
  );
};

function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to)
  const isActive = useMatch({ path: resolvedPath.pathname, end: true })

  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  )

}


