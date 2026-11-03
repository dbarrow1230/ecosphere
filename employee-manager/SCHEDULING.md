# Combined Employee Manager

Employee Manager is the single EcoSphere application entry for employee records, scheduling, time clock, leave, and payroll. The separate Employee Scheduler dashboard card has been removed. Existing EcoSphere links to `/applications/employee-scheduler` redirect to Employee Manager's calendar.

- `/scheduling`: existing weekly schedules.
- `/scheduling/calendar`: calendar brought over from Employee Scheduler.
- `/scheduling/availability`: availability editor brought over from Employee Scheduler.
- `/shifts` and `/shifst-avail`: compatibility redirects within Employee Manager.

The calendar and editor use Employee Manager's `/api/employees` and `/api/availability`. Availability references the same shared Employee model as employee management and weekly schedules; repeated saves update one record per employee. It is stored in `employee_availability` on the existing business information connection. No second scheduler backend is needed.

Before consolidation, read-only checks found zero employees, availability records, schedules, or shifts in Employee Scheduler's application database. Employee Manager's business information database held three employees. No employee records were copied, deleted, or reassigned. The original scheduler source and runtime configuration remain available for recovery.

No production build was run. Validate availability with `node --test backend/tests/availabilityValidation.test.mjs` from this directory.
