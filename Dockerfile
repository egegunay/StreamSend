# Build stage
FROM denoland/deno:latest AS builder
WORKDIR /app
ENV DENO_DIR=/app/.deno_dir
COPY . .
RUN deno cache main.ts

# Production stage
FROM denoland/deno:latest
WORKDIR /app
ENV DENO_DIR=/app/.deno_dir
COPY --from=builder /app .
EXPOSE 8000
CMD ["deno", "run", "--allow-read", "--allow-env", "--allow-net", "--allow-write", "--cached-only", "main.ts"]
