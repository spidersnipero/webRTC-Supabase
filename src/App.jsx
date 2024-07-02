import { useEffect, useState } from "react";
import supabase from "./Supabase/client";
import { Routes, Route } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import SignIn from "./auth/Signin";
import Home from "./home/Home";
import VideoCall from "./video/VideoCall";

function App() {
  const [user, setUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(false);
      const user = session?.user;
      console.log(session);
      setUser(user ?? false);
      nav("/");
    });
  }, []);
  if (loading) return <h1>Loading...</h1>;

  return (
    <>
      <Routes>
        <Route path="/" element={<VideoCall />} />
      </Routes>
    </>
  );
}

export default App;
