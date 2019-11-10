const express = require('express');
const app = express();
const axios = require('axios');

const gymDates = [false, true, false, true, false, true, false];

app.use(express.json());

app.get('/', function(req, res) {
	res.send("This is my new app.")
});

function adaptCaloricIntake(preferences, caloric_intake) {
	if(preferences.dietType == "bulk") {
		caloric_intake += 300;
	} else if(preferences.dietType == "maintain") {
		// do not change caloric intake
	} else if(preferences.dietType == "lean") {
		caloric_intake -= 300;
	}
	return caloric_intake;
}

app.post('/plan_meals', async (req, res) => {

	weekly_macros = {};
	weekly_meals = {};

	for(var i = 0; i < 7; i = i + 1) {
		caloric_intake = 0;

		if(req.body.gender == "male") {

			person = req.body;

			caloric_intake = 2200;

		} else if(req.body.gender == "female")  {
			person = req.body;

			caloric_intake = 1800;
		}

		caloric_intake = adaptCaloricIntake(person.preferences, caloric_intake);

		if(!gymDates[i]) {
			caloric_intake -= 200;
		}

		weekly_macros[i] = {
			"calories" : caloric_intake,
			"proteins" : caloric_intake * 0.3 / 4.0,
			"carbohydrates" : caloric_intake * 0.5 / 4.0,
			"fat" : caloric_intake * 0.2 / 9.0,
			"meals_per_day" : 5
		};
	}

	console.log(weekly_macros);

	let response = 0;

	try {
		response = await axios.post('http://4e438fac.ngrok.io/get_recipes',  {
		 	data: weekly_macros
		});
	} catch(error) {
		console.log(error);
	}

	res.json(response.data);
});

const port = process.env.PORT || 3000;
app.listen(port);




























