

function updateSuccessJSON(jsonFilePath,keyToUpdate,valueToUpdate){
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    json[keyToUpdate] = valueToUpdate;
    fs.writeFileSync(jsonFilePath, JSON.stringify(json));
}




module.exports ={
    updateSuccessJSON
}