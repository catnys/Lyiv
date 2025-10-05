#!/bin/zsh



log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

EMOJI_COPY="📂"
EMOJI_VENV="🐍"
EMOJI_TEST="🧪"
EMOJI_PROMPT="🤔"
EMOJI_BACKEND="🖥️"
EMOJI_FRONTEND="🌐"
EMOJI_SUCCESS="✅"
EMOJI_FAIL="❌"
EMOJI_START="🚀"
EMOJI_LOG="📝"

log "$EMOJI_COPY Step 1: Checking for m5out directory at $SOURCE_DIR"
SOURCE_DIR="/Users/catnys/Documents/Academia/register_spilling/gem5/m5out"
TARGET_DIR="/Users/catnys/Documents/Academia/register_spilling/Lyiv/m5out"

if [ -d "$SOURCE_DIR" ]; then
    log "$EMOJI_COPY Copying m5out from $SOURCE_DIR to $TARGET_DIR..."
    cp -R "$SOURCE_DIR" "$TARGET_DIR"
    log "$EMOJI_SUCCESS m5out successfully copied to Lyiv/m5out."
else
    log "$EMOJI_FAIL m5out not found in gem5 directory."
    exit 1
fi

log "$EMOJI_VENV Step 2: Activating Python virtual environment at $VENV_PATH"
VENV_PATH="/Users/catnys/Documents/Academia/register_spilling/Lyiv/venv/bin/activate"
if [ -f "$VENV_PATH" ]; then
    source "$VENV_PATH"
    log "$EMOJI_SUCCESS Virtual environment activated."
else
    log "$EMOJI_FAIL venv not found. Please create it first."
    exit 1
fi

log "$EMOJI_TEST Step 3: Running test_optimization.py..."
python /Users/catnys/Documents/Academia/register_spilling/Lyiv/test_optimization.py
log "$EMOJI_SUCCESS test_optimization.py completed."

log "$EMOJI_PROMPT Step 4: Prompting user to start backend & frontend."
while true; do
    echo -n "$EMOJI_PROMPT Do you want to proceed and run backend & frontend? (y/n): "
    read ans
    ans=$(echo "$ans" | tr '[:upper:]' '[:lower:]')
    if [ "$ans" = "y" ]; then
    log "$EMOJI_START $EMOJI_BACKEND Starting backend server..."
    cd /Users/catnys/Documents/Academia/register_spilling/Lyiv/backend
    nohup python simple_app.py > backend.log 2>&1 &
    log "$EMOJI_BACKEND Backend started. $EMOJI_LOG Log: backend/backend.log"
    log "$EMOJI_START $EMOJI_FRONTEND Starting frontend server..."
    cd /Users/catnys/Documents/Academia/register_spilling/Lyiv/frontend
    nohup npm start > frontend.log 2>&1 &
    log "$EMOJI_FRONTEND Frontend started. $EMOJI_LOG Log: frontend/frontend.log"
    log "$EMOJI_SUCCESS $EMOJI_BACKEND $EMOJI_FRONTEND Both backend and frontend started."
        break
    elif [ "$ans" = "n" ]; then
    log "$EMOJI_FAIL Process terminated by user."
        break
    else
    log "🤷 Please answer y or n."
    fi
done