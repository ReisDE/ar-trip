FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3333
# A ordem importa: aplica migrations, garante o seed demo, depois sobe a API.
# migrate/seed podem ser sobrescritos pelo `command:` do docker-compose.
CMD ["npx", "prisma", "migrate", "deploy"]