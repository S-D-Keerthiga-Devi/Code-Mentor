import axios from 'axios';

const testImprovedPrompt = async () => {
    const questions = [
        "give study plan for the given syllabus",
        "summarise the course content",
        "What subjects are in semester 7?"
    ];

    for (const q of questions) {
        try {
            console.log(`\n${'='.repeat(70)}`);
            console.log(`Question: "${q}"`);
            console.log('='.repeat(70));

            const response = await axios.post('http://localhost:5000/api/course-materials/chat', {
                query: q
            });

            console.log('\nAI Response:');
            console.log(response.data.answer.substring(0, 300) + '...\n');

        } catch (error) {
            console.error('❌ Error:', error.response?.data || error.message);
        }
    }
};

testImprovedPrompt();
