const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,

  user: 'root',
  password: '70Uk881@7U$Y',
  database: 'bamazon_DB',
});

connection.connect(function(err) {
  if (err) throw err;
  // console.log(`connected as id ${connection.threadId}`);
  managerPortal();
});

function managerPortal() {
  inquirer.prompt([
    {
      name: 'rootMenu',
      type: 'list',
      message: 'Hi! What would you like to do today?',
      choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit Program'],
    },
  ]).then(function(answer) {
    switch (answer.rootMenu) {
      case 'View Products for Sale':
        displayProducts();
        break;
      case 'View Low Inventory':
        reorderReport();
        break;
      case 'Add to Inventory':
        addToInventory();
        break;
      case 'Add New Product':
        addNewProduct();
        break;
      case 'Exit Program':
        connection.end();
        break;
      default:
        console.log('Error');
    }
  });
}

function displayProducts() {
  const query = 'SELECT * FROM products';
  let products = [];
  connection.query(query, function(err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      products.push(`ID: ${res[i].item_id}, ${res[i].product_name}, price: $${res[i].price}, Qty. ${res[i].stock_quantity}`);
    }
    console.log(products);
    managerPortal();
  });
}

function reorderReport() {
  const query = 'SELECT * FROM products WHERE stock_quantity BETWEEN 0 AND 5';
  connection.query(query, function(err, res) {
    if (err) return err;
    for (let i = 0; i < res.length; i++) {
      console.log(`ID: ${res[i].item_id}, ${res[i].product_name}, Qty. ${res[i].stock_quantity}`);
    }
    managerPortal();
  });
}

function updateStockQuantity(newQuantity, itemToUpdate) {
  const update = 'UPDATE products SET stock_quantity = ? WHERE item_id = ?';
  connection.query(update, [newQuantity, itemToUpdate], function(err, res) {
    if (err) throw err;
    // console.log(res);
  });
}

function addToInventory() {
  inquirer.prompt([
    {
      name: 'productID',
      type: 'input',
      message: 'Enter the ID of the product to which you would like to add inventory.',
    },
    {
      name: 'quantity',
      type: 'input',
      message: 'How many would you like to add?',
    },
  ]).then(function(answer) {
    const update = 'UPDATE products SET ? WHERE ?';
    connection.query(
      update,
      [
        {
          stock_quantity: answer.quantity,
        },
        {
          item_id: answer.productID,
        },
      ],
      function(err, res) {
        if (err) throw err;
        let newQuantity = res[0].stock_quantity + answer.quantity;
        // console.log(newQuantity);
        updateStockQuantity(newQuantity, answer.productID);
        console.log(res.affectedRows + " products updated!\n");
        managerPortal();
      },
    );
  });
}

function addNewProduct() {
  inquirer.prompt([
    {
      name: 'prodName',
      type: 'input',
      message: 'Enter the name of the new product.',
    },
    {
      name: 'department',
      type: 'input',
      message: 'Enter the department of the new product.',
    },
    {
      name: 'price',
      type: 'input',
      message: 'Enter the price of the product in the format 99.99.',
    },
    {
      name: 'stockQuantity',
      type: 'input',
      message: 'How many are you adding to inventory?',
    },
  ]).then(function(answer) {
    console.log("Inserting a new product...\n");
    const insert = "INSERT INTO products SET ?"
    connection.query(
      insert,
      {
        product_name: answer.prodName,
        department_name: answer.department,
        price: answer.price,
        stock_quantity: answer.stockQuantity,
      },
      function(err, res) {
        console.log(res.affectedRows + " product inserted!\n");
        managerPortal();
      },
    );
  });
}
