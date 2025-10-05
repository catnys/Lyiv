#!/bin/zsh

# Step 1: Retrieve m5out file
SOURCE_DIR="/Users/catnys/Documents/Academia/register_spilling/gem5/m5out"
TARGET_DIR="/Users/catnys/Documents/Academia/register_spilling/Lyiv/m5out"

if [ -d "$SOURCE_DIR" ]; then
    cp -R "$SOURCE_DIR" "$TARGET_DIR"
    echo "✅ m5out successfully copied to Lyiv/m5out."
else
    echo "❌ m5out not found in gem5 directory."
    exit 1
fi

# Step 2: Activate venv
VENV_PATH="/Users/catnys/Documents/Academia/register_spilling/Lyiv/venv/bin/activate"
if [ -f "$VENV_PATH" ]; then
    source "$VENV_PATH"
    echo "✅ Virtual environment activated."
else
    echo "❌ venv not found. Please create it first."
    exit 1
fi

# Step 3: Run test_optimization.py
echo "Running test_optimization.py..."
python /Users/catnys/Documents/Academia/register_spilling/Lyiv/test_optimization.py

# Step 4: Ask user to proceed
while true; do
    echo -n "Do you want to proceed and run backend & frontend? (y/n): "
    read ans
    ans=$(echo "$ans" | tr '[:upper:]' '[:lower:]')
    if [ "$ans" = "y" ]; then
        echo "Starting backend..."
        cd /Users/catnys/Documents/Academia/register_spilling/Lyiv/backend
        nohup python simple_app.py > backend.log 2>&1 &
        echo "Starting frontend..."
        cd /Users/catnys/Documents/Academia/register_spilling/Lyiv/frontend
        nohup npm start > frontend.log 2>&1 &
        echo "✅ Both backend and frontend started."
        break
    elif [ "$ans" = "n" ]; then
        echo "Process terminated by user."
        break
    else
        echo "Please answer y or n."
    fi
done