const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {
        const [results] = await db.promise().query(`
            SELECT e.id_equipo, e.nombre_equipo, e.numero_serie, e.estado, 
                   e.id_categoria, c.nombre_categoria, 
                   e.id_ubicacion_actual, u.nombre_lugar 
            FROM equipos e
            JOIN categorias c ON e.id_categoria = c.id_categoria
            JOIN ubicaciones u ON e.id_ubicacion_actual = u.id_ubicacion
        `);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyAdmin, async (req, res) => {
    const { nombre, serie, estado, categoria, ubicacion } = req.body;
    try {
        const [result] = await db.promise().query(
            `INSERT INTO equipos (nombre_equipo, numero_serie, estado, id_categoria, id_ubicacion_actual, fecha_adquisicion) VALUES (?, ?, ?, ?, ?, NOW())`,
            [nombre, serie, estado, categoria, ubicacion]
        );
        res.json({ message: 'Equipo guardado', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.promise().query("DELETE FROM equipos WHERE id_equipo = ?", [id]);
        res.json({ message: 'Equipo eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'No se puede eliminar (quizás tiene historial asociado)' });
    }
});

router.put('/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    const { nombre, serie, estado, categoria, ubicacion } = req.body;
    
    try {
        await db.promise().query(
            `UPDATE equipos SET nombre_equipo = ?, numero_serie = ?, estado = ?, id_categoria = ?, id_ubicacion_actual = ? WHERE id_equipo = ?`,
            [nombre, serie, estado, categoria, ubicacion, id]
        );
        res.json({ message: 'Equipo actualizado correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

async function deleteItem(id, res) {
    try {
        await db.promise().query("DELETE FROM equipos WHERE id_equipo = ?", [id]);
        res.json({ message: 'Equipo eliminado correctamente' });
    } catch (err) {
        res.status(500).json({ error: 'No se puede eliminar (quizás tiene historial asociado)' });
    }
}

module.exports = router;