import CustomerUpdateCounter from "./CustomerUpdateCounter.jsx";
import "./style.css";

export default function App() {
  // Demo props; in VenueVista pass the selected booking's actual customer details.
  const customer = { customerName: "Aaryan Sah", customerId: "VV001" };
  return (
    <main className="page">
      <h1>Experiment 4: React.js</h1>
      <p className="subtitle">Components, Props and State — Customer Update Counter</p>
      <CustomerUpdateCounter
        customerName={customer.customerName}
        customerId={customer.customerId}
        onUpdateSuccess={() => console.log("Successful update callback")}
      />
    </main>
  );
}
