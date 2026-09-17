#!/bin/zsh
set -euo pipefail

LABEL="com.kodex.rae"
PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"
LOG_DIR="$HOME/Library/Logs"
UID_NOW="$(id -u)"
DOMAIN="gui/${UID_NOW}"

if [[ "${1:-}" == "--uninstall" ]]; then
  launchctl bootout "$DOMAIN" "$PLIST" >/dev/null 2>&1 || true
  rm -f "$PLIST"
  echo "KDX.RAE LaunchAgent removed: $PLIST"
  exit 0
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT" ]]; then
  echo "ERROR: run this installer from the dedicated KDX.RAE git worktree."
  exit 2
fi

BRANCH="$(git -C "$ROOT" branch --show-current)"
EXPECTED="${KDX_RAE_BRANCH:-feat/kdx-rae-v0-1-live}"
if [[ "$BRANCH" != "$EXPECTED" ]]; then
  echo "ERROR: refusing to schedule from branch '$BRANCH'. Expected '$EXPECTED'."
  echo "Use a dedicated RAE worktree; do not schedule the main production worktree."
  exit 3
fi

if ! command -v claude >/dev/null 2>&1; then
  echo "ERROR: Claude Code is not available in the current shell PATH."
  exit 4
fi

if ! claude auth status >/dev/null 2>&1; then
  echo "ERROR: Claude Code is not authenticated. Run 'claude auth login' first."
  exit 5
fi

mkdir -p "$HOME/Library/LaunchAgents" "$LOG_DIR"

xml_escape() {
  local s="$1"
  s="${s//&/&amp;}"
  s="${s//</&lt;}"
  s="${s//>/&gt;}"
  s="${s//\"/&quot;}"
  s="${s//\'/&apos;}"
  print -r -- "$s"
}

ROOT_XML="$(xml_escape "$ROOT")"
BRANCH_XML="$(xml_escape "$EXPECTED")"
DRIVE_XML="$(xml_escape "${KDX_RAE_DRIVE_DIR:-$HOME/Trabajos-Aparte/KODEX/drive-pull}")"
MCP_XML="$(xml_escape "${KDX_RAE_MCP_CONFIG:-}")"
MCP_TOOLS_XML="$(xml_escape "${KDX_RAE_MCP_TOOLS:-}")"
MODEL_XML="$(xml_escape "${KDX_RAE_MODEL:-claude-opus-5}")"
EFFORT_XML="$(xml_escape "${KDX_RAE_EFFORT:-high}")"
MAX_TURNS_XML="$(xml_escape "${KDX_RAE_MAX_TURNS:-20}")"
MAX_BUDGET_XML="$(xml_escape "${KDX_RAE_MAX_BUDGET_USD:-5}")"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>

  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-lc</string>
    <string>cd "\$KDX_RAE_ROOT" &amp;&amp; export PATH="\$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:\$PATH"; if [ -s "\$HOME/.nvm/nvm.sh" ]; then . "\$HOME/.nvm/nvm.sh"; fi; node command-center/kdx-rae.mjs --once</string>
  </array>

  <key>EnvironmentVariables</key>
  <dict>
    <key>KDX_RAE_ROOT</key><string>${ROOT_XML}</string>
    <key>KDX_RAE_MODE</key><string>dispatch</string>
    <key>KDX_RAE_BRANCH</key><string>${BRANCH_XML}</string>
    <key>KDX_RAE_DRIVE_DIR</key><string>${DRIVE_XML}</string>
    <key>KDX_RAE_MCP_CONFIG</key><string>${MCP_XML}</string>
    <key>KDX_RAE_MCP_TOOLS</key><string>${MCP_TOOLS_XML}</string>
    <key>KDX_RAE_MODEL</key><string>${MODEL_XML}</string>
    <key>KDX_RAE_EFFORT</key><string>${EFFORT_XML}</string>
    <key>KDX_RAE_MAX_TURNS</key><string>${MAX_TURNS_XML}</string>
    <key>KDX_RAE_MAX_BUDGET_USD</key><string>${MAX_BUDGET_XML}</string>
  </dict>

  <key>StartInterval</key>
  <integer>3600</integer>
  <key>RunAtLoad</key>
  <false/>
  <key>ProcessType</key>
  <string>Background</string>
  <key>ThrottleInterval</key>
  <integer>60</integer>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/KDX-RAE.stdout.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/KDX-RAE.stderr.log</string>
</dict>
</plist>
EOF

plutil -lint "$PLIST"
launchctl bootout "$DOMAIN" "$PLIST" >/dev/null 2>&1 || true
launchctl bootstrap "$DOMAIN" "$PLIST"

echo "KDX.RAE installed as hourly LaunchAgent."
echo "  worktree: $ROOT"
echo "  branch:   $BRANCH"
echo "  plist:    $PLIST"
echo "  stdout:   $LOG_DIR/KDX-RAE.stdout.log"
echo "  stderr:   $LOG_DIR/KDX-RAE.stderr.log"
echo
launchctl print "$DOMAIN/$LABEL" | head -40 || true
