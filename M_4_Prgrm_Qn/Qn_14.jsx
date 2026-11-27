/* Question 14 (10 Marks): Create a React Course Registration UI. Store at
least four courses in an array, render them with map(), pass each course
through props, provide a Register button, and use state to display the
selected course. */
import { useState } from 'react';

const courses = [
  { id: 'C1', name: 'Web Development' },
  { id: 'C2', name: 'Database Systems' },
  { id: 'C3', name: 'Computer Networks' },
  { id: 'C4', name: 'Operating Systems' }
];

function CourseCard({ course, onRegister }) {
  return (
    <article>
      <h2>{course.name}</h2>
      <button onClick={() => onRegister(course.name)}>Register</button>
    </article>
  );
}

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState('');

  return (
    <main>
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onRegister={setSelectedCourse}
        />
      ))}
      <p>
        {selectedCourse
          ? `Selected course: ${selectedCourse}`
          : 'No course selected'}
      </p>
    </main>
  );
}
