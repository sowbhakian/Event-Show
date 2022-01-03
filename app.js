const express = require("express");
const mongoose = require("mongoose");
const _ = require('lodash');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/EventShow", { useNewUrlParser: true });

//Signup/Login
var userName = "";
var userId = "";
const LoginSchema = new mongoose.Schema({
    Name: String,
    mailId: String,
    password: String,
    phoneNumber: String
});
const LoginVar = mongoose.model("login", LoginSchema) //Collection-1

app.get("/", function(req, res) {
    res.render("index", { userName: userName });
});

app.get("/signin", function(req, res) {
    res.render("signin", { userName: userName, message: "" });
});
app.post("/signup", function(req, res) {
    const name = req.body.name;
    //email = userID
    const email = _.lowerCase(req.body.email);
    const pass = req.body.password;
    const ph = req.body.phonenumber;
    let check = false;

    LoginVar.find({}, (err, output) => {
        if (!err) {

            output.forEach(output => {
                if (output.mailId == email) {
                    check = true
                    res.render("signin", { userName: userName, message: "User-Id already Exist!" });
                }
            })
            if (!check) {
                const newVoter = new LoginVar({
                    Name: name,
                    mailId: email,
                    password: pass,
                    phoneNumber: ph
                })

                newVoter.save((err) => {
                    if (!err) {
                        res.render("signin", { userName: userName, message: "Successfully Signed up!" });
                    }
                })
            }
        }
    })

});
app.post("/login", function(req, res) {
    const email = _.lowerCase(req.body.email);
    const pass = req.body.password;
    let mailCheck = false;

    LoginVar.find({}, (err, output1) => {
        if (!err) {
            // console.log(output1);
            if (output1) {

                output1.forEach(output => {
                    if (output.mailId === email) {
                        if (output.password === pass) {
                            userName = output.Name
                            userId = output.mailId
                            res.redirect("/event")
                        } else {
                            // console.log("In Pass Fail");
                            res.render("signin", { userName: userName, message: "Incorrect Password!" });
                        }
                        mailCheck = true;
                    }
                });

                if (mailCheck === false) {
                    res.render("signin", { userName: userName, message: "Invalid UserId" });
                }

            }
        }
    })
});


app.get("/admin", function(req, res) {
    res.render("admin", { userName: userName });
});

app.get("/logout", function(req, res) {
    userName = "";
    userId = "";
    res.render("index", { userName: userName });
});

app.listen(9000, function() {
    console.log("Server running in 9000")
});