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

## Reportes
Al finalizar la ejecución, se generarán los siguientes archivos en la carpeta output/:

Archivo -> Descripción

reporte-ejecutivo.txt -> Reporte en texto plano para personas no técnicas

reporte-tecnico.html -> Reporte visual con gráficos y métricas detalladas

datos-{timestamp}.json -> Datos crudos en formato JSON

## Interpretación de resultados
El reporte mostrará los siguientes indicadores:

Indicador ->	Qué significa

Tiempo promedio ->	Tiempo promedio que tardó cada petición en completarse

Tiempo máximo ->La petición más lenta registrada

Tiempo p95 -> El 95% de las peticiones fueron más rápidas que este valor

Tasa de error -> Porcentaje de peticiones que fallaron

## Criterios de aprobación
Escenario	- Tiempo p95 - Tasa de error

50 TPS	< 2000 ms (2 segundos)	< 5%

100 TPS	< 3000 ms (3 segundos)	< 5%

# Estados posibles

Estado -> Significado

✅ CUMPLE	El sistema está dentro de los límites aceptables

⚠️ OPTIMIZACIÓN REQUERIDA -> Funciona bien en condiciones normales, pero falla en alta demanda

❌ NO CUMPLE -> El sistema presenta problemas incluso en condiciones normales


# Convertir el reporte técnico a PDF

Abra el archivo output/reporte-tecnico.html en su navegador

Presione Ctrl + P (Windows) / Cmd + P (Mac)

Seleccione "Guardar como PDF"

Guarde el archivo
