FROM node:22-alpine

WORKDIR /app
COPY frontend/package.json ./
RUN npm install --legacy-peer-deps

COPY frontend ./

EXPOSE 3000
CMD ["sh", "-c", "npm run dev -- --hostname 0.0.0.0"]
