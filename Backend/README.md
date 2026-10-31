# HouseRentLk Backend

Express 5 + MongoDB API for HouseRentLk. Setup, environment variables, scripts, testing and
deployment are documented in the [root README](../README.md); every variable is listed with an
explanation in [.env.example](.env.example).

```bash
cp .env.example .env
npm install
npm run dev      # nodemon server.js on http://localhost:5000
npm test         # unit (Jest) + integration (node:test, in-memory MongoDB)
```
