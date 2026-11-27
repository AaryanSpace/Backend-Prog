import { useState } from "react";

// Props carry the customer name and ID from the parent.
// State counts updates while this component remains mounted.
export default function CustomerUpdateCounter({ customerName, customerId, onUpdateSuccess }) {
  const [updateCount, setUpdateCount] = useState(0);
  const [message, setMessage] = useState("");

  function handleUpdateClick() {
    // In VenueVista, call this only AFTER the existing Express PUT request succeeds.
    if (typeof onUpdateSuccess === "function") onUpdateSuccess();

    const nextCount = updateCount + 1;
    setUpdateCount(nextCount);
    const word = nextCount === 1 ? "time" : "times";
    setMessage(`Thank you, ${customerName} (Customer ID: ${customerId})! Your details have been updated ${nextCount} ${word}.`);
  }

  return (
    <section className="counter" aria-live="polite">
      <h2>Customer Update Status</h2>
      <p><strong>Customer Name:</strong> {customerName}</p>
      <p><strong>Customer ID:</strong> {customerId}</p>
      <p><strong>Update count:</strong> {updateCount}</p>
      <button type="button" onClick={handleUpdateClick}>Demonstrate Update Message</button>
      {message && <p className="message">{message}</p>}
    </section>
  );
}
