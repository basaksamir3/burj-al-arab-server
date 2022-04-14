const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const admin = require('firebase-admin')

require('dotenv').config()

const port = 5000

const app = express()
app.use(cors());
app.use(bodyParser.json());




var serviceAccount = require("./hotel-auth-d2948-firebase-adminsdk-5k8fk-222e8fcd1c.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});



const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mjdcc.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const collection = client.db("burjAlArab").collection("booking");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;

        collection.insertOne(newBooking)
            .then(result => {
                console.log(result);
            })
        console.log(newBooking)
    })

    app.get('/collection', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });

            admin.auth()
                .verifyIdToken(idToken)
                .then(function (decodedToken) {
                    const tokenEmail = decodedToken.email;
                    const queryEmail = req.query.email;

                    console.log(tokenEmail, queryEmail);
                    if (tokenEmail == queryEmail) {
                        collection.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.status(200).send(documents);
                            })
                    }
                    else {
                        res.status(401).send('un-authorised access denied');
                    }

                })
                .catch((error) => {
                    res.status(401).send('un-authorised access denied');
                });

        }
        else {
            res.status(401).send('un-authorised access denied');
        }

    })
});



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening on port ${port}`)
})