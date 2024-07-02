import React, { useState } from "react";
import supabase from "../Supabase/client";

function InsertData() {
  const [todo, setTodo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    supabase
      .from("todo")
      .insert([{ todo }])
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(todo);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Todo:
        <input
          type="text"
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
      </label>
      <button type="submit">Submit</button>
    </form>
  );
}

export default InsertData;
