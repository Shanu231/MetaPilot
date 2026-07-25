# MetaPilot Contribution Guidelines

Thank you for your interest in contributing to MetaPilot! This document provides guidelines for contributing code, documentation, and issues.

---

## 1. Code of Conduct

All contributors must adhere to the [Code of Conduct](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/CODE_OF_CONDUCT.md) in the repository.

---

## 2. Issue Guidelines

* Search the existing issue tracker to verify that your bug or feature request has not already been reported.
* If reporting a bug, use the **Bug Report** template and include:
  - Clear reproduction steps.
  - Expected vs. actual outcomes.
  - Contextual logs and screenshots if relevant.
* If proposing a new feature, use the **Feature Request** template, detailing the problem solved and the suggested implementation.

---

## 3. Local Development Setup

Refer to the [Setup Guide](file:///c:/Users/user/OneDrive/Desktop/MetaPilot/docs/SetupGuide.md) for instructions on setting up backend servers and Vite React client shells locally.

---

## 4. Coding Standards

To ensure code readability and maintainability, all additions must conform to the following standards:

### Python (Backend)
- **Formatting**: Code must be formatted using `black` (line length: 88).
- **Imports**: Organize imports using `isort`.
- **Linting**: Run `flake8` to ensure syntax formatting.
- **Typing**: Use PEP 484 type hints for all function arguments and return types.
- **Database**: Use async definitions (`async/await`) for database operations.

### TypeScript / React (Frontend)
- **Formatting**: Code must follow the workspace `prettier` standards.
- **Typing**: Avoid using the `any` type; maintain strict TypeScript schemas.
- **Styling**: Do not define inline hex values. Use Tailwind's HSL system variables (`var(--primary)`, `var(--background)`).
- **Hooks**: Use custom hooks for sharing stateful behaviors.

---

## 5. Testing Requirements

All contributions must include test coverage:
* **Backend**: Write test modules under `backend/app/tests/` and run using:
  ```bash
  cd backend
  pytest
  ```
* **Frontend**: Ensure compilation runs without warnings:
  ```bash
  npm run build
  ```

---

## 6. Pull Request Process

1. Fork the repository and create your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit using semantic commit formatting:
   ```bash
   git commit -m "feat: add GMS lineage metrics display"
   ```
3. Push to your branch and open a Pull Request.
4. Ensure all CI build checks pass.
5. Code reviews from at least one core developer are required before merging.
