# CRA-Tool Quick Reference

## 🚀 Quick Commands

```bash
# Start everything
./start.sh

# Stop everything
./stop.sh

# View backend logs
tail -f backend.log

# View frontend logs
tail -f frontend.log

# Check if running
ps aux | grep -E "cra-tool.*(uvicorn|nuxt)" | grep -v grep

# Check ports
lsof -i:8000  # Backend
lsof -i:3000  # Frontend
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📋 System Requirements

| Requirement | Minimum Version |
|------------|----------------|
| Python     | 3.8+          |
| Node.js    | 18+           |
| npm        | 6+            |

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port in use | `./stop.sh` then `./start.sh` |
| Backend won't start | Check `backend.log` |
| Frontend won't start | Check `frontend.log` |
| Dependencies issue | Delete `node_modules` and `backend/.venv`, then `./start.sh` |

## ✅ What start.sh Does

1. ✓ Validates system requirements
2. ✓ Checks/cleans ports
3. ✓ Stops previous processes
4. ✓ Sets up Python virtual environment
5. ✓ Installs Python dependencies (if needed)
6. ✓ Installs Node.js dependencies (if needed)
7. ✓ Starts backend and frontend
8. ✓ Verifies services are running

## 🛑 What stop.sh Does

1. ✓ Kills processes from PID files
2. ✓ Scans for cra-tool processes
3. ✓ Kills by process pattern
4. ✓ Releases all ports
5. ✓ Verifies cleanup complete

## 📁 Important Files

```
cra-tool/
├── start.sh           # Start script
├── stop.sh            # Stop script
├── backend.pid        # Backend process ID
├── frontend.pid       # Frontend process ID
├── backend.log        # Backend logs
├── frontend.log       # Frontend logs
└── STARTUP_GUIDE.md   # Full documentation
```

## 🎯 First Time Setup

```bash
cd cra-tool
./start.sh
# That's it! Script handles everything.
```

## 🔄 Development Workflow

1. Start: `./start.sh`
2. Code changes auto-reload (hot-reload enabled)
3. Stop: `./stop.sh`

---

**For detailed documentation, see [STARTUP_GUIDE.md](STARTUP_GUIDE.md)**
