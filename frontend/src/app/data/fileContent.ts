export const exampleFileContent = `import { useState } from 'react';

export function ExampleComponent() {
  const [count, setCount] = useState(0);

  return (
    <div className="container">
      <h1>Counter Example</h1>
      <p>Current count: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}`;

export const fileAuthor = {
  name: 'Sarah Developer',
  avatar: 'S',
  updated: 'Updated 2 hours ago',
};
