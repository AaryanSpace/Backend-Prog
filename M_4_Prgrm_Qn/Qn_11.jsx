/* Question 11 (10 Marks): Develop a React Student Profile application using
JSX and props. StudentProfile must receive name, course and year and display
all three. Show two students using the same reusable component. */
function StudentProfile({ name, course, year }) {
  return (
    <article>
      <h2>{name}</h2>
      <p>Course: {course}</p>
      <p>Year: {year}</p>
    </article>
  );
}

export default function App() {
  return (
    <main>
      <StudentProfile name="Asha" course="CSE" year={2} />
      <StudentProfile name="Ravi" course="ECE" year={3} />
    </main>
  );
}
