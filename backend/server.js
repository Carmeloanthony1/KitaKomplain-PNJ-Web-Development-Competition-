import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

dotenv.config(); //biar bisa di proses dalam code, ngebaca .env

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY //anon key ini di pake untuk akses databasenya
);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:
    {
        user: process.env.EMAIL_USER, //email user
        pass: process.env.EMAIL_APP_PASSWORD //email password
    }
});

const verifytoken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; //ngambil tokennya aja, bearer (0) token (1)

    if(!token){
        return res.status(401).json({
            message: "Akses di tolak!, Kode tidak di temukan"
        });
    }

    try {
        const verified = JWT.verify(token, process.env.JWT_SECRET); //ngecheck kecocokannya dan masa kadarluasa
        req.user = verified; 
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Token tidak valid, sudah kadarluasa. Silahkan login!"
        });
    }
};

//Bagian signup
app.post('/api/auth/sign_up', async (req, res) => {
    const { username, email, password } = req.body;

    if(!username || !email || !password){
        return res.status(400).json({
            message: "Seluruh field harus di isi!"
        });
    }
    try {
        const { data: existingUser, error: fetchError } = await supabase
            .from('users') //ambil dari user, milih email dan username, cari yang emailnya sama atau usernamenya sama
            .select('email, username')
            .or(`email.eq.${email},username.eq.${username}`) //nyari yang emailnya sama atau usernamenya sama 
            .maybeSingle();
        
        if(existingUser){
            return res.status(400).json({
                message: "Username atau email sudah digunakan!"
            });
        }

        const saltRounds = 10;
        const hashed_password = await bcrypt.hash(password, saltRounds);

        const { data: newuser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    username: username,
                    email: email,
                    password: hashed_password
                }
            ])
            .select();
        
        if(insertError){
            throw insertError;
        }
        
        return res.status(200).json({
            message: "Sign up berhasil",
            user: {
                id: newuser[0].id,
                username: newuser[0].username,
                email: newuser[0].email
            }
        });
    } catch (error){
        console.error("Error sign up", error.message);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server! "
        });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { identifier, email, password } = req.body;
    const loginKey = identifier || email;

        if(!loginKey || !password){
            return res.status(400).json({
                message: "Email dan password wajib di isi!"
            });
        }
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .or(`email.eq.${loginKey},username.eq.${loginKey}`)
            .maybeSingle();
        
        if(error || !user){
            return res.status(400).json({
                message: "Email atau password salah"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({
                message : "Email atau password salah"
            });
        }

        const token = JWT.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: "Login berhasil!", token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error login: ", error.message);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!"
        });
    }
});

app.get('/api/tags', async (req, res) => {
    try {
        const { query } = req.query;

        const tags = await db.tag.findMany({
            where: {
                name: {
                    contains: query || "",
                    mode: 'insensitive',
                },
            },
        });

        res.json(tags);
    } catch (error){
        res.status(500).json({message: "Gagal mengambil data tag"});
    }
});

app.post('/api/reports', verifytoken, async (req, res) =>
{
    const { category, details } = req.body;

    if (!category || !details)
    {
        return res.status(400).json(
        {
            message: "Category dan detail wajib diisi!"
        });
    }
    try
    {

        // Generate ticket number
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const ticket = `Ticket-${randomNum}`;

        // Get user information from JWT
        const userId = req.user.id;
        const userEmail = req.user.email;

        const emailText =
            "User ID: " + userId + "\n" +
            "User Email: " + userEmail + "\n" +
            "Category: " + category + "\n\n" +
            "Details:\n" +
            details;

        // Send email
        await transporter.sendMail(
        {
            from: process.env.EMAIL_USER,
            to: process.env.DEVELOPER_EMAIL,
            subject: `[Support ${ticket} - ${category}]`,
            text: emailText
        });

        return res.status(200).json(
        {
            message: "Report berhasil dikirim!",
            ticket
        });

    }
    catch (error)
    {
        console.error("Error sending report:", error);

        return res.status(500).json(
        {
            message: "Gagal mengirim report."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di di http://localhost:${PORT}`)
});