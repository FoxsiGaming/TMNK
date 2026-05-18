CLEANUP PROPOSAL — items to consider removing or adjusting
=========================================================

NOTE: Per user instruction, the `admin/` folder and `profiles/` will be preserved — no deletions will be made for those.

I inspected the repository and it is fairly tidy. To avoid removing anything important without your approval, here are suggestions of "extra" items you may want to remove or change. I did not delete files; please confirm which items to remove and I will apply the deletions.

Suggested changes
-----------------
- Remove unused images in `/profiles` if you don't need them in source control (they can be re-uploaded via admin). This will reduce repo size.
- If you don't plan to run the admin panel, you can remove the entire `admin/` folder and keep only the static front-end (`index.html`, `styles.css`, `script.js`, `dynamic.js`, `profiles/`).
- Consider removing large comments in `styles.css` if you want a smaller CSS file for production; otherwise use minified builds for deployment.

Small tidy-ups (safe to apply)
-----------------------------
- Keep `admin/.gitignore` as-is (it already ignores uploads and node_modules). I added a top-level `.gitignore` to keep workspace clean.
- Keep `.gitkeep` files inside `admin/uploads` — they ensure upload folders remain in the repo.

If you want me to proceed
-------------------------
- Reply with which of the suggested removals to perform (e.g. "Remove admin/") and I will delete them and update the README with the new minimal setup.
- Or tell me to continue with optional improvements: add a root `package.json`, create a Docker Compose dev setup, or minify assets.
