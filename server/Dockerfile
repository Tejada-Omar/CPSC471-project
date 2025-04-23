FROM node:22-bullseye-slim

WORKDIR /app

# Copy dependencies the install
COPY package*.json ./
RUN npm install

# Copy the rest of app
COPY . .

# Expose port 5173 for the frontend
EXPOSE 8080

CMD ["npm", "run", "dev"]