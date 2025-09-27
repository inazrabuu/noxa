# NOXA

An AI-first Internal Developer Platform (IDP) that can boost developer productivity into 10x.

## How To Use

* `docker compose build --no-cache`
* `docker compose up`
* kind create cluster --name noxa-idp
* kubectl create namespace dev
* kubectl create namespace dev

### Frontend
- Go to `http://localhost:3000`

### API
- Use API caller / curl and go to `http://locahost:3001`

### TO DO:
* move prompts to templates
* auto generated gh actions for projects
* env vars for backend code reviewer
* auto deploy from repo
* github oauth flow