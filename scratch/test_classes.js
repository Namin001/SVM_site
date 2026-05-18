fetch('http://localhost:3000/api/classes').then(res => res.json()).then(console.log).catch(console.error);
fetch('http://localhost:3000/api/users').then(res => res.json()).then(data => {
  const users = data.users;
  console.log("First user:", users[0]);
});
