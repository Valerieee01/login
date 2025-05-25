import express from 'express'
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import mysql from "mysql2/promise";
import jwt from 'jsonwebtoken';


const app = express()

// Permite que la app acepte datos JSON
app.use(bodyParser.json()); 
// app.use(express.json());
// Permite el envio de datos de tipo utlencode
app.use(express.urlencoded({ extended: true }));

app.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.contrasena;
  const [rows] = await connection.query("SELECT * FROM usuarios WHERE email = ?" , [email]);
  
  // console.log("password: ", password);
  // console.log("contraseña: ",rows[0].contrasena);
  
  const esValido = await bcrypt.compare(password, rows[0].contrasena)
  if (esValido) {
    console.log('Contraseña correcta. Usuario Autenticado');
    // console.log(rows);
    // contraseñas correctas
    const token = await generarToken(rows[0]);
    const tokenRefresh = await generarTokenRefresh(rows[0]);
    const bdTokenRefres = await connection.query('UPDATE usuarios SET refreshToken = ? WHERE email = ?', [tokenRefresh, email]);
    // console.log({"Generado Token inicio: ":token});
    // console.log({"Generado Token Refresco: ": tokenRefresh});
    return res.json({
      mensaje : "Usuario Autenticado",
      token : token,
      tokenRefresh: tokenRefresh
    })
    
  } else {
    // contraseñas sin coincidir
    console.log('Contraseña incorrecta. Usuario no Autenticado');
    
    return res.json({
      mensaje : "Contraseña incorrecta. Usuario no Autenticado",
    })
  }
  
});
const validarToken = (req, res, next) => {

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader && !authHeader.startsWith('Bearer')) {
        return res.json({
            mensaje: "No Existe o Es Incorrecto el Token"
        });
    }

    const token = authHeader.split('  ')[1];   
    const decode = jwt.verify(token, "secret")

    next();
  } catch (error) {
    return res.json({
            "mensaje": "Token Expirado"
        });
  }

    
};


app.get('/privada', (req, res) => {
    return res.json({
      mensaje: "Ingresando a la ruta refresh"
    });
})


app.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split('  ')[1];  
    
    const decode = jwt.verify(token, "secretRefresh");

    

    const nuevoToken = await generarToken(decode)
      return res.json({
      mensaje: "Ingresando a la ruta Refresh",
      tokenRefresh : nuevoToken
    }); 
    
  } catch (error) {
    return res.json({
      mensaje: "Erroral ingresar a la ruta Refresh",
    }); 
  }

  
});

const generarToken = async (user) => {
  return jwt.sign({
    data: 'foobar'
  }, 'secret', { expiresIn: '1h' });
}


const generarTokenRefresh = async (user) => {
  return jwt.sign({
    data: 'foobar'
  }, 'secretRefresh', { expiresIn: '7d' });
}

app.listen(3000)

app.post("/registro", async (req, res) => {
    const nombre = req.body.nombre;
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password,10);
    const [respuesta] = connection.query("INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)", [nombre, email, password]);

    console.log(respuesta);
    console.log(nombre,email,password);
    return res.json({"registro": true}) 
})


// Configuración de la conexión
const connection = await mysql.createConnection({
  host: "localhost",
  user: "login",
  password: "Aprendiz2024",
  database: "nodeLogin",
});

