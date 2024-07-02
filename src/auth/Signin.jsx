import React from "react";
import supabase from "../Supabase/client";

const SignIn = () => {
  // creating a component for signup with google in supabase
  async function signIn() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    // making user sign in with google with redirect
  }
  return (
    <>
      <button onClick={signIn}>get going</button>
    </>
  );
};

export default SignIn;
