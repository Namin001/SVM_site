async function test() {
  const res = await fetch('http://localhost:3000/api/posts?type=NEWSLETTER');
  if (res.ok) {
    const data = await res.json();
    console.log('Posts:', data.length);
    console.log(data);
  } else {
    console.log('Error:', res.status);
    console.log(await res.text());
  }
}
test();
