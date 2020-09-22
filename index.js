
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

const port = 3000
let counter = 0;
let clickCounter = {};

//lets abstract this

class SubscriptionManager {

	subscribers;
	processAll;
	processSubscriber;
	sendResponse;

	constructor()
	{
		this.subscribers = [];

		this.processAll = function()
		{
			return Promise.resolve();
		}

		this.processSubscriber = function(id)
		{
			return Promise.resolve();
		}

		this.sendResponse = function(res, id, doc)
		{
			res.status(200).send("empty response");
			return Promise.resolve();
		}


	}

	subscribe(id, res)
	{
		let s = this.subscribers.find(u => u.id == id);

		if(s)
		{
			//repeat subscription
			s.res = res;
		}
		else
		{
			//initial subscription
			this.subscribers.push({id: id, res: res});
			this.processSubscriber(id)
			.then(doc =>
			{
				return this.sendResponse(res, id, doc);
			})
			.catch(err =>
			{
				console.log(err);
			})

		}
	}

	publish()
	{
		//any global processing

		this.processAll()

		.then(_=>
		{
			let promises = this.subscribers.map(subscriber =>
			{
				if(subscriber.res != null)
				{
					return this.processSubscriber(subscriber.id) // individual processing
					.then(doc =>
					{
						return this.sendResponse(subscriber.res, subscriber.id, doc) //finally send the response
					})
				}
				else
				{
					return Promise.resolve();
				}
			})
			return Promise.all(promises);
		})

		.then(_=>
		{
			this.cleanUp();
		})

		.catch(err =>
		{
			console.log(err);
		})
	}

	cleanUp()
	{
		for(let i = this.subscribers.length - 1; i >= 0; i--)
		{
			if(this.subscribers[i].res == null)
			{
				//remove dead subscribers
				this.subscribers.splice(i,1);
			}
			else{
				this.subscribers[i].res = null;
			}
		}
	}

}

let subscription = new SubscriptionManager();

app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));

app.get('/', (req, res) =>
{
	res.sendFile(__dirname + '/index.html');
})

app.get('/count', (req, res) =>
{
	subscription.subscribe(req.query.id, res);
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

	subscription.publish();
	res.status(200).send("counter: " + counter);
})



subscription.sendResponse = function(res,id)
{
	let x = clickCounter[id] || 0;
	res.send("the count is " + counter + ", you have clicked " + x + " times.");
	return Promise.resolve();
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
