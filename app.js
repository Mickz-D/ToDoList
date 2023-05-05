require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const PORT = process.env.PORT || 3000;


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true});


const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema);


const item1 = new Item({
    name: "Welcome to your To do list"
});

const item2 = new Item({
    name: "Hit the + button to add new item."
});

const item3 = new Item({
    name: "<-- Hit this to delete an item."
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemSchema]
};

const List = mongoose.model("List", listSchema);
// 



app.get("/", async function(req, res){
    // let day = date.getDate();
    try {
        let foundItems = await Item.find({});
        if (foundItems.length === 0){
            await Item.insertMany(defaultItems);
            await mongoose.connection.close();
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
    } catch (error) {
        console.log(error);
    }
});
// app.get("/", function(req, res){
//     let day = date.getDate();
// Item.find({}, function(err, foundItems){
//     if (foundItems.length === 0){
     
//         Item.insertMany(defaultItems, function(err){
//             if (err){
//                 console.log(err);
//             }else{
//                 console.log("Successfully saved default items to DB.");
//             }
//         });
//         res.redirect("/");
//     }else{
//         res.render("list", {listTitle: day, newListItems: foundItems});
//     }
    
// });

    
//     });
      


app.get("/:customListName", async function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    try {
        const foundList = await List.findOne({name: customListName});
        if(!foundList){
            //create a new list
            const list = new List({
                name: customListName,
                items: defaultItems
            });
        
            await list.save();
            res.redirect("/" + customListName);
        }else{
            // show an existing list
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Error finding list.");
    }
});


// app.get("/:customListName", function(req, res){

//     const customListName = (req.params.customListName);
    

//     List.findOne({name: customListName}, function(err, foundList){
//         if(!err){
//             if(!foundlist){
//                 //create a new list
//                 const list = new List({
//                     name: customListName,
//                     items: defaultItems
//                 });
            
//                 list.saved();
//                 res.redirect("/" + customListName);
//             }else{
//                 // show an existing list
//                 res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
//             }
//         }
//     })

    
// });    
    






app.get("/about", function(req, res){

res.render("about")

});








app.post("/", async function(req, res){
    const itemName = req.body.newItems;
    const listName = req.body.list;
    const item = new Item({
      name: itemName
    });
   
   if(listName === "Today"){
      item.save();
      res.redirect("/");
   } else {
      try {
          const foundList = await List.findOne({name: listName});
          foundList.items.push(item);
          await foundList.save();
          res.redirect("/" + listName);
      } catch (err) {
          console.log(err);
          res.status(500).send("Error finding list.");
      }
   }
  });
 
  
  
  
  
  


  app.post("/delete", async function(req, res) {
    const checkItemId = req.body.checkbox; // Get the ID of the item to delete from the request body
    const listName = req.body.listName; // Get the name of the list from the request body
    try {
        if(listName === "Today"){ // If the list name is "Today"
            await Item.findOneAndDelete({_id: checkItemId}); // Find and delete the item with the given ID using async/await syntax
            console.log("successfully deleted checked item.");
            res.redirect("/"); // Redirect to the home page
        } else {
            await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkItemId}}}); // Find the list with the given name, remove the item with the given ID from the items array using async/await syntax
            res.redirect("/" + listName); // Redirect to the page for the found list
        }
    } catch (err) {
      console.log(err); // Log the error to the console
      res.status(500).send("Error deleting item."); // Send a 500 status code and an error message to the user
    }
});

// app.post("/delete", function(req, res){
//    const checkItemId = req.body.checkbox;

//     Item.findByIdAndRemove(checkItemId, function(err){
//         if (!err){
//             console.log("successfully deleted checked item.")
//         }
//     });


// });




app.listen(PORT, function(){
    console.log("Server started on port 3000")
});