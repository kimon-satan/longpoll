
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

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
	subscribe(req.query.id, res);
})

app.post('/increment', (req, res) =>
{
	counter++;
	publish();
	res.status(200).send("counter: " + counter);
})

function subscribe(id, res)
{
	let s = subscribers.find(u => u.id == id);

	if(s)
	{
		//repeat subscription
		s.res = res;
	}
	else
	{
		//initial subscription
		subscribers.push({id: id, res: res});
		res.send("the count is " + counter);
	}
}

function publish()
{
	for(let i = subscribers.length -1; i >= 0; i--)
	{
		if(subscribers[i].res == null)
		{
			subscribers.splice(i,1);
		}
		else
		{
			subscribers[i].res.send("the count is " + counter);
			subscribers[i].res = null;
		}
	}
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
