export const Login = async (username, password) => {
  const host = (import.meta.env.VITE_API_HOST || "http://127.0.0.1:8000").replace(/\/+$/, "");

  console.log("API Host:", host);

  const res = await fetch(`${host}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Invalid username or password");
  }

  const user = await res.json();
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};