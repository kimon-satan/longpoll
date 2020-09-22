
const express = require('express')
const app = express()
const port = 3000
let counter = 0;
let subscribers = [];

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));

app.get('/', (req, res) =>
{
	res.sendFile(__dirname + '/index.html');
})

app.get('/count', (req, res) =>
{
	subscribe(res);
})

app.post('/increment', (req, res) =>
{
	counter++;
	publish();
	res.status(200).send("counter: " + counter);
})

function subscribe(res)
{
	subscribers.push(res);
}

function publish()
{
	for(let i = 0; i < subscribers.length; i++)
	{
		subscribers[i].send("the count is " + counter);
	}
	subscribers = [];
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
