//server.js
const express = require('express');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const crypto = require('crypto');

const app = express();

// Konfigurasi Supabase (GANTI PPAKE PUNYA LO!)
const supabaseUrl = 'https://ibzgaokdgkjtydsrazpw.supabase.co';
const supabaseKey = 'sb_publishable_wb44sdrIasS5UI4F83azyw_ALgc2Cva'; // Service Role Key
const supabase = createClient(supabaseUrl, supabaseKey);

// Konfigurasi multer (buffer, bukan save ke disk)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB
});

// Endpoint upload
app.post('/upload', upload.single('cdnFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Generate random filename (format: 10 karakter hex)
        const ext = path.extname(req.file.originalname);
        const randomName = crypto.randomBytes(5).toString('hex'); // 10 karakter hex
        const fileName = `${randomName}${ext}`;
        
        // Upload ke Supabase Storage
        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype,
                cacheControl: '3600'
            });
        
        if (error) throw error;
        
        // Dapetin public URL
        const { data: { publicUrl } } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);
        
        // Kirim response pake DOMAIN LO sendiri!
        const yourDomain = 'https://babehmodss-vvip.my.id'; // GANTI!
        const customUrl = `${yourDomain}/file/${fileName}`;
        
        res.json({
            url: customUrl,
            link: customUrl,
            originalUrl: publicUrl
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint untuk serve file (redirect ke Supabase)
app.get('/file/:filename', async (req, res) => {
    const { filename } = req.params;
    
    const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filename);
    
    res.redirect(publicUrl);
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
