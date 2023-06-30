// Importing necessary modules...
const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");
const date_fns = require("date-fns");

// Defining port number..
const port = 3000;

// Creating server instance.
const app = express();

// Exporting server instance..
module.exports = app;

// Express in-built middleware function..
app.use(express.json());

// Defining the database file path...
const dbPath = path.join(__dirname, "todoApplication.db");

// Creating database object...
let db = null;

// Initializing the server and database..
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB error: ${error}`);
    process.exit(1);
  }
};

// Calling the initializer function..
initializeDbAndServer();

const hasStatus = (requestQuery) => {
  if (
    requestQuery.status !== undefined &&
    requestQuery.priority === undefined &&
    requestQuery.search_q === undefined &&
    requestQuery.category === undefined
  ) {
    return true;
  } else {
    return false;
  }
};

const hasPriority = (requestQuery) => {
  if (
    requestQuery.priority !== undefined &&
    requestQuery.status === undefined &&
    requestQuery.search_q === undefined &&
    requestQuery.category === undefined
  ) {
    return true;
  } else {
    return false;
  }
};

const hasCategory = (requestQuery) => {
  if (
    requestQuery.category !== undefined &&
    requestQuery.priority === undefined &&
    requestQuery.status === undefined &&
    requestQuery.search_q === undefined
  ) {
    return true;
  } else {
    return false;
  }
};

const hasTodo = (requestQuery) => {
  if (
    requestQuery.todo !== undefined &&
    requestQuery.priority === undefined &&
    requestQuery.status === undefined &&
    requestQuery.category === undefined
  ) {
    return true;
  } else {
    return false;
  }
};

const changeCase = (eachObject) => {
  return {
    id: eachObject.id,
    todo: eachObject.todo,
    priority: eachObject.priority,
    status: eachObject.status,
    category: eachObject.category,
    dueDate: eachObject.due_date,
  };
};

// Checking Invalid Scenarios and 1 API.
app.get("/todos/", async (request, response) => {
  const { status, priority, search_q, category } = request.query;
  let relatedQuery = ``;
  let isValidPriority;
  let isValidStatus;
  let isValidCategory;

  const hasSearchQ = (requestQuery) => {
    if (
      requestQuery.search_q !== undefined &&
      requestQuery.status === undefined &&
      requestQuery.category === undefined &&
      requestQuery.priority === undefined
    ) {
      return true;
    } else {
      return false;
    }
  };

  const hasPriorityAndStatus = (requestQuery) => {
    if (
      requestQuery.priority !== undefined &&
      requestQuery.status !== undefined &&
      requestQuery.category === undefined &&
      requestQuery.search_q === undefined
    ) {
      return true;
    } else {
      return false;
    }
  };

  const hasCategoryAndStatus = (requestQuery) => {
    if (
      requestQuery.category !== undefined &&
      requestQuery.status !== undefined &&
      requestQuery.priority === undefined &&
      requestQuery.search_q === undefined
    ) {
      return true;
    } else {
      return false;
    }
  };

  const hasCategoryAndPriority = (requestQuery) => {
    if (
      requestQuery.category !== undefined &&
      requestQuery.priority !== undefined &&
      requestQuery.status === undefined &&
      requestQuery.search_q === undefined
    ) {
      return true;
    } else {
      return false;
    }
  };

  const getValidityOfStatus = () => {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      return true;
    } else {
      return false;
    }
  };

  const getValidityOfPriority = () => {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      return true;
    } else {
      return false;
    }
  };

  const getValidityOfCategory = () => {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      return true;
    } else {
      return false;
    }
  };

  switch (true) {
    case hasStatus(request.query):
      if (getValidityOfStatus()) {
        relatedQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE
                status = "${status}";
        `;
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case hasPriority(request.query):
      if (getValidityOfPriority()) {
        relatedQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE
                priority = "${priority}";
        `;
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    case hasSearchQ(request.query):
      relatedQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE
                todo LIKE "%${search_q}%";
        `;

      break;
    case hasCategory(request.query):
      if (getValidityOfCategory()) {
        relatedQuery = `
            SELECT
                *
            FROM 
                todo
            WHERE
                category = "${category}";
        `;
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case hasPriorityAndStatus(request.query):
      isValidPriority = getValidityOfPriority();
      isValidStatus = getValidityOfStatus();
      if (isValidPriority && isValidStatus) {
        relatedQuery = `
            SELECT *
            FROM 
                todo
            WHERE
                priority = "${priority}"
                AND 
                status = "${status}";
        `;
      } else {
        response.status(400);
        if (isValidPriority === false) {
          response.send("Invalid Todo Priority");
        } else {
          response.send("Invalid Todo Status");
        }
      }
      break;
    case hasCategoryAndStatus(request.query):
      isValidCategory = getValidityOfCategory();
      isValidStatus = getValidityOfStatus();
      if (isValidCategory && isValidStatus) {
        relatedQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE
                category = "${category}"
                AND
                status = "${status}";
        `;
      } else {
        response.status(400);
        if (isValidCategory === false) {
          response.send("Invalid Todo Category");
        } else {
          response.send("Invalid Todo Status");
        }
      }
      break;
    default:
      isValidCategory = getValidityOfCategory();
      isValidPriority = getValidityOfPriority();
      if (isValidCategory && isValidPriority) {
        relatedQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE
                category = "${category}"
                AND
                priority = "${priority}";
        `;
      } else {
        response.status(400);
        if (isValidCategory === false) {
          response.send("Invalid Todo Category");
        } else {
          response.send("Invalid Todo Priority");
        }
      }
  }

  const dbResponse = await db.all(relatedQuery);
  const inCamel = [];
  for (let each of dbResponse) {
    inCamel.push(changeCase(each));
  }
  response.status(200);
  response.send(inCamel);
});

