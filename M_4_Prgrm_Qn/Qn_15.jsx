/* Question 15 (10 Marks): Create a mini Student Dashboard combining
components, props, state, list rendering and a controlled search input.
Display at least three students and show only matching students as the user
types. */
import { useState } from 'react';

const students = [
  { id: 'S101', name: 'Asha', course: 'CSE' },
  { id: 'S102', name: 'Ravi', course: 'ECE' },
  { id: 'S103', name: 'Meena', course: 'CSE' }
];

function StudentRow({ student }) {
  return (
    <li>
      {student.name} - {student.course}
    </li>
  );
}

export default function App() {
  const [search, setSearch] = useState('');
  const matchingStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main>
      <h1>Student Dashboard</h1>
      {/* The input value is controlled by React state. */}
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search students"
        aria-label="Search students"
      />
      <ul>
        {matchingStudents.map((student) => (
          <StudentRow key={student.id} student={student} />
        ))}
      </ul>
      {matchingStudents.length === 0 && <p>No matching students.</p>}
    </main>
  );
}
