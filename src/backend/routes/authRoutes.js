const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error del servidor' });
        
        if (results.length === 0) {
            return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        }

        const usuario = results[0];
        const validPassword = await bcrypt.compare(password, usuario.password_hash);


        if (!validPassword) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.id_rol },
            process.env.JWT_SECRET || 'secreto',
            { expiresIn: '8h' }
        );

        res.json({
            message: 'Bienvenido',
            token: token,
            usuario: { 
                id_usuario: usuario.id_usuario,
                nombre: usuario.nombre_completo, 
                rol: usuario.id_rol 
            }
        });
    });
});

module.exports = router;