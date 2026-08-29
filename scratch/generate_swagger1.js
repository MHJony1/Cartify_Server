const fs = require('fs');
const path = require('path');

const schemas = {
  User: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      role: { type: "string", enum: ["USER", "ADMIN", "VENDOR"] },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  Category: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      slug: { type: "string" },
      isDeleted: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" }
    }
  },
  Product: {
    type: "object",
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      description: { type: "string" },
      price: { type: "number" },
      stock: { type: "number" },
      image: { type: "string" },
      categoryId: { type: "string" },
      isDeleted: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" }
    }
  },
  CartItem: {
    type: "object",
    properties: {
      id: { type: "string" },
      productId: { type: "string" },
      quantity: { type: "integer" }
    }
  },
  Order: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      status: { type: "string", enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] },
      paymentStatus: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED"] },
      totalAmount: { type: "number" },
      shippingAddress: { type: "string" },
      paymentMethod: { type: "string" },
      createdAt: { type: "string", format: "date-time" }
    }
  },
  Review: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      productId: { type: "string" },
      rating: { type: "integer" },
      comment: { type: "string" },
      createdAt: { type: "string", format: "date-time" }
    }
  },
  Address: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      street: { type: "string" },
      city: { type: "string" },
      state: { type: "string" },
      zipCode: { type: "string" },
      country: { type: "string" },
      isDefault: { type: "boolean" }
    }
  },
  Wishlist: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      productId: { type: "string" },
      createdAt: { type: "string", format: "date-time" }
    }
  },
  Coupon: {
    type: "object",
    properties: {
      id: { type: "string" },
      code: { type: "string" },
      discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"] },
      discountValue: { type: "number" },
      minPurchase: { type: "number" },
      startDate: { type: "string", format: "date-time" },
      endDate: { type: "string", format: "date-time" },
      isActive: { type: "boolean" }
    }
  },
  Payment: {
    type: "object",
    properties: {
      id: { type: "string" },
      orderId: { type: "string" },
      amount: { type: "number" },
      status: { type: "string" },
      transactionId: { type: "string" }
    }
  },
  Notification: {
    type: "object",
    properties: {
      id: { type: "string" },
      userId: { type: "string" },
      title: { type: "string" },
      message: { type: "string" },
      type: { type: "string" },
      isRead: { type: "boolean" },
      createdAt: { type: "string", format: "date-time" }
    }
  }
};

const responses = {
  ValidationError: {
    description: "Invalid Request Data",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation Error" },
            errorMessages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  path: { type: "string" },
                  message: { type: "string" }
                }
              }
            }
          }
        }
      }
    }
  },
  UnauthorizedError: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "You are not authorized" }
          }
        }
      }
    }
  },
  ForbiddenError: {
    description: "Forbidden",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Forbidden access" }
          }
        }
      }
    }
  },
  NotFoundError: {
    description: "Resource Not Found",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Resource not found" }
          }
        }
      }
    }
  },
  ConflictError: {
    description: "Conflict (e.g. already exists)",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Resource already exists" }
          }
        }
      }
    }
  }
};

const paths = {};

// 1. Auth/Users
paths["/auth/register"] = {
  post: {
    tags: ["Auth"],
    summary: "Register a new user",
    security: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              email: { type: "string" },
              password: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "User created successfully", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
      "400": { $ref: "#/components/responses/ValidationError" },
      "409": { $ref: "#/components/responses/ConflictError" }
    }
  }
};

paths["/auth/login"] = {
  post: {
    tags: ["Auth"],
    summary: "Login user",
    security: [],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: { type: "string" },
              password: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "200": { 
        description: "Login successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                success: { type: "boolean" },
                statusCode: { type: "integer" },
                message: { type: "string" },
                data: {
                  type: "object",
                  properties: {
                    accessToken: { type: "string" },
                    user: { $ref: "#/components/schemas/User" }
                  }
                }
              }
            }
          }
        }
      },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};

paths["/auth/logout"] = {
  post: {
    tags: ["Auth"],
    summary: "Logout user",
    security: [],
    responses: {
      "200": { description: "Logout successful" }
    }
  }
};

// 2. Categories
paths["/categories"] = {
  get: {
    tags: ["Categories"],
    summary: "Get all categories",
    security: [],
    responses: {
      "200": {
        description: "List of categories",
        content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Category" } } } }
      }
    }
  },
  post: {
    tags: ["Categories"],
    summary: "Create a category",
    description: "Requires ADMIN role",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              slug: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "Category created", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" },
      "400": { $ref: "#/components/responses/ValidationError" }
    }
  }
};

