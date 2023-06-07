require("dotenv").config();

let express = require("express");
let app = express();
let path = require("path");
let ejsMate = require("ejs-mate");
let axios = require("axios");
let CatchAsync = require("./utils/CatchAsync");
let ExpressError = require("./utils/ExpressError");
let mongoSanitize = require("express-mongo-sanitize");
let helmet = require("helmet");

app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());

app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());


app.get("/", (req, res) => {
    res.render("home");
})

app.post("/search", CatchAsync( async (req, res) => {
    let data = req.body.search;
    let Sdata = req.body.select.split("-")[0];
    let SCdata = req.body.select.split("-")[1];

    let options = {
    method: 'GET',
    url: 'https://utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com/lookup',
    params: {
        term: data,
        country: Sdata
    },
    headers: {
        'X-RapidAPI-Key': process.env.APIKEY,
        'X-RapidAPI-Host': 'utelly-tv-shows-and-movies-availability-v1.p.rapidapi.com'
    }
    };

    try {
        let response = await axios.request(options);
        let input = response.data.results;

        if(input[0] === undefined){
            input = undefined;
        }

        res.render("search", {input, data, Sdata, SCdata});
    } catch (error) {
        throw new ExpressError(error);
    }
}))

app.get("/search", (req, res) => {
    let input = undefined;
    let data = null;
    let Sdata = "us";
    res.render("search", {input, data, Sdata});
})

app.get("/policy", (req, res) => {
    res.render("policy");
})

app.get("/contact", (req, res) => {
    res.render("contact");
})

app.get("/about", (req, res) => {
    res.render("about");
})

app.use((err, req, res, next) => {
    res.render("error", {err});
})

app.listen(3000, () => {
    console.log("listening on port: 3000");
})