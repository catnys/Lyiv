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
    if [ -d "$TARGET_DIR" ]; then
        while true; do
            echo -n "$EMOJI_PROMPT m5out already exists in Lyiv. Do you want to replace it? (y/n): "
            read replace_ans
            replace_ans=$(echo "$replace_ans" | tr '[:upper:]' '[:lower:]')
            if [ "$replace_ans" = "y" ]; then
                log "$EMOJI_COPY Replacing existing m5out in Lyiv..."
                rm -rf "$TARGET_DIR"
                cp -R "$SOURCE_DIR" "$TARGET_DIR"
                log "$EMOJI_SUCCESS m5out replaced in Lyiv/m5out."
                break
            elif [ "$replace_ans" = "n" ]; then
                log "$EMOJI_FAIL Keeping existing m5out in Lyiv."
                # Do not copy, just proceed with existing m5out
                break
            else
                log "🤷 Please answer y or n."
            fi
        done
    else
        while true; do
            echo -n "$EMOJI_PROMPT No m5out exists in Lyiv. Do you want to bring it from gem5? (y/n): "
            read bring_ans
            bring_ans=$(echo "$bring_ans" | tr '[:upper:]' '[:lower:]')
            if [ "$bring_ans" = "y" ]; then
                log "$EMOJI_COPY Copying m5out from $SOURCE_DIR to $TARGET_DIR..."
                cp -R "$SOURCE_DIR" "$TARGET_DIR"
                log "$EMOJI_SUCCESS m5out successfully copied to Lyiv/m5out."
                break
            elif [ "$bring_ans" = "n" ]; then
                log "$EMOJI_FAIL No m5out in Lyiv and user chose not to bring it. Exiting."
                exit 1
            else
                log "🤷 Please answer y or n."
            fi
        done
    fi


else
    log "$EMOJI_FAIL m5out not found in gem5 directory."
    if [ -d "$TARGET_DIR" ]; then
        while true; do
            echo -n "$EMOJI_PROMPT gem5 m5out not found. Would you like to use your own Lyiv m5out? (y/n): "
            read own_ans
            own_ans=$(echo "$own_ans" | tr '[:upper:]' '[:lower:]')
            if [ "$own_ans" = "y" ]; then
                log "$EMOJI_SUCCESS Using your own m5out in Lyiv."
                break
            elif [ "$own_ans" = "n" ]; then
                log "$EMOJI_FAIL No m5out selected. Exiting."
                exit 1
            else
                log "🤷 Please answer y or n."
            fi
        done
    else
        log "$EMOJI_FAIL No m5out available in Lyiv. Exiting."
        exit 1
    fi
fi

# Check for stats.txt in selected m5out (always, after m5out selection)
STATS_PATH="$TARGET_DIR/stats.txt"
if [ -f "$STATS_PATH" ]; then
    log "$EMOJI_SUCCESS stats.txt found in m5out. Proceeding."
else
    log "$EMOJI_FAIL stats.txt not found in m5out. Exiting."
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
    log "🤷🏼‍♀️ Please answer y or n."
    fi
done