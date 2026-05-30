# Multi-stage Dockerfile for Reviva backend on Fly.io.
#
# Stage 1 (build): installs build tools needed for onnxruntime-node's native
# binding fallback (Silero VAD v4 model loader). On linux-x64 Node 22 the
# prebuilt binary is normally picked up and these tools are unused, but
# keeping them in a discardable stage costs nothing at runtime and saves us
# from "MODULE_NOT_FOUND: Error loading shared library" surprises if the
# prebuilt index ever drifts.
#
# Stage 2 (runtime): slim Debian-based Node 22 image with ONLY production
# node_modules + source. Runs as a non-root user. Listens on PORT (default
# 8080), which fly.toml's internal_port matches.

# ---- Stage 1: build ----
FROM node:22-bookworm-slim AS build

# Build tools for any optional native compilations (onnxruntime-node fallback,
# bcrypt-style native deps if added later). Pinned to apt's stable set.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      python3 \
      make \
      g++ \
      libc6-dev \
      ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy manifests first so this layer caches across source-only changes.
# npm ci is preferred over npm install because it respects package-lock.json
# exactly and fails fast on drift.
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# Now copy the rest of the backend source. .dockerignore filters out tests,
# coverage, .env files, etc.
COPY . .

# ---- Stage 2: runtime ----
FROM node:22-bookworm-slim AS runtime

# Minimal runtime deps. ca-certificates is required for outbound HTTPS to
# Gemini / Deepgram / Stripe / Supabase / GitHub. tini gives us a proper
# PID 1 that forwards SIGTERM (Fly sends SIGTERM on deploy / scale down) so
# the Node process can flush WS connections cleanly via the existing
# graceful-shutdown handlers in server.js.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates \
      tini \
 && rm -rf /var/lib/apt/lists/* \
 && update-ca-certificates

# Non-root user. UID/GID 1001 is a common convention and avoids conflicts
# with node's built-in `node` user (UID 1000) in case Fly's image scanner
# flags overlap.
RUN groupadd --system --gid 1001 reviva \
 && useradd  --system --uid 1001 --gid reviva --home /app --shell /usr/sbin/nologin reviva

WORKDIR /app

# Copy artefacts from build stage with correct ownership.
COPY --from=build --chown=reviva:reviva /app /app

USER reviva

# PORT is read by backend/src/config/index.js:55 with a default of 8080.
# We set it explicitly so it's obvious what the contract is, and so EXPOSE
# matches.
ENV NODE_ENV=production \
    PORT=8080

EXPOSE 8080

# tini -> node so SIGTERM from Fly reaches the Node process and triggers the
# graceful WS shutdown path (closing sessions, flushing Deepgram, etc.).
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
