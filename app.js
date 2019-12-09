const express = require('express');
const app = express();
const axios = require('axios');

app.use(express.json());

app.get('/', function(req, res) {
	res.send("This is your nodejs server.")
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

function calculate_ingredients(weekly_meals) {
	ingredients = {};

	weekly_meals.forEach(daily_meals => {
		daily_meals.forEach(meal => {

			for (const [key, value] of Object.entries(meal.ingredient[0])) {

				var left_bracket = key.indexOf("(");

				if(left_bracket != -1) {
					var product = key.substring(0, left_bracket);

					if(ingredients.hasOwnProperty(product)) {
						ingredients[product] += parseFloat(value);
					} else {
						ingredients[product] = parseFloat(value);
					}
				}
		  	}
		});
	});

	return ingredients;
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

		if(!person.gymDates[i]) {
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

	// console.log(weekly_macros);

	let response = 0;

	try {
		response = await axios.post('https://meal-planning-app-259900.appspot.com/get_recipes',  {
		 	data: weekly_macros
		});
	} catch(error) {
		console.log(error);
	}

	final_result = {
		"ingredients_list" :  calculate_ingredients(response.data),
		"weekly_recipes" : response.data
	}

	res.json(final_result);
});

const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';

app.listen(port, hostname);
