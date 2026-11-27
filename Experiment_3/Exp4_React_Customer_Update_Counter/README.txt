EXPERIMENT 4 — REACT CUSTOMER UPDATE COUNTER

This React.js demo applies the concepts in your Module 4 slides:
- Component: CustomerUpdateCounter is a reusable function component.
- Props: customerName and customerId are passed from App to the child component.
- State: useState(0) tracks the update count and re-renders the message after each click.
- Event: onClick calls handleUpdateClick().

RUN:
1. Extract this ZIP and open its folder in VS Code.
2. Open a terminal in this folder.
3. Run: npm install
4. Run: npm run dev
5. Open the local URL Vite prints.

Expected message on first, second and third clicks:
Thank you, Aaryan Sah (Customer ID: VV001)! Your details have been updated 1 time.
Thank you, Aaryan Sah (Customer ID: VV001)! Your details have been updated 2 times.
Thank you, Aaryan Sah (Customer ID: VV001)! Your details have been updated 3 times.

IMPORTANT:
This is a separate React demo; it does not alter your Experiment 3 files.
Your existing VenueVista frontend is plain HTML/JavaScript. JSX needs a React build setup such as Vite, so do not simply add this JSX file to an ordinary HTML script tag.
When integrating with VenueVista, call the state update only after the existing Express PUT request succeeds. Pass the selected customer's name and ID as props. Do not count new bookings or revised bookings as updates. Keep Customer ID and customer name non-editable.

The count starts at zero and is held in React state while the component is mounted. Refreshing/remounting resets it. Persistent counts require backend or browser storage.
