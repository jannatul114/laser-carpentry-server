const express = require('express')
const app = express()
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e4meh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized access' })
    }

    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}

async function run() {
    await client.connect();
    const reviewCollection = client.db("manufecturer").collection("reviews");
    const toolsCollection = client.db("manufecturer").collection("tools");
    const ordersCollection = client.db("manufecturer").collection("orders");
    const usersCollection = client.db("manufecturer").collection("users");




    try {
        app.get('/reviews', async (req, res) => {
            const query = {};
            const result = await reviewCollection.find(query).toArray();
            res.send(result);
        })

        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email })
            const isAdmin = user.role === 'admin';
            res.send({ admin: isAdmin })
        })

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review)
            res.send(result)
        })


        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order)
            res.send(result)
        })

        app.get('/users', verifyJWT, async (req, res) => {
            const users = await usersCollection.find().toArray()
            res.send(users)
        })

        app.put('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const request = req.decoded.email;
            const requesterAccount = await usersCollection.findOne({ email: request })
            if (requesterAccount.role === 'admin') {
                const filter = { email: email }
                const updatedDoc = {
                    $set: { role: 'admin' },
                }
                const result = await usersCollection.updateOne(filter, updatedDoc)
                res.send(result)
            }

            else { res.status(403).send({ message: 'forbidden' }) }

        })


        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email }
            const options = { upsert: true }
            const updatedDoc = {
                $set: user,
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ result, token })
        })

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await usersCollection.findOne(query)
            res.send(result);
        })

        app.get('/orders', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const result = await ordersCollection.find({ email: email }).toArray()
            res.send(result)
        })

        app.get('/tools', async (req, res) => {
            const query = {};
            const result = await toolsCollection.find(query).toArray();
            res.send(result.reverse());
        })

        app.post('/tools', async (req, res) => {
            const tools = req.body;
            const result = await toolsCollection.insertOne(tools)
            res.send(result)
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