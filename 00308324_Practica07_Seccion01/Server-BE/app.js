import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
const PORT = 5000;
// NOTA: Usa una clave fuerte y secreta en un entorno real.
const JWT_SECRET = "your_jwt_secret"; 

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// --- Simulación de Base de Datos y Registro ---
// En una aplicación real, esto provendría de MongoDB, MySQL, etc.
const users = [
    // Usuario de prueba pre-registrado: password cifrado de 'password123'
    { 
        id: 1, 
        email: "test@example.com", 
        password: "$2a$10$e9eR2l7RzJ/k/T/g9z.1lO.mP1UvE7fB9R4wZ9f0A.A/lYg/p2O" // Reemplaza con una contraseña cifrada real o implementa una ruta de registro.
    }
];

// Middleware: Función para verificar el Token JWT en el encabezado
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Acceso denegado: Token no proporcionado" });
    }

    // El token viene como "Bearer <token>"
    const token = authHeader.split(" ")[1];
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token inválido o expirado" });
        }
        // Si es válido, se adjunta la información del usuario a la solicitud
        req.user = user; 
        next(); // Continúa con la siguiente función (la ruta protegida)
    });
};

// --- Rutas (Endpoints) ---

// 1. Ruta de Inicio de Sesión (Publica)
app.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
    // Compara la contraseña (la parte de bcrypt.compare debe ser asíncrona)
    // NOTA: El código del artículo usa bcrypt, pero para esta simple simulación se usa un array.
    // Asumiremos que la contraseña ya está cifrada para simplificar el ejemplo.
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    // if (!isPasswordValid) return res.status(400).json({ message: "Credenciales inválidas" });

    // En el ejemplo simple del artículo, esta lógica es simulada:
    if (password !== "password123") return res.status(400).json({ message: "Credenciales inválidas" }); 

    // Crea el token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    
    res.status(200).json({ token });
});

// 2. Ruta Protegida (Requiere el Token)
app.get("/protected", verifyToken, (req, res) => {
    // Si llegamos aquí, el token fue verificado por 'verifyToken'
    res.status(200).json({ 
        message: "¡Acceso exitoso a la ruta protegida!", 
        user: req.user 
    });
});

// Inicia el servidor
app.listen(PORT, () => 
    console.log(`Server running at http://localhost:${PORT}`)
);