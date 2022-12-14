// Created library
const db = require("../config/database");
const { Checkgroup } = require("../utility/checkGroup");
const { generateAudit, generatePromoteDemoteAudit } = require("../utility/generateAudit");
const { retrieveRnumber, updateRnumber } = require("../utility/runningNumber");
const { retrieveTask, retrieveTaskWithPlan } = require("../utility/retrieveTask");
const { retrieveCurrentTaskState, retrieveApplicationPermit, retrieveTaskNotes } = require("../utility/promoteDemoteTask");
const { retrievePlan } = require("../utility/retrievePlan");
const { sendEmail, retrieveLeadEmailAndUsername } = require("../utility/sendEmail");

// Required library
const e = require("express");
const { request } = require("express");
const { query } = require("../config/database");

// Retrieve all application
const getAllApplication = (req, res) => {
  let sql = "SELECT * FROM application";

  db.query(sql, (err, results) => {
    if (err) {
      console.log("Error retrieving application");
      return res.status(200).send({
        success: false,
        message: "Error retrieving application"
      });
    } else {
      return res.status(200).send({
        success: true,
        message: results
      });
    }
  });
};

// Create application
const createApplication = async (req, res, next) => {
  // Retrieving user input
  var acronym_input = req.body.app_acronym;
  var description_input = req.body.app_description;
  var rnumber_input = req.body.app_rnumber;
  var startdate_input = req.body.app_startdate;
  var enddate_input = req.body.app_enddate;
  var permitcreate_input = req.body.app_permit_create;
  var permitopen_input = req.body.app_permit_open;
  var permittodolist_input = req.body.app_permit_todolist;
  var permitdoing_input = req.body.app_permit_doing;
  var permitdone_input = req.body.app_permit_done;

  // Regex to validate user input
  const acronymPattern = /^[A-Za-z0-9]+$/;
  const rnumberPattern = /^[0-9]+$/;

  // Acronym validation
  if (!acronym_input.match(acronymPattern) || acronym_input.length < 2) {
    return res.status(200).send({
      success: false,
      message: "Acronym require minimum at least 2 characters, no space and special character"
    });
  }

  // R number validation
  if (!rnumber_input.match(rnumberPattern)) {
    return res.status(200).send({
      success: false,
      message: "R number do not allow decimal or any other character"
    });
  }

  // Date validation
  if (startdate_input === undefined || enddate_input === undefined) {
    return res.status(200).send({
      success: false,
      message: "Please ensure date are provided"
    });
  }

  // Permit validation
  if (permitcreate_input === undefined || permitopen_input === undefined || permittodolist_input === undefined || permitdoing_input === undefined || permitdone_input === undefined) {
    return res.status(200).send({
      success: false,
      message: "Please ensure all permit are provided"
    });
  }

  if (permitcreate_input === null || permitopen_input === null || permittodolist_input === null || permitdoing_input === null || permitdone_input === null) {
    return res.status(200).send({
      success: false,
      message: "Please ensure all permit are provided"
    });
  }

  startdate_input = startdate_input.slice(0, 10);
  enddate_input = enddate_input.slice(0, 10);

  let sql = `INSERT into application 
  (app_acronym, app_description, app_rnumber, app_startdate, app_enddate, app_permit_create, app_permit_open, app_permit_todolist, app_permit_doing, app_permit_done)  
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [acronym_input, description_input, rnumber_input, startdate_input, enddate_input, permitcreate_input, permitopen_input, permittodolist_input, permitdoing_input, permitdone_input], (err, results) => {
    try {
      // SQL error messages
      if (err) {
        console.log("Error");
        // console.log(err);
        return res.status(200).send({
          success: false,
          message: "Problem creating app, please ensure no duplicate app name and all fields are filled"
        });
      }
      // Successful messages
      else {
        return res.status(200).send({
          success: true,
          message: "Application created successfully"
        });
      }
    } catch (e) {
      if (e.code == "ER_DUP_ENTRY") {
        return res.status(200).send({
          success: false,
          message: "No duplicate app allowed"
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "Error creating app, try again later"
        });
      }
    }
  });
};

// Edit application
const editApplication = async (req, res, next) => {
  // Retrieving user input
  var acronym_input = req.body.app_acronym;
  var description_input = req.body.app_description;
  var startdate_input = req.body.app_startdate.slice(0, 10);
  var enddate_input = req.body.app_enddate.slice(0, 10);
  var permitcreate_input = req.body.app_permit_create;
  var permitopen_input = req.body.app_permit_open;
  var permittodolist_input = req.body.app_permit_todolist;
  var permitdoing_input = req.body.app_permit_doing;
  var permitdone_input = req.body.app_permit_done;

  // Date validation
  if (startdate_input === undefined || enddate_input === undefined || startdate_input === null || enddate_input === null) {
    return res.status(200).send({
      success: false,
      message: "Please ensure date are provided"
    });
  }

  // Permit validation
  if (permitcreate_input === undefined || permitopen_input === undefined || permittodolist_input === undefined || permitdoing_input === undefined || permitdone_input === undefined) {
    return res.status(200).send({
      success: false,
      message: "Please ensure all permit are provided"
    });
  }

  if (permitcreate_input === null || permitopen_input === null || permittodolist_input === null || permitdoing_input === null || permitdone_input === null) {
    return res.status(200).send({
      success: false,
      message: "Please ensure all permit are provided"
    });
  }

  let sql = `UPDATE application
  SET app_description = ?, app_startdate = ?,
  app_enddate = ?, app_permit_create = ?,
  app_permit_open = ?, app_permit_todolist = ?,
  app_permit_doing = ?, app_permit_done = ?
  WHERE app_acronym= ?`;

  db.query(sql, [description_input, startdate_input, enddate_input, permitcreate_input, permitopen_input, permittodolist_input, permitdoing_input, permitdone_input, acronym_input], (err, results) => {
    try {
      // SQL error messages
      if (err) {
        console.log("Error");
        console.log(err);
        return res.status(200).send({
          success: false,
          message: "Error updating app, please try again later"
        });
      }
      // Successful messages
      else {
        return res.status(200).send({
          success: true,
          message: "Application updated successfully"
        });
      }
    } catch (e) {
      return res.status(200).send({
        success: false,
        message: "Error updating app, try again later"
      });
    }
  });
};

// Application checkgroup, check if current user have the permit
const checkAppPermit = async (req, res) => {
  var username_input = req.query.username;
  if (username_input !== undefined) {
    try {
      var checkgroupresult = await Checkgroup(username_input, "PL");
      if (checkgroupresult === true) {
        return res.status(200).send({
          success: true,
          message: true
        });
      } else {
        return res.status(200).send({
          success: true,
          message: false
        });
      }
    } catch (e) {
      console.log("Error at check app permit");
      console.log(e);
    }
  } else {
    return res.status(200).send({
      success: true,
      message: false
    });
  }
};

// Create plan
const createPlan = async (req, res, next) => {
  // Retrieving user input
  var mvp_name_input = req.body.plan_mvp_name;
  var startdate_input = req.body.plan_startdate.slice(0, 10);
  var enddate_input = req.body.plan_enddate.slice(0, 10);
  var acronym_input = req.body.app_acronym;
  var colorcode_input = req.body.plan_colorcode;

  // Regex to validate user input
  const mvpnamePattern = /^[A-Za-z0-9_.]+$/;

  // Plan MVP validation
  if (!mvp_name_input.match(mvpnamePattern) || mvp_name_input.length < 3) {
    return res.status(200).send({
      success: false,
      message: "Plan name require minimum at least 3 characters, no space and special character. But allow dot and underscore"
    });
  }

  let sql = `INSERT into plan 
  (plan_mvp_name, plan_startdate, plan_enddate, plan_app_acronym, plan_colorcode)  
  VALUES ('${mvp_name_input}','${startdate_input}', '${enddate_input}', '${acronym_input}', '${colorcode_input}')`;

  db.query(sql, (err, results) => {
    try {
      // SQL error messages
      if (err) {
        console.log("Error");
        // console.log(err);
        return res.status(200).send({
          success: false,
          message: "Error creating plan, ensure no duplicate plan name in the same application"
        });
      }
      // Successful messages
      else {
        return res.status(200).send({
          success: true,
          message: "Plan created successfully"
        });
      }
    } catch (e) {
      if (e.code == "ER_DUP_ENTRY") {
        return res.status(200).send({
          success: false,
          message: "No duplicate plan in the same application allowed"
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "Error creating plan, try again later"
        });
      }
    }
  });
};

// Retrieve plan according to app
const getPlan = (req, res) => {
  let sql = `SELECT * FROM plan WHERE plan_app_acronym = '${req.query.app_acronym}'`;

  db.query(sql, (err, results) => {
    if (err) {
      console.log("Error retrieving plan");
      return res.status(200).send({
        success: false,
        message: "Error retrieving plan"
      });
    } else {
      return res.status(200).send({
        success: true,
        message: results
      });
    }
  });
};

// Edit plan
const editPlan = async (req, res, next) => {
  // Retrieving user input
  var mvp_name_input = req.body.plan_mvp_name;
  var startdate_input = req.body.plan_startdate.slice(0, 10);
  var enddate_input = req.body.plan_enddate.slice(0, 10);
  var acronym_input = req.body.app_acronym;
  var colorcode_input = req.body.plan_colorcode;

  let sql = `UPDATE plan 
  SET plan_startdate = '${startdate_input}', plan_enddate = '${enddate_input}',
  plan_colorcode = '${colorcode_input}'
  WHERE plan_mvp_name = '${mvp_name_input}' AND plan_app_acronym = '${acronym_input}'`;

  db.query(sql, (err, results) => {
    try {
      // SQL error messages
      if (err) {
        console.log("Error");
        console.log(err);
        return res.status(200).send({
          success: false,
          message: "Error updating plan, please try again later"
        });
      }
      // Successful messages
      else {
        return res.status(200).send({
          success: true,
          message: "Plan updated successfully"
        });
      }
    } catch (e) {
      return res.status(200).send({
        success: false,
        message: "Error updating plan, try again later"
      });
    }
  });
};

// Plan checkgroup, check if current user is the PM, for managing plan
const checkPlanPermit = async (req, res) => {
  var username_input = req.query.username;
  if (username_input !== undefined) {
    try {
      var checkgroupresult = await Checkgroup(username_input, "PM");
      if (checkgroupresult === true) {
        return res.status(200).send({
          success: true,
          message: true
        });
      } else {
        return res.status(200).send({
          success: true,
          message: false
        });
      }
    } catch (e) {
      console.log(e);
      console.log("Error at check plan permit");
    }
  } else {
    return res.status(200).send({
      success: true,
      message: false
    });
  }
};

// Create task
const createTask = async (req, res, next) => {
  // Retrieving user input
  var task_name_input = req.body.task_name;
  var task_description_input = req.body.task_description;
  var task_notes_input = req.body.task_notes;
  var task_plan_input = req.body.task_plan;
  var task_app_acronym_input = req.body.task_app_acronym;
  var task_creator_input = req.body.task_creator;
  var task_owners_input = req.body.task_owner;

  // Validation for task name, Check for only space empty string
  if (task_name_input.trim().length === 0) {
    return res.status(200).send({
      success: false,
      message: "Pure spaces are not allowed for task name"
    });
  }

  // Validation for task app acronym
  if (task_app_acronym_input < 1) {
    return res.status(200).send({
      success: false,
      message: "App acronym are missing for creation of task"
    });
  }

  // Validation for task creator
  if (task_creator_input < 1) {
    return res.status(200).send({
      success: false,
      message: "Task creator are missing"
    });
  }

  // Validation for task owner
  if (task_owners_input < 1) {
    return res.status(200).send({
      success: false,
      message: "Task creator are missing"
    });
  }

  // Setting date
  var createdDate = new Date(Date.now()).toISOString().slice(0, 10);
  // Retrieving rnumber
  var rnumber = (await retrieveRnumber(task_app_acronym_input)) + 1;

  // Generating task_id
  var task_id = String(task_app_acronym_input) + "_" + String(rnumber);

  // Check for only space empty string
  if (task_name_input.trim().length === 0) {
    return res.status(200).send({
      success: false,
      message: "Pure spaces are not allowed for task name"
    });
  }

  // Generating audit trail
  var auditMsg = await generateAudit(task_creator_input, "create", "Task are created");

  // Promotion audit trail
  var promoteAuditMsg = await generatePromoteDemoteAudit(task_owners_input, "Task promoted to ->     " + String("OPEN"));

  // If user added notes
  if (task_notes_input.length > 1 || task_notes_input.trim().length !== 0) {
    auditMsg = auditMsg + promoteAuditMsg + generateAudit(task_creator_input, "open", "Added Notes: \n" + task_notes_input);
  } else {
    auditMsg = auditMsg + promoteAuditMsg;
  }

  // Declare state
  var task_state = "open";

  // Check for plan
  var taskPlan = "";
  // Prevent crashing if no plan was selected
  if (task_plan_input !== null && task_plan_input !== undefined) {
    taskPlan = task_plan_input.value;
  } else {
    taskPlan = "";
  }

  let sql = `INSERT into task
  (task_id, task_name, task_description, task_notes, task_plan, task_app_acronym, task_state, task_creator, task_owner, task_createdate)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [task_id, task_name_input, task_description_input, auditMsg, taskPlan, task_app_acronym_input, task_state, task_creator_input, task_owners_input, createdDate], async (err, results) => {
    if (err) {
      console.log(err);
      return res.status(200).send({
        success: false,
        message: "Failed to create task, please contact admin"
      });
    } else {
      if ((await updateRnumber(task_app_acronym_input, rnumber)) === true) {
        return res.status(200).send({
          success: true,
          message: "Task created successfully"
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "Failed to create task, please contact admin"
        });
      }
    }
  });
};

