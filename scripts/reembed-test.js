"use strict";
/**
 * Test Re-embedding Script
 *
 * This script re-embeds just 5 publications to test the embedding process
 * before running the full re-embedding script.
 *
 * Usage:
 *   npx tsx scripts/reembed-test.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var pg_1 = require("pg");
var DATABASE_URL = process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_UAJfycaGi0k8@ep-withered-mud-a1we345i-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
var pool = new pg_1.Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});
function generateEmbedding(text) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, error_1, response, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!process.env.HUGGINGFACE_API_KEY) return [3 /*break*/, 6];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch('https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(process.env.HUGGINGFACE_API_KEY),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                inputs: text,
                                options: { wait_for_model: true }
                            })
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    if (Array.isArray(result) && Array.isArray(result[0])) {
                        return [2 /*return*/, result[0]];
                    }
                    else if (Array.isArray(result) && typeof result[0] === 'number') {
                        return [2 /*return*/, result];
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.log('HuggingFace failed:', error_1 instanceof Error ? error_1.message : error_1);
                    return [3 /*break*/, 6];
                case 6:
                    if (!process.env.COHERE_API_KEY) return [3 /*break*/, 12];
                    _a.label = 7;
                case 7:
                    _a.trys.push([7, 11, , 12]);
                    return [4 /*yield*/, fetch('https://api.cohere.ai/v1/embed', {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(process.env.COHERE_API_KEY),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                texts: [text],
                                model: 'embed-english-v3.0',
                                input_type: 'search_document'
                            })
                        })];
                case 8:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 10];
                    return [4 /*yield*/, response.json()];
                case 9:
                    data = _a.sent();
                    if (data.embeddings && data.embeddings.length > 0) {
                        return [2 /*return*/, data.embeddings[0]];
                    }
                    _a.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    error_2 = _a.sent();
                    console.log('Cohere failed:', error_2 instanceof Error ? error_2.message : error_2);
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/, null];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client, result, _i, _a, pub, text, embedding, error_3;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('\n🧪 Testing Re-Embedding Process (5 publications)\n');
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 10, 11, 13]);
                    return [4 /*yield*/, pool.connect()];
                case 2:
                    client = _b.sent();
                    console.log('✅ Database connected\n');
                    // Check API keys
                    console.log('🔑 API Keys:');
                    console.log("   HuggingFace: ".concat(process.env.HUGGINGFACE_API_KEY ? '✅' : '❌'));
                    console.log("   Cohere: ".concat(process.env.COHERE_API_KEY ? '✅' : '❌', "\n"));
                    if (!process.env.HUGGINGFACE_API_KEY && !process.env.COHERE_API_KEY) {
                        throw new Error('No API keys found!');
                    }
                    return [4 /*yield*/, client.query("\n      SELECT id, title, abstract\n      FROM publications \n      ORDER BY id ASC\n      LIMIT 5\n    ")];
                case 3:
                    result = _b.sent();
                    console.log("\uD83D\uDCDA Processing ".concat(result.rows.length, " test publications:\n"));
                    _i = 0, _a = result.rows;
                    _b.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    pub = _a[_i];
                    console.log("\uD83D\uDCC4 \"".concat(pub.title.substring(0, 50), "...\""));
                    text = [
                        pub.title,
                        pub.abstract
                    ].filter(Boolean).join('\n\n');
                    return [4 /*yield*/, generateEmbedding(text)];
                case 5:
                    embedding = _b.sent();
                    if (!(embedding && embedding.length > 0)) return [3 /*break*/, 7];
                    console.log("   \u2705 Embedding generated (dimension: ".concat(embedding.length, ")"));
                    // Update database
                    return [4 /*yield*/, client.query('UPDATE publications SET embedding = $1, updated_at = NOW() WHERE id = $2', [embedding, pub.id])];
                case 6:
                    // Update database
                    _b.sent();
                    console.log("   \uD83D\uDCBE Database updated\n");
                    return [3 /*break*/, 8];
                case 7:
                    console.log("   \u274C Failed to generate embedding\n");
                    _b.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    console.log('✨ Test complete! If all embeddings were successful, you can run the full script.\n');
                    return [3 /*break*/, 13];
                case 10:
                    error_3 = _b.sent();
                    console.error('❌ Error:', error_3);
                    return [3 /*break*/, 13];
                case 11:
                    if (client)
                        client.release();
                    return [4 /*yield*/, pool.end()];
                case 12:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 13: return [2 /*return*/];
            }
        });
    });
}
main().catch(console.error);
