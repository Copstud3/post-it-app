# Use an official node.js runtime as a parent image
FROM node:22-alpine


# set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# install the depenencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .


# Install Prisma CLI globally
RUN npx prisma generate

# Expose the port the app runs on
EXPOSE 3000


# Define the command to run the app
CMD ["sh", "-c", "npm run migrate && npm start"]