// MongoDB initialization script
// This runs when the MongoDB container starts for the first time

// Connect to pharmacy database
db = db.getSiblingDB('pharmacy');

// Create a user for the application
db.createUser({
  user: "pharmacyuser",
  pwd: "pharmacypass123",  // Change this in production!
  roles: [{ role: "readWrite", db: "pharmacy" }]
});

// Create indexes for better performance (example)
db.medicines.createIndex({ name: "text", genericName: "text" });
db.sales.createIndex({ saleDate: -1 });
db.purchases.createIndex({ purchaseDate: -1 });
db.dues.createIndex({ dueDate: 1, status: 1 });

print("Pharmacy database initialized successfully!");