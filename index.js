const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e4meh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    await client.connect();
    const reviewCollection = client.db("manufecturer").collection("reviews");
    const toolsCollection = client.db("manufecturer").collection("tools");


    try {
        app.get('/reviews', async (req, res) => {
            const query = {};
            const result = await reviewCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/tools', async (req, res) => {
            const query = {};
            const result = await toolsCollection.find(query).toArray();
            res.send(result);
        })
        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.findOne(query)
            res.send(result);
        })
        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await toolsCollection.findOne(query)
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello manufecrurer')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})