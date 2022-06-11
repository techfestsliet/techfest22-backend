const { validationResult } = require("express-validator");
const Event = require("../models/events");
const { successAction, failAction } = require("../utils/response");
const fileHelper = require("../utils/file");
const fs = require("fs");
const User = require("../models/user");
const Team = require("../models/team");
const { ideahub } = require("googleapis/build/src/apis/ideahub");

module.exports.addEvents = (req, res) => {
  if (!req.file) {
    return res
      .status(208)
      .json({ isError: true, title: "Error", message: "Image not given" });
  }

  const errors = validationResult(req);

  // return console.log(errors.array());
  if (!errors.isEmpty()) {
    if (req.file) {
      const pathImg = "upload/images/" + req.file.filename;
      fileHelper.deleteFiles(pathImg);
    }
    return res
      .status(208)
      .json({ isError: true, title: "Error", message: errors.array() });
  }

  const {
    name,
    description,
    endDate,
    startDate,
    eventMode,
    domain,
    driveLink,
    studentCoordinator,
    ePrizeWorth,
  } = req.body;
  // return console.log(startDate, endDate);
  const photo = req.file.filename;
  let studentCoordinatorArr = studentCoordinator.split(",");

  Event.findOne({ name: name }, (err, event) => {
    if (err) {
      if (req.file) {
        const pathImg = "upload/images/" + req.file.filename;
        fileHelper.deleteFiles(pathImg);
      }
      return res
        .status(208)
        .json({ isError: true, title: "Error", message: err });
    }
    if (event) {
      if (req.file) {
        const pathImg = "upload/images/" + req.file.filename;
        fileHelper.deleteFiles(pathImg);
      }
      return res.status(208).json({
        isError: true,
        title: "Error",
        message: `Event already exists with this name :- ${name}`,
      });
    } else {
      const eLoad = {
        name,
        description,
        photo,
        startDate,
        endDate,
        eventMode,
        domain,
        ePrizeWorth,
        driveLink,
        studentCoordinator: studentCoordinatorArr,
      };

      const event = new Event(eLoad);

      try {
        event.save((err, event) => {
          if (err || !event) {
            if (req.file) {
              const pathImg = "upload/images/" + req.file.filename;
              fileHelper.deleteFiles(pathImg);
            }
            return res.status(208).json({
              isError: true,
              title: "Error",
              message: "Error ocurd while saving db",
              error: err,
            });
          } else {
            return res.status(200).json({
              isError: false,
              title: "Success",
              message: "Event is added",
            });
          }
        });
      } catch (err) {
        if (req.file) {
          const pathImg = "upload/images/" + req.file.filename;
          fileHelper.deleteFiles(pathImg);
        }
        return res
          .status(208)
          .json({ isError: true, title: "Error", message: err });
      }
    }
  });
};

module.exports.getAllEvents = (req, res) => {
  Event.find()
    .populate("studentCoordinator", ["coordinatorName", "coordinatorEmail"])
    .exec((err, events) => {
      if (err || !events) {
        return res.status(208).json(failAction(err));
      }
      return res.status(200).json({
        isError: false,
        title: "Succes",
        message: "succes",
        data: events,
      });
    });
};

exports.getByDomain = (req, res, next) => {
  const name = req.params.name.trim().toLowerCase();
  //return console.log(name);
  Event.find({ domain: name })
    .populate("studentCoordinator", [
      "coordinatorName",
      "coordinatorPhone",
      "photo",
    ])
    .exec((err, d) => {
      if (err || !d) {
        return res.status(200).json({
          isError: true,
          title: "Error",
          message: "Not found",
        });
      }

      return res.status(200).json({
        isError: false,
        title: "Succes",
        message: "succes",
        data: d,
      });
    });
};

