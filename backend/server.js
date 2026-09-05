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

app.use(cors({
    origin: true,
    credentials: true
}));
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

app.patch('/api/reports/:id/status', verifytoken, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Status wajib dikirim!" });
    }

    try {
        const { data, error } = await supabase
            .from('reports')
            .update({ status: status })
            .eq('id', id)
            .select();

        if (error) throw error;

        return res.status(200).json({
            message: "Status laporan berhasil diperbarui!",
            report: data[0]
        });
    } catch (error) {
        console.error("Error updating status:", error.message);
        return res.status(500).json({ message: "Gagal memperbarui status laporan" });
    }
});

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

app.post('/api/auth/send-otp', verifytoken, async (req, res) => {
    const userId = req.user.id;
    const email = req.user.email; 

    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const { error: dbError } = await supabase
            .from('users')
            .update({ otp_code: otp })
            .eq('id', userId);

        if (dbError) throw dbError;

        const mailOptions = {
            from: `"KitaKomplain" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Kode Verifikasi Akun KitaKomplain",
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2>Verifikasi Akun Anda</h2>
                    <p>Masukkan kode 6 digit berikut untuk memverifikasi akun Anda:</p>
                    <h1 style="background-color: #f7f7f7; padding: 15px; letter-spacing: 5px; color: #a50034; border-radius: 10px;">
                        ${otp}
                    </h1>
                    <p style="color: #888; font-size: 12px;">Kode ini bersifat rahasia. Jangan berikan kepada siapapun.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "OTP berhasil dikirim" });
    } catch (error) {
        console.error("Gagal mengirim OTP:", error.message);
        return res.status(500).json({ message: "Gagal mengirim OTP" });
    }
});

app.post('/api/auth/verify-otp', verifytoken, async (req, res) => {
    const userId = req.user.id;
    const { otp } = req.body;

    if (!otp) {
        return res.status(400).json({ message: "Kode OTP wajib diisi!" });
    }

    try {
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('otp_code')
            .eq('id', userId)
            .single();

        if (fetchError || !user) throw new Error("User tidak ditemukan");

        if (user.otp_code === otp) {
            await supabase
                .from('users')
                .update({ is_verified: true, otp_code: null })
                .eq('id', userId);

            return res.status(200).json({ message: "Verifikasi berhasil" });
        } else {
            return res.status(400).json({ message: "Kode OTP salah" });
        }
    } catch (error) {
        console.error("Error verify OTP:", error.message);
        return res.status(500).json({ message: error.message });
    }
});

export default app;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}