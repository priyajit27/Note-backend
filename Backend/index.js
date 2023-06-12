const connectToMongo=require('./db')
const express = require('express')
const cors = require('cors')
require('dotenv').config();

connectToMongo();
// function connectToMongo


const app = express()
// const port = 5000
const port = process.env.BASE_URL||5000
app.use(cors())

app.use(express.json())
// Available routes
app.use('/api/auth',require('./routes/auth'))
// // Middleware function for authentication

// Here, the middleware function will be executed for requests that start with /api/notes
app.use('/api/notes',require('./routes/notes'))


// app.get: This method is used to define a route that handles HTTP GET requests.
// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })


// app.listen
// This method starts the server and makes it listen for incoming requests on a specified port. It is typically the last line of code in an Express application. 
app.listen(port, () => {
  console.log(`iNotebook backend listening on port ${port}`)
})
