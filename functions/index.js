/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require('cors')({ origin: true });

admin.initializeApp();
// admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const storage = admin.storage().bucket();

exports.createUserFile = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const userData = {
    billing: {
      compute_unit: 200,
      hold: 0,
      plan: "free",
    },
    permission: "user",
  };

  // Create a document in the "users" collection with the user's UID as the document ID
  await db.collection("users").doc(uid).set(userData);
});

exports.deleteUserFile = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;

  // Delete the document with the user's UID from the "users" collection
  await db.collection("users").doc(uid).delete();
});

exports.helloWorld = functions.https.onRequest((req, res) => {
  res.status(200).send('Hello, World!');
});

exports.getUserInfo = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
    if(req.method === 'GET'){
      try {
        const uid = req.query.uid;
  
        const querySnapshot = await db.collection('users').doc(uid).get();
        
        let userInfo = {}
  
        if (querySnapshot.empty) {
          console.log('No matching documents.');
        } else {
          userInfo = querySnapshot.data();
          console.log(userInfo);
        }
        res.status(200).json(userInfo);
      } catch (error) {
        console.error('Error finding User Info:', error);
        res.status(500).json({ error: 'Error finding User Info' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
});

exports.getProjectsByUid = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
    if(req.method === 'GET'){
      try {
        const uid = req.query.uid;
  
        const querySnapshot = await db.collection('projects').where('uid', '==', uid).get();
  
        const projects = [];
        querySnapshot.forEach((doc) => {
          projects.push({ id: doc.id, data: doc.data() });
        });
  
        res.status(200).json({ projects: projects });
      } catch (error) {
        console.error('Error finding projects:', error);
        res.status(500).json({ error: 'Error finding projects' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
});

exports.createProject = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
    if(req.method === 'GET'){
      try {
        const uid = req.query.uid;
        const project = {
          name: "",
          uid: uid,
          status: "Blank",
          progress: 0,
          voxelData: [],
          imageLink: "",
          meshLink: ""
        }
        const projectRef = await db.collection('projects').add(project);
        const projectId = projectRef.id;
        res.status(200).json({projectId: projectId});
      } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).send('Error creating project');
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
});

exports.creditExist = functions.https.onRequest(async (req,res) => {
  cors(req, res, async ()=>{
    if(req.method === 'GET'){
      try {
        const uid = req.query.uid;
        const userData = (await db.collection('users').doc(uid).get()).data();

        if(userData.billing.compute_unit > 0)
          res.status(200).json("Possible");
        else
          res.status(400).json("No Credit")
      } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: 'Error finding user' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
})

exports.voxelCreated = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
    if(req.method === 'POST'){
      try {
        const {uid, projectId, usedPrice, voxelData, file} = req.body;
        const userRef = db.collection('users').doc(uid);
        const userData = (await userRef.get()).data();
        const projectRef = db.collection("projects").doc(projectId);
        
        await userRef.update({
          'billing.compute_unit': userData.billing.compute_unit - usedPrice
        });

        await projectRef.update({
          'imageLink': file,
          'status': "Editing",
          'voxelData': voxelData
        });

        const projectData = (await projectRef.get()).data();
        res.status(200).json({ message: "Successfully saved Voxel Data", project: projectData });
      } catch (error) {
        console.error('Error processing voxel data:', error);
        res.status(500).json({ error: 'Error processing voxel data' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
})


exports.startStage2 = functions.https.onRequest(async (req,res) => {
  cors(req, res, async ()=>{
    if(req.method === 'GET'){
      try {
        const projectId = req.query.projectId;
        const projectRef = db.collection('projects').doc(projectId);
        const projectData = (await projectRef.get()).data()
        
        const uid = projectData.uid;
        const userRef = db.collection('users').doc(uid);
        const userData = (await userRef.get()).data();

        if(projectData.status !== "Blank"){
          return res.status(400).json("You need to create voxel firstly")
        }else if(projectData.status !== "Generating"){
          return res.status(400).json("It is already generating stage.")
        }else if(projectData.status !== "Completed"){
          return res.status(400).json("Project already completed")
        }

        if(userData.billing.compute_unit >= 100){
          await userRef.update({
            'billing.hold': 100,
            'billing.compute_unit': userData.billing.compute_unit - 100
          });

          await projectRef.update({
            'status': "Generating",
          });
          
          res.status(200).json("Started");
        }
        else
          res.status(400).json("Insufficient credit")
      } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ error: error });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
})

exports.updateVoxel = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
      if(req.method === 'POST'){
      try {
        const {projectId, voxelData} = req.body;
        const projectRef = db.collection("projects").doc(projectId);
        
        await projectRef.update({
          'status': "Editing",
          'voxelData': voxelData
        });

        const projectData = (await projectRef.get()).data();

        res.status(200).json({ message: "Successfully updated Voxel Data" });

      } catch (error) {
        console.error('Error updating voxel data:', error);
        res.status(500).json({ error: 'Error updating voxel data' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
})

exports.checkStatus = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
      if(req.method === 'GET'){
      try {
        const {projectId} = req.query;
        const projectRef = db.collection("projects").doc(projectId);
        
        const projectData = (await projectRef.get()).data();

        res.status(200).json({ status: projectData.status, progress: projectData.progress });

      } catch (error) {
        console.error('Error checking Status and progress:', error);
        res.status(500).json({ error: 'Error checking Status and progress' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
})

exports.changeProjectName = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
      if(req.method === 'GET'){
      try {
        const {projectId, newProjectName} = req.query;
        const projectRef = db.collection("projects").doc(projectId);
        
        await projectRef.update({
          'name': newProjectName
        });

        const projectData = (await projectRef.get()).data();

        res.status(200).json({ name: projectData.name });

      } catch (error) {
        console.error('Error changing Project Name:', error);
        res.status(500).json({ error: 'Error changing Project Name' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
})

exports.duplicateProject = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
      if(req.method === 'GET'){
      try {
        const {projectId} = req.query;
        const projectRef = db.collection("projects").doc(projectId);
        const projectData = (await projectRef.get()).data();

        const newProjectRef = await db.collection('projects').add(projectData);
        const newProjectId = newProjectRef.id;
        res.status(200).json({projectId: newProjectId});

      } catch (error) {
        console.error('Error duplicating project:', error);
        res.status(500).json({ error: 'Error duplicating project' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
})

exports.removeProject = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
      if (req.method === 'GET') {
      try {
        const { projectId } = req.query;
        await db.collection("projects").doc(projectId).delete();
        await storage.deleteFiles
        res.status(200).json({ message: 'Project removed successfully' });
      } catch (error) {
        console.error('Error removing project:', error);
        res.status(500).json({ error: 'Error removing project' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
});

exports.deleteProjectIcon = functions.firestore.document('projects/{projectId}').onDelete(async (snap, context) => {
  const projectId = context.params.projectId;

  const storageRef = admin.storage().bucket();
  const fileRef = storageRef.file(`${projectId}/icon.png`);
  await fileRef.delete();
});

// exports.create3DProject = functions.https.onRequest(async (req, res) => {
//   try {
//     // Verify user authentication
//     const { uid } = req.headers;
//     if (!uid) {
//       return res.status(401).json({ error: 'Unauthorized' });
//     }

//     // Access request data
//     const { projectName, projectData } = req.body;
//     const files = req.files;

//     // Create project document
//     const projectRef = await db.collection('projects').add({
//       uid: uid,
//       name: projectName,
//       data: projectData,
//       files: []
//     });

//     // Save files and update project document
//     for (const file of files) {
//       const fileRef = storage.file(`projects/${projectRef.id}/${file.name}`);
//       await fileRef.save(file.data);

//       const publicUrl = `https://storage.googleapis.com/${storage.name}/${fileRef.name}`;

//       await projectRef.update({
//         files: admin.firestore.FieldValue.arrayUnion(publicUrl)
//       });
//     }

//     res.status(200).json({ message: '3D project created successfully' });
//   } catch (error) {
//     console.error('Error creating 3D project:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });