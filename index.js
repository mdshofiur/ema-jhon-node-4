const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors')

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e7yhr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
  try {
       await  client.connect();
       const databse = client.db('onlineShop');
       const productionCollection = databse.collection('products');
       const orderCollection = databse.collection('orders');


       //Get API
       app.get('/products', async (req, res) => {
            const curser = productionCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size)
            let products;
            const count = await curser.count();
            if(page){
              products = await curser.skip(page*size).limit(size).toArray();
            }else{
               products = await curser.toArray();
            }
            res.send({
              count,
              products
            });
       })

       // Use Post to get data by keys
       
       app.post('/products/bykeys', async (req, res) => {
         const keys = req.body;
         const query = {key: {$in: keys}};
         const users = await productionCollection.find(query).toArray();
         res.json(users);
       })

      
       // Add Orders API

       app.post('/orders', async (req, res) => {
         const order = req.body;
         const result = await orderCollection.insertOne(order);
         res.json(result);     
       })





  }
  finally{
    //   await client.close();
  }
}



run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Hello Api
app.get('/hello', (req, res) => {
  res.send('Hello Api')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})