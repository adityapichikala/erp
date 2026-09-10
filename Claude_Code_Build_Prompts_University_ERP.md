# Claude Code Build Prompts — University ERP (Module-by-Module)

**How to use this file:**
- Run these prompts **in order**, in the same project folder, inside Claude Code.
- After each prompt finishes, **review the diff, run the app, commit** (`git add -A && git commit -m "..."`) before moving to the next prompt. Don't chain multiple prompts without checking the output — each one builds on the last.
- Each prompt is self-contained: it restates the tech stack and relevant context so Claude Code doesn't need to re-read your mind.
- Tech stack locked in below — don't change it mid-way or later prompts will conflict.

**Tech stack (used in every prompt):**
- Next.js (App Router) + TypeScript
- Prisma ORM + SQLite for local dev (schema written to be Postgres-compatible from day one)
- Tailwind CSS
- Auth: custom JWT in httpOnly cookie (no third-party auth vendor, so it's portable anywhere)
- File uploads: stored to local `/uploads` folder in dev, behind a storage abstraction so the production target is a config swap, not a rewrite

**Database & storage decision — Supabase:**
This build uses **Supabase** for Postgres (managed, with Row-Level Security available if you want a second enforcement layer beyond app-level RBAC) and **Supabase Storage** for file uploads. This is a deliberate choice because it's host-agnostic — the app itself can still deploy to Vercel, Render, or AWS unchanged, since Supabase is just an external Postgres connection string + a JS client, not tied to any of them.

One thing that matters specifically for Vercel: serverless functions open a new DB connection per invocation, which exhausts Postgres's connection limit fast. Use Supabase's **connection pooler** (port 6543, "Transaction" mode) for `DATABASE_URL` in any serverless deployment, not the direct connection (port 5432) — Prisma needs `?pgbouncer=true` appended in that case. Render/AWS (long-running servers) can use either.

**Deployment target compatibility — read this before you start:**
This build is designed to deploy to **Vercel, Render, or AWS** without rewriting anything:

| | Vercel | Render | AWS (ECS/Fargate) |
|---|---|---|---|
| Runtime | Serverless functions (stateless, no persistent disk) | Long-running Node server (persistent disk available) | Long-running container (full control) |
| Database | Supabase Postgres via pooled connection (required) | Supabase Postgres (pooled or direct) | Supabase Postgres (pooled or direct) |
| File uploads | Supabase Storage (required — no local disk on Vercel) | Supabase Storage (recommended for consistency) | Supabase Storage (recommended for consistency) |
| Best fit for this project | Fastest to demo, zero server management | Middle ground — simplest "real server" option, cheap | Most control, most setup, matches enterprise IT expectations |

**Practical decision:** since Supabase Storage works identically on all three hosts, build the storage abstraction (`lib/storage.ts`) around Supabase Storage from **Prompt 0**, not bolted on later — the same code then runs unchanged wherever you deploy the app itself.

---

## Prompt 0 — Project Foundation & Tooling

```
Create a new Next.js 14 App Router project in TypeScript called "university-erp".

Set up:
- Tailwind CSS configured
- Prisma ORM with **PostgreSQL** provider, pointed at a **Supabase** project (env var `DATABASE_URL` using the Supabase connection pooler string, e.g. `postgresql://...pooler.supabase.com:6543/postgres?pgbouncer=true`, plus a separate `DIRECT_URL` using the non-pooled port 5432 connection for running migrations — Prisma needs both: `directUrl` in schema.prisma for migrations, pooled `url` for runtime queries)
- Install `@supabase/supabase-js` and create `lib/supabase.ts` exporting a configured client (using `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` env vars — service role key only, since all access control is enforced in our own API routes, not via Supabase client-side auth)
- ESLint + Prettier
- A `.env.example` file listing: DATABASE_URL, DIRECT_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET, JWT_SECRET, NODE_ENV
- Folder structure:
  /app
    /(auth)/login
    /(dashboard)/[role]  -- placeholder, we'll build role dashboards later
    /api
  /lib        -- shared utilities (db client, auth helpers, storage, supabase client)
  /components -- shared UI components
  /prisma

Build a storage abstraction now, not later — this project must run on Vercel (no persistent disk) as well as Render/AWS, and we're standardizing on Supabase Storage everywhere so the same code works on all three hosts:
- lib/storage.ts exporting `uploadFile(buffer, path, contentType): Promise<string>` (uploads to the Supabase Storage bucket named by `SUPABASE_STORAGE_BUCKET`, returns the storage path) and `getFileUrl(path): Promise<string>` (returns a signed URL — assignment submissions and admissions documents should NOT be public buckets, use short-lived signed URLs for viewing).
- No page or API route should ever touch the local filesystem for user-uploaded content — always call through lib/storage.ts. Every later prompt that mentions file uploads (assignments, admissions documents, certificates) must use this.
- Print instructions at the end for creating the Supabase project, the storage bucket, and copying the four Supabase-related env vars — assume I'll create the actual Supabase project myself and paste in the values.

Add a root layout with a clean base theme (not the default Next.js starter look): 
- Base palette: deep navy (#12213C) for primary actions, warm off-white (#FAF8F3) background, slate gray (#5B6472) for secondary text, a single accent color of muted gold (#C9A24B) used sparingly for highlights/badges only.
- Typography: one serif display face for headings (e.g. "Source Serif 4") and one clean sans for body/UI (e.g. "Inter"). Load via next/font.
- This is an institutional/academic product, not a SaaS dashboard — avoid rounded-card-with-shadow templated look. Favor clear hairline dividers, generous whitespace, and a structured grid over floating cards.

Do not build any pages or features yet beyond a placeholder home page confirming the stack is wired up (Tailwind classes render, Prisma client connects). Print a confirmation of what was set up at the end.
```

---

## Prompt 1 — Full Database Schema (Prisma)

```
Using the existing Next.js + Prisma (PostgreSQL via Supabase) project, write the COMPLETE prisma/schema.prisma covering every module of a university ERP. Remember the datasource block needs both `url = env("DATABASE_URL")` (pooled) and `directUrl = env("DIRECT_URL")` (direct connection, used only for migrations) as set up in Prompt 0. Use these entities (add reasonable fields/timestamps/relations beyond what's listed — this is the minimum):

College(id, name, address, createdAt)
Department(id, name, collegeId, hodUserId)
User(id, name, email, passwordHash, role [enum: SUPER_ADMIN, COLLEGE_ADMIN, HOD, TEACHER, TA, STUDENT, REGISTRAR, FINANCE, LIBRARIAN, HOSTEL_WARDEN, HR, PLACEMENT_OFFICER, PARENT], collegeId, departmentId nullable, status [ACTIVE, INACTIVE], createdAt)
Class(id, name, departmentId, semester, batchYear)
CourseEnrollment(id, studentId, courseId, classId)
Course(id, name, code, departmentId, credits, teacherId)
Admission(id, applicantName, email, phone, programAppliedFor, documentsUrl, status [PENDING, APPROVED, REJECTED, WAITLISTED], meritScore, createdAt)
TimetableSlot(id, courseId, classId, dayOfWeek, startTime, endTime, room)
Attendance(id, studentId, courseId, date, status [PRESENT, ABSENT, LATE])
Assignment(id, courseId, teacherId, title, description, dueDate, maxMarks, rubric, allowedFileTypes, createdAt)
Submission(id, assignmentId, studentId, fileUrl, submittedAt, version, status [SUBMITTED, LATE, RESUBMITTED])
Grade(id, submissionId, score, feedback, gradedByUserId, gradedAt, aiSuggestedScore nullable)
Exam(id, courseId, examDate, examType [MIDTERM, FINAL, QUIZ], maxMarks)
ExamResult(id, examId, studentId, marksObtained, grade, publishedAt nullable)
FeeStructure(id, programName, batchYear, amount, dueDate)
FeeRecord(id, studentId, feeStructureId, amountPaid, paymentDate, status [PENDING, PAID, OVERDUE, WAIVED], transactionRef)
LibraryItem(id, title, author, isbn, totalCopies, availableCopies)
LibraryIssue(id, itemId, studentId, issuedAt, dueAt, returnedAt nullable, fineAmount)
HostelRoom(id, block, roomNumber, capacity)
HostelAllocation(id, studentId, roomId, allocatedAt, vacatedAt nullable)
Employee(id, userId, designation, departmentId, salaryBand, joinedAt)
LeaveRequest(id, employeeId, startDate, endDate, reason, status [PENDING, APPROVED, REJECTED])
PlacementDrive(id, companyName, role, eligibilityCriteria, driveDate, packageOffered)
PlacementApplication(id, driveId, studentId, status [APPLIED, SHORTLISTED, INTERVIEWED, OFFERED, REJECTED])
Notification(id, title, body, targetRole nullable, targetDepartmentId nullable, targetClassId nullable, createdByUserId, createdAt)
Certificate(id, studentId, type [BONAFIDE, TRANSCRIPT, NO_DUES], issuedAt, fileUrl)
AgentActionLog(id, agentName, actionType, targetEntity, status, approvedByUserId nullable, details, timestamp)

Requirements:
- Add proper @relation fields and foreign keys everywhere.
- Add `collegeId` scoping on tables where multi-tenant isolation matters.
- Add createdAt/updatedAt timestamps on every model.
- After writing the schema, run `npx prisma migrate dev --name init` against the Supabase DIRECT_URL and confirm it applies cleanly (this creates the tables in your actual Supabase project — check the Supabase Table Editor to confirm they appear).
- Write a short prisma/seed.ts that creates: 1 college, 2 departments, one user per role (with role name in the email e.g. teacher@demo.edu, student@demo.edu, all password "Demo1234!"), a couple of courses/classes, and leave everything else empty for now (we'll seed module-specific data in later prompts).
- Confirm the seed runs successfully and print the created demo login credentials at the end.
```

---

## Prompt 2 — Authentication & RBAC Middleware

```
Build authentication and role-based access control for this Next.js + Prisma project.

Requirements:
1. POST /api/auth/login — validates email/password against User table (bcrypt compare), issues a JWT (role, userId, collegeId, departmentId in payload) as an httpOnly, secure cookie named `session`.
2. POST /api/auth/logout — clears the cookie.
3. lib/auth.ts — helper `getSessionUser(req)` that reads and verifies the JWT from cookies, returns the decoded user or null.
4. lib/rbac.ts — a `requireRole(allowedRoles: Role[])` wrapper for API route handlers that returns 401/403 appropriately if the session is missing or the role isn't allowed. Also add a `requireScope` helper stub for later per-record scoping (e.g., a teacher can only touch their own course's data) — leave a clear TODO comment showing where each module will plug in its own scope check.
5. middleware.ts at the project root — redirects unauthenticated users hitting any /app/(dashboard)/* route to /login, and redirects authenticated users away from /login to their role's dashboard route.
6. A clean, minimal /login page (server component + client form) matching the established visual theme (navy/off-white/gold, serif headings). Show a clear error message on bad credentials — don't reveal whether it was the email or password that was wrong.
7. After login, redirect each role to /dashboard/[role-slug] (e.g. /dashboard/student, /dashboard/teacher) — for now these can be simple placeholder pages that just print "Welcome, {name} ({role})" — full dashboards come in a later prompt.

Test the full flow using the seeded demo accounts from Prompt 1 and confirm each role reaches its own placeholder dashboard and that logout works.
```

---

## Prompt 3 — User, Department & Admissions Module

```
Build the User/Identity Management and Admissions modules.

User/Identity (Admin-only, use requireRole(['SUPER_ADMIN','COLLEGE_ADMIN'])):
- /dashboard/admin/users — table of all users (name, email, role, department, status), with search and role filter.
- Create/edit user form (with role + department assignment).
- Bulk import via CSV upload (columns: name, email, role, department) — parse and create users, show a summary of successes/failures after import. Generate a random temp password for each and display it in the results table (don't email it yet, just show it).
- Deactivate/reactivate a user (soft delete via status field, never hard-delete).

Admissions (Admin + Registrar can view/manage; public-facing apply form is unauthenticated):
- Public page /apply — a form for applicant name, email, phone, program applied for, document upload (PDF/image), stored via the lib/storage.ts abstraction from Prompt 0 (path prefix `admissions/`) — do not write directly to disk.
- /dashboard/admin/admissions — list of applications with status filter, ability to change status (PENDING/APPROVED/REJECTED/WAITLISTED) and enter a merit score.
- When an application is marked APPROVED, show a manual "Convert to Student" action that creates a User with role STUDENT and a Department/Class assignment (dropdown), linked back to the admission record.

Use the existing auth/RBAC helpers from Prompt 2. Match the established visual theme. Confirm both modules work end-to-end with a test user going through apply → approve → convert to student → that student can log in.
```

---

## Prompt 4 — Academic Management, Timetable & Attendance

```
Build Academic Management, Timetable, and Attendance modules.

Academic Management (Admin/HOD manage; everyone else views):
- /dashboard/admin/courses — CRUD for Course (name, code, department, credits, assign teacher from a dropdown of TEACHER-role users in that department).
- /dashboard/admin/classes — CRUD for Class (name, department, semester, batch year), with a way to bulk-enroll students into a class (multi-select from student list) which creates CourseEnrollment records for all that class's courses.

Timetable:
- /dashboard/admin/timetable — a weekly grid builder: pick a class, then assign courses to day/time/room slots. Show conflict warnings if a teacher or room is double-booked at the same time.
- /dashboard/student/timetable and /dashboard/teacher/timetable — read-only weekly grid view scoped to the logged-in user's classes/courses (use requireScope pattern from Prompt 2: student sees their class's timetable, teacher sees only their assigned courses).

Attendance:
- /dashboard/teacher/attendance — teacher picks one of their courses + a date, sees the enrolled student roster, marks each PRESENT/ABSENT/LATE, saves in one submit. Prevent marking attendance for a future date.
- /dashboard/student/attendance — student sees their own attendance % per course, with a visual indicator (e.g., red if below 75%) and a table of daily records.
- /dashboard/admin/attendance-report — attendance % summary across all classes/courses, filterable by department.

Enforce scoping strictly: a teacher's attendance API must reject requests for courses they don't teach, verified server-side, not just hidden in the UI. Confirm this with a quick test: log in as a teacher and try to hit another teacher's course attendance API directly — it should 403.
```

---

## Prompt 5 — Assignments, Submissions & Grading (Headline Feature)

```
Build the full Assignment upload → Teacher grading workflow. This is the most important module — build it properly with polish and correct authorization.

Teacher side:
- /dashboard/teacher/assignments — list assignments the teacher created, grouped by course. "Create assignment" form: title, description, course (dropdown of their own courses only), due date, max marks, rubric text, allowed file types (checkboxes: pdf, docx, image, zip, code file extensions).
- /dashboard/teacher/assignments/[id] — submissions list for that assignment: student name, submitted at, status (on-time/late), a "Grade" action per row.
- Grading view: shows the submitted file inline if it's a PDF/image (use an <iframe> or <img>; for other types, show a download link), a score input bounded to maxMarks, a feedback textarea, and a Save button. Store gradedByUserId and gradedAt. Once graded, show "Graded by {name} on {date}" and allow re-editing with the change logged (store previous score/feedback in a simple JSON history field or a separate GradeHistory table — add one if needed).

Student side:
- /dashboard/student/assignments — list of assignments for their enrolled courses, with due date, status (Not submitted / Submitted / Graded), and score once available.
- Upload flow: file picker restricted client-side to the assignment's allowedFileTypes, max size 20MB, server-side re-validation of both file type and size (reject anything else with a clear error). Store the file via lib/storage.ts using path `assignments/{assignmentId}/{studentId}/{timestamp}-{filename}` — never write to disk directly, since this must work unchanged on Vercel's serverless functions.
- Allow resubmission before the due date only: each resubmission creates a new Submission row with an incremented version, keep prior versions visible to the teacher (don't delete). After the due date, block new submissions and show why.
- Once graded, student sees their score, feedback, and who graded it.

Authorization rules to enforce server-side (write a quick test for each):
- A student can only upload to assignments for courses they're enrolled in.
- A student can only ever see/download their own submissions, never another student's.
- A teacher can only grade submissions for courses they teach.
- Grades are never auto-published without a POST from an authenticated TEACHER/TA/HOD user — no automatic finalization.

Match the established visual theme throughout. This module should feel finished, not a prototype — good empty states ("No submissions yet" rather than a blank table), clear due-date countdowns, and a confirmation toast/message on every save action.
```

---

## Prompt 6 — Examination & Results

```
Build Examination & Results.

- /dashboard/registrar/exams — CRUD for Exam (course, exam date, type: MIDTERM/FINAL/QUIZ, max marks).
- /dashboard/teacher/marks-entry — teacher selects one of their exams, sees the enrolled student roster, enters marksObtained for each in a single table, saves in bulk. Validate marks don't exceed maxMarks.
- Grade computation: add a lib/grading.ts utility that converts marksObtained/maxMarks into a letter grade using a standard scale (make the scale configurable via a constants file, not hardcoded inline).
- /dashboard/registrar/results — registrar reviews entered marks per exam and clicks "Publish Results" — only after publishing do students see their results (add a publishedAt timestamp gate everywhere results are read).
- /dashboard/student/results — student sees published results only, per course/exam, with computed grade and a simple CGPA calculation across all their published, credit-weighted courses.

Enforce: unpublished results are invisible to students and to teachers other than the one who entered them, even via direct API calls (test this).
```

---

## Prompt 7 — Fees & Finance

```
Build the Fees & Finance module.

- /dashboard/finance/fee-structures — CRUD for FeeStructure (program name, batch year, amount, due date).
- /dashboard/finance/records — table of all students' FeeRecord status (PENDING/PAID/OVERDUE/WAIVED), with filters by program/batch/status. Manual actions: mark as paid (enter transactionRef, paymentDate), mark as waived (requires a reason field, stored).
- /dashboard/student/fees — student sees their own fee records, amounts due, due dates, and payment history. Add a "Pay Now" button that is a STUB for now (don't integrate a real payment gateway yet — just simulate success and create a FeeRecord with status PAID and a fake transactionRef), with a clear code comment marking where Razorpay/Stripe integration will go later.
- /dashboard/finance/reports — simple aggregate view: total collected vs total due, broken down by program/batch, rendered as a table (a chart can come later).

Ensure a student can only ever see/pay their own fee records — verify with a direct-API test using a second student account.
```

---

## Prompt 8 — Library & Hostel

```
Build Library and Hostel modules together (both are simpler inventory + allocation patterns).

Library:
- /dashboard/librarian/catalog — CRUD for LibraryItem (title, author, isbn, total copies — availableCopies auto-derived).
- /dashboard/librarian/issues — issue a book to a student (decrements availableCopies, sets dueAt = issuedAt + 14 days by default), return a book (increments availableCopies, calculates a fine if returned after dueAt using a simple per-day rate constant).
- /dashboard/student/library — student sees their currently issued books, due dates, and any outstanding fines.

Hostel:
- /dashboard/warden/rooms — CRUD for HostelRoom (block, room number, capacity).
- /dashboard/warden/allocations — allocate a student to a room (block if room is at capacity), vacate a student (sets vacatedAt).
- /dashboard/student/hostel — student sees their current room allocation if any.

Keep both modules simple and functional — table + form + action buttons, matching the established visual theme. No need for anything fancier at this stage.
```

---

## Prompt 9 — HR/Payroll & Placement

```
Build HR/Payroll and Placement modules together.

HR:
- /dashboard/hr/employees — CRUD for Employee (linked to a User with a staff role, designation, department, salary band, joined date).
- /dashboard/hr/leave-requests — employees submit LeaveRequest (start date, end date, reason) from their own dashboard; HR/HOD approves or rejects from this view. Show status history.
- /dashboard/teacher/leave (or a shared /dashboard/staff/leave for any staff role) — a simple form + status list for the logged-in employee's own leave requests.

Placement:
- /dashboard/placement/drives — CRUD for PlacementDrive (company name, role, eligibility criteria as free text, drive date, package offered).
- /dashboard/student/placements — students see drives they're eligible for (just show all upcoming drives for now, eligibility matching can stay manual/free-text) and can click "Apply" which creates a PlacementApplication with status APPLIED.
- /dashboard/placement/applications — placement officer sees applicants per drive and can update status (SHORTLISTED/INTERVIEWED/OFFERED/REJECTED).

Match the established visual theme. Keep it functional and clean.
```

---

## Prompt 10 — Notifications & Reports/Analytics Dashboards

```
Build Notifications and the role-specific analytics dashboards.

Notifications:
- /dashboard/admin/notifications (also accessible to HOD/Teacher for their own scope) — create a Notification with a title, body, and target (whole college / a specific department / a specific class).
- A notification bell/inbox component in the shared dashboard layout header, visible to every logged-in user, showing notifications targeted at their role/department/class, newest first, with a read/unread indicator (add an isRead join table or a simple read-tracking field if needed).

Reports & Analytics — build a real dashboard home page per role (replacing the placeholders from Prompt 2), pulling real aggregate data from the DB:
- Admin dashboard: total students, total staff, fee collection %, attendance % institution-wide, pending admissions count — as a clean stat-grid, not decorative cards. Use the visualize/chart approach only where a real trend/comparison exists (e.g., attendance over the last 4 weeks) — don't force a chart where a number suffices.
- HOD dashboard: same stats scoped to their department.
- Teacher dashboard: their courses, pending submissions to grade (count + quick links), today's timetable.
- Student dashboard: attendance %, upcoming assignment due dates, latest published grade, fee due status — the things a student needs to see first thing.

Keep the visual theme consistent. This page is the first thing every role sees after login, so it should feel like the most polished page in the app.
```

---

## Prompt 11 — Certificates & Document Generation

```
Build the Certificate/Document Generation module.

- /dashboard/registrar/certificates — registrar can generate a Bonafide Certificate, Transcript, or No-Dues Certificate for a selected student. 
- Transcript: pull the student's published ExamResults and computed CGPA into a clean PDF (use a PDF generation library appropriate for Next.js/Node — pick one and note the choice).
- Bonafide/No-Dues: simpler templated PDF with student name, program, and today's date (No-Dues should first check the student has no PENDING/OVERDUE FeeRecord and no outstanding LibraryIssue fine before allowing generation — block with a clear message listing what's outstanding if not clear).
- Store generated PDFs via lib/storage.ts (path prefix `certificates/`) and save a Certificate record with the returned file path/URL.
- /dashboard/student/certificates — student sees and can download their own previously issued certificates.

Confirm a generated transcript PDF opens correctly and shows real data from a seeded student.
```

---

## Prompt 12 — Seed Data Pass (Realistic Demo Data)

```
Write a comprehensive prisma/seed.ts (replacing the minimal one from Prompt 1) that populates realistic demo data across every module built so far, so the app looks alive for a client demo:

- 1 college, 3 departments, 6 courses, 3 classes, ~40 students spread across classes, 6 teachers, 1 HOD, 1 registrar, 1 finance officer, 1 librarian, 1 hostel warden, 1 HR officer, 1 placement officer, 1 college admin.
- A few weeks of realistic attendance records with some intentional absences (so the "below 75%" warning has something to show).
- 5-6 assignments across different courses, with a realistic mix: some ungraded, some graded, one with a resubmission.
- 2 exams with published results for at least one class.
- Fee records with a mix of PAID/PENDING/OVERDUE.
- A handful of library items with some currently issued (including one overdue, to show a fine).
- Hostel rooms with partial occupancy.
- 2-3 placement drives with a few student applications in different stages.
- A few notifications targeted at different scopes.

After seeding, print a clear summary table of every demo login (email/password/role) so it's copy-pasteable into a client demo script.
```

---

## Prompt 13 — Full UI/UX Polish Pass

```
Do a full visual and UX polish pass across the entire app before the client demo. Do not change any data logic or API behavior — this is presentation only.

- Audit every page against the established theme (navy #12213C / off-white #FAF8F3 / slate #5B6472 / gold #C9A24B accent, serif headings + Inter body) and fix any page that drifted from it.
- Add a consistent shared dashboard shell: left sidebar navigation (items scoped to the logged-in role — don't show a nav link to a module the role can't access), top bar with the notification bell and user menu (name, role, logout).
- Add loading states (skeletons, not spinners-only) to every data table and form submission.
- Add empty states with a clear next action wherever a list can be empty (e.g., "No assignments yet — create one" for a teacher with zero assignments).
- Add basic responsive behavior down to tablet width at minimum (full mobile isn't required for the demo but shouldn't break).
- Run a quick accessibility pass: visible focus states on all interactive elements, form labels properly associated, sufficient color contrast on the gold accent (it should never carry meaning alone — pair it with text/icon).
- Take a pass through every role's login → dashboard → core-task flow and note (in a short POLISH_NOTES.md file) anything that felt rough but is out of scope to fix now, so we have a punch list before the client sees it.
```

---

## Prompt 14 — Deployment Configs for Vercel, Render, and AWS

```
The database (Supabase Postgres) and file storage (Supabase Storage) are already environment-config-driven from Prompt 0 — no code changes needed to move hosts. This prompt only adds the per-platform deployment config so we can deploy to any of the three without extra setup work later.

1. Vercel:
   - Add a `vercel.json` if any custom config is needed (usually not, for standard Next.js App Router).
   - Document in DEPLOYMENT.md: set DATABASE_URL to the Supabase POOLED connection string (port 6543, ?pgbouncer=true) in Vercel's env vars — the direct URL is only needed locally for migrations, never in the deployed app.
   - Confirm next.config.js has no filesystem-dependent settings that would break on Vercel's read-only serverless filesystem.

2. Render:
   - Add a `render.yaml` (Render Blueprint) defining a Web Service: build command `npm run build`, start command `npm run start`, and the required env vars listed (referencing them as secrets, not hardcoded).
   - Document that Render can use either the pooled or direct Supabase connection string since it's a long-running server, not serverless.

3. AWS (for later, once the client wants full IT-team ownership):
   - Add a Dockerfile (multi-stage: install deps, build, run `next start`).
   - Add a docker-compose.yml for local container testing (app container only — Supabase remains external, don't containerize a local Postgres).
   - Outline in DEPLOYMENT.md how this container maps to ECS Fargate + Application Load Balancer + Route 53, with Supabase as the external managed database (no RDS needed unless we later migrate off Supabase).

4. Add a .github/workflows/ci.yml that runs lint, type-check, and `prisma migrate deploy --dry-run` on every PR, using GitHub Actions secrets for the Supabase DIRECT_URL.

5. Write DEPLOYMENT.md covering: the full list of required env vars, which platforms need the pooled vs direct Supabase connection string, and a short step-by-step for each of the three hosting options above.

Do not provision any actual cloud resources — this prompt only adds config files and documentation so deployment to any of the three is a same-day task once we decide.
```

---

## Notes for you (not for Claude Code)

- **Order matters** — later prompts assume earlier tables/auth/theme exist. If you skip one, later prompts will produce inconsistent results.
- **Review after every prompt.** Claude Code will sometimes make a reasonable-but-wrong assumption (e.g., a field name) — catching it after Prompt 3 is a 30-second fix; catching it after Prompt 12 means re-touching everything downstream.
- **Prompt 5 (Assignments/Grading) and Prompt 12 (seed data) are the two that will make or break the client demo** — spend the most review time there.
- **Create the Supabase project before running Prompt 0.** Go to supabase.com, create a project, and have these four values ready: the pooled connection string (Settings → Database → Connection pooling), the direct connection string, your project URL, and the service role key (Settings → API). Claude Code will ask you to paste these in.
- Because the database and storage are Supabase from Prompt 0 onward, **deploying to Vercel, Render, or AWS is just a hosting decision, not a rebuild** — Prompt 14 sets up config for all three. Show the client the Vercel version first (fastest, free to demo), and only move to Render/AWS if they specifically want more control or an in-house-managed server.