module.exports.getEventById = async (req, res) => {
  const errors = validationResult(req);
  const eventId = req.params.id;
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const eventData = await Event.findById(eventId)
    .populate("individual", ["name", "whatsappPhoneNumber", "email"])
    .exec();

  let teams = [];
  let individuals = [];
  for (const individual of eventData.individual) {
    const individualDataList = {
      name: "",
      whatsappPhoneNumber: "",
      email: "",
    };
    const individualData = User.findById(individual._id);

    individualDataList.name = individualData.name;
    individualDataList.email = individualData.email;

    if (individualData.whatsappPhoneNumber !== null) {
      individualDataList.whatsappPhoneNumber =
        individualData.whatsappPhoneNumber;
    } else {
      individualDataList.whatsappPhoneNumber = "";
    }

    individuals.push(individualDataList);
  }
  for (const teamVal of eventData.teams) {
    const teamData = {
      teamName: "",
      teamLeaderName: "",
      teamLeaderWahtsApp: "",
      teamLeaderMail: "",
      membersMail: [],
    };
    const teamActualData = await Team.findById(teamVal._id);
    const leaderData = await User.findById(teamActualData.leaderId);
    teamData.teamName = teamActualData.name;
    teamData.teamLeaderName = leaderData.name;
    if (leaderData.whatsappPhoneNumber !== null) {
      teamData.teamLeaderWahtsApp = leaderData.whatsappPhoneNumber;
    }

    teamData.teamLeaderMail = leaderData.email;
    teamData.membersMail = teamActualData.members;

    teams.push(teamData);
  }

  if (!eventData) {
    return res.status(200).json({
      isError: false,
      title: "Not found",
      message: "Not found!",
    });
  }
  return res.status(200).json({
    isError: false,
    title: "found",
    message: "Success",
    event: eventData,
    teams: teams,
    individualsArray: individuals,
  });
};

exports.deletEvent = (req, res, next) => {
  const eId = req.params.eId;

  Event.findByIdAndDelete(eId).then((result) => {
    if (!result) {
      res.status(208).json({
        isError: true,
        title: "Error",
        message: "Image is not given",
      });
    }

    //return console.log(eId, result);

    const pathImg = "upload/images/" + result.photo;
    if (fs.existsSync(pathImg)) {
      fileHelper.deleteFiles(pathImg);
    } //photo exists

    res.status(208).json({
      data: result,
      statusCode: 410,
      message: "successfully deleted! ",
    });
  });
};

exports.getProperEvents = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId)
    .populate("events", ["name", "endDate"])
    .populate("workshops", ["workshopName", "endDate"])
    .populate("teamMembers", ["name", "events"]);
  if (!user) {
    return res.status(200).json({
      isError: true,
      title: "Error",
      message: "Not found",
    });
  }
  const userSubscribeEvents = user.events;
  const userTeamSubsEvents = [];
  for (const t of user.teamMembers) {
    const tt = await Team.findById(t._id).populate("events", [
      "name",
      "endDate",
    ]);
    for (const e of tt.events) {
      userTeamSubsEvents.push(e._id.toString());
    }
  }
  const eventsUserSubs = [];
  const eventTeamsSub = [];
  for (const e of user.events) {
    let actionFeild = {
      _id: e._id,
      name: e.name,
      endDate: e.endDate,
      action: "",
    };
    if (userTeamSubsEvents.includes(e._id.toString())) {
      actionFeild.action = "no"; //with team
      eventTeamsSub.push(actionFeild);
    } else {
      actionFeild.action = "yes"; //individual

      eventsUserSubs.push(actionFeild);
    }
  }

  return res.status(200).json({
    isError: true,
    title: "Good",
    message: " found",
    eventsIndividual: eventsUserSubs,
    eventsTeam: eventTeamsSub,
    workshops: user.workshops,
  });
};

module.exports.getTeamsByEventName = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { name } = req.body;

  Event.findOne({ name: name }, (err, e) => {
    if (err || !e) {
      return res.status(400).json({ err: "Event not found" });
    }
    try {
      const teams = e.teams;
      let teamArray = [];
      teams.map((team) => {
        let leaderId = team.leaderId;
        let leaderEmail;

        let theMembers = [];
        Team.findById(team, (err, te) => {
          if (err || !te) {
            return res.status(200).json({ err: "Team not found" });
          }
          te.members.map((member) => {
            User.findById(member.memberId).then((user) => {
              // console.log(user.name);
              theMembers.push(user.name);
            });
          });
          setTimeout(() => {
            console.log(theMembers);
            const myTeam = {
              name: te.name,
              leaderName: te.leaderName,
              members: theMembers,
            };
            teamArray.push(myTeam);
          }, 1000);
          // console.log(myTeam);
        });
      });
      setTimeout(() => {
        return res.status(200).json({ teamArray });
      }, 1500);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ msg: "Server error", err: err });
    }
  });
};