// Retrieve task and assign color code based on acronym
const getTask = async (req, res) => {
  try {
    var app_acronym_input = req.query.app_acronym;

    var taskWithoutPlan = await retrieveTask(app_acronym_input);
    var taskWithPlan = await retrieveTaskWithPlan(app_acronym_input);

    var taskData = taskWithoutPlan;

    for (var i = 0; i < taskData.length; i++) {
      taskData[i].plan_colorcode = "#";
    }

    for (var i = 0; i < taskData.length; i++) {
      for (var x = 0; x < taskWithPlan.length; x++) {
        if (taskData[i].task_id === taskWithPlan[x].task_id) {
          taskData[i] = taskWithPlan[x];
        }
      }
    }

    return res.status(200).send({
      success: true,
      message: taskData
    });
  } catch (e) {
    console.log(e);
    return res.status(200).send({
      success: false,
      message: "Error retrieving task"
    });
  }
};

// Update task
const editTask = async (req, res, next) => {
  // Retrieving user input
  var task_id_input = req.body.task_id;
  var task_added_notes_input = req.body.task_added_notes;
  var task_plan_input = req.body.task_plan;
  var username_input = req.body.username;

  var taskPlan = "";
  // Prevent crashing if no plan was selected
  if (task_plan_input !== null && task_plan_input !== undefined) {
    taskPlan = task_plan_input.value;
  } else {
    taskPlan = task_plan_input.value;
  }

  // Retrieve current task plan
  var dbPlan = await retrievePlan(task_id_input);

  // Check if user submit empty field and no changes detected
  if (task_added_notes_input.trim().length === 0 && taskPlan === dbPlan) {
    return res.status(200).send({
      success: false,
      message: "No changes detected, task are not updated"
    });
  }

  // Get task current state
  var currentState = await retrieveCurrentTaskState(task_id_input);

  // Retrieve current task notes
  var currentNotes = await retrieveTaskNotes(task_id_input);

  // Generate audit message based on which is updated
  var auditMsg = "";

  if (task_added_notes_input.trim().length !== 0 && taskPlan !== dbPlan) {
    auditMsg = auditMsg + generateAudit(username_input, currentState, "Task notes & plan have been updated" + "\n\nPlan Change to: \n" + String(taskPlan) + "\n\nAdded Notes: \n" + String(task_added_notes_input));
  } else if (task_added_notes_input.trim().length !== 0 && taskPlan === dbPlan) {
    auditMsg = auditMsg + generateAudit(username_input, currentState, "Task notes have been updated" + "\n\nAdded Notes: \n" + String(task_added_notes_input));
  } else if (task_added_notes_input.trim().length === 0 && taskPlan !== dbPlan) {
    auditMsg = auditMsg + generateAudit(username_input, currentState, "Task plan have been updated" + "\n\nPlan Change to: \n" + String(taskPlan));
  }
  // Appending to notes
  auditMsg = currentNotes + auditMsg;

  let sql = `UPDATE task
    SET task_notes = ?,
    task_plan = ?, task_owner = ?
    WHERE task_id = ?`;

  db.query(sql, [auditMsg, taskPlan, username_input, task_id_input], (err, results) => {
    try {
      // SQL error messages
      if (err) {
        console.log(err);
        return res.status(200).send({
          success: false,
          message: "Error updating task, please try again later"
        });
      }
      // Successful messages
      else {
        return res.status(200).send({
          success: true,
          message: "Task updated successfully"
        });
      }
    } catch (err) {
      console.log("Error at edit task");
      return res.status(200).send({
        success: false,
        message: "Error updating task, try again later"
      });
    }
  });
};

