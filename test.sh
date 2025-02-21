#!/bin/bash

# Define your new environment variables or values
ENV_FILE=".env"
KEY1="DEBUG_LOG"

# Function to update or add a key in the .env file
update_env_key() {
    local key=$1
    local value=$2
    if grep -q "^$key=" "$ENV_FILE"; then
        # If the key exists, update its value
        echo "Updating $key..."
        # For macOS compatibility, use 'sed -i '''
        sed -i '' "s/^$key=.*/$key=$value/" "$ENV_FILE"
    else
        # If the key doesn't exist, append it
        echo "Adding $key..."
        echo "$key=$value" >> "$ENV_FILE"
    fi
}
# Make sure the .env file exists, otherwise create it
if [ ! -f "$ENV_FILE" ]; then
    echo "$ENV_FILE does not exist, creating it."
    touch "$ENV_FILE"
fi

# Update or add the environment keys
update_env_key "DEBUG_LOG" "false"

echo ".env file updated successfully!"