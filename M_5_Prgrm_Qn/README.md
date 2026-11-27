# Module 5 - MongoDB and Mongoose Answers

## MongoDB shell examples

The `.mongosh` files contain commands for the MongoDB shell. Install MongoDB
Shell and MongoDB Server if you need them, then run a file from this folder:

```powershell
winget install --id MongoDB.Shell --exact
winget install --id MongoDB.Server --exact
mongosh --file Qn_6.mongosh
```

Use the question's filename to run another example. `mongosh` and a local
MongoDB service are not currently installed/available on this computer.

## Mongoose examples

Mongoose is not installed in this module folder. From this folder, install it
with:

```powershell
npm install mongoose
```

`Qn_9.js` exports a model for use by another CommonJS program. `Qn_14.js`
uses ES module syntax. Run it from this folder as an ES module with:

```powershell
Get-Content -Raw Qn_14.js | node --input-type=module
```

The program connects to `mongodb://127.0.0.1:27017/collegeDB`. Start MongoDB
before running it. `Qn_15.js` is a CommonJS Express/Mongoose API example and
also needs Express installed in this folder (`npm install express mongoose`).
