# Verification Checklist

Use this checklist to verify the migration was successful:

## ✅ Documentation
- [ ] README.md shows "CRA Tool (EN-40000)" as the title
- [ ] No references to "Common Criteria" or "CCGenTool" in README.md
- [ ] agents.md updated with CRA terminology

## ✅ Frontend Branding
- [ ] Browser tab title shows "CRA Tool" (check index.html if needed)
- [ ] Navbar brand displays "CRA Tool"
- [ ] Dashboard shows "CRA Tool Demo Gallery"
- [ ] Sidebar navigation shows "Requirements Table" instead of "SFR Table"

## ✅ Backend API
- [ ] API docs at http://localhost:8000/docs show "CRA Tool API"
- [ ] Health endpoint returns status successfully
- [ ] No errors in backend logs about missing tables

## ✅ Database
- [ ] Old database (if exists) backed up or removed
- [ ] New tables created successfully on first run:
  - [ ] components
  - [ ] technical_requirements
  - [ ] assurance_requirements
  - [ ] product_profiles
  - [ ] vulnerability_assessments
  - [ ] document_sections

## ✅ Functionality Tests
- [ ] Dashboard loads without errors
- [ ] Modal demo works
- [ ] Requirements Table demo works (add/remove entries)
- [ ] Rich Text Editor demo works
- [ ] XML Viewer demo displays sample data
- [ ] DOCX Preview demo generates documents
- [ ] Save/Load demo exports and imports data
- [ ] Theme toggle works (light/dark mode)
- [ ] Database health indicator shows "ok" status

## ✅ No Old References
Run these commands to check for any missed references:

```bash
# Check for remaining Common Criteria references
grep -r "Common Criteria" /home/devi/EN-40000/web/src /home/devi/EN-40000/server --include="*.vue" --include="*.ts" --include="*.py" 2>/dev/null | grep -v node_modules | grep -v ".venv"

# Check for remaining ccgentool references
grep -r "ccgentool" /home/devi/EN-40000/web/src /home/devi/EN-40000/server --include="*.vue" --include="*.ts" --include="*.py" 2>/dev/null | grep -v node_modules | grep -v ".venv"

# Check for SFR/SAR/TOE that weren't replaced
grep -r "\bSFR\b|\bSAR\b|\bTOE\b" /home/devi/EN-40000/web/src /home/devi/EN-40000/server --include="*.vue" --include="*.ts" --include="*.py" 2>/dev/null | grep -v "Technical Requirement\|Assurance Requirement\|Product"
```

## Starting the Application

```bash
cd /home/devi/EN-40000
./dev_start.sh
```

Then visit: http://127.0.0.1:5173

## Stopping the Application

```bash
cd /home/devi/EN-40000
./dev_stop.sh
```

## Common Issues

### Issue: Database errors on startup
**Solution**: Delete the old database file and let it recreate:
```bash
rm /home/devi/EN-40000/server/ccgentool2.db  # or wherever DATABASE_URL points
```

### Issue: Frontend won't compile
**Solution**: Clear cache and reinstall:
```bash
cd /home/devi/EN-40000/web
rm -rf node_modules package-lock.json
npm install
```

### Issue: Backend module import errors
**Solution**: Reinstall Python dependencies:
```bash
cd /home/devi/EN-40000/server
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Issue: Port already in use
**Solution**: Kill existing processes:
```bash
# Find and kill processes on port 8000 (backend)
lsof -ti:8000 | xargs kill -9

# Find and kill processes on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

## Success Criteria

The migration is successful when:
1. ✅ Application starts without errors
2. ✅ All demo pages are accessible and functional
3. ✅ No Common Criteria terminology visible in the UI
4. ✅ Database operations work (CRUD on components)
5. ✅ Document generation works (DOCX preview)
6. ✅ Theme switching persists across page reloads
7. ✅ No console errors in browser developer tools
8. ✅ No errors in backend logs
