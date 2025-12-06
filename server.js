const express = require("express");
const app = express();
const path = require("path");
const db = require("mongoose");
const PORT = 4000;

db.connect("mongodb+srv://ariela:123@cluster0.mvru3fw.mongodb.net/")
  .then(() => {
    console.log("DB connected!");
  })
  .catch((err) => {
    console.log("Error connecting!", err);
  });

app.use(express.json());
app.use(express.static("client"));

const employeeSchema = new db.Schema({
  name: String,
  depart: String,
  age: Number,
  salary: Number,
});

const Employee = db.model("employee", employeeSchema);

app.get("/addEmployee", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "addEmployee.html"));
});
app.get("/alterDepartment", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "alterDepart.html"));
});
app.get("/removeEmployees", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "removeEmployees.html"));
});

const addEmployee = async (user) => {
  const employee = new Employee({
    name: user.name,
    depart: user.depart,
    age: user.age,
    salary: user.salary,
  });

  await employee.save();
};

app.post("/api/add-employee", async (req, res) => {
  const { name, age, depart, salary } = req.body;
  const user = { name, age, depart, salary };
  await addEmployee(user);
  res.status(201).send("Employee added successfully");
});

const removeOver = async (removeAge) => {
  const result = await Employee.deleteMany({ age: { $gt: removeAge } });
  return result;
};

app.delete("/api/remove-over", async (req, res) => {
  const { age } = req.body;
  if (!age) {
    return res.status(400).send("Age is required");
  }
  try {
    const result = await removeOver(age);

    if (result.deletedCount === 0) {
      return res.status(404).send("No one over that age was found");
    }

    res.send(`${result.deletedCount} were deleted`);
  } catch (error) {
    res.status(500).send("Something happend" + error.message);
  }
});

const updateDepart = async (current, newer) => {
  const result = await Employee.updateMany(
    { depart: current },
    { $set: { depart: newer } }
  );
  return result
};

app.put("/api/update-depart",async (req,res)=>{
    try {
        //validate
        const { oldDepart, newDepart } = req.body;
        const result = await updateDepart(oldDepart, newDepart);
        if (result.matchedCount === 0) {
            return res.status(404).send("no department found");
          }
        res.send(`${result.modifiedCount} were updated`)
    } catch (error) {
    res.status(500).send("Something happend" + error.message);
        
    }
})

app.listen(PORT, () => {
  console.log(`Server is on: http://localhost:${PORT}`);
});