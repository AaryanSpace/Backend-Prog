/* Question 13 (10 Marks): Analogy-based question: Think of React as LEGO.
Components are reusable blocks, props are information supplied to a block,
and state is changing memory. Design ProductCard with name/price as props and
an Add-to-Cart counter using state. Explain the choices. */
import { useState } from 'react';

function ProductCard({ name, price }) {
  const [cartCount, setCartCount] = useState(0);

  return (
    <article>
      <h2>{name}</h2>
      <p>Price: Rs. {price}</p>
      <p>Items in cart: {cartCount}</p>
      {/* Props describe this product; state tracks its changing cart count. */}
      <button onClick={() => setCartCount(cartCount + 1)}>Add to Cart</button>
    </article>
  );
}

export default function App() {
  return <ProductCard name="Notebook" price={50} />;
}
