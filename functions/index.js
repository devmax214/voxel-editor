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
const date_fns = require("date-fns");

admin.initializeApp();
// admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const storage = admin.storage().bucket();
const topicName = 'SecondAIReq';

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
        console.log('Error finding User Info:', error);
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
        console.log('Error finding projects:', error);
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
          voxelDataLink: '',
          meshGenerated: false
        }
        const projectRef = await db.collection('projects').add(project);
        const projectId = projectRef.id;
        res.status(200).json({projectId: projectId});
      } catch (error) {
        console.log('Error creating project:', error);
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
        console.log('Error finding user:', error);
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
        console.log('Error processing voxel data:', error);
        res.status(500).json({ error: 'Error processing voxel data' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
})

const SECOND_AI_API_BASEURL = "https://api.runpod.ai/v2/gg3lo31p6vvlb0";
const API_KEY = "7TY4F9VDBMPKWBIAXSKM8P4Q2HBOJUU65M8LFFVW";
const FIREBASE_CLOUD_BASEURL = "https://us-central1-enlighten-3d-backend.cloudfunctions.net";
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const DEFAULT_REQ_CREDIT = 75;

exports.startStage2 = functions.https.onRequest(async (req,res) => {
  cors(req, res, async ()=>{
    if (req.method === 'POST') {
      const { projectId, prompt, vertices } = req.body;
      
      try {
        const projectRef = db.collection("projects").doc(projectId);
        const projectData = (await projectRef.get()).data();

        const userRef = db.collection('users').doc(projectData.uid);
        const userData = (await userRef.get()).data();

        if (userData.billing.compute_unit < DEFAULT_REQ_CREDIT) {
          return res.status(400).json("You don't have enough credit");
        }

        if(projectData.status === "Blank"){
          return res.status(400).json("You need to create voxel firstly")
        }else if(projectData.status === "Generating"){
          return res.status(400).json("It is already generating stage.")
        }else if(projectData.status === "Completed"){
          return res.status(400).json("Project already completed")
        }

        await userRef.update({
          'billing.compute_unit': userData.billing.compute_unit - DEFAULT_REQ_CREDIT,
          'billing.hold': userData.billing.hold + DEFAULT_REQ_CREDIT
        })

        const reqRes = await fetch(`${SECOND_AI_API_BASEURL}/run`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${API_KEY}`
          },
          body: JSON.stringify({
            input: {
              prompt: prompt,
              vertices: vertices
            },
            webhook: `${FIREBASE_CLOUD_BASEURL}/meshGenerated`,
          })
        });

        const resData = await reqRes.json();

        await projectRef.update({
          status: "Generating",
          meshReqId: resData.id,
          requestedAt: new Date().toISOString()
        });

        res.status(200).json("Requested");
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error Second Stage Project' });
      }
    }
  })
})

exports.updateVoxel = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
    if(req.method === 'POST'){
      try {
        const {projectId, voxelData, file} = req.body;
        const projectRef = db.collection("projects").doc(projectId);
        
        await projectRef.update({
          'imageLink': file,
          'status': "Editing",
          'voxelData': voxelData
        });

        const projectData = (await projectRef.get()).data();

        res.status(200).json({ message: "Successfully updated Voxel Data" });

      } catch (error) {
        console.log('Error updating voxel data:', error);
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
        console.log('Error checking Status and progress:', error);
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
        console.log('Error changing Project Name:', error);
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
        console.log('Error duplicating project:', error);
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
        await storage.deleteFiles(`${projectId}/`);
        res.status(200).json({ message: 'Project removed successfully' });
      } catch (error) {
        console.log('Error removing project:', error);
        res.status(500).json({ error: 'Error removing project' });
      }
    } else {
      res.status(405).send('Method Not Allowed');
    }
  })
});

exports.processAIRequest = functions.runWith({ timeoutSeconds: 9000 }).pubsub.topic(topicName).onPublish(async (message, context) => {
  const messageData = JSON.parse(Buffer.from(message.data, 'base64').toString());
  const projectId = messageData.projectId;
  const projectPrompt = messageData.prompt;
  try {
    const projectRef = db.collection("projects").doc(projectId);

    await projectRef.update({
      status: "Generating",
    });
  
    const reqRes = await fetch(`${SECOND_AI_API_BASEURL}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        input: {
          prompt: projectPrompt
        }
      })
    });

    let res = await reqRes.json();
  
    console.log('requested');
  
    while (res.status !== 'COMPLETED') {
      console.log('checked', res.status);
      await delay(600000);
      const checkProject = await fetch(`${SECOND_AI_API_BASEURL}/status/${res.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`
        }
      });

      res = await checkProject.json();
    }
  
    console.log('completed');
  
    await projectRef.update({
      status: "Completed",
    });
  } catch (error) {
    console.log('Error processing AI Request:', error);
  }
});

