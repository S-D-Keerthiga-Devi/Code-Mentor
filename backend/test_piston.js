// No import needed for fetch in Node 18+
const runTest = async () => {
    const code = `console.log("Hello Piston");`;

    // Test Case 1: Specific Version 18.15.0
    console.log("Test 1: Specific Version 18.15.0");
    try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: "javascript",
                version: "18.15.0",
                files: [{ content: code }]
            })
        });

        console.log("Status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("Data:", JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log("Error Body:", text);
        }

    } catch (e) {
        console.error("Test 1 Failed:", e.message);
    }

    // Test Case 2: Wildcard Version
    console.log("\nTest 2: Wildcard Version *");
    try {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                language: "javascript",
                version: "*",
                files: [{ content: code }]
            })
        });

        console.log("Status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("Data:", JSON.stringify(data, null, 2));
        } else {
            const text = await response.text();
            console.log("Error Body:", text);
        }
    } catch (e) {
        console.error("Test 2 Failed:", e.message);
    }
};

runTest();