// 2 API
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getSpecificTodo = `
        SELECT 
            *
        FROM 
            todo
        WHERE
            id = ${todoId};
    `;

  const specificTodoDetails = await db.get(getSpecificTodo);
  response.status(200);
  response.send(changeCase(inCamel));
});

// 3 API
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  let isDateValid = date_fns.isValid(new Date(date));
  let formattedDate;
  if (isDateValid === true) {
    formattedDate = date_fns.format(new Date(date), "yyyy-MM-dd");
  }
  if (isDateValid === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const getDueDateTodoQuery = `
        SELECT 
            *
        FROM 
            todo
        WHERE
            due_date = "${formattedDate}";
      `;

    const getDueDateTodo = await db.all(getDueDateTodoQuery);
    const inCamel = [];
    for (let each of getDueDateTodo) {
      inCamel.push(changeCase(each));
    }
    response.status(200);
    response.send(inCamel);
  }
});

// 4 API
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const formattedDate = date_fns.format(new Date(dueDate), "yyy-MM-ddd");
  const createTodoQuery = `
    INSERT INTO
        todo(id,todo,priority,status,category,due_date)
    VALUES
        (${id},"${todo}","${priority}","${status}","${category}","${formattedDate}");
  `;

  const dbResponse = await db.run(createTodoQuery);
  response.status(200);
  response.send("Todo Successfully Added");
});

// 5 API
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status, priority, todo, category, dueDate } = request.body;
  let updateTodoQuery = ``;
  let updatedResponse;
  let updatedStatus;

  let isDateValid = date_fns.isValid(new Date(dueDate));
  let formattedDate;
  if (isDateValid === true) {
    formattedDate = date_fns.format(new Date(dueDate), "yyyy-MM-dd");
  }

  let hasStatusOnly = hasStatus(request.body);
  let hasPriorityOnly = hasPriority(request.body);
  let hasCategoryOnly = hasCategory(request.body);
  let hasTodoOnly = hasTodo(request.body);

  switch (true) {
    case hasStatusOnly:
      updateTodoQuery = `
            UPDATE 
                todo
            SET
                status = "${status}"
            WHERE
                id = ${todoId};
          `;
      updatedResponse = "Status Updated";
      updatedStatus = 200;
      break;
    case hasPriorityOnly:
      updateTodoQuery = `
            UPDATE
                todo
            SET
                priority = "${priority}"
            WHERE
                id = ${todoId};
          `;
      updatedResponse = "Priority Updated";
      updatedStatus = 200;
      break;
    case hasCategoryOnly:
      updateTodoQuery = `
            UPDATE 
                todo
            SET
                category = "${category}"
            WHERE
                id = ${todoId};
          `;
      updatedResponse = "Category Updated";
      updatedStatus = 200;
      break;
    case hasTodoOnly:
      updateTodoQuery = `
            UPDATE
                todo
            SET
                todo = "${todo}"
            WHERE
                id = ${todoId};
          `;
      updatedResponse = "Todo Updated";
      updatedStatus = 200;
      break;
    default:
      if (isDateValid === true) {
        updateTodoQuery = `
            UPDATE 
                todo
            SET 
                due_date = "${formattedDate}"
            WHERE
                id = ${todoId};
        `;
        updatedResponse = "Due Date Updated";
        updatedStatus = 200;
      } else {
        updatedResponse = "Invalid Due Date";
        updatedStatus = 400;
      }
  }

  const dbResponse = await db.run(updateTodoQuery);
  response.status(updatedStatus);
  response.send(updatedResponse);
});

// 6 API
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
        DELETE FROM todo 
        WHERE
            id = ${todoId};
    `;

  const dbResponse = await db.run(deleteTodoQuery);
  response.status(200);
  response.send("Todo Deleted");
});
