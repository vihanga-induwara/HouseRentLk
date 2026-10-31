# HouseRentLk API: Node.js server + Python runtime for the AI scripts and scrapers.
# Build context is the Backend/ directory:  docker build -t houserentlk-api Backend
FROM node:20-bookworm-slim

ENV NODE_ENV=production \
    PYTHON_BIN=python3 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 python3-pip python3-venv tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python dependencies in a virtualenv (Debian blocks system-wide pip installs)
COPY utils/ai/requirements.txt ./utils/ai/requirements.txt
RUN python3 -m venv /opt/venv \
    && /opt/venv/bin/pip install -r utils/ai/requirements.txt
ENV PATH="/opt/venv/bin:$PATH"

# Node dependencies (production only)
COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev

COPY . .

# Run as the unprivileged "node" user that ships with the image
RUN chown -R node:node /app
USER node

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||5000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# tini forwards SIGTERM so the server can shut down gracefully
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
