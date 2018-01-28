import { Resource } from 'ng2-rest';
import * as express from "express";

const express = require('express')
const cors = require('cors')
const port = 3000;

const rest = Resource.create(`http://localhost:${port}`, 'users');
export async function start() {

    const app = express()
    app.use(cors())

    app.get('/users', (req, res) => {
        res.json([{ "name": "Bob from mockable.io", "id": 1 }, { "name": "Alice from mockable.io", "id": 2 }])
    })

    app.listen(port, async () => {
        console.log('Example app listening on port 3000!')
        console.log('test')
        try {
            const resp = await rest.model({
                test: 11
            }).array.get()
            console.log(JSON.stringify(resp.headers.toJSON()));
            console.log(JSON.stringify(resp.body.json))
        } catch (error) {
            console.log(error)
        }
    })



}
start();
