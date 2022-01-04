const express = require("express");
const mongoose = require("mongoose");
const _ = require('lodash');
const { redirect } = require("express/lib/response");
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/EventShow", { useNewUrlParser: true });

//Signup/Login
var userName = "";
var AdminName = "";
var userId = "";
const LoginSchema = new mongoose.Schema({
    Name: String,
    mailId: String,
    password: String,
    phoneNumber: String
});
const LoginVar = mongoose.model("login", LoginSchema) //Collection-1

//List Of Event - ADMIN added/remove
const ListOfEventSchema = new mongoose.Schema({
    clgname: String,
    eventname: String,
    startdate: String,
    enddate: String,
    state: String,
    medium: String
});
const ListOfEvent = mongoose.model("listofevents", ListOfEventSchema) //Collection-2

app.get("/", function(req, res) {
    res.render("index", { userName: userName });
});

// ppt Events Common
const PptSchema = new mongoose.Schema({
    name: String,
    rollno: Number,
    mailid: String,
    phno: Number
});
const Ppt = mongoose.model("ppt", PptSchema) //Collection-3

// project Events Common
const ProjectSchema = new mongoose.Schema({
    name: String,
    rollno: Number,
    mailid: String,
    phno: Number
});
const Project = mongoose.model("project", ProjectSchema) //Collection-4

// ideathon Events Common
const IdeathonSchema = new mongoose.Schema({
    name: String,
    rollno: Number,
    mailid: String,
    phno: Number
});
const Ideathon = mongoose.model("ideathon", IdeathonSchema) //Collection-5



app.get("/signin", function(req, res) {
    res.render("signin", { userName: userName, message: "", adminLogin: "no" });
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
                    res.render("signin", { userName: userName, message: "User-Id already Exist!", adminLogin: "no" });
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
                        res.render("signin", { userName: userName, message: "Successfully Signed up!", adminLogin: "no" });
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
                            res.render("signin", { userName: userName, message: "Incorrect Password!", adminLogin: "no" });
                        }
                        mailCheck = true;
                    }
                });

                if (mailCheck === false) {
                    res.render("signin", { userName: userName, message: "Invalid UserId", adminLogin: "no" });
                }

            }
        }
    })
});



app.get("/adminEvent", function(req, res) {

    if (AdminName != "") {
        ListOfEvent.find({}, (err, outArray) => {
            if (!err) {
                res.render("adminevent", { userName: userName, ListOfEvent: outArray, message: "", AdminName: AdminName });
            }
        })
    } else {
        res.render("signin", { userName: userName, message: "", adminLogin: "yes" });
    }

});

app.post("/adminEventAdd", function(req, res) {
    var clgname = req.body.clgname
    var eventname = req.body.eventname
    var startdate = req.body.startdate
    var enddate = req.body.enddate
    var state = req.body.state
    var medium = req.body.medium
    var ch = false;
    //Saves to DB
    const eventToAdd = new ListOfEvent({
        clgname: clgname,
        eventname: eventname,
        startdate: startdate,
        enddate: enddate,
        state: state,
        medium: medium
    })

    // Checks Event Name
    ListOfEvent.find({ eventname: eventname }, (err, outArray) => {
        if (!err) {
            // console.log(outArray);
            if (outArray.length != 0) {
                ListOfEvent.find({}, (err, outArray) => {
                    if (!err) {
                        res.render("adminevent", { userName: userName, ListOfEvent: outArray, message: "Event Name Already Exits!", AdminName: AdminName });
                    }
                })
            } else {
                eventToAdd.save((err) => {
                    if (!err) {
                        ListOfEvent.find({}, (err, outArray) => {
                            if (!err) {
                                res.render("adminEvent", { userName: userName, ListOfEvent: outArray, message: "Event Registered Successfully!", AdminName: AdminName });
                            }
                        })
                    }
                })
            }
        }
    })
});


app.post("/removeEvent", function(req, res) {
    var eventName = req.body.eventName

    ListOfEvent.deleteOne({ eventName: eventName }, (err) => {
        if (!err) {
            ListOfEvent.find({}, (err, outArray) => {
                if (!err) {
                    res.render("adminEvent", { userName: userName, ListOfEvent: outArray, message: "Event Removed Successfully!", AdminName: AdminName });
                }
            })
        }
    })

});

app.get("/event", function(req, res) {

    if (userName != "") {
        ListOfEvent.find({}, (err, outArray) => {
            if (!err) {
                res.render("event", { userName: userName, ListOfEvent: outArray });
            }
        })
    } else {
        res.redirect("/signin");
    }

});

app.post("/innerMoveEvent", function(req, res) {
    var eventName = req.body.eventName;
    res.render("innerEvent", { userName: userName });
});


app.post("/adminlogin", function(req, res) {
    var userId = req.body.userId;
    var password = req.body.password;
    if (userId == "admin") {
        if (password == "admin") {
            res.redirect("/adminEvent");
            AdminName = "Admin"
        } else {
            res.render("signin", { userName: userName, message: "Incorrect Password!", adminLogin: "yes" });
        }
    } else {
        res.render("signin", { userName: userName, message: "Incorrect UserID!", adminLogin: "yes" });
    }
});


app.get("/innerEvent", function(req, res) {
    if (userName != "") {
        res.render("innerEvent", { userName: userName });
    } else {
        res.redirect("/signin")
    }
});

app.get("/enrollmentView", function(req, res) {
    if (AdminName != "") {
        res.render("enrollmentView", { userName: userName });
    } else {
        res.redirect("/signin");
    }
});


// PPT PRO IDE - POST
app.post("/ppt", function(req, res) {
    var name = req.body.name
    var rollno = req.body.rollno
    var mailid = req.body.email
    var phno = req.body.phone
        // save to db
    const ppt = new Ppt({
        name: name,
        rollno: rollno,
        mailid: mailid,
        phno: phno
    })
    ppt.save((err) => {
        if (!err) {
            res.redirect("/innerEvent");
        }
    })
});
app.post("/project", function(req, res) {
    var name = req.body.name
    var rollno = req.body.rollno
    var mailid = req.body.email
    var phno = req.body.phone
        // save to db
    const project = new Project({
        name: name,
        rollno: rollno,
        mailid: mailid,
        phno: phno
    })
    project.save((err) => {
        if (!err) {
            res.redirect("/innerEvent");
        }
    })
});
app.post("/ideathon", function(req, res) {
    var name = req.body.name
    var rollno = req.body.rollno
    var mailid = req.body.email
    var phno = req.body.phone
        // save to db
    const ideathon = new Ideathon({
        name: name,
        rollno: rollno,
        mailid: mailid,
        phno: phno
    })
    ideathon.save((err) => {
        if (!err) {
            res.redirect("/innerEvent");
        }
    })
});


app.get("/logout", function(req, res) {
    userName = "";
    userId = "";
    AdminName = "";
    res.render("index", { userName: userName });
});

app.listen(9000, function() {
    console.log("Server running in 9000")
});