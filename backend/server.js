import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

const verifytoken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: "Akses di tolak!, Kode tidak di temukan"
        });
    }

    try {
        const verified = JWT.verify(token, process.env.JWT_SECRET || 'secretkey');
        req.user = verified; 
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Token tidak valid, sudah kadarluasa. Silahkan login!"
        });
    }
};

// Bagian signup
app.post('/api/auth/sign_up', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Seluruh field harus di isi!"
        });
    }
    try {
        const { data: existingUser } = await supabase
            .from('users')
            .select('email, username')
            .or(`email.eq.${email},username.eq.${username}`)
            .maybeSingle();
        
        if (existingUser) {
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
        
        if (insertError) throw insertError;
        
        return res.status(200).json({
            message: "Sign up berhasil",
            user: {
                id: newuser[0].id,
                username: newuser[0].username,
                email: newuser[0].email
            }
        });
    } catch (error) {
        console.error("Error sign up:", error.message);
        return res.status(500).json({
            message: "Terjadi kesalahan pada server!"
        });
    }
});

// Bagian Login
app.post('/api/auth/login', async (req, res) => {
    const { identifier, email, password } = req.body;
    const loginKey = identifier || email;

    if (!loginKey || !password) {
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
        
        if (error || !user) {
            return res.status(400).json({
                message: "Email atau password salah"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Email atau password salah"
            });
        }

        const token = JWT.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: "Login berhasil!", 
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Error login:", error.message);
        return res.status(500).json({
            message: "Terjadi kesalahan di server!"
        });
    }
});

// Endpoint untuk Tag
app.get('/api/tags', async (req, res) => {
    try {
        const { query } = req.query;

        let supabase_query = supabase.from('posts').select('tag');

        if (query && query.trim() !== '') {
            supabase_query = supabase_query.ilike('tag', `%${query.trim()}%`);
        }

        const { data, error } = await supabase_query;

        if (error) throw error;

        const tags = data
            .map(item => item.tag)
            .filter(tag => tag !== null && tag !== "")
            .map((tagName, index) => ({ id: index + 1, name: tagName.replace('#', '') }));

        return res.status(200).json(tags);

    } catch (error) {
        console.error("Error fetching tags:", error.message);
        return res.status(500).json({ message: "Gagal mengambil data tag" });
    }
});

// Endpoint Fetch Posts
app.get('/api/posts', async (req, res) => {
    try {
        const { query } = req.query;
        let supabase_query = supabase
            .from('posts')
            .select(`
                id,
                description,
                image_url,
                tag,
                created_at,
                user_id,
                users (
                    username,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false });

        if (query && query.trim() !== '') {
            const search_term = `%${query.trim()}%`;
            supabase_query = supabase_query.or(`description.ilike.${search_term},tag.ilike.${search_term}`);
        }

        const { data: posts, error } = await supabase_query;
        
        if (error) {
            console.error("Supabase error /posts:", error);
            return res.status(400).json({ message: error.message });
        }        
        return res.status(200).json(posts || []);
    } catch (error) {
        console.error("Error fetching posts:", error.message);
        return res.status(500).json({ message: "Gagal mengambil data postingan" });
    }
});

// Endpoint Buat Post Baru
app.post('/api/posts', verifytoken, async (req, res) => {
    const { description, image_url, tag } = req.body;
    const userId = req.user.id;

    if (!description) {
        return res.status(400).json({
            message: "Deskripsi postingan wajib diisi!"
        });
    }

    try {
        const cleanTag = tag ? tag.replace('#', '').trim() : null;

        const { data: newPost, error } = await supabase
            .from('posts')
            .insert([
                {
                    user_id: userId,
                    description: description,
                    image_url: image_url || null,
                    tag: cleanTag
                }
            ])
            .select();

        if (error) throw error;

        return res.status(201).json({
            message: "Postingan berhasil dibuat!",
            post: newPost[0]
        });
    } catch (error) {
        console.error("Error creating post:", error.message);
        return res.status(500).json({
            message: "Gagal membuat postingan!"
        });
    }
});

// Endpoint Fetch Reports
app.get('/api/reports', verifytoken, async (req, res) => {
    try {
        const { data: reports, error } = await supabase
            .from('reports')
            .select(`
                id,
                ticket,
                category,
                problem_type,
                details,
                status,
                created_at,
                user_id,
                users (
                    username,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return res.status(200).json(reports || []);
    } catch (error) {
        console.error("Error fetching reports:", error.message);
        return res.status(500).json({ message: "Gagal mengambil data report" });
    }
});

// Endpoint Create Report Problem
app.post('/api/reports', verifytoken, async (req, res) => {
    const { category, problemType, problem_type, details } = req.body;
    const selectedProblemType = problemType || problem_type || "Technical";

    if (!category || !details) {
        return res.status(400).json({
            message: "Category dan detail wajib diisi!"
        });
    }
    try {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const ticket = `Ticket-${randomNum}`;

        const userId = req.user.id;
        const userEmail = req.user.email;

        const { data: New_report, error } = await supabase
            .from('reports')
            .insert([
                {
                    ticket: ticket, 
                    user_id: userId,
                    category: category,
                    problem_type: selectedProblemType,
                    details: details,
                    status: "Waiting"
                }
            ])
            .select();
        
        if (error) {
            console.error("Error inserting report:", error);
            return res.status(500).json({
                message: "Gagal menyimpan report ke database", 
                error: error.message
            });
        }

        const emailText =
            `Nomor Ticket: ${ticket}\n` +  
            `User ID: ${userId}\n` +
            `User Email: ${userEmail}\n` +
            `Category: ${category}\n` +
            `Problem Type: ${selectedProblemType}\n\n` +
            `Details:\n${details}`;

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: process.env.DEVELOPER_EMAIL,
                subject: `[Support ${ticket} - ${category}]`,
                text: emailText
            });
        } catch (mailError) {
            console.error("Error sending email (laporan tetap tersimpan di DB):", mailError.message);
        }

        return res.status(200).json({
            message: "Report berhasil dikirim!",
            ticket: ticket,
            report: New_report[0]
        });

    } catch (error) {
        console.error("Error sending report:", error);

        return res.status(500).json({
            message: "Gagal mengirim report.",
            errordetail: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});