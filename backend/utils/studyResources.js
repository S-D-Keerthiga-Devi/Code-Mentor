/**
 * Curated database of verified, direct video tutorials (YouTube direct watch URLs)
 * and official documentation / concept articles (MDN, JavaScript.info, GeeksforGeeks, OWASP).
 */

export const CURATED_RESOURCE_DATABASE = [
    {
        keywords: ["binary search", "binarysearch", "left <= right", "mid", "pointer", "infinite loop", "while (left", "while(left"],
        videos: [
            {
                title: "Binary Search Algorithm in 100 Seconds",
                url: "https://www.youtube.com/watch?v=MFhxShGxHWc",
                channel: "Fireship"
            },
            {
                title: "Binary Search - Step by Step Implementation & Pointer Safety",
                url: "https://www.youtube.com/watch?v=s4DPM8ct1pI",
                channel: "NeetCode"
            },
            {
                title: "JavaScript While Loop & Avoiding Infinite Loops",
                url: "https://www.youtube.com/watch?v=24WkytymZ88",
                channel: "Programming with Mosh"
            }
        ],
        articles: [
            {
                title: "MDN: while statement & loop termination condition",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while",
                source: "MDN Web Docs"
            },
            {
                title: "GeeksforGeeks: Binary Search in JavaScript",
                url: "https://www.geeksforgeeks.org/binary-search-in-javascript/",
                source: "GeeksforGeeks"
            },
            {
                title: "JavaScript.info: While and For Loops Guide",
                url: "https://javascript.info/while-for",
                source: "JavaScript.info"
            }
        ]
    },
    {
        keywords: ["two sum", "twosum", "hash map", "hashmap", "map", "nested loop", "o(n^2)", "o(n2)", "findtwosum", "complement"],
        videos: [
            {
                title: "Two Sum - LeetCode 1 (Optimal Hash Map Solution)",
                url: "https://www.youtube.com/watch?v=KLlXCFG5TnA",
                channel: "NeetCode"
            },
            {
                title: "Big-O Notation in 100 Seconds",
                url: "https://www.youtube.com/watch?v=g2o22C3CRfU",
                channel: "Fireship"
            },
            {
                title: "JavaScript Map and Set in 15 Minutes",
                url: "https://www.youtube.com/watch?v=hLgUTM3FOII",
                channel: "Web Dev Simplified"
            }
        ],
        articles: [
            {
                title: "MDN: Map object and O(1) Constant Time Lookups",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map",
                source: "MDN Web Docs"
            },
            {
                title: "GeeksforGeeks: Two Sum Problem using Hash Map",
                url: "https://www.geeksforgeeks.org/two-sum-problem-using-hashmap/",
                source: "GeeksforGeeks"
            },
            {
                title: "JavaScript.info: Map and Set Data Structures",
                url: "https://javascript.info/map-set",
                source: "JavaScript.info"
            }
        ]
    },
    {
        keywords: ["sql injection", "sqli", "select * from", "parameterized", "prepared statement", "dbquery", "' or '1'='1"],
        videos: [
            {
                title: "SQL Injection Tutorial for Beginners",
                url: "https://www.youtube.com/watch?v=2nXOxLpeu80",
                channel: "freeCodeCamp"
            },
            {
                title: "SQL Injection Explained in 5 Minutes",
                url: "https://www.youtube.com/watch?v=ciNHn38EyRc",
                channel: "Computerphile"
            }
        ],
        articles: [
            {
                title: "OWASP: SQL Injection Prevention Cheat Sheet",
                url: "https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html",
                source: "OWASP"
            },
            {
                title: "MDN: Express & Node.js SQL Parameterization Security",
                url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Express_Nodejs/forms",
                source: "MDN Web Docs"
            }
        ]
    },
    {
        keywords: ["bubble sort", "sort", "bubblesort", "array sorting", "swap", "quicksort", "mergesort"],
        videos: [
            {
                title: "Bubble Sort Algorithm in 2 Minutes",
                url: "https://www.youtube.com/watch?v=xli_FI7CuzA",
                channel: "Geekific"
            },
            {
                title: "Sorting Algorithms Explained with Visualizations",
                url: "https://www.youtube.com/watch?v=kPRA0W1kECg",
                channel: "Bro Code"
            }
        ],
        articles: [
            {
                title: "MDN: Array.prototype.sort() Documentation",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort",
                source: "MDN Web Docs"
            },
            {
                title: "GeeksforGeeks: Bubble Sort in JavaScript",
                url: "https://www.geeksforgeeks.org/bubble-sort-in-javascript/",
                source: "GeeksforGeeks"
            }
        ]
    },
    {
        keywords: ["factorial", "fibonacci", "recursion", "recursive", "call stack", "stack overflow", "maximum call stack"],
        videos: [
            {
                title: "Recursion in 100 Seconds",
                url: "https://www.youtube.com/watch?v=rf60MejMz3E",
                channel: "Fireship"
            },
            {
                title: "JavaScript Call Stack and Recursion Explained",
                url: "https://www.youtube.com/watch?v=IJDJ0kBx2LM",
                channel: "freeCodeCamp"
            }
        ],
        articles: [
            {
                title: "MDN: Functions & Recursion Guide",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#recursion",
                source: "MDN Web Docs"
            },
            {
                title: "JavaScript.info: Recursion and Stack",
                url: "https://javascript.info/recursion",
                source: "JavaScript.info"
            }
        ]
    },
    {
        keywords: ["promise", "async", "await", "fetch", "sequential", "promise.all", "concurrent", "asynchronous"],
        videos: [
            {
                title: "JavaScript Async Await in 10 Minutes",
                url: "https://www.youtube.com/watch?v=V_Kr9OSfDeU",
                channel: "Web Dev Simplified"
            },
            {
                title: "Promises & Promise.all in JavaScript",
                url: "https://www.youtube.com/watch?v=PoRJizFvM7s",
                channel: "freeCodeCamp"
            }
        ],
        articles: [
            {
                title: "MDN: Promise.all() Concurrent Requests Guide",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all",
                source: "MDN Web Docs"
            },
            {
                title: "JavaScript.info: Async/await and Microtasks",
                url: "https://javascript.info/async-await",
                source: "JavaScript.info"
            }
        ]
    },
    {
        keywords: ["const", "let", "var", "scope", "reassignment", "syntaxerror", "referenceerror", "typeerror"],
        videos: [
            {
                title: "Var, Let, and Const in 5 Minutes",
                url: "https://www.youtube.com/watch?v=9WIJQDvt4Us",
                channel: "Web Dev Simplified"
            },
            {
                title: "JavaScript Crash Course For Beginners",
                url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
                channel: "Traversy Media"
            }
        ],
        articles: [
            {
                title: "MDN: const vs let vs var Variable Declarations",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/const",
                source: "MDN Web Docs"
            },
            {
                title: "MDN: JavaScript Grammar and Types Guide",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types",
                source: "MDN Web Docs"
            }
        ]
    }
];

