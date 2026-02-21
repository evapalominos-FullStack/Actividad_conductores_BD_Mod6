# 🚗 API CONDUCTORES Y AUTOMÓVILES 

Se crea una API (servidor) que se conecta a PostgreSQL y un sitio web que consume esa API.

---

## 🛠️ PASO 1: 

### Node.js, 
### PostgreSQL

## 📁 PASO 2: 

### 2.1 Crear carpeta

mkdir api-conductores
cd api-conductores

### Inicializar proyecto Node
npm init -y

### Instalar paquetes necesarios
npm install express pg cors

## 🗄️ PASO 3: CREAR LA BASE DE DATOS
### pgAdmin4

### Crear una base de datos
conductores_db

## 💻 PASO 4: CONFIGURAR EL SERVIDOR
## 🚀 PASO 5: INICIAR EL SERVIDOR
🚀 Servidor corriendo en http://localhost:3000

### ✅ Ver todos los conductores
http://localhost:3000/conductores
### ✅ Ver todos los automóviles
http://localhost:3000/automoviles
### ✅ Conductores sin auto menores de 30 años
http://localhost:3000/conductoressinauto?edad=30
### ✅ Ver solitos
http://localhost:3000/solitos
### ✅ Buscar auto por patente
http://localhost:3000/auto?patente=HXJH55
### ✅ Buscar autos que comienzan con H
http://localhost:3000/auto?iniciopatente=H

## 🎨 PASO 7: USAR EL FRONTEND

====================================================================
DESARROLLO DE APLICACIONES FULL STACK JAVASCRIPT TRAINEE V2.0

  ASTRID EVA PALOMINOS ESPINOZA 🚀



