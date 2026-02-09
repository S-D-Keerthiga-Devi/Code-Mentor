import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const uploadFile = async () => {
    try {
        const form = new FormData();
        // Create a dummy PDF file if it doesn't exist
        const filePath = path.join(process.cwd(), 'test_debug.pdf');
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, '%PDF-1.4\n%...\n');
        }

        form.append('file', fs.createReadStream(filePath));
        form.append('title', 'Debug Upload');

        console.log('Attempting to upload file...');
        const response = await axios.post('http://localhost:5000/api/course-materials/upload', form, {
            headers: {
                ...form.getHeaders(),
            },
        });

        console.log('Upload Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Server Error Response:', JSON.stringify(error.response.data, null, 2));
            console.error('Status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
    }
};

uploadFile();
