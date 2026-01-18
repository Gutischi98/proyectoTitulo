const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {
        let sql = `
            SELECT t.*, 
                   u_reporta.nombre_completo AS nombre_reporta,
                   u_asigna.nombre_completo AS nombre_asignado
            FROM tickets t
            LEFT JOIN usuarios u_reporta ON t.id_usuario_reporta = u_reporta.id_usuario
            LEFT JOIN usuarios u_asigna ON t.id_usuario_asignado = u_asigna.id_usuario
        `;
        
        const params = [];

        // Relaxed check: != instead of !== to handle string vs number roles
        if (req.user.rol != 1) {
            sql += ' WHERE t.id_usuario_reporta = ? OR t.id_usuario_asignado = ?';
            params.push(req.user.id, req.user.id);
        }

        sql += ' ORDER BY t.fecha_creacion DESC';

        const [results] = await db.promise().query(sql, params);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
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