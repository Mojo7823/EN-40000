#!/bin/bash

# CRA Tool - Nuxt Migration Verification Script
# This script verifies that all files have been migrated correctly

echo "🔍 CRA Tool - Nuxt Migration Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check file existence
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $1 - MISSING"
    ((FAILED++))
  fi
}

# Function to check directory existence
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $1/ - MISSING"
    ((FAILED++))
  fi
}

echo "1. Core Configuration Files"
echo "----------------------------"
check_file "web-nuxt/package.json"
check_file "web-nuxt/nuxt.config.ts"
check_file "web-nuxt/tsconfig.json"
check_file "web-nuxt/.gitignore"
check_file "web-nuxt/.env.example"
check_file "web-nuxt/app.vue"
check_file "web-nuxt/README.md"
echo ""

echo "2. Styles"
echo "---------"
check_dir "web-nuxt/assets"
check_dir "web-nuxt/assets/css"
check_file "web-nuxt/assets/css/main.css"
echo ""

echo "3. Components"
echo "-------------"
check_dir "web-nuxt/components"
check_file "web-nuxt/components/Sidebar.vue"
check_file "web-nuxt/components/Sidebar.css"
check_file "web-nuxt/components/RichTextEditor.vue"
check_file "web-nuxt/components/RichTextEditor.css"
check_file "web-nuxt/components/XMLTreeNode.vue"
check_file "web-nuxt/components/XMLTreeNode.css"
check_file "web-nuxt/components/RiskEvidenceTracker.vue"
check_dir "web-nuxt/components/settings"
check_file "web-nuxt/components/settings/ModifyDataPanel.vue"
check_file "web-nuxt/components/settings/QueryDataPanel.vue"
check_file "web-nuxt/components/settings/XmlParserPanel.vue"
echo ""

echo "4. Composables"
echo "--------------"
check_dir "web-nuxt/composables"
check_file "web-nuxt/composables/useApi.ts"
echo ""

echo "5. Pages - Dashboard"
echo "--------------------"
check_dir "web-nuxt/pages"
check_file "web-nuxt/pages/index.vue"
check_file "web-nuxt/pages/index.css"
echo ""

echo "6. Pages - Demo"
echo "---------------"
check_dir "web-nuxt/pages/demo"
check_file "web-nuxt/pages/demo/modal.vue"
check_file "web-nuxt/pages/demo/table.vue"
check_file "web-nuxt/pages/demo/editor.vue"
check_file "web-nuxt/pages/demo/xml-viewer.vue"
check_file "web-nuxt/pages/demo/docx-preview.vue"
check_file "web-nuxt/pages/demo/storage.vue"
check_file "web-nuxt/pages/demo/tree.vue"
echo ""

echo "7. Pages - Document"
echo "-------------------"
check_dir "web-nuxt/pages/document"
check_file "web-nuxt/pages/document/cover.vue"
check_file "web-nuxt/pages/document/introduction.vue"
check_file "web-nuxt/pages/document/purpose-scope.vue"
check_file "web-nuxt/pages/document/product-identification.vue"
check_file "web-nuxt/pages/document/manufacturer-information.vue"
check_file "web-nuxt/pages/document/preview.vue"
check_file "web-nuxt/pages/document/load-save.vue"
check_file "web-nuxt/pages/document/evidence.vue"
echo ""

echo "8. Pages - Product Overview"
echo "---------------------------"
check_dir "web-nuxt/pages/product-overview"
check_file "web-nuxt/pages/product-overview/description.vue"
check_file "web-nuxt/pages/product-overview/architecture.vue"
check_file "web-nuxt/pages/product-overview/third-party-components.vue"
echo ""

echo "9. Pages - Conformance"
echo "----------------------"
check_dir "web-nuxt/pages/conformance"
check_file "web-nuxt/pages/conformance/standards.vue"
check_file "web-nuxt/pages/conformance/regulatory.vue"
check_file "web-nuxt/pages/conformance/level.vue"
echo ""

echo "10. Pages - Convention"
echo "----------------------"
check_dir "web-nuxt/pages/convention"
check_file "web-nuxt/pages/convention/terminology.vue"
check_file "web-nuxt/pages/convention/notation.vue"
echo ""

echo "11. Pages - Risk Management"
echo "---------------------------"
check_dir "web-nuxt/pages/risk"
check_file "web-nuxt/pages/risk/general-approach.vue"
check_dir "web-nuxt/pages/pcontext"
check_file "web-nuxt/pages/pcontext/intended-purpose.vue"
echo ""

echo "12. Services"
echo "------------"
check_dir "web-nuxt/services"
check_file "web-nuxt/services/api.ts"
check_file "web-nuxt/services/demoStorage.ts"
check_file "web-nuxt/services/documentWorkspace.ts"
check_file "web-nuxt/services/sessionService.ts"
echo ""

echo "13. Utils"
echo "---------"
check_dir "web-nuxt/utils"
check_file "web-nuxt/utils/coverImage.ts"
check_file "web-nuxt/utils/dataUrl.ts"
check_file "web-nuxt/utils/securityObjectivesPreview.ts"
check_file "web-nuxt/utils/securityPreview.ts"
check_file "web-nuxt/utils/spdPreview.ts"
echo ""

echo "14. Constants & Data"
echo "--------------------"
check_dir "web-nuxt/constants"
check_file "web-nuxt/constants/conformance.ts"
check_dir "web-nuxt/data"
check_file "web-nuxt/data/xmlSamples.ts"
echo ""

echo "15. Types"
echo "---------"
check_dir "web-nuxt/types"
check_file "web-nuxt/types/conformance.ts"
check_file "web-nuxt/types/docx-preview.d.ts"
echo ""

echo "16. Scripts"
echo "-----------"
check_file "nuxt_dev_start.sh"
check_file "nuxt_dev_stop.sh"
echo ""

echo "17. Documentation"
echo "-----------------"
check_file "NUXT_MIGRATION_GUIDE.md"
check_file "NUXT_MIGRATION_SUMMARY.md"
echo ""

echo "=========================================="
echo "📊 Verification Summary"
echo "=========================================="
echo -e "${GREEN}Passed:${NC} $PASSED"
echo -e "${RED}Failed:${NC} $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! Migration is complete.${NC}"
  echo ""
  echo "Next steps:"
  echo "1. cd web-nuxt && npm install"
  echo "2. ./nuxt_dev_start.sh"
  echo "3. Open http://localhost:3000"
  exit 0
else
  echo -e "${RED}❌ Some checks failed. Please review the missing files.${NC}"
  exit 1
fi
