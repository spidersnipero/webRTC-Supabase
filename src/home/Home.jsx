import React from "react";
import supabase from "../Supabase/client";
import InsertData from "./insertData";
import TodoList from "./data";

const Home = () => {
  async function signoutUser() {
    await supabase.auth.signOut();
  }
  return (
    <div>
      <button onClick={signoutUser}>signout</button>
      <InsertData />
      <TodoList />
    </div>
  );
};

export default Home;
