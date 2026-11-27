/* Question 8 (5 Marks): Write a React component using useState to create a
counter that increases by 1 whenever a button is clicked. */
import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <main>
      <p>Count: {count}</p>
      {/* Updating state asks React to render the new count. */}
      <button onClick={() => setCount(count + 1)}>Increase</button>
    </main>
  );
}