exports.meshGenerated = functions.https.onRequest(async (req, res) => {
  cors(req, res, async ()=>{
    if(req.method === 'POST'){
      try {
        const { id, status, output, executionTime, error } = req.body;
        const snapShot = await db.collection("projects").where("meshReqId", "==", id).limit(1).get();
        const projectRef = snapShot.empty ? null : snapShot.docs[0].ref;
        const projectData = snapShot.empty ? null : snapShot.docs[0].data();
        const userRef = db.collection('users').doc(projectData.uid);
        const userData = (await userRef.get()).data();
        
        if (projectRef) {
          if (status === "COMPLETED" && projectData.status === "Generating") {
            const filesData = [
              {
                filename: "model.obj",
                base64: output.obj
              },
              {
                filename: "model.mtl",
                base64: output.mtl
              },
              {
                filename: "texture_kd.jpg",
                base64: output.albedo
              },
              {
                field: "metallic",
                filename: "texture_metallic.jpg",
                base64: output.metallic
              },
              {
                filename: "texture_roughness.jpg",
                base64: output.roughness
              },
              {
                filename: "mesh.png",
                base64: output.screenshot
              }
            ];
    
            const uploadPromises = filesData.map(async (fileData) => {
              const { filename, base64 } = fileData;
              
              if (!filename || !base64) {
                throw new Error('Missing filename or base64 data');
              }
              
              // Decode the base64 string to binary data
              const buffer = Buffer.from(base64, 'base64');
              
              // Create a new blob in the bucket and upload the file data.
              const blob = storage.file(`${projectRef.id}/${filename}`);
              blob.save(buffer);
              const blobStream = blob.createWriteStream({
                metadata: {
                  contentType: 'auto', // Firebase can auto-detect content type if not specified
                },
              });
          
              return new Promise((resolve, reject) => {
                blobStream.on('error', (err) => reject(err));
                blobStream.on('finish', () => resolve(filename));
                blobStream.end(buffer);
              });
            });
    
            await Promise.all(uploadPromises);
  
            await projectRef.update({
              status: "Completed",
              meshGenerated: true,
              lastModified: new Date().toISOString(),
            });
  
            const requireCredit = Math.floor(executionTime / 60000);
            
            await userRef.update({
              'billing.compute_unit': userData.billing.compute_unit - (requireCredit - DEFAULT_REQ_CREDIT),
              'billing.hold': userData.billing.hold - DEFAULT_REQ_CREDIT
            });
  
            res.status(200).json("Job completed");
          }
          if (status === "FAILED" && projectData.status === "Generating") {
            await projectRef.update({
              status: "Failed",
            });
            await userRef.update({
              'billing.compute_unit': userData.billing.compute_unit + DEFAULT_REQ_CREDIT,
              'billing.hold': userData.billing.hold - DEFAULT_REQ_CREDIT
            });

            console.log("error", error);
            res.status(200).json("Job failed");
          }
        }
        else {
          res.status(404).json("No document founded")
        }
  
      } catch (error) {
        console.log('Mesh generation failed:', error);
        res.status(500).json('Mesh generation failed');
      }
    }
  })
});

exports.voxelGenerated = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === 'POST') {
      try {
        const { id, status } = req.body;
        const snapShot = await db.collection("projects").where("voxelReqId", "==", id).limit(1).get();
        const projectData = snapShot.empty ? null : snapShot.docs[0].data();

        if (projectData) {
          const userRef = db.collection('users').doc(projectData.uid);
          const userData = (await userRef.get()).data();

          await userRef.update({
            'billing.compute_unit': userData.billing.compute_unit - 1
          });

          res.status(200).json("Voxel generation success");
        }
        else {
          res.status(404).json("No document founded")
        }

      } catch (error) {
        console.log('Voxel generation failed:', error);
        res.status(500).json('Voxel generation failed');
      }
    }
  })
});

exports.getAsset = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    if (req.method === 'GET') {
      try {
        const { projectId, fileName } = req.query;
        const storageRef = admin.storage().bucket();
        const fileRef = storageRef.file(`${projectId}/${fileName}`);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Create a read stream for the file
        const fileReadStream = fileRef.createReadStream();
        
        // Pipe the read stream to the response object
        fileReadStream.pipe(res);
        
        fileReadStream.on('error', (error) => {
          console.error('Stream encountered error:', error);
          res.status(500).end('Internal Server Error');
        });     
      } catch (error) {
        console.log('Get asset failed:', error);
        res.status(500).json('Get asset failed');
      }
    }
  })
});

exports.cancelJob = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  try {
    const snapShot = await db.collection("projects").where("status", "==", "Generating").select("requestedAt", "meshReqId", "uid").get();
    const generatingProjects = snapShot.empty ? [] : snapShot.docs.map(doc => ({id: doc.id, ...doc.data()}));
    const cancelJob = generatingProjects.filter(project => date_fns.differenceInHours(new Date(), new Date(project.requestedAt)) > 5);
    
    cancelJob.forEach(async project => {
      try {
        await fetch(`${SECOND_AI_API_BASEURL}/cancel/${project.meshReqId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${API_KEY}`
          },
        });
      } catch (err) {
        console.log(err);
      } finally {
        const projectRef = db.collection("projects").doc(project.id);
        await projectRef.update({
          status: "Failed"
        });
        const userRef = db.collection('users').doc(project.uid);
        await userRef.update({
          'billing.compute_unit': userData.billing.compute_unit + DEFAULT_REQ_CREDIT,
          'billing.hold': userData.billing.hold - DEFAULT_REQ_CREDIT
        });
      }
    });

  } catch (error) {
    console.log(error);
    throw error;
  }
});

exports.delete3DAssets = functions.firestore.document('projects/{projectId}').onDelete(async (snapShot, context) => {
  try {
    await storage.deleteFiles({
      prefix: `${context.params.projectId}/`,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
});