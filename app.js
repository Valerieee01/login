import express from 'express'
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import mysql from "mysql2/promise";


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

    
    const [contrasena] =  await connection.query("SELECT contrasena FROM usuarios WHERE email = ?" , [email]);
    console.log("contraseña: ",contrasena)
    bcrypt.compare(password, contrasena); 

    console.log(rows);
    return res.json({"Hola":"Mundo"})
})

app.listen(3000)

app.post("/registro", async (req, res) => {
    const nombre = req.body.nombre;
    const email = req.body.email;
    const password = await bcrypt.hash(req.body.password,10);

    const respuesta = connection.query("INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)", [nombre, email, password]);
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

