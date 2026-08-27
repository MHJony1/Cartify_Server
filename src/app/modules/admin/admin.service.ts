import { prisma } from "@/app/lib/prisma";
import { AppError } from "@/app/errors/AppError";
import { IAnalyticsQuery, IDateRangeQuery } from "./admin.interface";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/enums";

// A basic global configuration for low stock threshold matching inventory module
const LOW_STOCK_THRESHOLD = 5;

// Helper to construct date filters based on query parameters
const getDateFilter = (query: IDateRangeQuery) => {
  const { from, to, period } = query;
  
  if (from && to) {
    return {
      gte: new Date(from),
      lte: new Date(new Date(to).setUTCHours(23, 59, 59, 999)),
    };
  }

  if (period) {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
      case "7d":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(now.getDate() - 90);
        break;
      case "1y":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        break;
    }

    return {
      gte: startDate,
      lte: now,
    };
  }

  return undefined; // No filter
};

// ==============================
// Dashboard Overview
// ==============================
const getDashboardOverview = async () => {
  // Aggregate using Promise.all for performance
  const [
    totalUsers,
    totalProducts,
    totalCategories,
    totalOrders,
    ordersGroupByStatus,
    paymentsGroupByStatus,
    totalRevenueAgg,
    lowStockProducts,
    outOfStockProducts,
    totalReviews
  ] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false, role: "USER" } }),
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.category.count({ where: { isDeleted: false } }),
    prisma.order.count({ where: { isDeleted: false } }),
    
    // Group orders by status
    prisma.order.groupBy({
      by: ["status"],
      _count: true,
      where: { isDeleted: false },
    }),

    // Group payments by status
    prisma.payment.groupBy({
      by: ["status"],
      _count: true,
    }),

    // Aggregate revenue (only PAID and COMPLETED payments)
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: { in: [PaymentStatus.PAID, PaymentStatus.COMPLETED] } },
    }),

    // Inventory metrics using the same threshold as inventory module
    prisma.product.count({ where: { isDeleted: false, stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
    prisma.product.count({ where: { isDeleted: false, stock: { equals: 0 } } }),

    prisma.review.count({ where: { isDeleted: false } }),
  ]);

  // Format order stats
  const orders = {
    pending: ordersGroupByStatus.find((o) => o.status === OrderStatus.PENDING)?._count || 0,
    processing: ordersGroupByStatus.find((o) => o.status === OrderStatus.PROCESSING)?._count || 0,
    shipped: ordersGroupByStatus.find((o) => o.status === OrderStatus.SHIPPED)?._count || 0,
    delivered: ordersGroupByStatus.find((o) => o.status === OrderStatus.DELIVERED)?._count || 0,
    cancelled: ordersGroupByStatus.find((o) => o.status === OrderStatus.CANCELLED)?._count || 0,
  };

  // Format payment stats
  const payments = {
    paid: paymentsGroupByStatus.find((p) => p.status === PaymentStatus.PAID)?._count || 0,
    completed: paymentsGroupByStatus.find((p) => p.status === PaymentStatus.COMPLETED)?._count || 0,
    pending: paymentsGroupByStatus.find((p) => p.status === PaymentStatus.PENDING)?._count || 0,
    failed: paymentsGroupByStatus.find((p) => p.status === PaymentStatus.FAILED)?._count || 0,
    refunded: paymentsGroupByStatus.find((p) => p.status === PaymentStatus.REFUNDED)?._count || 0,
  };

  const totalRevenue = totalRevenueAgg._sum.amount || 0;

  // Recent data
  const [recentOrders, recentUsers, inventoryAlerts] = await Promise.all([
    prisma.order.findMany({
      where: { isDeleted: false },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        user: { select: { name: true } },
        totalAmount: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: { isDeleted: false, role: "USER" },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        status: true,
      },
    }),
    prisma.product.findMany({
      where: { isDeleted: false, stock: { lte: LOW_STOCK_THRESHOLD } },
      take: 5,
      orderBy: { stock: "asc" },
      select: {
        id: true,
        name: true,
        stock: true,
      },
    }),
  ]);

  return {
    overview: {
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      outOfStockProducts,
      totalReviews,
    },
    orders,
    payments,
    recentOrders,
    recentUsers,
    inventoryAlerts,
  };
};

