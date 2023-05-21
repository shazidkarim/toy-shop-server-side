const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wyepuci.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const dollCollection = client.db('toymarket').collection('dolls');
    const addToyCollection = client.db('toymarket').collection('addtoy');

    // app.get('/dolls', async (req, res) => {
    //   const cursor = dollCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // })
    // 
    app.get("/dolls", async (req, res) => {
      const limit = parseInt(req.query.limit) || 20;
      const result = await dollCollection.find().limit(limit).toArray();
      res.send(result);
     
    });
    

    // add toy
    app.get('/addtoy', async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await addToyCollection.find(query).toArray();
      res.send(result);
    })

    app.get('/addtoy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
    
      try {
        const sortCriteria = req.query.sortBy === 'desc' ? -1 : 1;
        const result = await addToyCollection.find(query).sort({ price: sortCriteria }).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while retrieving the toys' });
      }
    });
    


    // app.post('/addtoy', async (req, res) => {
    //   const addtoy = req.body;
    //   console.log(addtoy);
    //   const result = await addToyCollection.insertOne(addtoy);
    //   res.send(result);
    // })



    app.post('/addtoy', async (req, res) => {
      const addtoy = req.body;
      console.log(addtoy);
      const result = await addToyCollection.insertOne(addtoy);
      const insertedId = result.insertedId;
      res.send({ insertedId }); // Send the inserted document's ID as a response
    });

    
    app.put('/addtoy/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const options = { upsert: true };
      const updatedToy = req.body;
      const newToy = {
        $set: {
          category: updatedToy.category,
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          rating: updatedToy.rating,
          photo: updatedToy.photo,
          customerName: updatedToy.customerName
        }
      }
      const result = await addToyCollection.updateOne(filter,newToy,options);
      res.send(result);

    })

    app.delete('/addtoy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addToyCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('toy marketplace server is running')
})

app.listen(port, () => {
  console.log(`toy marketplace server is running on port ${port}`)
})