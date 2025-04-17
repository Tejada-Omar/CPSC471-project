FROM node:22-bullseye-slim

WORKDIR /app

COPY . .

RUN npm install

# Expose port 5173 for the frontend
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]