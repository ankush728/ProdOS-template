#!/bin/bash

# Gong MCP Server - Node.js Launcher
# Finds Node.js in PATH or common installation locations

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENTRY_POINT="$SCRIPT_DIR/dist/index.js"

# Try PATH first
if command -v node &> /dev/null; then
    exec node "$ENTRY_POINT" "$@"
fi

# Homebrew (Apple Silicon - M1/M2/M3)
if [ -x "/opt/homebrew/bin/node" ]; then
    exec /opt/homebrew/bin/node "$ENTRY_POINT" "$@"
fi

# Homebrew (Intel Mac)
if [ -x "/usr/local/bin/node" ]; then
    exec /usr/local/bin/node "$ENTRY_POINT" "$@"
fi

# System Node.js (Linux package managers)
if [ -x "/usr/bin/node" ]; then
    exec /usr/bin/node "$ENTRY_POINT" "$@"
fi

# nvm (Node Version Manager)
if [ -d "$HOME/.nvm/versions/node" ]; then
    for dir in $(ls -rd "$HOME"/.nvm/versions/node/v* 2>/dev/null); do
        if [ -x "$dir/bin/node" ]; then
            exec "$dir/bin/node" "$ENTRY_POINT" "$@"
        fi
    done
fi

# fnm (Fast Node Manager)
if [ -d "$HOME/.fnm/node-versions" ]; then
    for dir in $(ls -rd "$HOME"/.fnm/node-versions/v* 2>/dev/null); do
        if [ -x "$dir/installation/bin/node" ]; then
            exec "$dir/installation/bin/node" "$ENTRY_POINT" "$@"
        fi
    done
fi

# Volta
if [ -x "$HOME/.volta/bin/node" ]; then
    exec "$HOME/.volta/bin/node" "$ENTRY_POINT" "$@"
fi

# asdf version manager
if [ -x "$HOME/.asdf/shims/node" ]; then
    exec "$HOME/.asdf/shims/node" "$ENTRY_POINT" "$@"
fi

echo "ERROR: Node.js not found" >&2
echo "Install from https://nodejs.org" >&2
exit 1
