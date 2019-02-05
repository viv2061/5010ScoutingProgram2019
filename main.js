function start() {
    
}

function addTeam() {
    while (true) {
        let teamNumber = prompt("Enter team number: ");
        if (!isNaN(teamNumber)) {
            console.log(teamNumber);
            createTeamFile(teamNumber);
            break;
        } else {
            alert("You didn't enter a team number!");
        }
    }
}

function createTeamFile(teamNumber) {
    let file = new Blob(["hello world"], { type: "text/plain" });
    let downloadLink = document.querySelector("#downloadLink");
    downloadLink.download = teamNumber + ".txt";
    downloadLink.href = window.URL.createObjectURL(file);
}