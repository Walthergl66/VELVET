#!/usr/bin/env node

/**
 * Script para generar reportes de cobertura de tests
 * Ejecuta tests y genera reportes en múltiples formatos
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COVERAGE_DIR = path.join(__dirname, 'coverage');
const REPORTS_DIR = path.join(__dirname, 'test-reports');

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function createDirectories() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
    log('✓ Creado directorio de reportes', 'green');
  }
}

function runTests() {
  log('🧪 Ejecutando tests con cobertura...', 'blue');
  
  try {
    // Ejecutar tests con cobertura
    execSync('npm run test:coverage', { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    log('✓ Tests ejecutados exitosamente', 'green');
    return true;
  } catch (error) {
    log('✗ Error ejecutando tests', 'red');
    console.error(error.message);
    return false;
  }
}

function generateReports() {
  log('📊 Generando reportes adicionales...', 'blue');
  
  try {
    // Copiar reporte HTML a directorio de reportes
    if (fs.existsSync(path.join(COVERAGE_DIR, 'lcov-report'))) {
      execSync(`cp -r ${path.join(COVERAGE_DIR, 'lcov-report')} ${path.join(REPORTS_DIR, 'coverage-html')}`, {
        stdio: 'inherit'
      });
      log('✓ Reporte HTML copiado', 'green');
    }
    
    // Leer resumen de cobertura
    const summaryPath = path.join(COVERAGE_DIR, 'coverage-summary.json');
    if (fs.existsSync(summaryPath)) {
      const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
      displayCoverageSummary(summary);
      
      // Generar badge de cobertura
      generateCoverageBadge(summary);
    }
    
    log('✓ Reportes generados', 'green');
  } catch (error) {
    log('⚠ Error generando reportes adicionales', 'yellow');
    console.error(error.message);
  }
}

function displayCoverageSummary(summary) {
  log('\n📈 RESUMEN DE COBERTURA', 'bold');
  log('========================', 'bold');
  
  const total = summary.total;
  
  console.table({
    'Líneas': {
      'Cubiertas': total.lines.covered,
      'Total': total.lines.total,
      'Porcentaje': `${total.lines.pct}%`
    },
    'Funciones': {
      'Cubiertas': total.functions.covered,
      'Total': total.functions.total,
      'Porcentaje': `${total.functions.pct}%`
    },
    'Ramas': {
      'Cubiertas': total.branches.covered,
      'Total': total.branches.total,
      'Porcentaje': `${total.branches.pct}%`
    },
    'Declaraciones': {
      'Cubiertas': total.statements.covered,
      'Total': total.statements.total,
      'Porcentaje': `${total.statements.pct}%`
    }
  });
  
  // Mostrar archivos con baja cobertura
  const lowCoverageFiles = Object.entries(summary)
    .filter(([path, data]) => path !== 'total' && data.lines.pct < 70)
    .sort(([,a], [,b]) => a.lines.pct - b.lines.pct);
  
  if (lowCoverageFiles.length > 0) {
    log('\n⚠ ARCHIVOS CON BAJA COBERTURA (<70%)', 'yellow');
    log('=====================================', 'yellow');
    
    lowCoverageFiles.forEach(([filePath, data]) => {
      const relativePath = path.relative(__dirname, filePath);
      log(`${relativePath}: ${data.lines.pct}%`, 'yellow');
    });
  }
}

function generateCoverageBadge(summary) {
  const percentage = summary.total.lines.pct;
  let color = 'red';
  
  if (percentage >= 80) color = 'brightgreen';
  else if (percentage >= 70) color = 'yellow';
  else if (percentage >= 60) color = 'orange';
  
  const badgeUrl = `https://img.shields.io/badge/coverage-${percentage}%25-${color}`;
  const badgeMarkdown = `![Coverage](${badgeUrl})`;
  
  // Guardar badge en archivo
  const badgePath = path.join(REPORTS_DIR, 'coverage-badge.md');
  fs.writeFileSync(badgePath, badgeMarkdown);
  
  log(`✓ Badge de cobertura generado: ${percentage}%`, 'green');
}

function generateTestReport() {
  log('📋 Generando reporte final...', 'blue');
  
  const reportContent = `
# Reporte de Tests - VELVET E-commerce

**Fecha:** ${new Date().toLocaleString('es-ES')}

## Comandos de Testing

\`\`\`bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage

# Ejecutar tests para CI/CD
npm run test:ci
\`\`\`

## Archivos de Configuración

- \`jest.config.js\`: Configuración principal de Jest
- \`jest.setup.js\`: Setup global para tests
- \`src/__tests__/\`: Directorio de tests organizados por tipo

## Estructura de Tests

\`\`\`
src/__tests__/
├── components/          # Tests de componentes React
├── hooks/              # Tests de custom hooks
├── pages/              # Tests de páginas
└── utils/              # Tests de utilidades
\`\`\`

## Coverage Reports

- HTML: \`coverage/lcov-report/index.html\`
- LCOV: \`coverage/lcov.info\`
- JSON: \`coverage/coverage-final.json\`

## Umbrales de Cobertura

- **Global:** 70% en todas las métricas
- **Componentes:** 80% en todas las métricas  
- **Utilidades:** 90% en todas las métricas

## Integración Continua

Los tests se ejecutan automáticamente en:
- Pull Requests
- Push a rama main
- Releases

Para más información, consulta la documentación del proyecto.
`;
  
  const reportPath = path.join(REPORTS_DIR, 'README.md');
  fs.writeFileSync(reportPath, reportContent);
  
  log('✓ Reporte final generado', 'green');
}

// Función principal
function main() {
  log('🚀 VELVET E-commerce - Generador de Reportes de Test', 'bold');
  log('==================================================', 'bold');
  
  createDirectories();
  
  const testsSuccess = runTests();
  if (!testsSuccess) {
    log('❌ Tests fallaron - revisar errores arriba', 'red');
    process.exit(1);
  }
  
  generateReports();
  generateTestReport();
  
  log('\n🎉 ¡Reportes generados exitosamente!', 'green');
  log(`📁 Revisa los reportes en: ${REPORTS_DIR}`, 'blue');
  log(`🌐 Abre: ${path.join(COVERAGE_DIR, 'lcov-report', 'index.html')}`, 'blue');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  runTests,
  generateReports,
  generateTestReport
};