// Promote task && send email if task are promoted to done
const promoteTask = async (req, res, next) => {
  // Retrieving user input
  var task_id_input = req.body.task_id;
  var username_input = req.body.username;
  var task_app_acronym_input = req.body.task_app_acronym;

  // Array of possible promotion state
  var taskStateArray = ["open", "todolist", "doing", "done", "close"];

  // Retrieve the state of the selected task
  var currentTaskState = await retrieveCurrentTaskState(task_id_input);

  // Retrieve the index of the current task in the array
  var currentIndexOfTaskState = taskStateArray.indexOf(currentTaskState);

  // Retrieve selected application permission
  var applicationPermit = await retrieveApplicationPermit(task_app_acronym_input);
  var applicationPermitArray = Object.values(applicationPermit);

  // 2nd layer of backend check if user are permited to promote task, by performing checkgroup
  if ((await Checkgroup(username_input, applicationPermitArray[currentIndexOfTaskState])) === false) {
    return res.status(200).send({
      success: false,
      message: "You are not permited to promote this task"
    });
  }

  // Promoted state value of the next promotion
  var promotedState = taskStateArray[currentIndexOfTaskState + 1];

  // Retrieve current task notes
  var currentAuditMsg = await retrieveTaskNotes(task_id_input);

  // Create audit trail for promoting task
  var auditMsg = await generatePromoteDemoteAudit(username_input, "Task promoted to ->     " + String(promotedState.toUpperCase()));

  currentAuditMsg = String(currentAuditMsg) + String(auditMsg);

  let sql = `UPDATE task 
    SET task_state = ?, task_owner = ?, task_notes = ?
    WHERE task_id = ?`;

  db.query(sql, [promotedState, username_input, currentAuditMsg, task_id_input], async (err, results) => {
    try {
      if (promotedState === "done") {
        // console.log("im in");
        var leadUser = await retrieveLeadEmailAndUsername("PL");
        var msg = `Dear fellow project leads, \n\n${task_id_input} from ${task_app_acronym_input} have been promoted to DONE state \n\nRegards with thanks`;
        sendEmail("System Generated", "systemgenerated@email.com", leadUser, msg);
        // Successful messages
        return res.status(200).send({
          success: true,
          message: "Task promoted"
        });
      } else {
        // Successful messages
        return res.status(200).send({
          success: true,
          message: "Task promoted"
        });
      }
    } catch (err) {
      return res.status(200).send({
        success: false,
        message: "Error promoting task, please try again later"
      });
    }
  });
};

