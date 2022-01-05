const express = require("express");
const mongoose = require("mongoose");
const _ = require('lodash');
const { redirect } = require("express/lib/response");
const app = express();
const date = require("./date");

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));


// database Host
let port = process.env.PORT || 5000;
const URI = "mongodb+srv://sowbi:1234@cluster0.hdb8s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(URI || "mongodb://localhost:27017/EventShow", { useNewUrlParser: true });

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

// ppt Events Common
const PptSchema = new mongoose.Schema({
    name: String,
    rollno: String,
    mailid: String,
    phno: Number
});
const Ppt = mongoose.model("ppt", PptSchema) //Collection-3

// project Events Common
const ProjectSchema = new mongoose.Schema({
    name: String,
    rollno: String,
    mailid: String,
    phno: Number
});
const Project = mongoose.model("project", ProjectSchema) //Collection-4

// ideathon Events Common
const IdeathonSchema = new mongoose.Schema({
    name: String,
    rollno: String,
    mailid: String,
    phno: Number
});
const Ideathon = mongoose.model("ideathon", IdeathonSchema) //Collection-5

//List Of Event - ADMIN added/remove
const ListOfEventSchema = new mongoose.Schema({
    clgname: String,
    eventname: String,
    regdate: String,
    startdate: String,
    enddate: String,
    state: String,
    medium: String,
    eventDescription: String,
    ppt: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ppt' }],
    project: [{ type: mongoose.Schema.Types.ObjectId, ref: 'project' }],
    ideathon: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ideathon' }]
});
const ListOfEvent = mongoose.model("listofevents", ListOfEventSchema) //Collection-2

// Home
app.get("/", function(req, res) {
    res.render("index", { userName: userName, AdminName: AdminName });
});

//  SIGNIN | LOGIN
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



// EVENTS
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
    ListOfEvent.find({ eventName: eventName }, (err, outArray) => {
        if (!err) {
            res.render("innerEvent", { userName: userName, eventName: eventName, outArray: outArray, message: "" });
        }
    })

});


// ADMIN
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
app.post("/enrollmentView", function(req, res) {
    var eventName = req.body.eventName
    var pptvar = [];
    var projectvar = [];
    var ideathonvar = [];
    ListOfEvent.find({ eventname: eventName }).populate('ppt').populate('project').populate('ideathon').exec((err1, outArray1) => {
        if (!err1) {
            pptvar = outArray1[0].ppt;
            projectvar = outArray1[0].project;
            ideathonvar = outArray1[0].ideathon;
            res.render("enrollmentView", { eventName: eventName, pptvar: pptvar, projectvar: projectvar, ideathonvar: ideathonvar, startDate: outArray1[0].startdate, endDate: outArray1[0].enddate, clgName: outArray1[0].clgname, eventName: outArray1[0].eventname, c: 0 });
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
    var eventname = _.upperCase(req.body.eventname);
    var regdate = req.body.registrationdate
    var startdate = req.body.startdate
    var enddate = req.body.enddate
    var state = req.body.state
    var medium = req.body.medium
    var eventDescription = req.body.eventDescription
    var result = date.check(startdate, enddate, regdate); //date
    if (result) {

        //Saves to DB
        const eventToAdd = new ListOfEvent({
            clgname: clgname,
            eventname: eventname,
            regdate: regdate,
            startdate: startdate,
            enddate: enddate,
            state: state,
            medium: medium,
            eventDescription: eventDescription
        })

        // Checks Event Name
        ListOfEvent.find({ eventname: eventname }, (err, outArray) => {
            if (!err) {
                // console.log(outArray);
                if (outArray.length != 0) {
                    ListOfEvent.find({}, (err, outArray) => {
                        if (!err) {
                            res.render("adminEvent", { userName: userName, ListOfEvent: outArray, message: "Event Name Already Exits!", AdminName: AdminName });
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
    } else {
        ListOfEvent.find({}, (err, outArray) => {
            if (!err) {
                res.render("adminEvent", { userName: userName, ListOfEvent: outArray, message: "Registration Date must be Close Before the Start of the event!", AdminName: AdminName });
            }
        })
    }
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
app.post("/removeUser", function(req, res) {
    var eventName = req.body.eventName
});


// PPT PRO IDE - POST
app.post("/ppt", function(req, res) {
    var name = req.body.name
    var rollno = req.body.rollno
    var mailid = req.body.email
    var phno = req.body.phone
    var eventName = req.body.eventName
    ListOfEvent.findOne({ eventname: eventName }).populate('ppt').exec((err, foundUser) => {

        if (!err) {
            const addpptEvent = new Ppt({
                name: name,
                rollno: rollno,
                mailid: mailid,
                phno: phno
            });

            // ListOfEvent push and Save
            foundUser.ppt.push(addpptEvent);
            foundUser.save();

            // Save the ppt details
            addpptEvent.save((err) => {
                // res.redirect("/event");
                ListOfEvent.find({ eventName: eventName }, (err, outArray) => {
                    if (!err) {
                        res.render("innerEvent", { userName: userName, eventName: eventName, outArray: outArray, message: "Event Registered Successful!" });
                    }
                })
            });

        } else {
            res.redirect("/event");
        }
    });

});
app.post("/project", function(req, res) {
    var name = req.body.name
    var rollno = req.body.rollno
    var mailid = req.body.email
    var phno = req.body.phone
    var eventName = req.body.eventName
        // console.log(eventName);
    ListOfEvent.findOne({ eventname: eventName }).populate('project').exec((err, foundUser) => {

        if (!err) {
            const addProjectEvent = new Project({
                name: name,
                rollno: rollno,
                mailid: mailid,
                phno: phno
            });

            // ListOfEvent push and Save
            foundUser.project.push(addProjectEvent);
            foundUser.save();

            // Save the ppt details
            addProjectEvent.save((err) => {
                ListOfEvent.find({ eventName: eventName }, (err, outArray) => {
                    if (!err) {
                        res.render("innerEvent", { userName: userName, eventName: eventName, outArray: outArray, message: "Event Registered Successful!" });
                    }
                })
            });

        } else {
            res.redirect("/event");
        }
    });

});
app.post("/ideathon", function(req, res) {
    var name = req.body.name
    var rollno = req.body.rollno
    var mailid = req.body.email
    var phno = req.body.phone
    var eventName = req.body.eventName
    ListOfEvent.findOne({ eventname: eventName }).populate('ideathon').exec((err, foundUser) => {

        if (!err) {
            const addIdeathonEvent = new Ideathon({
                name: name,
                rollno: rollno,
                mailid: mailid,
                phno: phno
            });

            // ListOfEvent push and Save
            foundUser.ideathon.push(addIdeathonEvent);
            foundUser.save();

            // Save the ppt details
            addIdeathonEvent.save((err) => {
                ListOfEvent.find({ eventName: eventName }, (err, outArray) => {
                    if (!err) {
                        res.render("innerEvent", { userName: userName, eventName: eventName, outArray: outArray, message: "Event Registered Successful!" });
                    }
                })
            });

        } else {
            res.redirect("/event");
        }
    });

});


app.get("/logout", function(req, res) {
    userName = "";
    userId = "";
    AdminName = "";
    res.render("index", { userName: userName, AdminName: AdminName });
});

app.listen(port, function() {
    console.log("Server running in 5000")
});