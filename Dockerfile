# Use the official Directus image as the base image
FROM directus/directus

# Set the working directory
WORKDIR /var/directus

# Copy your project files into the container
COPY . /var/directus

COPY .env /var/directus

USER node

# Expose the port (if needed, adjust this to match your project's configuration)
EXPOSE 8055

# Start Directus
CMD ["npx", "directus", "start"]
