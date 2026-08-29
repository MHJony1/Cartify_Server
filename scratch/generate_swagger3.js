const fs = require('fs');
const path = require('path');

const swaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, "swagger2.json"), "utf8"));
const paths = swaggerDoc.paths;

// 10. Payments
paths["/payments"] = {
  get: {
    tags: ["Payments"],
    summary: "Get all payments",
    description: "Requires ADMIN role",
    responses: {
      "200": { description: "All payments", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Payment" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
paths["/payments/create"] = {
  post: {
    tags: ["Payments"],
    summary: "Create a payment",
    requestBody: {
      required: true,
      content: { "application/json": { schema: { type: "object", properties: { orderId: { type: "string" }, amount: { type: "number" } } } } }
    },
    responses: {
      "201": { description: "Payment created" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/payments/my-payments"] = {
  get: {
    tags: ["Payments"],
    summary: "Get my payments",
    responses: {
      "200": { description: "List of user payments", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Payment" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/payments/{id}"] = {
  get: {
    tags: ["Payments"],
    summary: "Get single payment",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Payment details", content: { "application/json": { schema: { $ref: "#/components/schemas/Payment" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/payments/{id}/status"] = {
  patch: {
    tags: ["Payments"],
    summary: "Update payment status",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" } } } } }
    },
    responses: {
      "200": { description: "Payment status updated" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};

// 11. Inventory
paths["/inventory"] = {
  get: {
    tags: ["Inventory"],
    summary: "Get inventory list",
    description: "Requires ADMIN role",
    responses: {
      "200": { description: "List of inventory" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
paths["/inventory/{productId}"] = {
  get: {
    tags: ["Inventory"],
    summary: "Get inventory details",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Inventory details" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
paths["/inventory/{productId}/history"] = {
  get: {
    tags: ["Inventory"],
    summary: "Get inventory history",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Inventory history" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
paths["/inventory/{productId}/restock"] = {
  patch: {
    tags: ["Inventory"],
    summary: "Restock product",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: { "application/json": { schema: { type: "object", properties: { quantity: { type: "integer" } } } } }
    },
    responses: {
      "200": { description: "Product restocked" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
paths["/inventory/{productId}/damage"] = {
  patch: {
    tags: ["Inventory"],
    summary: "Mark inventory as damaged",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: { "application/json": { schema: { type: "object", properties: { quantity: { type: "integer" } } } } }
    },
    responses: {
      "200": { description: "Inventory damaged recorded" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
paths["/inventory/{productId}/adjust"] = {
  patch: {
    tags: ["Inventory"],
    summary: "Adjust inventory",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: { "application/json": { schema: { type: "object", properties: { quantity: { type: "integer" } } } } }
    },
    responses: {
      "200": { description: "Inventory adjusted" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};

// 12. Admin Analytics
paths["/admin/dashboard"] = {
  get: {
    tags: ["Admin Analytics"],
    summary: "Get dashboard overview",
    description: "Requires ADMIN role",
    responses: {
      "200": { description: "Dashboard data" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
const adminRoutes = ["sales", "orders", "customers", "products", "inventory", "payments", "reviews", "coupons"];
adminRoutes.forEach(route => {
  if (route === "inventory") {
    paths[`/admin/analytics/${route}`] = {
      get: {
        tags: ["Admin Analytics"],
        summary: `Get ${route} analytics`,
        description: "Requires ADMIN role",
        responses: {
          "200": { description: `Analytics for ${route}` },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "403": { $ref: "#/components/responses/ForbiddenError" }
        }
      }
    };
  } else {
    paths[`/admin/analytics/${route}`] = {
      get: {
        tags: ["Admin Analytics"],
        summary: `Get ${route} analytics`,
        description: "Requires ADMIN role",
        parameters: [
          { in: "query", name: "period", schema: { type: "string" } }
        ],
        responses: {
          "200": { description: `Analytics for ${route}` },
          "401": { $ref: "#/components/responses/UnauthorizedError" },
          "403": { $ref: "#/components/responses/ForbiddenError" },
          "400": { $ref: "#/components/responses/ValidationError" }
        }
      }
    };
  }
});

// 13. Notifications
paths["/notifications"] = {
  get: {
    tags: ["Notifications"],
    summary: "Get my notifications",
    responses: {
      "200": { description: "List of notifications", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Notification" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/notifications/unread"] = {
  get: {
    tags: ["Notifications"],
    summary: "Get unread notifications",
    responses: {
      "200": { description: "List of unread notifications" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/notifications/unread-count"] = {
  get: {
    tags: ["Notifications"],
    summary: "Get unread notification count",
    responses: {
      "200": { description: "Count of unread notifications" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/notifications/read-all"] = {
  patch: {
    tags: ["Notifications"],
    summary: "Mark all as read",
    responses: {
      "200": { description: "All marked as read" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/notifications/{id}/read"] = {
  patch: {
    tags: ["Notifications"],
    summary: "Mark single notification as read",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Marked as read" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/notifications/{id}"] = {
  delete: {
    tags: ["Notifications"],
    summary: "Delete notification",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Deleted notification" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};

fs.writeFileSync(path.join(__dirname, "..", "src", "app", "docs", "swagger.json"), JSON.stringify(swaggerDoc, null, 2));
console.log("Written final swagger.json!");
