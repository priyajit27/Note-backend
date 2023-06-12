const express = require('express');
const router= express.Router();
const fetchuser = require('../middleware/fetchuser')
const Notes=require('../models/Notes')
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the Notes using: GET "/api/notes/getuser". Login required
router.get('/fetchallnotes',fetchuser, async(req, res) => {
    try {
        let notes=await Notes.find({user:req.user.id});
       res.json(notes)
    } 
    
    catch (error) {
        console.error(error.message);
        res.status(500).send("Iternal server error")
    }
   
})


//  ROUTE 2: Add a new Note using: POST "/api/notes/addnote". Login required
router.post('/addnotes',fetchuser,
[
    body('title','Enter a valid title').isLength({ min: 3 }),
    body('description','Description must be atleast 5 letters').isLength({ min: 5}),
],
 async(req, res) => {

    try {
        const {title,description,tag}=req.body

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array()});
        }
    
        const notes= new Notes({
            title,description,tag,user:req.user.id
        });
        const savedNotes= await notes.save()
       
     res.json([savedNotes])
        
        }
        
        catch (error) {
            console.error(error.message);
            res.status(500).send("Iternal server error")
        }
})



// ROUTE 3: Update an existing Note using: POST "/api/notes/updatenote". Login required
router.put('/updatenotes/:id',fetchuser,
 async(req, res) => {
    // destructing
        const {title,description,tag}=req.body

        // Create a new Note object
        try {
            const newNote={}
            if(title){
                newNote.title=title
            }
            if(description){
                newNote.description=description
            }
            if(tag){
                newNote.tag=tag
            }
    
    // Find the note to be updated
            let note = await Notes.findById(req.params.id)
            if(!note)
            return res.status(404).send("Not found")
            if(note.user.toString()!==req.user.id)
            return res.status(404).send("Not Allowed")
           
       note=await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    //    new:true means a new object will be created

         res.json({note})
        //  res.json() method is commonly used in web development to send a JSON response from a server to a client. It is often used in combination with frameworks like Express.js to handle HTTP requests and responses.
        } 
        
        catch (error) {
            console.error(error.message);
            res.status(500).send("Iternal server error")
        }
       
        
})




//  ROUTE 4: Delete an existing Note using: DELETE "/api/notes/deletenote". Login required
router.delete('/deletenotes/:id',fetchuser,
 async(req, res) => {
      try {
        // Find the note to be deleted
        let note = await Notes.findById(req.params.id)
        if(!note)
        return res.status(404).send("Not found")
        if(note.user.toString()!==req.user.id)
        return res.status(404).send("Not Allowed")
       
   note=await Notes.findByIdAndDelete(req.params.id)
//    new:true means a new object will be deleted
     res.json({"Success":"Note has been deleted",note:note})
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Iternal server error")
      }
        
})

module.exports = router