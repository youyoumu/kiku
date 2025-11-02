#!/usr/bin/env bash
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Define paths
SRC_DIR="$ROOT_DIR/dist"
ANKI_MEDIA_DIR="$HOME/.local/share/Anki2/yym/collection.media"

# Files to copy
FILES=("_kiku.js" "_kiku.css")

# Check if Anki media folder exists
if [ ! -d "$ANKI_MEDIA_DIR" ]; then
  echo "❌ Anki media folder not found at: $ANKI_MEDIA_DIR"
  echo "Please update the path in this script if your Anki profile name is different."
  exit 1
fi

# Copy files
for file in "${FILES[@]}"; do
  SRC_FILE="$SRC_DIR/$file"
  DEST_FILE="$ANKI_MEDIA_DIR/$file"

  if [ -f "$SRC_FILE" ]; then
    cp "$SRC_FILE" "$DEST_FILE"
    echo "✅ Copied $file to Anki media folder."
  else
    echo "⚠️  File not found: $SRC_FILE"
  fi
done

echo "🎉 Done!"