paths["/categories/{id}"] = {
  get: {
    tags: ["Categories"],
    summary: "Get category by ID",
    security: [],
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Category object", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  patch: {
    tags: ["Categories"],
    summary: "Update category",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              slug: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "200": { description: "Updated category", content: { "application/json": { schema: { $ref: "#/components/schemas/Category" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  delete: {
    tags: ["Categories"],
    summary: "Delete category",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Category deleted" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  }
};

// 3. Products
paths["/products"] = {
  get: {
    tags: ["Products"],
    summary: "Get all products",
    security: [],
    parameters: [
      { in: "query", name: "page", schema: { type: "integer" } },
      { in: "query", name: "limit", schema: { type: "integer" } },
      { in: "query", name: "search", schema: { type: "string" } },
      { in: "query", name: "categoryId", schema: { type: "string" } },
      { in: "query", name: "minPrice", schema: { type: "number" } },
      { in: "query", name: "maxPrice", schema: { type: "number" } },
      { in: "query", name: "inStock", schema: { type: "boolean" } },
      { in: "query", name: "sortBy", schema: { type: "string" } },
      { in: "query", name: "sortOrder", schema: { type: "string", enum: ["asc", "desc"] } }
    ],
    responses: {
      "200": {
        description: "Paginated products",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                data: { type: "array", items: { $ref: "#/components/schemas/Product" } },
                meta: {
                  type: "object",
                  properties: {
                    page: { type: "integer" },
                    limit: { type: "integer" },
                    total: { type: "integer" },
                    totalPages: { type: "integer" }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  post: {
    tags: ["Products"],
    summary: "Create product",
    description: "Requires ADMIN role",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              stock: { type: "number" },
              image: { type: "string" },
              categoryId: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "Product created", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" },
      "400": { $ref: "#/components/responses/ValidationError" }
    }
  }
};

paths["/products/{id}"] = {
  get: {
    tags: ["Products"],
    summary: "Get single product",
    security: [],
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Product Details", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  patch: {
    tags: ["Products"],
    summary: "Update product",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              name: { type: "string" },
              description: { type: "string" },
              price: { type: "number" },
              stock: { type: "number" },
              image: { type: "string" },
              categoryId: { type: "string" }
            }
          }
        }
      }
    },
    responses: {
      "200": { description: "Product updated", content: { "application/json": { schema: { $ref: "#/components/schemas/Product" } } } },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  delete: {
    tags: ["Products"],
    summary: "Soft delete product",
    description: "Requires ADMIN role",
    parameters: [ { in: "path", name: "id", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Product deleted" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "403": { $ref: "#/components/responses/ForbiddenError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  }
};

// 4. Carts
paths["/carts"] = {
  get: {
    tags: ["Carts"],
    summary: "Get user cart",
    responses: {
      "200": {
        description: "Cart items",
        content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/CartItem" } } } }
      },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  },
  post: {
    tags: ["Carts"],
    summary: "Add item to cart",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              productId: { type: "string" },
              quantity: { type: "integer" }
            }
          }
        }
      }
    },
    responses: {
      "201": { description: "Item added to cart" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "400": { $ref: "#/components/responses/ValidationError" }
    }
  },
  delete: {
    tags: ["Carts"],
    summary: "Clear user cart",
    responses: {
      "200": { description: "Cart cleared" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};

paths["/carts/{productId}"] = {
  patch: {
    tags: ["Carts"],
    summary: "Update cart item quantity",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              quantity: { type: "integer" }
            }
          }
        }
      }
    },
    responses: {
      "200": { description: "Cart item updated" },
      "401": { $ref: "#/components/responses/UnauthorizedError" },
      "404": { $ref: "#/components/responses/NotFoundError" }
    }
  },
  delete: {
    tags: ["Carts"],
    summary: "Remove item from cart",
    parameters: [ { in: "path", name: "productId", required: true, schema: { type: "string" } } ],
    responses: {
      "200": { description: "Cart item removed" },
      "401": { $ref: "#/components/responses/UnauthorizedError" }
    }
  }
};

// Output JSON file
const swaggerDoc = {
  openapi: "3.0.0",
  info: {
    title: "Cartify E-Commerce API",
    version: "1.0.0",
    description: "Accurate API documentation for the Cartify E-commerce platform."
  },
  servers: [
    {
      url: "/api/v1",
      description: "Local API v1"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: schemas,
    responses: responses
  },
  security: [
    {
      bearerAuth: []
    }
  ],
  paths: paths
};

fs.writeFileSync(path.join(__dirname, "swagger1.json"), JSON.stringify(swaggerDoc, null, 2));
console.log("Written phase 1");
