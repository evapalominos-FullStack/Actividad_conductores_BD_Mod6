
const express = require('express');  
const cors = require('cors');         
const { Pool } = require('pg');      

const app = express();

const PORT = 3000;

const pool = new Pool({
    host: 'localhost',          
    port: 5432,                  
    password: '2087localc',     
    database: 'conductores_db'    
});

pool.connect((error) => {
    if (error) {
        console.log('❌ Error conectando a PostgreSQL:', error);
    } else {
        console.log('✅ Conectado a PostgreSQL exitosamente');
    }
});

app.use(cors());              // Permite que el frontend pueda hacer peticiones
app.use(express.json());      // Permite leer JSON en las peticiones

// ============================================
// ENDPOINTS - LAS RUTAS DE LA API
// ============================================

// RUTA RAÍZ - Solo para probar que el servidor funciona
app.get('/', (req, res) => {
    res.send('¡Servidor funcionando! 🚀 Prueba con /conductores o /automoviles');
});

// ============================================
// 1️⃣ GET /conductores
// Devuelve TODOS los conductores
// ============================================
app.get('/conductores', async (req, res) => {
    try {
        // Hacemos la consulta SQL
        const resultado = await pool.query('SELECT * FROM conductores');
        
        // Enviamos los datos
        res.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        // Si hay error, lo mostramos
        console.log('Error:', error);
        res.status(500).json({ 
            exito: false, 
            mensaje: 'Error al obtener conductores' 
        });
    }
});

// ============================================
// 2️⃣ GET /automoviles
// Devuelve TODOS los automóviles
// ============================================
app.get('/automoviles', async (req, res) => {
    try {
        // Consulta SQL simple
        const resultado = await pool.query('SELECT * FROM automoviles');
        
        // Enviamos respuesta
        res.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ 
            exito: false, 
            mensaje: 'Error al obtener automóviles' 
        });
    }
});

// ============================================
// 3️⃣ GET /conductoressinauto?edad=30
// Devuelve conductores SIN auto menores de X años
// ============================================
app.get('/conductoressinauto', async (req, res) => {
    try {
        // Obtenemos el parámetro "edad" de la URL
        const edad = req.query.edad;
        
        // Verificamos que haya puesto una edad
        if (!edad) {
            return res.status(400).json({ 
                exito: false, 
                mensaje: 'Debes poner ?edad=numero en la URL' 
            });
        }
        
        // SQL: Busca conductores que:
        // - Tienen menos de X años
        // - NO aparecen en la tabla automoviles
        const consulta = `
            SELECT c.nombre, c.edad
            FROM conductores c
            LEFT JOIN automoviles a ON c.nombre = a.nombre_conductor
            WHERE c.edad < $1 AND a.nombre_conductor IS NULL
        `;
        
        const resultado = await pool.query(consulta, [edad]);
        
        res.json({
            exito: true,
            mensaje: `Conductores menores de ${edad} años sin auto`,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ 
            exito: false, 
            mensaje: 'Error en la consulta' 
        });
    }
});

// ============================================
// 4️⃣ GET /solitos
// Devuelve conductores sin auto Y autos sin conductor
// ============================================
app.get('/solitos', async (req, res) => {
    try {
        // Primera consulta: Conductores sin auto
        const conductoresSinAuto = await pool.query(`
            SELECT c.nombre, c.edad
            FROM conductores c
            LEFT JOIN automoviles a ON c.nombre = a.nombre_conductor
            WHERE a.nombre_conductor IS NULL
        `);
        
        // Segunda consulta: Autos sin conductor (conductor no existe)
        const autosSinConductor = await pool.query(`
            SELECT a.marca, a.patente, a.nombre_conductor
            FROM automoviles a
            LEFT JOIN conductores c ON a.nombre_conductor = c.nombre
            WHERE c.nombre IS NULL
        `);
        
        // Enviamos ambos resultados
        res.json({
            exito: true,
            conductores_sin_auto: conductoresSinAuto.rows,
            autos_sin_conductor: autosSinConductor.rows
        });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ 
            exito: false, 
            mensaje: 'Error en la consulta' 
        });
    }
});

// ============================================
// 5️⃣ GET /auto?patente=HXJH55
// GET /auto?iniciopatente=H
// Busca auto por patente exacta O por letra inicial
// ============================================
app.get('/auto', async (req, res) => {
    try {
        // Obtenemos los parámetros de la URL
        const patente = req.query.patente;
        const inicioPatente = req.query.iniciopatente;
        
        // Verificamos que haya puesto al menos uno
        if (!patente && !inicioPatente) {
            return res.status(400).json({ 
                exito: false, 
                mensaje: 'Debes poner ?patente=ABC o ?iniciopatente=A' 
            });
        }
        
        let consulta;
        let valores;
        
        // Si busca por patente exacta
        if (patente) {
            consulta = `
                SELECT a.marca, a.patente, a.nombre_conductor, c.edad
                FROM automoviles a
                LEFT JOIN conductores c ON a.nombre_conductor = c.nombre
                WHERE a.patente = $1
            `;
            valores = [patente];
        } 
        // Si busca por inicio de patente
        else {
            consulta = `
                SELECT a.marca, a.patente, a.nombre_conductor, c.edad
                FROM automoviles a
                LEFT JOIN conductores c ON a.nombre_conductor = c.nombre
                WHERE a.patente LIKE $1
            `;
            valores = [inicioPatente + '%'];  // El % significa "cualquier cosa después"
        }
        
        const resultado = await pool.query(consulta, valores);
        
        // Si no encuentra nada
        if (resultado.rows.length === 0) {
            return res.status(404).json({ 
                exito: false, 
                mensaje: 'No se encontró ningún auto' 
            });
        }
        
        res.json({
            exito: true,
            cantidad: resultado.rows.length,
            datos: resultado.rows
        });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ 
            exito: false, 
            mensaje: 'Error en la consulta' 
        });
    }
});

// ============================================
// INICIAR EL SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📝 Prueba estas rutas:`);
    console.log(`   http://localhost:${PORT}/conductores`);
    console.log(`   http://localhost:${PORT}/automoviles`);
    console.log(`   http://localhost:${PORT}/conductoressinauto?edad=30`);
    console.log(`   http://localhost:${PORT}/solitos`);
    console.log(`   http://localhost:${PORT}/auto?patente=HXJH55`);
    console.log(`   http://localhost:${PORT}/auto?iniciopatente=H\n`);
});
