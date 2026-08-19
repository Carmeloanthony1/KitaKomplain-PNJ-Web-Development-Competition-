import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

dotenv.config(); //biar bisa di proses dalam code, ngebaca .env

const app = express();
const PORT = process.env.PORT || 500;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY //anon key ini di pake untuk akses databasenya
);

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
    const { username, }
})