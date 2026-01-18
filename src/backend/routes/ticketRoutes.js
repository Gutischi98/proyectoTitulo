const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {
        console.log('DEBUG: Iniciando consulta de tickets...');
        if (!req.user) {
             throw new Error('Req.user is undefined');
        }
        console.log('DEBUG: User:', req.user);

        // Simplificado para debug: sin JOINs complejos por ahora, y sin filtros
        // Recuperemos TODO para ver si el SQL básico funciona
        let sql = `SELECT * FROM tickets ORDER BY fecha_creacion DESC`;
        
        console.log('DEBUG: SQL Simple:', sql);

        const [results] = await db.promise().query(sql);
        console.log('DEBUG: Resultados obtenidos:', results.length);
        
        res.json(results);
    } catch (err) {
        console.error('ERROR CRITICO EN TICKET ROUTES:', err);
        res.status(500).json({ error: 'Fallo Backend: ' + err.message, stack: err.stack });
    }
});

router.post('/', (req, res) => {
    const { asunto, descripcion, prioridad, id_usuario } = req.body;
    const sql = `INSERT INTO tickets (asunto, descripcion, prioridad, estado, id_usuario_reporta) VALUES (?, ?, ?, 'Abierto', ?)`;
    
    db.query(sql, [asunto, descripcion, prioridad, id_usuario], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Ticket creado', id: result.insertId });
    });
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { estado, prioridad, id_usuario_asignado } = req.body;
    
    let sql, params;

    if (req.user.rol === 1) {
        sql = `UPDATE tickets SET estado = ?, prioridad = ?, id_usuario_asignado = ? WHERE id_ticket = ?`;
        params = [estado, prioridad, id_usuario_asignado || null, id];
    } else {
        sql = `UPDATE tickets SET estado = ?, prioridad = ? WHERE id_ticket = ?`;
        params = [estado, prioridad, id];
    }
    
    try {
        await db.promise().query(sql, params);
        res.json({ message: 'Ticket actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    
    if (req.user.rol !== 1) {
        return res.status(403).json({ error: 'Solo administradores pueden eliminar tickets' });
    }

    try {
        await db.promise().query("DELETE FROM tickets WHERE id_ticket = ?", [id]);
        res.json({ message: 'Ticket eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;