/* Question 7 (5 Marks): Write a React function component named StudentCard
that receives name and course as props and displays them. Show how App passes
values. */
function StudentCard({ name, course }) {
  return (
    <article>
      <h2>{name}</h2>
      <p>Course: {course}</p>
    </article>
  );
}

export default function App() {
  // Pass values to a reusable component through props.
  return <StudentCard name="Asha" course="Computer Science" />;
}