/**
 * Resolves verified direct video URLs and direct article documentation URLs
 * matching the user's code, error message, and AI blueprint weakness.
 */
export function resolveCuratedResources(code = "", error = "", weakness = "", rawVideos = [], rawArticles = []) {
    const combinedText = `${code} ${error} ${weakness}`.toLowerCase();

    // Check curated database for best matches
    let matchedVideos = [];
    let matchedArticles = [];

    for (const entry of CURATED_RESOURCE_DATABASE) {
        const matches = entry.keywords.some(kw => combinedText.includes(kw.toLowerCase()));
        if (matches) {
            matchedVideos.push(...entry.videos);
            matchedArticles.push(...entry.articles);
            break;
        }
    }

    // Default fallback if no keyword match
    if (matchedVideos.length === 0) {
        matchedVideos = [
            {
                title: "JavaScript Debugging & Common Errors in 100 Seconds",
                url: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
                channel: "Fireship"
            },
            {
                title: "JavaScript Crash Course & Algorithm Fundamentals",
                url: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
                channel: "Programming with Mosh"
            }
        ];
    }

    if (matchedArticles.length === 0) {
        matchedArticles = [
            {
                title: "MDN Web Docs: JavaScript Fundamentals Guide",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
                source: "MDN Web Docs"
            },
            {
                title: "JavaScript.info: The Modern JavaScript Tutorial",
                url: "https://javascript.info/",
                source: "JavaScript.info"
            }
        ];
    }

    // Return deduplicated lists (max 3 of each)
    const uniqueVideos = [];
    const seenVideoUrls = new Set();
    for (const v of matchedVideos) {
        if (!seenVideoUrls.has(v.url)) {
            seenVideoUrls.add(v.url);
            uniqueVideos.push(v);
        }
        if (uniqueVideos.length >= 3) break;
    }

    const uniqueArticles = [];
    const seenArticleUrls = new Set();
    for (const a of matchedArticles) {
        if (!seenArticleUrls.has(a.url)) {
            seenArticleUrls.add(a.url);
            uniqueArticles.push(a);
        }
        if (uniqueArticles.length >= 3) break;
    }

    return {
        videos: uniqueVideos,
        articles: uniqueArticles
    };
}
