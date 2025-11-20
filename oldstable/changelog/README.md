# Changelog & Documentation

This folder contains project documentation, transformation history, and reference materials for the CRA Tool.

## 📚 Documentation Files

### Database & Architecture
- **[DATABASE.md](./DATABASE.md)** - Comprehensive database documentation including:
  - SQLite and PostgreSQL configuration
  - Complete schema documentation (20 tables)
  - Backup and migration procedures
  - Troubleshooting guide
  - Security best practices

### Terminology Reference
- **[GLOSSARY.md](./GLOSSARY.md)** - Common Criteria legacy terminology guide:
  - CC → CRA terminology mappings
  - Explanation of all abbreviations (ST, TOE, SFR, SAR, TSS, EAL)
  - Where legacy terms appear in the codebase
  - Quick reference card for developers
  - Background on Common Criteria standard

### Project History
- **[TRANSFORMATION_COMPLETE.md](./TRANSFORMATION_COMPLETE.md)** - Original transformation from CCGenTool to CRA Tool:
  - What was changed during the rebranding
  - Terminology mappings applied
  - Features preserved
  - Migration notes

- **[CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)** - Recent cleanup work (Nov 2024):
  - Legacy database removal
  - Documentation creation
  - Code comments added
  - User-facing terminology updates
  - Backward compatibility notes

### Quality Assurance
- **[VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md)** - Testing and verification checklist:
  - Feature verification steps
  - Integration testing guide
  - Quality assurance checklist

## 🗄️ Legacy Files

These files are kept for historical reference:

- **[LEGACY_README.md](./LEGACY_README.md)** - Original README before transformation
- **[README.md.bak](./README.md.bak)** - Backup of previous README version

## 📖 Quick Start for New Developers

If you're new to the project, read these in order:

1. **Start with the main [README.md](../README.md)** in the project root - Overview and quick start
2. **[GLOSSARY.md](./GLOSSARY.md)** - Understand the legacy terminology you'll encounter
3. **[DATABASE.md](./DATABASE.md)** - Learn about the database structure
4. **[CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)** - Understand recent changes

## 🔍 Finding Information

| I want to... | Read this file |
|-------------|----------------|
| Set up the database | [DATABASE.md](./DATABASE.md) |
| Understand "ST", "TOE", "SFR" terms | [GLOSSARY.md](./GLOSSARY.md) |
| Know what changed recently | [CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md) |
| See the original transformation | [TRANSFORMATION_COMPLETE.md](./TRANSFORMATION_COMPLETE.md) |
| Verify a feature works | [VERIFICATION_CHECKLIST.md](./VERIFICATION_CHECKLIST.md) |

## 📅 Document History

| File | Created | Last Updated | Purpose |
|------|---------|--------------|---------|
| DATABASE.md | Nov 2024 | Nov 2024 | Database documentation |
| GLOSSARY.md | Nov 2024 | Nov 2024 | Terminology reference |
| CLEANUP_SUMMARY.md | Nov 2024 | Nov 2024 | Cleanup work summary |
| TRANSFORMATION_COMPLETE.md | Nov 2024 | Nov 2024 | Original transformation |
| VERIFICATION_CHECKLIST.md | Nov 2024 | Nov 2024 | Testing checklist |

## 🔗 External Links

- [Common Criteria Portal](https://www.commoncriteriaportal.org/) - CC background
- [ISO/IEC 15408](https://www.iso.org/standard/72891.html) - CC standard
- [EU Cyber Resilience Act](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act) - CRA regulation

## 💡 Contributing to Documentation

When adding new documentation:

1. Place it in this `changelog/` folder
2. Update this README with a brief description
3. Link to it from the main [README.md](../README.md) if relevant
4. Use clear, descriptive file names
5. Include a table of contents for longer documents

## 📝 Maintenance

These documents should be updated when:

- **DATABASE.md**: Database schema changes, new configuration options
- **GLOSSARY.md**: New legacy terms discovered or terminology changes
- **CLEANUP_SUMMARY.md**: Major cleanup or refactoring work
- **VERIFICATION_CHECKLIST.md**: New features added or testing procedures change

---

**Questions?** Check the main [README.md](../README.md) or open an issue.
