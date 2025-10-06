# NOXA

Noxa is a developer-focused automation framework (Internal Development Platform -IDP) designed to streamline software delivery, from project creation to deployment.  
It bridges the gap between **DevOps**, **platform engineering**, and **developer experience**, enabling teams to move faster with consistency, observability, and governance built-in.

---

## 🚀 Key Features

### ⚙️ Project Generation Automation
Spin up new projects in seconds:
- Auto-generates boilerplate code from prompts.
- Creates corresponding GitHub repositories.
- Initializes repo structure, permissions, and pushes first commit automatically.
- Supports multiple tech stacks (Node.js, Python, Go, etc.), node.js as a default.

### 🌐 Project Environment Automation
No more manual setup:
- Automatically provisions development, staging environments.
- Syncs environment variables and secrets securely.
- Integrates with CI/CD pipelines out of the box.
- Configurable through a simple YAML manifest.

### ☸️ Cluster Deployment Automation
One-command deployments:
- Deploy applications to Kubernetes clusters automatically.
- Handles namespace creation, Helm deployments, and environment rollouts.
- Monitors deployment health and logs via integrated dashboard.
- Supports rollback and version tracking.

### 🤖 PR Review Comment Automation
Faster and smarter code reviews:
- Automatically comments on pull requests with insights and detected issues.
- Performs static analysis, style checks, and security scans.
- Integrates with GitHub Actions or your CI/CD pipeline.
- Customizable comment templates for different repositories.

### 🧠 Log Explainer
Simplify debugging and post-mortems:
- Parses and explains error logs using AI-powered language models.
- Detects patterns and suggests potential root causes.
- Integrates directly into the CI/CD pipeline or can be used as a CLI tool.
- Saves developer hours spent digging through cryptic stack traces.

## How To Use

* `docker compose build --no-cache`
* `docker compose up`
* `kind create cluster --name noxa-idp`
* `kubectl create namespace dev`
* `kubectl create namespace stag`

### Frontend
- Go to `http://localhost:3000`

### API
- Use API caller / curl and go to `http://locahost:3001`

### TO DO:
* Refine README
* move prompts to templates
* auto generated gh actions for projects
* env vars for backend code reviewer
* auto deploy from repo
* github oauth flow