// ==============================
// Sales Analytics
// ==============================
const getSalesAnalytics = async (query: IAnalyticsQuery) => {
  const dateFilter = getDateFilter(query);

  const wherePayment = {
    status: { in: [PaymentStatus.PAID, PaymentStatus.COMPLETED] },
    ...(dateFilter && { createdAt: dateFilter }),
  };

  const whereOrder = {
    isDeleted: false,
    ...(dateFilter && { createdAt: dateFilter }),
  };

  const [totalRevenueAgg, totalOrdersCount] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: wherePayment,
    }),
    prisma.order.count({
      where: whereOrder,
    }),
  ]);

  const totalRevenue = totalRevenueAgg._sum.amount || 0;
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Use raw query for daily sales aggregation
  let timeSeriesQuery: any;

  if (dateFilter) {
    timeSeriesQuery = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as "date",
        SUM(amount) as "revenue",
        COUNT(id) as "orders"
      FROM payments
      WHERE status IN ('PAID', 'COMPLETED')
        AND created_at >= ${dateFilter.gte}
        AND created_at <= ${dateFilter.lte}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC;
    `;
  } else {
    timeSeriesQuery = await prisma.$queryRaw`
      SELECT 
        DATE(created_at) as "date",
        SUM(amount) as "revenue",
        COUNT(id) as "orders"
      FROM payments
      WHERE status IN ('PAID', 'COMPLETED')
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC;
    `;
  }

  // Format bigints or strings returned from raw query
  const timeline = Array.isArray(timeSeriesQuery) ? timeSeriesQuery.map((row: any) => ({
    date: row.date.toISOString().split("T")[0],
    revenue: Number(row.revenue || 0),
    orders: Number(row.orders || 0),
  })) : [];

  return {
    summary: {
      totalRevenue,
      totalOrders: totalOrdersCount,
      averageOrderValue,
    },
    timeline,
  };
};

// ==============================
// Order Analytics
// ==============================
const getOrderAnalytics = async (query: IAnalyticsQuery) => {
  const dateFilter = getDateFilter(query);

  const where = {
    isDeleted: false,
    ...(dateFilter && { createdAt: dateFilter }),
  };

  const total = await prisma.order.count({ where });

  const grouped = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
    where,
  });

  return {
    total,
    pending: grouped.find((o) => o.status === OrderStatus.PENDING)?._count || 0,
    confirmed: grouped.find((o) => o.status === OrderStatus.CONFIRMED)?._count || 0,
    processing: grouped.find((o) => o.status === OrderStatus.PROCESSING)?._count || 0,
    shipped: grouped.find((o) => o.status === OrderStatus.SHIPPED)?._count || 0,
    delivered: grouped.find((o) => o.status === OrderStatus.DELIVERED)?._count || 0,
    cancelled: grouped.find((o) => o.status === OrderStatus.CANCELLED)?._count || 0,
  };
};

// ==============================
// Customer Analytics
// ==============================
const getCustomerAnalytics = async (query: IAnalyticsQuery) => {
  const dateFilter = getDateFilter(query);

  const [totalUsers, activeUsers, inactiveUsers, suspendedUsers, newUsers] = await Promise.all([
    prisma.user.count({ where: { isDeleted: false, role: "USER" } }),
    prisma.user.count({ where: { isDeleted: false, role: "USER", status: "ACTIVE" } }),
    prisma.user.count({ where: { isDeleted: false, role: "USER", status: "INACTIVE" } }),
    prisma.user.count({ where: { isDeleted: false, role: "USER", status: "SUSPENDED" } }),
    dateFilter ? prisma.user.count({ where: { isDeleted: false, role: "USER", createdAt: dateFilter } }) : 0,
  ]);

  return {
    totalUsers,
    activeUsers,
    inactiveUsers,
    suspendedUsers,
    newUsersWithinPeriod: newUsers,
  };
};

// ==============================
// Product Analytics
// ==============================
const getProductAnalytics = async (query: IAnalyticsQuery) => {
  const limit = Number(query.limit) || 10;
  const dateFilter = getDateFilter(query);

  const [totalProducts, activeProducts, deletedProducts, outOfStock, lowStock] = await Promise.all([
    prisma.product.count(), // Total regardless of deletion
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.product.count({ where: { isDeleted: true } }),
    prisma.product.count({ where: { isDeleted: false, stock: { equals: 0 } } }),
    prisma.product.count({ where: { isDeleted: false, stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
  ]);

  // Determine top selling products from OrderItems (excluding cancelled orders)
  const whereOrderItem: any = {
    order: {
      status: { not: OrderStatus.CANCELLED },
      isDeleted: false,
    },
    ...(dateFilter && { createdAt: dateFilter }),
  };

  const topOrderItems = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
      price: true, // Wait, price is per unit, so this isn't exact revenue for this grouping. We will calculate revenue differently if needed, or omit it. 
    },
    where: whereOrderItem,
    orderBy: {
      _sum: { quantity: "desc" },
    },
    take: limit,
  });

  const productIds = topOrderItems.map(item => item.productId);

  const productsData = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, price: true },
  });

  const topSelling = topOrderItems.map(item => {
    const product = productsData.find(p => p.id === item.productId);
    const totalQuantitySold = item._sum.quantity || 0;
    return {
      productId: item.productId,
      name: product?.name || "Unknown Product",
      totalQuantitySold,
      // Approximate revenue (quantity * current price if exact wasn't stored, but we have price in order item)
      // Actually, since _sum doesn't do quantity*price, we just multiply the summed quantity by product price
      // or omit exact revenue to avoid confusion.
      revenue: product ? totalQuantitySold * product.price : 0, 
    };
  });

  return {
    totalProducts,
    activeProducts,
    deletedProducts,
    outOfStockProducts: outOfStock,
    lowStockProducts: lowStock,
    topSelling,
  };
};

// ==============================
// Inventory Analytics
// ==============================
const getInventoryAnalytics = async () => {
  const [
    totalProducts,
    totalStockAgg,
    lowStockCount,
    outOfStockCount,
    recentMovements
  ] = await Promise.all([
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.product.aggregate({ _sum: { stock: true }, where: { isDeleted: false } }),
    prisma.product.count({ where: { isDeleted: false, stock: { gt: 0, lte: LOW_STOCK_THRESHOLD } } }),
    prisma.product.count({ where: { isDeleted: false, stock: { equals: 0 } } }),
    prisma.inventoryTransaction.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { name: true } },
      },
    }),
  ]);

  const inStockCount = totalProducts - lowStockCount - outOfStockCount;

  return {
    totalProducts,
    totalStockUnits: totalStockAgg._sum.stock || 0,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    recentMovements: recentMovements.map(m => ({
      product: m.product.name,
      type: m.type,
      quantity: m.quantity,
      previousStock: m.previousStock,
      newStock: m.newStock,
      date: m.createdAt,
    })),
  };
};

// ==============================
// Payment Analytics
// ==============================
const getPaymentAnalytics = async (query: IAnalyticsQuery) => {
  const dateFilter = getDateFilter(query);

  const where = {
    ...(dateFilter && { createdAt: dateFilter }),
  };

  const [totalPayments, groupedByStatus, groupedByMethod, totalAmountsByStatus] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.groupBy({ by: ["status"], _count: true, where }),
    prisma.payment.groupBy({ by: ["method"], _count: true, where }),
    prisma.payment.groupBy({ by: ["status"], _sum: { amount: true }, where }),
  ]);

  const getCount = (status: PaymentStatus) => groupedByStatus.find(s => s.status === status)?._count || 0;
  const getAmount = (status: PaymentStatus) => totalAmountsByStatus.find(s => s.status === status)?._sum.amount || 0;

  return {
    totalPayments,
    pending: getCount(PaymentStatus.PENDING),
    paid: getCount(PaymentStatus.PAID),
    completed: getCount(PaymentStatus.COMPLETED),
    failed: getCount(PaymentStatus.FAILED),
    refunded: getCount(PaymentStatus.REFUNDED),
    
    methods: {
      cod: groupedByMethod.find(m => m.method === "COD")?._count || 0,
      online: groupedByMethod.find(m => m.method === "ONLINE")?._count || 0,
    },

    amounts: {
      totalPaid: getAmount(PaymentStatus.PAID) + getAmount(PaymentStatus.COMPLETED),
      totalPending: getAmount(PaymentStatus.PENDING),
      totalRefunded: getAmount(PaymentStatus.REFUNDED),
    }
  };
};

// ==============================
// Review Analytics
// ==============================
const getReviewAnalytics = async (query: IAnalyticsQuery) => {
  const dateFilter = getDateFilter(query);

  const where = {
    isDeleted: false,
    ...(dateFilter && { createdAt: dateFilter }),
  };

  const [totalReviews, ratingGroups, averageRatingAgg] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.groupBy({ by: ["rating"], _count: true, where }),
    prisma.review.aggregate({ _avg: { rating: true }, where }),
  ]);

  const ratingDistribution = {
    "5 stars": ratingGroups.find(r => r.rating === 5)?._count || 0,
    "4 stars": ratingGroups.find(r => r.rating === 4)?._count || 0,
    "3 stars": ratingGroups.find(r => r.rating === 3)?._count || 0,
    "2 stars": ratingGroups.find(r => r.rating === 2)?._count || 0,
    "1 star": ratingGroups.find(r => r.rating === 1)?._count || 0,
  };

  return {
    totalReviews,
    averageRating: averageRatingAgg._avg.rating ? Number(averageRatingAgg._avg.rating.toFixed(2)) : 0,
    ratingDistribution,
  };
};

// ==============================
// Coupon Analytics
// ==============================
const getCouponAnalytics = async (query: IAnalyticsQuery) => {
  const dateFilter = getDateFilter(query);

  const [totalCoupons, activeCoupons, expiredCoupons, totalUsageAgg] = await Promise.all([
    prisma.coupon.count({ where: { isDeleted: false } }),
    prisma.coupon.count({ 
      where: { 
        isDeleted: false, 
        isActive: true, 
        endDate: { gte: new Date() } 
      } 
    }),
    prisma.coupon.count({ 
      where: { 
        isDeleted: false, 
        endDate: { lt: new Date() } 
      } 
    }),
    // Discount amounts used are harder to get easily without joining orders, 
    // but we can sum order discountAmount where a coupon was used
    prisma.order.aggregate({
      _sum: { discountAmount: true },
      where: {
        isDeleted: false,
        couponId: { not: null },
        ...(dateFilter && { createdAt: dateFilter }),
      },
    }),
  ]);
  
  const totalUsage = await prisma.couponUsage.count({
    where: dateFilter ? { createdAt: dateFilter } : undefined
  });

  return {
    totalCoupons,
    activeCoupons,
    expiredCoupons,
    totalCouponUsage: totalUsage,
    totalDiscountGiven: totalUsageAgg._sum.discountAmount || 0,
  };
};


export const AdminService = {
  getDashboardOverview,
  getSalesAnalytics,
  getOrderAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getInventoryAnalytics,
  getPaymentAnalytics,
  getReviewAnalytics,
  getCouponAnalytics,
};
