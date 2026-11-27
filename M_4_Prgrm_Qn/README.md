# Module 4 - React.js Answers

Each `Qn_*.jsx` file exports a standalone React component. React and Vite are
already installed in the neighboring `Module_4\react` project.

To run an answer, import its default component in that project's
`src\main.jsx` and render it with React. For example:

```jsx
import Example from '../../../M_4_Prgrm_Qn/Qn_14.jsx';
```

Keep the existing `createRoot(...).render(...)` call and render `<Example />`.
Then start the Vite server from `Module_4\react`:

```powershell
npm run dev
```

Do not replace an existing `src\App.jsx` or `src\main.jsx` without saving your
current work first.
