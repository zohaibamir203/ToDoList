//jshint esversion:6
// Requiring Modules
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

// Connecting to mongoose database
mongoose.set("strictQuery",false);
mongoose.connect('mongodb+srv://admin_zohaib:test123@cluster0.rm61a3n.mongodb.net/todolistDB',{useNewUrlParser:true});

// Setting Plugins to Express
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose Schema
const itemsSchema = new mongoose.Schema({
    name:{type : String , required : true}
})

const listSchema = new mongoose.Schema({
  name : {type : String, required : true},
  items : [itemsSchema]
})

// mongoose Model
const Item = new mongoose.model("Item",itemsSchema);
const List = new mongoose.model("List",listSchema);
// Default Items
const item1 = new Item({
    name : "Welcome to your todolist!"
})

const item2 = new Item({
    name : "Hit the + button to add a new item."
})

const item3 = new Item({
    name : "<-- Hit this to delete an item."
})

app.get("/", function(req, res) {
    Item.find(function(err,items){
        if (items.length === 0){
            Item.insertMany([item1,item2,item3],function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Added.");
                }
            });
            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today", newListItems: items});
        }
    })
});

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const itemTitle = req.body.list;
  const item = new Item({
    name : itemName
  })
  if (itemTitle === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name : itemTitle},function(err,result){
      result.items.push(item);
      result.save();
      res.redirect("/"+itemTitle);
    })
  }
});

app.post("/delete",function(req,res){
  const id = req.body.checkbox;
  const title = req.body.listName;
  if (title === "Today"){
    Item.findByIdAndRemove(id,function(err){
      if(!err){
        console.log("Succesfully Deleted Checked Item!");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name : title},{$pull:{items:{_id : id}}},function(err,result){
      if(!err){
        res.redirect("/"+title);
      }
    })
  }
})

app.get('/:list',function(req,res){
  let listName = _.capitalize(req.params.list);
  List.findOne({name : listName},function(err,result){
    if(!err){
      if(!result){
        let list = new List({
          name : listName,
          items : [item1,item2,item3]
         });
        list.save();
        res.redirect("/"+listName);
      }else{
        res.render("list",{listTitle : result.name, newListItems : result.items})
      }
    }
  })
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

// mongoose.connection.close(function(){
// console.log('Mongoose default connection disconnected through app termination;');
// process.exit(0);
// });

app.listen(3000, function() {
  console.log("Server started on port 3000");
});