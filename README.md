# CampusConnect — Simple Course Demo

A frontend-only website for a one-credit Skill Lab project. Browse fictional campus projects, create an idea, join/leave a sample team, and change its status.

**No backend, MongoDB, environment variables, login, real users or API calls.** Everyone tries the app as **Demo Student**. All names and projects are samples. Changes are saved only in this browser using `localStorage`; clearing browser data removes them.

## Run

Install Node.js 20 or later. Open a terminal in `skill_lab_sem_3`:

```powershell
npm install
npm run dev
```

Open the local URL printed in the terminal, normally `http://localhost:5173`.

```powershell
npm run build
npm run test
```

Both commands type-check and build the website; `test` is a build check, not a separate automated test suite. Production files are generated in `client/dist`. For static hosting, route unknown page URLs to `index.html` so React Router works after refresh.

## Only six source files

```text
client/src/
├── main.tsx                   # Starts React and enables routing
├── App.tsx                    # Navigation, state and the three pages
├── data.ts                    # Project type, sample data, load/save
├── styles.css                 # All styling and mobile layout
└── components/
    ├── Primitives.tsx         # Small shared buttons, badges and alerts
    └── ProjectCard.tsx        # One reusable project card
```

The other files (`package.json`, `index.html`, `tsconfig.json`, `vite.config.ts`) configure npm, TypeScript and Vite. `node_modules` is downloaded library code, **not your source code**. Do not edit or submit it; `npm install` recreates it. You can collapse that folder in your editor.

## How to explain the code

1. **React components** are functions that return the page UI. There are three pages: project list, create form and project detail.
2. **`useState`** in `App.tsx` stores the project array. Pages receive the array as **props**.
3. A **callback** updates a project by replacing its entry using `map`. Creating a project adds an item with the spread operator.
4. **Join** adds `Demo Student` to the members array; **leave** removes it with `filter`. The button blocks joining a full or completed project. Project owners are already members and cannot leave.
5. The **status select** changes the project's status. Anyone can change it in this demo; there are no permissions or authentication rules.
6. **`useEffect`** saves the project array to `localStorage` when it changes. The app loads this data when opened again. If storage is blocked, it shows a warning and works in memory.
7. **React Router** selects a page based on its URL. **CSS** handles the colours, cards and responsive layout.

## Presentation checklist

- Browse the three sample projects and search by title or skill.
- Open Campus Events Board, join the team, reload, then leave.
- Open Digital Canteen Menu to demonstrate the full-team button.
- Change a project's status to Completed and show that joining is disabled.
- Create a new project; show Demo Student as the owner and first member.
- Reload to demonstrate browser storage.

To reset only this demo's data, use the browser console:

```javascript
localStorage.removeItem("campusconnect.demo.projects.v1");
location.reload();
```

## Git history and course scope

The earlier full-stack version is preserved on `feature/campusconnect-phase2`. This simplified version is on `demo/simple-campusconnect`. No old commits were discarded.

This is intentionally **not a full-stack application**. Check with your instructor if the marking rubric requires a backend or database before submitting. Do not describe browser storage as a database server or this demo as a real multi-user platform.
