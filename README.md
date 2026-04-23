# Performance Challenge - MALC

## Requisitos previos
Previamente debe tener instalado chocolatey "https://chocolatey.org/install#individual"

Como administrado en powershell debe ejecutar este comando "Set-ExecutionPolicy Bypass -Scope Process"

Y ejecutar este comando "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"

Para la instalación de k6 debe ejecutar como administrador en powershell
- *Windows:* `choco install k6` o descargar desde [k6.io](https://k6.io/docs/get-started/installation/)

## Verificar instalación:
k6 --version

## Ejecución de la prueba
Ingresar a la carpeta

cd challenge-performance-malc

Dentro de la carpeta challenge-performance-malc, ejecutar:
* k6 run test.js

## ¿Qué hace esta prueba?

Obtiene un token JWT válido usando las credenciales de prueba

Ejecuta dos escenarios de carga:
* 50 TPS (transacciones por segundo) durante 1 minuto
* 100 TPS (transacciones por segundo) durante 1 minuto

Cada request envía un título único (requisito del endpoint)

Al finalizar, genera un reporte en consola con resultados y conclusión

## Interpretación de resultados
El reporte mostrará los siguientes indicadores:
* Tiempo promedio: Tiempo que tardó cada request en promedio
* p95: El 95% de las requests fueron más rápidas que este valor
* Tasa de error: Porcentaje de requests que fallaron
* Estado: ✅ CUMPLE o ❌ NO CUMPLE

## Criterios de aprobación
* 50 TPS: 95% de requests < 2000 ms, error < 5%
* 100 TPS: 95% de requests < 3000 ms, error < 5%

## Resultados detallados
Además del reporte en consola, se genera un archivo JSON en la carpeta: "output/" con todas las métricas.
