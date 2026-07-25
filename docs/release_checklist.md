# MetaPilot Release Checklist

This checklist tracks tasks required to finalize the MetaPilot public release and hackathon submission.

---

## 📂 1. Repository Checklist
- [x] **License**: Verify that the Apache 2.0 LICENSE file exists at the root.
- [x] **Clean Files**: Verify that console logs, trace statements, and print commands have been removed.
- [x] **GitHub Metadata**: Verify that `.github/` issue templates and PR templates are populated and correct.
- [x] **Ignore List**: Verify that `.gitignore` prevents tracking virtual environments (`venv/`), database locks (`metapilot.db`, `vector_store.db`), and local secrets (`.env`).

---

## ☁️ 2. Deployment Checklist
- [ ] **Database Provisioning**: Set up production database instances on Render PostgreSQL, AWS RDS, or Supabase.
- [ ] **Cache Server**: Spin up production caching services using Render Redis or Upstash Redis.
- [ ] **Backend Web App (Render)**: Set up the Dockerized FastAPI service, configure env variables, and verify that the backend is live.
- [ ] **Frontend CDN (Vercel)**: Connect the root repository, specify compilation commands (`npm run build`), configure env variables, and verify edge deployment.
- [ ] **SSL Certification**: Confirm that HTTPS certificates (Let's Encrypt) are active for all custom subdomains.
- [ ] **Health Checks**: Verify that `/api/vector/status` returns status healthy.

---

## 📖 3. README Checklist
- [x] **Badges**: Verify that status, license, and version badges render correctly on GitHub.
- [x] **Hero & Logo**: Include placeholders for the hero banner and logo images.
- [x] **TOC**: Confirm that all anchor links in the Table of Contents resolve to correct headers.
- [x] **Quickstart Instructions**: Verify that installation steps for both the backend and frontend are correct.
- [x] **API Index**: Review the endpoints table to confirm it matches the active backend routes.

---

## 📄 4. Documentation Checklist
- [x] **Architecture Specification**: Verify that `docs/Architecture.md` contains the 10 Mermaid diagrams.
- [x] **Developer Handbook**: Confirm that code standard guides, layout HSL rules, and pytest triggers are documented in `docs/DeveloperGuide.md`.
- [x] **Cloud Deployments Guide**: Review `docs/DeploymentGuide.md` for step-by-step instructions.
- [x] **Config Index**: Verify that all parameters (keys, caches, fallbacks) are documented in `docs/EnvironmentVariables.md`.
- [x] **Directory Maps**: Review the directory structure annotations in `docs/FolderStructure.md`.
- [x] **Security Policies**: Verify that security protocols and disclosures are documented in `docs/Security.md`.
- [x] **Community Guides**: Verify that contributing workflows (`docs/Contributing.md`), troubleshooting steps (`docs/Troubleshooting.md`), and the changelog (`docs/CHANGELOG.md`) are accurate.

---

## 🎥 5. Demo Checklist
- [ ] **Record Screens**: Follow the UI Demo Flow timeline in `docs/demo/demo_script.md` to capture a screen recording.
- [ ] **Narrate Pitch**: Record the audio narration matching the 3-minute video speaking script.
- [ ] **Compile Video**: Edit the video, add caption descriptions, and upload the final walkthrough to YouTube or Vimeo.
- [ ] **Thumbnail**: Create a project banner and embed it as a video thumbnail placeholder.

---

## 🎨 6. Devpost Checklist
- [x] **Submission Writeup**: Verify that the pitches, technology rationale, and future scope are compiled in `docs/devpost_submission.md`.
- [ ] **Create Draft**: Create a new Devpost draft submission under your user profile.
- [ ] **Upload Assets**: Add the demo video link and upload screenshots matching the capture plan.
- [ ] **Review Descriptions**: Copy the short (50 words), medium (200 words), and long (1000+ words) descriptions into the Devpost fields.

---

## 🧪 7. Testing Checklist
- [x] **Backend Unit Testing**: Run the test suite using pytest to verify that all tests pass.
- [x] **Frontend Compilation**: Run `npm run build` locally to confirm the production build completes without compiler errors.
- [x] **Judge Walkthrough**: Follow the steps in `docs/demo/judge_experience.md` to confirm the walkthrough functions correctly.

---

## 🚀 8. Submission Checklist
- [ ] **Git Push**: Push the final release preparation commits to the main branch.
- [ ] **Release Draft**: Create a draft release tag `v1.0.0` on GitHub and paste the release notes.
- [ ] **Submit Devpost**: Click **Submit** on the Devpost project page before the hackathon deadline.
