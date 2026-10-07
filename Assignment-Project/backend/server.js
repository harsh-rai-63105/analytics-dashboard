const express = require('express');
const cors = require('cors');
const xml2js = require('xml2js');

const app = express();
app.use(cors());
app.use(express.json());

// Sample Datasets
const rawOrdersJSON = {
  "orders": [
    {
      "order_id": "1001",
      "customer": { "id": "C001", "name": "Rahul" },
      "items": [
        { "product_id": "P101", "qty": 2, "price": 500 },
        { "product_id": "P102", "qty": 1, "price": 1200 }
      ],
      "order_date": "2024-01-01"
    },
    {
      "order_id": "1002",
      "customer": { "id": "C002", "name": "Anita" },
      "items": [
        { "product_id": "P103", "qty": 3, "price": 200 }
      ],
      "order_date": "2024-01-02"
    }
  ]
};

const rawProductsCSV = [
  { ProductID: 'P101', ProductName: 'Laptop', Category: 'Electronics' },
  { ProductID: 'P102', ProductName: 'Phone', Category: 'Electronics' },
  { ProductID: 'P103', ProductName: 'Chair', Category: 'Furniture' }
];

const rawShipmentsXML = `
<shipments>
  <shipment>
    <shipment_id>S001</shipment_id>
    <order_id>1001</order_id>
    <delivery_days>3</delivery_days>
    <status>Delivered</status>
  </shipment>
  <shipment>
    <shipment_id>S002</shipment_id>
    <order_id>1002</order_id>
    <delivery_days>7</delivery_days>
    <status>Delayed</status>
  </shipment>
</shipments>
`;

let shipmentsData = [];
xml2js.parseString(rawShipmentsXML, { explicitArray: false }, (err, result) => {
  if (!err && result.shipments && result.shipments.shipment) {
    shipmentsData = Array.isArray(result.shipments.shipment) 
      ? result.shipments.shipment 
      : [result.shipments.shipment];
  }
});

app.get('/analytics/summary', (req, res) => {
  let totalRevenue = 0;
  let totalOrdersCount = rawOrdersJSON.orders.length;
  let delayedOrdersCount = 0;
  const categoryRevenueMap = {};

  rawOrdersJSON.orders.forEach(order => {
    const shipment = shipmentsData.find(s => s.order_id === order.order_id);
    if (shipment && shipment.status.toLowerCase() === 'delayed') {
      delayedOrdersCount++;
    }

    order.items.forEach(item => {
      const itemTotal = item.qty * item.price;
      totalRevenue += itemTotal;

      const product = rawProductsCSV.find(p => p.ProductID === item.product_id);
      const category = product ? product.Category : 'Uncategorized';

      categoryRevenueMap[category] = (categoryRevenueMap[category] || 0) + itemTotal;
    });
  });

  const categoryData = Object.keys(categoryRevenueMap).map(cat => ({
    category: cat,
    revenue: categoryRevenueMap[cat]
  }));

  res.json({
    summary: {
      totalOrders: totalOrdersCount,
      totalRevenue: totalRevenue,
      delayedOrders: delayedOrdersCount
    },
    categoryWiseRevenue: categoryData
  });
});

app.listen(5000, () => console.log('Backend Server running on http://localhost:5000'));