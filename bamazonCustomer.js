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
  customerStorefront();
});

function customerStorefront() {
  inquirer.prompt([
    {
      name: 'productID',
      type: 'input',
      message: 'Please enter the ID # of the product you would like to buy. Or enter "help" for a list of items.',
    },
  ]).then(function(answer) {
    if (answer.productID === 'help') {
      displayProducts();
      customerStorefront();
    } else {
      connection.query('SELECT * FROM products WHERE ?', { item_id: answer.productID }, function(err, res) {
        if (err) throw err;
        // console.log(res);
        inquirer.prompt([
          {
            name: 'quantity',
            type: 'input',
            message: 'How many would you like to purchase?', // insert qty available if able
          },
        ]).then(function(input) {
          if (res[0].stock_quantity >= input.quantity) {
            let newQuantity = res[0].stock_quantity - input.quantity;
            // console.log(newQuantity);
            updateStockQuantity(newQuantity, answer.productID);
            const totalCost = parseFloat(res[0].price * input.quantity).toFixed(2);
            console.log(`Thank you for ordering ${input.quantity} ${res[0].product_name}(s).\nYour total cost is $${totalCost}`);
            connection.end();
          } else {
            console.log(`Sorry, insufficient quantity!\n${res[0].stock_quantity} available`);
            customerStorefront();
          }
        });
      });
    }
  });
}

function displayProducts() {
  const query = 'SELECT * FROM products';
  // let products = [];
  connection.query(query, function(err, res) {
    if (err) throw err;
    for (let i = 0; i < res.length; i++) {
      // products.push(`ID: ${res[i].item_id}, ${res[i].product_name}, price: $${res[i].price}`);
      console.log(`ID: ${res[i].item_id}, ${res[i].product_name}, price: $${res[i].price}`);
      // console.log(products);
    }
  });
}

function updateStockQuantity(newQuantity, itemToUpdate) {
  const update = 'UPDATE products SET stock_quantity = ? WHERE item_id = ?';
  connection.query(update, [newQuantity, itemToUpdate], function(err, res) {
    if (err) throw err;
    // console.log(res);
  });
}
