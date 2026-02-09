import axios from 'axios';

const testChat = async () => {
    try {
        console.log('Sending chat query...');
        const response = await axios.post('http://localhost:5000/api/course-materials/chat', {
            query: "What is in the syllabus?"
        });
        console.log('Chat Response:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Server Error Response:', JSON.stringify(error.response.data, null, 2));
            console.error('Status:', error.response.status);
        } else {
            console.error('Error:', error.message);
        }
    }
};

testChat();
