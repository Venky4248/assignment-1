const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const toDate = require("date-fns/toDate");
const d_path = path.join(__dirname, "todoApplication.db");
let obj = null;
const Server = async () => {
  try {
    obj = await open({
      filename: d_path,
      driver: sqlite3.Database,
    });

    app.listen(3001, () => {
      console.log("run");
    });
  } catch (e) {
    console.log(`error:${e.message}`);
    process.exit(1);
  }
};
Server();

const MiddleWare1 = (request, response, next) => {
  const { search_q, category, priority, status, date } = request.query;
  const { todoId } = request.params;
  if (status !== undefined) {
    const array = ["TO DO", "IN PROGRESS", "DONE"];
    const check = array.includes(status);
    if (check) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  }else {
      response.status(400);
      response.send("Invalid Todo Status");
    }

  if (priority !== undefined) {
    const priorityarray = ["HIGH", "MEDIUM", "LOW"];
    const check1 = priorityarray.includes(priority);
    if (check1) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }

  if (category !== undefined) {
    const categoryarray = ["WORK", "HOME", "LEARNING"];
    const check2 = categoryarray.includes(category);
    if (check2) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  }else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  if (date !== undefined) {
    const myDate = new Date(date);
    const f = format(new Date(date), "yyyy-MM-dd");
    const valid = isValid(new Date(f));
    console.log(valid);
    if (valid) {
      request.date = f;
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  next();
};


const MiddleWare2 = (request, response, next) => {
  const { id, todo, category, priority, status, dueDate } = request.body;
  const { todoId } = request.params;

  if (category !== undefined) {
    categoryArray = ["WORK", "HOME", "LEARNING"];
    categoryIsInArray = categoryArray.includes(category);

    if (categoryIsInArray === true) {
      request.category = category;
    } else {
      response.status(400);
      response.send("Invalid Todo Category");
      return;
    }
  }

  if (priority !== undefined) {
    priorityArray = ["HIGH", "MEDIUM", "LOW"];
    priorityIsInArray = priorityArray.includes(priority);
    if (priorityIsInArray === true) {
      request.priority = priority;
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
      return;
    }
  }

  if (status !== undefined) {
    statusArray = ["TO DO", "IN PROGRESS", "DONE"];
    statusIsInArray = statusArray.includes(status);
    if (statusIsInArray === true) {
      request.status = status;
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
      return;
    }
  }
  if (dueDate !== undefined) {
    const myDate = new Date(dueDate);
    const f = format(new Date(dueDate), "yyyy-MM-dd");
    const valid = isValid(new Date(f));
    console.log(valid);
    if (valid) {
      request.date = f;
    } else {
      response.status(400);
      response.send("Invalid Due Date");
    }
  }
  next();
};





app.get("/todos/", MiddleWare1, async (request, response) => {
  const {
    search_q = "",
    category = "",
    priority = "",
    status = "",
    date = "",
  } = request.query;
  const query1 = `SELECT 
            id,
            todo,
            priority,
            status,
            category,
            due_date AS dueDate 
        FROM 
            todo
        WHERE todo LIKE '%${search_q}%' AND priority LIKE '%${priority}%' 
        AND status LIKE '%${status}%' AND category LIKE '%${category}%';`;
  const res = await obj.all(query1);
  response.send(res);
});

//API2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query2 = `SELECT
                    id,
                    todo,
                    priority,
                    status,
                    category,
                    due_date AS dueDate 
                FROM 
                    todo
                WHERE id=${todoId}`;
  const query2_res = await obj.get(query2);
  response.send(query2_res);
});

//API3

app.get("/agenda/", MiddleWare1, async (request, response) => {
  const { date } = request;
  console.log(date);
  const query3 = `SELECT
                    id,
                    todo,
                    priority,
                    status,
                    category,
                    due_date AS dueDate 
                FROM 
                    todo
                WHERE due_date='${date}'`;
  const query3_res = await obj.all(query3);
  if (query3_res === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    response.send(query3_res);
  }
});
//api4
app.post("/todos/", MiddleWare2, async (request, response) => {
  const { id, todo, category, priority, status, dueDate } = request.body;

  const addTodoQuery = `
        INSERT INTO 
            todo (id, todo, priority, status, category, due_date)
        VALUES
            (
                ${id},
               '${todo}',
               '${priority}',
               '${status}',
               '${category}',
               '${dueDate}'
            )
        ;`;

  const createUser = await obj.run(addTodoQuery);
  console.log(createUser);
  response.send("Todo Successfully Added");
});
//API5

app.put("/todos/:todoId/", MiddleWare2, async (request, response) => {
  const { todoId } = request.params;
  const { priority, todo, status, category, dueDate } = request.body;
  let updateTodoQuery = null;
  switch (true) {
    case status !== undefined:
      updateTodoQuery = `UPDATE todo SET status='${status}' WHERE id=${todoId}`;
      const q_re1 = await obj.run(updateTodoQuery);
      response.send("Status Updated");
      break;
    case priority !== undefined:
      updateTodoQuery = `
            UPDATE
                todo
            SET 
                priority = '${priority}'
            WHERE 
                id = ${todoId}     
        ;`;
      await obj.run(updateTodoQuery);
      response.send("Priority Updated");
      break;
    case todo !== undefined:
      updateTodoQuery = `
                UPDATE
                    todo
                SET 
                    todo = '${todo}'
                WHERE 
                    id = ${todoId}     
            ;`;
      await obj.run(updateTodoQuery);
      response.send("Todo Updated");
      break;
    case category !== undefined:
      const updateCategoryQuery = `
                UPDATE
                    todo
                SET 
                    category = '${category}'
                WHERE 
                    id = ${todoId}     
            ;`;
      await obj.run(updateCategoryQuery);
      response.send("Category Updated");
      break;
    case dueDate !== undefined:
      const updateDateQuery = `
                UPDATE
                    todo
                SET 
                    due_date = '${dueDate}'
                WHERE 
                    id = ${todoId}     
            ;`;
      await obj.run(updateDateQuery);
      response.send("Due Date Updated");
      break;
  }
});

//API6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const final = `DELETE FROM todo WHERE id=${todoId}`;
  const final_res = await obj.run(final);
  response.send("Todo Deleted");
});
module.exports = app;
