const fs = require('fs');
const path = require('path');

// Read the generate-docs.js file
const code = fs.readFileSync(path.join(__dirname, 'generate-docs.js'), 'utf-8');

// Extract the endpoints array
const match = code.match(/const endpoints = (\[[\s\S]*?\]);\s*let html =/);
if (!match) {
    console.error("Could not find endpoints array.");
    process.exit(1);
}

let endpoints;
try {
    // Safely evaluate the array
    endpoints = eval(match[1]);
} catch (e) {
    console.error("Failed to parse endpoints array:", e);
    process.exit(1);
}

// Build the Postman Collection structure
const collection = {
    info: {
        name: "Krisna WA Gateway API",
        description: "Dokumentasi Resmi Integrasi API Enterprise",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    variable: [
        {
            key: "base_url",
            value: "https://api.krisnamarket.my.id",
            type: "string"
        },
        {
            key: "x_master_key",
            value: "MASTER_KEY_ANDA",
            type: "string"
        },
        {
            key: "x_api_key",
            value: "API_KEY_ANDA",
            type: "string"
        }
    ],
    item: []
};

// Group endpoints by category or badge
let currentFolder = null;

endpoints.forEach(ep => {
    if (ep.category) {
        // Remove emojis and formatting from category name for folder
        let folderName = ep.category.replace(/[^\w\s/()-]/gi, '').trim();
        currentFolder = {
            name: folderName,
            item: []
        };
        collection.item.push(currentFolder);
    }

    // Prepare headers
    const headers = [];
    if (ep.badge === "master") {
        headers.push({ key: "x-master-key", value: "{{x_master_key}}", type: "text" });
    } else if (ep.badge === "user") {
        headers.push({ key: "x-api-key", value: "{{x_api_key}}", type: "text" });
    }

    if (ep.params && ep.params.find(p => p.field === "sender_id")) {
         headers.push({ key: "sender_id", value: "628xxx", type: "text", disabled: true });
    }

    // Content-Type for POST
    if (ep.method === "POST" || ep.method === "PUT") {
        headers.push({ key: "Content-Type", value: "application/json", type: "text" });
    }

    // Build Request
    const request = {
        method: ep.method,
        header: headers,
        url: {
            raw: "https://api.krisnamarket.my.id" + ep.path,
            protocol: "https",
            host: ["api", "krisnamarket", "my", "id"],
            path: ep.path.split('/').filter(p => p)
        },
        description: ep.summary
    };

    if (ep.reqBody) {
        request.body = {
            mode: "raw",
            raw: ep.reqBody,
            options: {
                raw: { language: "json" }
            }
        };
    }

    const postmanItem = {
        name: ep.path,
        request: request,
        response: []
    };

    if (currentFolder) {
        currentFolder.item.push(postmanItem);
    } else {
        collection.item.push(postmanItem);
    }
});

fs.writeFileSync(path.join(__dirname, 'Krisna_WA_Gateway.postman_collection.json'), JSON.stringify(collection, null, 2));
console.log("Successfully generated Postman Collection!");
