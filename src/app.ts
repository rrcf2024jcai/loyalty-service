import express, { Request, Response, Express } from "express";

/**
 * Interface representing a customer.
 */
interface Customer {
  id: number;
  name: string;
  status: "GOLD" | "SILVER" | "BRONZE";
  points: number;
  lastPurchaseDate: string;
  email?: string;
  preferredStore?: string;
  joinDate: string;
  notifications: boolean;
  lastStatusChange?: string;
}

const customers: Customer[] = [
  {
    id: 1,
    name: "John Smith",
    status: "SILVER",
    points: 450,
    lastPurchaseDate: "2024-02-15",
    joinDate: "2023-06-15",
    notifications: true,
    preferredStore: "Downtown",
  },
  {
    id: 2,
    name: "Jane Doe",
    status: "GOLD",
    points: 850,
    lastPurchaseDate: "2024-03-01",
    email: "jane.doe@email.com",
    joinDate: "2023-01-20",
    notifications: false,
  },
];

const app: Express = express();
app.use(express.json());

/**
 * Retrieve a customer by ID.
 * @route GET /api/customers/:id
 * @param req - Express request object
 * @param res - Express response object
 */
app.get("/api/customers/:id", (req: Request, res: Response): void => {
  const customerId: number = parseInt(req.params.id);
  const customer: Customer | undefined = customers.find(
    (c) => c.id === customerId
  );
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).send("Customer not found");
  }
});

/**
 * Record a purchase for a customer and update status based on points.
 * @route POST /api/customers/:id/purchase
 * @param req - Express request object
 * @param res - Express response object
 */
app.post("/api/customers/:id/purchase", (req: Request, res: Response): void => {
  const customerId: number = parseInt(req.params.id);
  const customer: Customer | undefined = customers.find(
    (c) => c.id === customerId
  );
  if (!customer) {
    res.status(404).send("Customer not found");
    return;
  }

  const purchaseAmount: number = req.body.amount;
  const storeLocation: string = req.body.storeLocation;

  customer.points += Math.floor(purchaseAmount / 10);
  customer.lastPurchaseDate = new Date().toISOString();

  if (customer.points >= 750) {
    customer.status = "GOLD";
    customer.lastStatusChange = new Date().toISOString();
  } else if (customer.points >= 500) {
    customer.status = "SILVER";
    customer.lastStatusChange = new Date().toISOString();
  }

  res.json(customer);
});

/**
 * Update customer preferences, such as notifications, preferred store, and email.
 * @route PATCH /api/customers/:id/preferences
 * @param req - Express request object
 * @param res - Express response object
 */
app.patch(
  "/api/customers/:id/preferences",
  (req: Request, res: Response): void => {
    const customerId: number = parseInt(req.params.id);
    const customer: Customer | undefined = customers.find(
      (c) => c.id === customerId
    );
    if (!customer) {
      res.status(404).send("Customer not found");
      return;
    }

    if (typeof req.body.notifications === "boolean") {
      customer.notifications = req.body.notifications;
    }
    if (typeof req.body.preferredStore === "string") {
      customer.preferredStore = req.body.preferredStore;
    }
    if (typeof req.body.email === "string") {
      customer.email = req.body.email;
    }

    res.json(customer);
  }
);

/**
 * Ticket #4: LOYALTY-156 - View all customers
 * Retrieve all customers and the total count.
 * @route GET /api/customers
 */
app.get("/api/customers", (req: Request, res: Response): void => {
  const totalCount = customers.length;
  const responseData = {
    count: totalCount,
    customers: customers,
  };
  res.json(responseData);
});

/**
 * Retrieve all customers and the total count.
 * @route GET /api/customers
 */
app.get("/api/customers", (req: Request, res: Response): void => {
  const totalCount = customers.length;
  const responseData = {
    count: totalCount,
    customers: customers,
  };
  res.json(responseData);
});

/**
 * Ticket #6: FEATURE-892 - Get program statistics
 * Retrieve loyalty program statistics.
 * @route GET /api/statistics
 */
app.get("/api/statistics", (req: Request, res: Response): void => {
  let totalPoints = 0;
  const customersByStatus = {
    GOLD: 0,
    SILVER: 0,
    BRONZE: 0,
  };

  customers.forEach((customer) => {
    totalPoints = totalPoints + customer.points;

    if (customer.status === "GOLD") {
      customersByStatus.GOLD++;
    } else if (customer.status === "SILVER") {
      customersByStatus.SILVER++;
    } else if (customer.status === "BRONZE") {
      customersByStatus.BRONZE++;
    }
  });

  const totalCustomers = customers.length;

  const responseData = {
    totalCustomers: totalCustomers,
    totalPoints: totalPoints,
    customersByStatus: customersByStatus,
  };

  res.json(responseData);
});

export default app;
