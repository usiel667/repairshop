# User Stories for Repair Shop App

1. [ ] Replace current sticky note system
2. [x] Add a public facing page with basic contact info
3. [x] Add a passwordless employee login to the app
4. [ ] Show a real-time open tickets page after login
5. [ ] Provide easy navigation & search for customers & tickets
6. [x] Provide a logout option
7. [x] Require users to login at least once per week
8. [ ] Provide a way to remove employee access asap if needed
9. [x] Customers have an ID, full address, phone, email & notes
10. [x] Tickets have an ID, title, notes, created & updated dates
11. [x] Tickets are either OPEN or COMPLETED
12. [x] Tickets are assigned to specific employees
13. [x] Users can have Employee, Manager, or Admin permissions
14. [ ] All users can create and view tickets
15. [ ] All users can create, edit and view customers
16. [ ] Employees can only edit their assigned tickets
17. [ ] Managers and Admins can view, edit, and delete all tickets
18. [ ] Desktop mode is most important but the app should be usable on tablet devices as well.
19. [x] Light / Dark mode option requested by employees
20. [x] Expects quick support if anything goes wrong with the app


# STACK USED:

1. [x] Next.js
2. [x] ShadCN/ui
3. [x] Sentry Next.js
4. [x] Tailwind CSS
5. [x] TS
6. [x] Neon Postgres
7. [x] Kinde Auth
8. [x] Zod


# **Notes:**

1. [ ] look into the difference between ?? and ||.  Need to change the || to ?? in CustomerForm.tsx to match TicketFrom.tsx.(look up and fix this weekend with also figuring out and practicing how to select all of them at once and changing them all at once in nvim)
2. [ ] figure out why on http://localhost:3000/tickets/form?ticketId=4 the output on the brower after ## Edit Ticket ID #4 for Jane Smith is in decending order instead of just a string across the screen.
3. [ ] 