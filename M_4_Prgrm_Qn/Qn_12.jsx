/* Question 12 (10 Marks): Analyze this React code. Identify at least four
JSX/React problems and rewrite it correctly:
function card(){ return <div class='student'><h2>{name}</h2><p>Course: {course}<p></div> }
Problems: component names should start with a capital letter; JSX uses
className instead of class; name and course were not received as props; and
the paragraph element was not closed. */
function Card({ name, course }) {
  return (
    <div className="student">
      <h2>{name}</h2>
      <p>Course: {course}</p>
    </div>
  );
}

export default function App() {
  return <Card name="Asha" course="CSE" />;
}
