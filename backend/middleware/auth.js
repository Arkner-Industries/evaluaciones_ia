// este midelware no esta implementado aun
import jwt from "jsonwebtoken";

const verificar_token = (req, res, next) => {
    const cabecera = req.headers.authorization || "";

    const [tipo, token] = cabecera.split(" ");

    if (tipo !== "Bearer" || !token) {
        return res.status(401).json({ mensaje: "Token requerido" })
    }

    try {
        req.usuario = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ mensaje: "Token invalido o expirado" });
    }
};

const verificar_rol = (...roles) => (req, res, next) => {
    if (!req.usuario || !roles.usuario(req.usuario,rol)) {
        return res.status(403).json({ mensaje: "No tienes permiso para esto" })
    }
}

export {
    verificar_token,
    verificar_rol
}