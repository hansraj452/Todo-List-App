const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _ = require("lodash");


const app = express();

  const workItem = [];

app.set('view engine' , 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB"); 
const itemsSchema = {
    name: String 
}
const item = mongoose.model("Items" , itemsSchema );

const item1 = new item({
  name:"Welcom to list"
});
const item2 =  item({
  name:"Hit the button to add the in the list"
});
const item3 = new item({
  name:"<-- Hit this to delete an item."
});

const defaultitems =[item1,item2,item3];
 
// 
const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List" , listSchema);

app.get("/",function(req ,res){

  

// var today = new Date();
// var day = today. toLocaleString( 'en -us', {weekday: 'long'});;

//var day = " "

//if(today.getDay()===6||today.getDay()===0){
 //day = "Weekend"
  // res.sendFile(__dirname + "/weekend.html");
  // res.render("list" ,{kindofDay: day})
//}
//  else{
    //day = "weekday"
    // res.send("boo ! I to day is working day ");
    // res.sendFile(__dirname + "/weekend.html")
    // res.render("list" ,{kindofDay: day});
// res.render("lis t" ,{kindofDay: day});

//}
// let today = new Date();
// let options = {
//   weekday : "long",
//   day : "numeric",
//   month : "long"
// };
// let day = today.toLocaleDateString("en-IN"  , options);
item.find().then((founditem) => {
if(founditem.length===0){
  item.insertMany(defaultitems)
        .then(function () {
          console.log("Successfully saved defult items to DB");
        })
        .catch(function (err) {
          console.log(err);
        });
   res.redirect("/");
  }
 else{
  res.render("list",{ListTitle: "Today" , newListitems : founditem});
 }
 }); 

});

// app.get("/",function(req , res ){
//   // res.sendFile(__dirname + "/list.ejs")
//
//    console.log(__dirname + "/list.ejs");
// });

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  // Check if itemName is not an empty string
  if (itemName.trim() !== '') {
    // Create a new item based on the input
    const newItem = new item({
      name: itemName,
    });

    if (listName === "Today") {
      // Save the item to the default collection
      newItem.save();
      res.redirect("/");
    } else {
      // Find the custom list and push the new item
      List.findOne({ name: listName })
        .then((foundItems) => {
          foundItems.items.push(newItem);
          foundItems.save();
          res.redirect("/" + listName);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  } else {
    if (listName === "Today") {
      res.redirect("/");
    } else {
      List.findOne({ name: listName })
        .then((foundItems) => {
          res.redirect("/" + listName);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
});

app.post("/delete", function (req, res) {

  const listName = req.body.listName;
  const checkItemId = req.body.checkbox;

  // Delete the item from the default collection
  if (listName == "Today") {
    deleteCheckedItem();
  } else {
    // Find the custom list and pull the item from the array
    deleteCustomItem();
  }

  async function deleteCheckedItem() {
    await item.deleteOne({ _id: checkItemId });
    res.redirect("/");
  }

  async function deleteCustomItem() {
    await List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkItemId } } }
    );
    res.redirect("/" + listName);
  }
});


app.get("/:customListName" , async function(req,res){
    const customListName = _.capitalize(req.params.customListName);
    
    try{
      const foundList =  await List.findOne({name:customListName});
      if(!foundList){
        const list = new List({
          name: customListName,
          item:defaultitems
        });
        list.save();
        res.redirect("/" + customListName)
      }
      else{
        res.render("list" , {ListTitle:foundList.name , newListitems:foundList.items})
      }
    }
    catch(err){
      console.log(err);
    }
});

app.post("/work",function(req,res){
  const item  = req.body.newItem;
  workItem.push(item);
  res.render("/work");
})

app.get("/about",function(req,res){
  res.render("about");
});



app.listen(process.env.PORT || 3000 ,function(){
  console.log("server is started at port 3000");
});
