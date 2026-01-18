const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
    try {
        const [ticketsPendientes] = await db.promise().query("SELECT COUNT(*) AS count FROM tickets WHERE estado = 'Abierto'");
        const [equiposActivos] = await db.promise().query("SELECT COUNT(*) AS count FROM equipos WHERE estado = 'Operativo'");
        const [enReparacion] = await db.promise().query("SELECT COUNT(*) AS count FROM tickets WHERE estado = 'En Reparación'");
        const [ultimosTickets] = await db.promise().query("SELECT * FROM tickets ORDER BY fecha_creacion DESC LIMIT 5");

        res.json({
            ticketsPendientes: ticketsPendientes[0].count,
            equiposActivos: equiposActivos[0].count,
            enReparacion: enReparacion[0].count,
            ultimosTickets: ultimosTickets
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
