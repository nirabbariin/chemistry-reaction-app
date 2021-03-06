const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
// const _ = require("lodash");
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/Chemistry",{useNewUrlParser:true});
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.listen(3000, function() {
  console.log("Server started on port 3000");
});

const chemSchema = new mongoose.Schema({
    name: String,
    attempt: Number,
    pass: Number,
    fail: Number,
    used: Boolean
});

const Reaction = new mongoose.model("reaction",chemSchema);
let p = [];
app.get("/",(req,res)=>{
    Reaction.find({used:false},(err,items)=>{
        let n = items.length;
        let random = Math.round((Math.random())*n)-1;
        p = [items[random].attempt,items[random].pass,items[random].fail];
        res.render("home",{items:items,random:random});   
    });

});

app.post("/fail",(req,res)=>{
    Reaction.findOneAndUpdate({_id:req.body.button},{attempt:(p[0]+1),fail:(p[2]+1)},
        (err,result)=>{
            if (err) {
                console.log(err);
            }console.log(result);
        });
    res.redirect("/");
});
app.post("/pass",(req,res)=>{
    Reaction.findOneAndUpdate({_id:req.body.button},{attempt:(p[0]+1),pass:(p[1]+1)},
        (err,result)=>{
            if (err) {
                console.log(err);
            }else{
                console.log(result);
                if (result.pass == 3) {
                    Reaction.findOneAndUpdate({_id:req.body.button},{used:true},
                    (err,result)=>{
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }
        });
    res.redirect("/");
});
app.post("/reset",(req,res)=>{
    Reaction.updateMany({},{attempt:0,pass:0,fail:0,used:false},
        {upsert:true},(err,result)=>{
            if (err) {
                console.log(err);
            }
        });
    res.redirect("/");
});
app.get('/create', (req,res)=>{
    res.render("create.ejs");
});
app.post('/create',(req,res)=>{
    Reaction.create({
        name:req.body.input,
        attempt: 0,
        pass: 0,
        fail: 0,
        used: false
    },(err,obj)=>{
        if (err) {
            console.log(err);
        }else{
            console.log(obj);
        }
    });
    res.redirect("/create");
});
app.get('/homeRedirect',(req,res)=>{
    res.redirect('/');
})
// Tank.create({ size: 'small' }, function (err, small) {
//     if (err) return handleError(err);
//     // saved!
//   });
//{upsert:true},{ useUnifiedTopology: true }