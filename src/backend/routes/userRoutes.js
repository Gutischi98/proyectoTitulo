const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', verifyAdmin, async (req, res) => {
    try {
        const [users] = await db.promise().query(`
            SELECT u.id_usuario, u.nombre_completo, u.email, r.nombre_rol 
            FROM usuarios u 
            JOIN roles r ON u.id_rol = r.id_rol
        `);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', verifyAdmin, async (req, res) => {
    const { nombre, email, password, rol } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const [result] = await db.promise().query(
            "INSERT INTO usuarios (nombre_completo, email, password_hash, id_rol) VALUES (?, ?, ?, ?)",
            [nombre, email, hash, rol]
        );
        res.json({ message: 'Usuario creado', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', verifyAdmin, async (req, res) => {
    const { nombre, email, rol } = req.body;
    const { id } = req.params;
    try {
        await db.promise().query(
            "UPDATE usuarios SET nombre_completo = ?, email = ?, id_rol = ? WHERE id_usuario = ?",
            [nombre, email, rol, id]
        );
        res.json({ message: 'Usuario actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id/password', verifyAdmin, async (req, res) => {
    const { password } = req.body;
    const { id } = req.params;
    try {
        const hash = await bcrypt.hash(password, 10);
        await db.promise().query("UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?", [hash, id]);
        res.json({ message: 'Contraseña actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/profile/change-password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const [users] = await db.promise().query("SELECT password_hash FROM usuarios WHERE id_usuario = ?", [userId]);
        if (users.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const user = users[0];

        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return res.status(401).json({ error: 'La contraseña actual es incorrecta' });

        const newHash = await bcrypt.hash(newPassword, 10);
        await db.promise().query("UPDATE usuarios SET password_hash = ? WHERE id_usuario = ?", [newHash, userId]);

        res.json({ message: 'Tu contraseña ha sido actualizada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;