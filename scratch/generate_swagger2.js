const fs = require('fs');
const path = require('path');

const swaggerDoc = JSON.parse(fs.readFileSync(path.join(__dirname, "swagger1.json"), "utf8"));
const paths = swaggerDoc.paths;

// 5. Orders
paths["/orders"] = {
  get: {
    tags: ["Orders"],
    summary: "Get all orders",
    description: "Requires ADMIN role",
    responses: {
      "200": { description: "List of all orders", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Order" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  },
  post: {
    tags: ["Orders"],
    summary: "Create a new order",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              items: { type: "array", items: { $ref: "#/components/schemas/CartItem" } },
              shippingAddress: { type: "string" },
              addressId: { type: "string" },
              couponCode: { type: "string" },
              paymentMethod: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "Order created", content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "400": { $ref: "#/components/responses/ValidationError" }
    }
  }
};
paths["/orders/my-orders"] = {
  get: {
    tags: ["Orders"],
    summary: "Get my orders",
    responses: {
      "200": { description: "List of user's orders", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Order" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/orders/{id}"] = {
  get: {
    tags: ["Orders"],
    summary: "Get single order",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Order Details", content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  }
};
paths["/orders/{id}/status"] = {
  patch: {
    tags: ["Orders"],
    summary: "Update order status",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: { "application/json": { schema: { type: "object", properties: { status: { type: "string" } } } } }
    },
    responses: {
      "200": { description: "Order status updated" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
paths["/orders/{id}/cancel"] = {
  patch: {
    tags: ["Orders"],
    summary: "Cancel order",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Order cancelled" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/orders/{id}/payment-status"] = {
  patch: {
    tags: ["Orders"],
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

// 6. Reviews
paths["/reviews"] = {
  get: {
    tags: ["Reviews"],
    summary: "Get all reviews",
    description: "Requires ADMIN role",
    parameters: [
      { in: "query", name: "page", schema: { type: "integer" } },
      { in: "query", name: "limit", schema: { type: "integer" } },
      { in: "query", name: "productId", schema: { type: "string" } },
      { in: "query", name: "rating", schema: { type: "integer" } }
    ],
    responses: {
      "200": { description: "All reviews", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  },
  post: {
    tags: ["Reviews"],
    summary: "Create a review",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              productId: { type: "string" },
              rating: { type: "integer" },
              comment: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "Review created", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
      "400": { $ref: "#/components/responses/ValidationError" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/reviews/product/{productId}"] = {
  get: {
    tags: ["Reviews"],
    summary: "Get product reviews",
    security: [],
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Product reviews", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } }
    }
  }
};
paths["/reviews/my-reviews"] = {
  get: {
    tags: ["Reviews"],
    summary: "Get my reviews",
    responses: {
      "200": { description: "My reviews", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Review" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/reviews/{id}"] = {
  patch: {
    tags: ["Reviews"],
    summary: "Update review",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              rating: { type: "integer" },
              comment: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "200": { description: "Updated review", content: { "application/json": { schema: { $ref: "#/components/schemas/Review" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  delete: {
    tags: ["Reviews"],
    summary: "Delete review",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Review deleted" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  }
};

// 7. Addresses
paths["/addresses"] = {
  get: {
    tags: ["Addresses"],
    summary: "Get my addresses",
    responses: {
      "200": { description: "List of user's addresses", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Address" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  },
  post: {
    tags: ["Addresses"],
    summary: "Create address",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              street: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              zipCode: { type: "string" },
              country: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "Address created", content: { "application/json": { schema: { $ref: "#/components/schemas/Address" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "400": { $ref: "#/components/responses/ValidationError" }
    }
  }
};
paths["/addresses/{id}"] = {
  get: {
    tags: ["Addresses"],
    summary: "Get address by ID",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Address Details", content: { "application/json": { schema: { $ref: "#/components/schemas/Address" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  patch: {
    tags: ["Addresses"],
    summary: "Update address",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              street: { type: "string" },
              city: { type: "string" },
              state: { type: "string" },
              zipCode: { type: "string" },
              country: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "200": { description: "Address updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Address" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  delete: {
    tags: ["Addresses"],
    summary: "Delete address",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Address deleted" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  }
};
paths["/addresses/{id}/default"] = {
  patch: {
    tags: ["Addresses"],
    summary: "Set default address",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Set as default address" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  }
};

// 8. Wishlist
paths["/wishlists"] = {
  get: {
    tags: ["Wishlists"],
    summary: "Get my wishlist",
    responses: {
      "200": { description: "My wishlist items", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Wishlist" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/wishlists/{productId}"] = {
  post: {
    tags: ["Wishlists"],
    summary: "Add to wishlist",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    responses: {
      "201": { description: "Added to wishlist" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "409": { $ref: "#/components/responses/ConflictError" }
    }
  },
  delete: {
    tags: ["Wishlists"],
    summary: "Remove from wishlist",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Removed from wishlist" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/wishlists/{productId}/move-to-cart"] = {
  patch: {
    tags: ["Wishlists"],
    summary: "Move wishlist item to cart",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Moved to cart" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};

// 9. Coupons
paths["/coupons"] = {
  get: {
    tags: ["Coupons"],
    summary: "Get all coupons",
    description: "Requires ADMIN role",
    responses: {
      "200": { description: "List of coupons", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Coupon" } } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  },
  post: {
    tags: ["Coupons"],
    summary: "Create a coupon",
    description: "Requires ADMIN role",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              code: { type: "string" },
              discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"] },
              discountValue: { type: "number" },
              minPurchase: { type: "number" },
              startDate: { type: "string", format: "date-time" },
              endDate: { type: "string", format: "date-time" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "Coupon created", content: { "application/json": { schema: { $ref: "#/components/schemas/Coupon" } } } },
      "400": { $ref: "#/components/responses/ValidationError" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
paths["/coupons/apply"] = {
  post: {
    tags: ["Coupons"],
    summary: "Apply a coupon",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              code: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "200": { description: "Coupon applied successfully" },
      "400": { $ref: "#/components/responses/ValidationError" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};
paths["/coupons/{id}"] = {
  get: {
    tags: ["Coupons"],
    summary: "Get coupon by ID",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Coupon Details", content: { "application/json": { schema: { $ref: "#/components/schemas/Coupon" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  patch: {
    tags: ["Coupons"],
    summary: "Update coupon",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              discountValue: { type: "number" },
              minPurchase: { type: "number" },
              endDate: { type: "string", format: "date-time" }
            }
          }
        }
      }
    },
    responses: {
      "200": { description: "Coupon updated" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  delete: {
    tags: ["Coupons"],
    summary: "Delete coupon",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Coupon deleted" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};
paths["/coupons/{id}/toggle-status"] = {
  patch: {
    tags: ["Coupons"],
    summary: "Toggle coupon status",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Status toggled" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" }
    }
  }
};

fs.writeFileSync(path.join(__dirname, "swagger2.json"), JSON.stringify(swaggerDoc, null, 2));
console.log("Written phase 2");
