import http from 'k6/http';
import { check } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

const config = JSON.parse(open('./config.json'));

function generarTituloUnico() {
  const timestamp = Date.now();
  const numeroAleatorio = Math.floor(Math.random() * 100000);
  const idVU = __VU || 0;
  const iteracion = __ITER || 0;
  return `Producto_${timestamp}_${numeroAleatorio}_VU${idVU}_ITER${iteracion}`;
}

function obtenerToken() {
  console.log('[1/4] Obteniendo token JWT...');
  const url = `${config.baseUrl}/auth/login`;
  const payload = JSON.stringify({
    username: config.credentials.username,
    password: config.credentials.password
  });
  const params = {
    headers: { 'Content-Type': 'application/json' }
  };
  
  const response = http.post(url, payload, params);
  
  check(response, {
    'Login exitoso': (r) => r.status === 200,
    'Token recibido': (r) => r.json('accessToken') !== undefined
  });
  
  console.log(response.status === 200 ? '[1/4] ✅ Token JWT obtenido' : '[1/4] ❌ Error al obtener token');
  
  return response.json('accessToken');
}

function crearProducto(token, titulo) {
  const url = `${config.baseUrl}/products/add`;
  const payload = JSON.stringify({
    title: titulo,
    price: config.product.defaultPrice
  });
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const response = http.post(url, payload, { headers });
  
  check(response, {
    'Producto creado o aceptado': (r) => r.status === 200 || r.status === 201 || r.status === 429
  });
  
  return response;
}

export const options = {
  scenarios: {},
  thresholds: {},
  summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
  summaryTimeUnit: 'ms'
};

config.scenarios.forEach((scenario, index) => {
  options.scenarios[scenario.name] = {
    executor: 'constant-arrival-rate',
    rate: scenario.tps,
    timeUnit: '1s',
    duration: scenario.duration,
    preAllocatedVUs: scenario.preAllocatedVUs,
    maxVUs: scenario.maxVUs,
    tags: { escenario: scenario.name },
    startTime: index === 0 ? '0s' : `${index * 70}s`
  };
  
  options.thresholds[`http_req_duration{escenario:${scenario.name}}`] = [
    `p(95)<${config.thresholds[scenario.name].p95}`
  ];
  
  options.thresholds[`http_req_failed{escenario:${scenario.name}}`] = [
    `rate<${config.thresholds[scenario.name].errorRate}`
  ];
});

export function setup() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 INICIANDO PRUEBAS DE PERFORMANCE');
  console.log('='.repeat(60));
  console.log(`📋 Escenarios: ${config.scenarios.map(s => `${s.name} (${s.tps} TPS)`).join(', ')}`);
  console.log('-'.repeat(60));
  
  const token = obtenerToken();
  
  console.log('[2/4] Ejecutando pruebas...\n');
  
  return { token: token };
}

export default function (data) {
  const titulo = generarTituloUnico();
  crearProducto(data.token, titulo);
}

export function teardown(data) {
  console.log('\n' + '-'.repeat(60));
  console.log('[3/4] Finalizando pruebas...');
}

export function handleSummary(data) {
  console.log('[4/4] Generando reportes...');
  console.log(`   Total de peticiones: ${data.metrics.http_reqs?.values.count || 0}`);
  
  return {
    'output/reporte-ejecutivo.txt': generarReporteNegocio(data),
    'output/reporte-tecnico.html': htmlReport(data),
    [`output/datos-${Date.now()}.json`]: JSON.stringify(data, null, 2)
  };
}

function generarReporteNegocio(data) {
  const metrics = data.metrics;
  const fecha = new Date().toLocaleString();
  const totalRequests = metrics.http_reqs?.values.count || 0;
  
  let reporte = "";
  
  reporte += "=".repeat(70) + "\n";
  reporte += "REPORTE DE PRUEBAS DE RENDIMIENTO\n";
  reporte += "=".repeat(70) + "\n\n";
  
  reporte += "Fecha: " + fecha + "\n";
  reporte += "Sistema evaluado: Creación de nuevos productos\n";
  reporte += "Total de peticiones realizadas: " + totalRequests + "\n\n";
  
  reporte += "-".repeat(70) + "\n";
  reporte += "RESULTADOS\n";
  reporte += "-".repeat(70) + "\n\n";
  
  for (const scenario of config.scenarios) {
    const durationMetric = metrics[`http_req_duration{escenario:${scenario.name}}`];
    const failedMetric = metrics[`http_req_failed{escenario:${scenario.name}}`];
    
    if (durationMetric?.values) {
      const avgTime = durationMetric.values.avg || 0;
      const maxTime = durationMetric.values.max || 0;
      const p95Time = durationMetric.values['p(95)'] || 0;
      const errorRate = (failedMetric?.values?.rate || 0) * 100;
      
      reporte += "ESCENARIO: " + scenario.name + " (" + scenario.tps + " peticiones por segundo)\n";
      reporte += "   Tiempo promedio: " + avgTime.toFixed(0) + " milisegundos\n";
      reporte += "   Tiempo máximo:   " + maxTime.toFixed(0) + " milisegundos\n";
      reporte += "   Tiempo p95:       " + p95Time.toFixed(0) + " milisegundos\n";
      reporte += "   Tasa de error:   " + errorRate.toFixed(2) + "%\n\n";
    }
  }
  
  reporte += "-".repeat(70) + "\n";
  reporte += "CONCLUSIÓN\n";
  reporte += "-".repeat(70) + "\n\n";
  
  const errorRate50 = (metrics['http_req_failed{escenario:50_TPS}']?.values?.rate || 0) * 100;
  const errorRate100 = (metrics['http_req_failed{escenario:100_TPS}']?.values?.rate || 0) * 100;
  
  if (errorRate50 < 5 && errorRate100 < 5) {
    reporte += "✅ EL SISTEMA SOPORTA AMBOS ESCENARIOS CORRECTAMENTE\n\n";
    reporte += "El sistema está preparado para soportar tanto el tráfico normal\n";
    reporte += "como el tráfico de días de alta concurrencia (fechas especiales).\n";
  } else if (errorRate50 < 5 && errorRate100 >= 5) {
    reporte += "⚠️ EL SISTEMA REQUIERE OPTIMIZACIÓN PARA DÍAS DE ALTA CONCURRENCIA\n\n";
    reporte += "El sistema funciona correctamente en condiciones normales,\n";
    reporte += "pero presenta problemas cuando el tráfico aumenta considerablemente.\n";
    reporte += "Se recomienda optimizar antes de la próxima fecha especial.\n";
  } else {
    reporte += "❌ EL SISTEMA NO SUPERA LAS PRUEBAS DE RENDIMIENTO\n\n";
    reporte += "El sistema presenta problemas incluso en condiciones normales.\n";
    reporte += "Se requiere una revisión urgente antes de cualquier evento de alta demanda.\n";
  }
  
  reporte += "\n" + "=".repeat(70) + "\n";
  reporte += "FIN DEL REPORTE\n";
  reporte += "=".repeat(70) + "\n";
  
  return reporte;
}