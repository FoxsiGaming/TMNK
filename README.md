TMNK — Project setup and cleanup
=================================

This repository contains a small public website and an `admin` panel (Node/Express + PostgreSQL) used to manage content.

Quick start (Admin + API)
-------------------------
Prerequisites: Node.js (18+ recommended), npm, and PostgreSQL running.

1. Open a terminal and go to the `admin` folder:

   cd admin

2. Copy the example env and edit values if necessary:

   copy .env.example .env   # Windows PowerShell
   cp .env.example .env     # macOS / Linux

3. Install dependencies and prepare the database:

   npm install
   npm run migrate
   npm run seed

4. Start the server:

   npm start

App will be available at http://localhost:3000 (Admin panel: /admin)

Public site only
----------------
If you only want the static site without the API, open `index.html` in a browser. The site will display static content; dynamic features that fetch `/api` require the admin server.

Files added/changed by this cleanup
----------------------------------
- README.md (this file)
- .gitignore (top level)
- admin/setup.ps1 and admin/setup.sh (helper scripts)
- CLEANUP_PROPOSAL.md (suggested deletions — review before removing anything)

Next steps and suggestions
--------------------------
- Run the `admin/setup.ps1` (Windows) or `admin/setup.sh` to automate setup (they copy `.env.example`, install deps, migrate and seed DB).
- Review `CLEANUP_PROPOSAL.md` and confirm any deletions before proceeding.

If you want, I can: create a root `package.json` wrapper, remove files listed in the proposal, or wire a Docker setup for one-command startup.
