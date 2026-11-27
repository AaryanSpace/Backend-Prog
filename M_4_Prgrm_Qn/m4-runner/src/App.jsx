/* Question 10 (5 Marks): Why is the key prop used when rendering a list with
map()? Write a short student-list example. */
const students = [
  { id: 'S101', name: 'Asha' },
  { id: 'S102', name: 'Ravi' }
];

export default function App() {
  // A stable unique key helps React identify each list item between renders.
  return (
    <ul>
      {students.map((student) => (
        <li key={student.id}>{student.name}</li>
      ))}
    </ul>
  );
}
