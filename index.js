
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const port = 3000
let counter = 0;
let subscribers = [];
let clickCounter = {};

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

	if(clickCounter[req.body.id] == undefined)
	{
		clickCounter[req.body.id] = 1;
	}
	else
	{
		clickCounter[req.body.id] += 1;
	}

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
		sendResponse(res);
	}
}

function publish()
{
	for(let i = subscribers.length -1; i >= 0; i--)
	{
		if(subscribers[i].res == null)
		{
			//remove dead subscribers
			subscribers.splice(i,1);
		}
		else
		{
			sendResponse(subscribers[i].res,subscribers[i].id);
			subscribers[i].res = null;
		}
	}
}

function sendResponse(res,id)
{

	let x = clickCounter[id] || 0;
	res.send("the count is " + counter + ", you have clicked " + x + " times.");
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
