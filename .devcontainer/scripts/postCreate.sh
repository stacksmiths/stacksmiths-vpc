#!/bin/bash

# Log script execution
echo "Running postCreate.sh"

# Display system information
uname -a

# Set up and activate Python virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv .venv || {
  echo "Error: Failed to create Python virtual environment" >&2
  exit 1
}
source .venv/bin/activate || {
  echo "Error: Failed to activate Python virtual environment" >&2
  exit 1
}
pip install --upgrade pip || {
  echo "Error: Failed to upgrade pip" >&2
  exit 1
}

# Install dependencies from requirements.txt if it exists
if [ -s hello_api/requirements.txt ]; then
  echo "Installing Python dependencies from requirements.txt..."
  pip install -r hello_api/requirements.txt || {
    echo "Error: Failed to install Python dependencies" >&2
    exit 1
  }
else
  echo "requirements.txt is empty or missing. Installing essential dependencies..."
fi

# Add essential dependencies and update requirements.txt
echo "Ensuring essential dependencies are installed..."
pip install fastapi uvicorn pydantic_settings || {
  echo "Error: Failed to install fastapi or uvicorn" >&2
  exit 1
}
echo "Updating requirements.txt with current dependencies..."
pip freeze > hello_api/requirements.txt || {
  echo "Error: Failed to update requirements.txt" >&2
  exit 1
}

# Clean up apt cache
echo "Cleaning up temporary files..."
apt-get clean && rm -rf /var/lib/apt/lists/* || {
  echo "Error: Failed to clean up" >&2
  exit 1
}
