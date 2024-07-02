import React, { useEffect, useState } from "react";
import supabase from "../Supabase/client";

function TodoList() {
  const [todoData, setTodoData] = useState([]);

  useEffect(() => {
    fetchTodoData();
  }, []);

  const todo_channel = supabase
    .channel("todo_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "todo" },
      (payload) => {
        console.log(payload.new);
        setTodoData((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  async function fetchTodoData() {
    try {
      const { data, error } = await supabase.from("todo").select("*");
      console.log(data);
      if (error) {
        throw new Error(error.message);
      }
      setTodoData(data);
    } catch (error) {
      console.error("Error fetching todo data:", error);
    }
  }

  return (
    <ul>
      {todoData.map((todo) => (
        <li key={todo.id}>{todo.todo}</li>
      ))}
    </ul>
  );
}

export default TodoList;
