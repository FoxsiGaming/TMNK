TMNK — Project setup and cleanup
=================================

This repository now contains the public/static TMNK website only. The previous `admin` panel and server components have been removed.

Quick start (Public site)
-------------------------
Open `index.html` in a browser to view the static site. Dynamic features that previously relied on the admin API are no longer available.

Files changed by this cleanup
----------------------------
- Removed the `admin/` server and UI components.
- Updated `.gitignore` and documentation to reflect the cleanup.

If you'd like, I can:
- Restore a lightweight API for the public site,
- Reintroduce admin functionality behind an optional subproject, or
- Keep the repo minimal and remove any remaining setup files (confirm first).
