

function updateSuccessJSON(jsonFilePath,keyToUpdate,valueToUpdate){
    var fs = require('fs');
    var json = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    json[keyToUpdate] = valueToUpdate;
    fs.writeFileSync(jsonFilePath, JSON.stringify(json));
}


function getCurrentFormattedDate() {
    const date = new Date();
  
    // Get day, month, and year
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
  
    return `${day}-${month}-${year}`;
  }
  

module.exports ={
    updateSuccessJSON,
    getCurrentFormattedDate
}