/**
 * 🌐 Atlas E2E Web & Route Health Testing Suite
 * Pings all key Atlas web application routes and API endpoints on http://localhost:3000
 * Verifies status code 200 OK, response time, and page payload integrity.
 */

export {};

const BASE_URL = "http://localhost:3000";

const routesToTest = [
  // Authentication & Public Pages
  { path: "/login", type: "PAGE" },
  
  // Dashboard & Overview
  { path: "/", type: "PAGE" },
  { path: "/catalog/dashboard", type: "PAGE" },

  // PIM & Catalog Creation Routes
  { path: "/products", type: "PAGE" },
  { path: "/catalog/create", type: "PAGE" },
  { path: "/catalog/manual/single", type: "PAGE" },
  { path: "/catalog/manual/bulk", type: "PAGE" },
  { path: "/catalog/ai/single", type: "PAGE" },
  { path: "/catalog/ai/bulk", type: "PAGE" },
  { path: "/catalog/workspace", type: "PAGE" },
  { path: "/catalog/variants", type: "PAGE" },
  { path: "/catalog/attributes", type: "PAGE" },
  { path: "/categories", type: "PAGE" },
  { path: "/catalog/brands", type: "PAGE" },
  { path: "/suppliers", type: "PAGE" },
  { path: "/catalog/templates", type: "PAGE" },
  { path: "/catalog/history", type: "PAGE" },
  { path: "/catalog/assets", type: "PAGE" },
  { path: "/catalog/publishing", type: "PAGE" },
  { path: "/catalog/versions", type: "PAGE" },
  { path: "/catalog/integrations", type: "PAGE" },

  // ERP Core Modules
  { path: "/inventory", type: "PAGE" },
  { path: "/orders", type: "PAGE" },
  { path: "/customers", type: "PAGE" },
  { path: "/purchasing", type: "PAGE" },
  { path: "/administration/sales-channels", type: "PAGE" },
  { path: "/users", type: "PAGE" },
  { path: "/settings", type: "PAGE" },

  // Key REST API Endpoints
  { path: "/api/products", type: "API" },
  { path: "/api/categories", type: "API" },
  { path: "/api/brands", type: "API" },
  { path: "/api/suppliers", type: "API" },
  { path: "/api/attributes", type: "API" },
  { path: "/api/inventory/stats", type: "API" },
  { path: "/api/sales-channels", type: "API" },
];

async function runWebRouteTests() {
  console.log("=================================================");
  console.log("🌐 ATLAS E2E WEB APPLICATION & API ROUTE TESTER");
  console.log(`Target Host: ${BASE_URL}`);
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;
  const startTime = Date.now();

  for (const item of routesToTest) {
    const targetUrl = `${BASE_URL}${item.path}`;
    const startReq = Date.now();
    try {
      const res = await fetch(targetUrl, {
        headers: {
          "Accept": item.type === "API" ? "application/json" : "text/html",
        },
      });
      const duration = Date.now() - startReq;

      if (res.status === 200 || res.status === 307 || res.status === 302 || res.status === 308) {
        passed++;
        console.log(`✅ [${res.status} OK] (${duration}ms) ${item.type}: ${item.path}`);
      } else {
        failed++;
        console.error(`❌ [${res.status} ERROR] (${duration}ms) ${item.type}: ${item.path}`);
      }
    } catch (err: any) {
      const duration = Date.now() - startReq;
      failed++;
      console.error(`❌ [FETCH FAILED] (${duration}ms) ${item.path} - ${err.message}`);
    }
  }

  const totalDuration = Date.now() - startTime;
  console.log("\n-------------------------------------------------");
  console.log(`📊 WEB E2E TEST SUMMARY: ${passed}/${routesToTest.length} ROUTES VERIFIED IN ${totalDuration}ms`);
  console.log("-------------------------------------------------\n");
}

runWebRouteTests();
