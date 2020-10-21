const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ejs = require("ejs");

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended:true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-charles:test123@cluster0.k82ec.mongodb.net/taskDB?retryWrites=true&w=majority", {useNewUrlParser: true});

const taskSchema = {
  title: String,
  description: String,
  done: Boolean
};

const Task = mongoose.model("Task", taskSchema);



app.get("/",function(req,res){

  Task.find({},function(err,found){
    if(!err){
      if(found.length === 0 ){
        res.send("No tasks found");
       } else{
         res.render('home',{
           newTasks:  found
         });
       }
    } else{
      res.send(err);
    }
  });
  
});

app.route("/add")
.get(function(req,res){
  res.render('add');
})
.post(function(req,res){
  //use post if you want to post info from the body
  
    const newItem = new Task({
      title: req.body.title,
      description: req.body.description,
      done: false
    });

    newItem.save(function(err){
      if(!err){
        res.redirect('/');
      } else{
        res.send(err);
      }
    });
});

app.post("/delete",function(req,res){

  Task.deleteOne({_id: req.body.taskID},function(err){
    if(err){
      res.send(err);
    } else{
      res.redirect("/");
    }
  });

});


///////////////////////////////////Requests Targetting all Tasks////////////////////////
app.route("/tasks")

.get(function(req,res){
  Task.find(function(err,foundTasks){
    if(!err){
      res.send(foundTasks);
    } else{
      res.send(err);
    }
  })
})

.post(function(req,res){

  const newTask = new Task({
    title: req.body.title,
    description: req.body.description,
    done: req.body.done
  });

  newTask.save(function(err){
    if(!err){
      res.send("Successfully added a new task!");
    } else{
      res.send(err);
    }
  });

})

.delete(function(req,res){
  Task.deleteMany(function(err){
    if(!err){
      res.send("Successfully deleted all tasks");
    } else{
      res.send(err);
    }
  })
});

///////////////////////////////////Requests Targetting A Specific Task////////////////////////

app.route("/tasks/:taskTitle")
.get(function(req,res){
  Task.findOne({title: req.params.taskTitle},function(err,foundTask){
    if(!err){
      if(foundTask){
        res.send(foundTask);
      } else{
        res.send("No task matching title found.");
      }
    } else{
      res.send(err);
    }
  });
})
//Needs to replace the whole field. Overwrite the whole field when using Put
.put(function(req,res){
  Task.update(
    {title: req.params.taskTitle},
    {title: req.body.title, description: req.body.description, done: req.body.done},
    {overwrite: true},
    function(err){
        if(!err){
          res.send("Put successful with the selected task.");
        } else{
          res.send(err);
        }
    }
  );
})
//Patch will just overwrite a certain field that the user wants to change
.patch(function(req,res){
  Task.update(
    {title: req.params.taskTitle},
    {$set: req.body},
    function(err){
      if(!err){
        res.send("Patch successful with the selected task.");
      } else{
        res.send(err);
      }
    }
  );
})
.delete(function(req,res){
  Task.deleteOne({title: req.params.taskTitle},function(err){
    if(!err){
      res.send("Delete successful with the selected task.");
    } else{
      res.send(err);
    }
  });
});






let port = process.env.PORT;
if( port == null || port == ""){
  port = 3000;
}
app.listen(port,function(){
  console.log("Server started successfully!");
});