// Demote task
const demoteTask = async (req, res, next) => {
  // Retrieving user input
  var task_id_input = req.body.task_id;
  var username_input = req.body.username;
  var task_app_acronym_input = req.body.task_app_acronym;

  // Array of possible possible state
  var taskStateArray = ["open", "todolist", "doing", "done", "close"];

  // Retrieve the state of the selected task
  var currentTaskState = await retrieveCurrentTaskState(task_id_input);

  // Retrieve the index of the current task in the array
  var currentIndexOfTaskState = taskStateArray.indexOf(currentTaskState);

  // Retrieve selected application permission
  var applicationPermit = await retrieveApplicationPermit(task_app_acronym_input);
  var applicationPermitArray = Object.values(applicationPermit);

  // 2nd layer of backend check if user are permited to promote task, by performing checkgroup
  if ((await Checkgroup(username_input, applicationPermitArray[currentIndexOfTaskState])) === false) {
    return res.status(200).send({
      success: false,
      message: "You are not permited to demote this task"
    });
  }
  var currentState = String(taskStateArray[currentIndexOfTaskState]);

  // 3rd layer of check, in case user are not at doing or done
  if (currentState !== "doing" && currentState !== "done") {
    return res.status(200).send({
      success: false,
      message: "You are not permited to demote this task"
    });
  }

  // Demotion state
  var demotedState = taskStateArray[currentIndexOfTaskState - 1];

  // Retrieve current task notes
  var currentAuditMsg = await retrieveTaskNotes(task_id_input);

  // Create audit trail for promoting task
  var auditMsg = await generatePromoteDemoteAudit(username_input, "Task demoted to ->     " + String(demotedState.toUpperCase()));

  currentAuditMsg = String(currentAuditMsg) + String(auditMsg);

  let sql = `UPDATE task 
      SET task_state = ?, task_owner = ?, task_notes = ?
      WHERE task_id = ?`;

  db.query(sql, [demotedState, username_input, currentAuditMsg, task_id_input], (err, results) => {
    try {
      // Successful messages
      return res.status(200).send({
        success: true,
        message: "Task demoted"
      });
    } catch (err) {
      console.log("Error at demoting task");
      return res.status(200).send({
        success: false,
        message: "Error demoting task, please try again later"
      });
    }
  });
};

// Perform checkgroup, return true or false, will be used for permit create, open, todolist, doing & done
const checkPermit = async (req, res) => {
  var username_input = req.query.username;
  var group_name_input = req.query.group_name;

  try {
    var checkgroupresult = await Checkgroup(username_input, group_name_input);
    // var checkgroupresult = await Checkgroup("admin", "admin");

    if (checkgroupresult === true) {
      return res.status(200).send({
        success: true,
        message: true
      });
    } else {
      return res.status(200).send({
        success: true,
        message: false
      });
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = { getAllApplication, createApplication, editApplication, checkAppPermit, createPlan, getPlan, editPlan, checkPlanPermit, createTask, getTask, editTask, promoteTask, demoteTask, checkPermit };
