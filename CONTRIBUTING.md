# Contributing to neutralinojs-cli

First off, kudos for taking the time to contribute! :tada::+1:

The following is a set of guidelines for contributing to neutralinojs-cli, which is hosted as a part of [Neutralinojs](https://github.com/neutralinojs) on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

* [Code of Conduct](#code-of-conduct)
* [Requirements](#requirements)
* [Local Development](#local-development)
* [Running the CLI Locally](#running-the-cli-locally)
* [Docker Development Environment](#docker-development-environment)
* [Useful Scripts](#useful-scripts)
* [Making a PR](#making-a-pr)

---

# Code of Conduct

This project encourages everyone to contribute and collaborate in a respectful and welcoming environment.

By participating in this project, you agree to uphold the spirit of open-source culture and maintain respectful communication with other contributors.

Please ensure that:

* Discussions remain constructive and respectful.
* Feedback is provided professionally.
* Contributors help maintain a welcoming environment for new developers.

---

# Requirements

Before starting development, ensure you have the following installed:

* **Node.js ≥ v12**
* **npm / yarn / pnpm**

You can verify your installation:

```bash
node -v
npm -v
```

---

# Local Development

Follow these steps to set up the project locally.

## 1. Clone the repository

```bash
git clone https://github.com/neutralinojs/neutralinojs-cli.git
cd neutralinojs-cli
```

## 2. Install dependencies

```bash
npm install
```

## 3. Build the CLI

The source code needs to be compiled before running the CLI.

```bash
npm run build
```

---

# Running the CLI Locally

You can run the CLI directly using Node.js.

```bash
node ./bin/neu.js --help
```

Example:

```bash
node ./bin/neu.js version
```

### Using npm start

The CLI entry point can also be executed with:

```bash
npm start
```

You can pass commands similarly to the global CLI:

```bash
npm start -- version
npm start -- create myapp
npm start -- help
```

This behaves similarly to the globally installed command:

```bash
neu version
neu create myapp
```

---

# Docker Development Environment

For contributors who prefer not to install Node.js locally, a Docker-based development environment is available.

This allows running and testing the Neutralino CLI inside a containerized environment.

## 1. Build the Docker image

```bash
docker compose build
```

## 2. Start an interactive development container

```bash
docker compose run neutralino-cli
```

This command starts the container and opens an interactive shell inside it.

## 3. Run CLI commands inside the container

You can run CLI commands exactly as you would locally.

Example:

```bash
node ./bin/neu.js version
```

or using the npm script:

```bash
npm start -- version
```

Example commands:

```bash
npm start -- help
npm start -- version
npm start -- create myapp
```

These commands behave similarly to the globally installed CLI:

```bash
neu version
neu create myapp
```

## 4. Running tests inside the container

```bash
npm test
```

## 5. Running lint checks

```bash
npm run lint
```

## 6. Stopping the container

If the container is running interactively, you can exit using:

```bash
exit
```

or

```bash
Ctrl + D
```

---

### Why use Docker for development?

Using Docker ensures:

* a consistent Node.js environment for all contributors
* no need to install Node.js locally
* easier onboarding for new contributors
* isolation from host system dependencies

# Useful Scripts

| Script          | Description                                         |
| --------------- | --------------------------------------------------- |
| `npm start`     | Runs the CLI using the entry point                  |
| `npm run build` | Compiles the source code into the `./bin` directory |
| `npm test`      | Runs the Mocha test suite                           |
| `npm run lint`  | Checks formatting and code style                    |

---

# Making a PR

1. Fork the repository
2. Create a new branch

```bash
git checkout -b feature/your-feature
```

3. Make your changes
4. Run tests and lint checks

```bash
npm test
npm run lint
```

5. Commit your changes

```bash
git commit -m "Add: description of your change"
```

6. Push to your fork

```bash
git push origin feature/your-feature
```

7. Open a Pull Request on GitHub.

Please ensure your PR:

* follows the existing code style
* passes tests
* includes a clear description of the change
