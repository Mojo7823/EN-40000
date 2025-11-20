# Dev Stop Script Fix - Port 5174 Issue

**Date:** November 18, 2024  
**Issue:** `dev_stop.sh` was not killing vite processes running on port 5174

## Problem

The `dev_stop.sh` script had two issues preventing it from stopping all vite processes:

1. **Overly specific vite pattern matching** (Line 82): The script searched for `"vite.*--host.*127.0.0.1.*--port.*5173"` which only matched vite processes started with very specific command-line arguments. Manually started vite instances or those on different ports were missed.

2. **Port range limitation** (Line 98): The script only checked ports 8000 and 5173, missing vite processes that might be running on port 5174 or other ports.

## Solution

### Change 1: Improved Vite Process Detection
**Before:**
```bash
FRONTEND_PIDS=$(pgrep -f "vite.*--host.*127.0.0.1.*--port.*5173" 2>/dev/null || true)
```

**After:**
```bash
FRONTEND_PIDS=$(pgrep -f "node_modules/.bin/vite" 2>/dev/null || true)
```

This broader pattern catches ANY vite process running from the project's node_modules, regardless of how it was started or which port it's using.

### Change 2: Expanded Port Checking
**Before:**
```bash
for port in 8000 5173; do
```

**After:**
```bash
for port in 8000 5173 5174; do
```

Now the script checks port 5174 as well, which is where vite sometimes binds when 5173 is already in use.

## Verification

After the fix, running `./dev_stop.sh` successfully:
- ✅ Detected and killed vite process on port 5174
- ✅ Freed port 5174
- ✅ Removed all zombie vite processes

## Root Cause

The vite process was running on port 5174 instead of 5173, likely because:
- Port 5173 was already in use when vite started
- Vite automatically incremented to the next available port (5174)
- The process was started outside of `dev_start.sh` (manually or by IDE)

## Recommendation

If you continue to see vite on unexpected ports, consider:
1. Always use `./dev_start.sh` to start servers (enforces consistent ports)
2. Run `./dev_stop.sh` before starting to ensure clean state
3. Check for orphaned processes: `ps aux | grep vite`
