const fs = require('fs')
const path = require('path')

fs.readFile(path.join(__dirname, 'files', 'hello.txt'), 'utf-8' ,(err, data) =>{
    if(err) throw err;
    console.log(data);
})

fs.writeFile(path.join(__dirname, 'files', 'log.txt'), "this is logger", (err) =>{
    if(err) throw err;
    console.log("file write done");
})

fs.appendFile(path.join(__dirname, 'files', 'test.txt'), "appended \n", (err) =>{
    if(err) throw err;
    console.log("append done");
})

console.log("hi");

process.on('uncaughtException', (err)=>{
    console.error(err);
    process.exit(1)
})