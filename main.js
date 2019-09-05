let teamListTitle = document.getElementById("teamListTitle");
let teamList = document.getElementById("teamList");
let teamNumberTitle = document.getElementById("teamNumberTitle");
let contentDiv = document.getElementById("content");
let createdEntry = document.getElementById("createdEntry");
let createdEntryProperties = document.getElementsByClassName("createdEntryProperty");
let createdEntryInputs = document.getElementsByClassName("createdEntryInput");
let summaryDiv = document.getElementById("summary");
let summaryTable = document.getElementById("summaryTable");
let summaryComments = document.getElementById("summaryComments");
let teamListSummaryDiv = document.getElementById("teamListSummary");
let teamListSummaryTable = document.getElementById("teamListSummaryTable")

// The data that is currently opened
let currentTeamListName;
let currentTeamIndex;
let currentTeamListData = [];
let teamListSavedYet = true;

function start() {
    if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
        alert("File APIs not fully supported in this browser!");
        return;
    }
    document.getElementById("openTeamList").addEventListener("change", openTeamList, false);
}

// Creates the big file that will contain all the team numbers
function createTeamList(data = null) {
    teamListName = data == null ? prompt("Enter team list name: ") : teamListName;
    let file = new Blob([data == null ? "" : data], { type: "text/plain" });
    let downloadLink = document.createElement("a");
    downloadLink.download = teamListName;
    downloadLink.href = window.URL.createObjectURL(file);   
    downloadLink.click();
}

// Opens the team file list.
function openTeamList(evt) {
    clearContent();
    // If opening a different team list, confirm if we want to save first
    if (!teamListSavedYet) {
        let unsaved = confirm("You have unsaved changes. If you open another file without saving, data will be lost. Continue?");
        if (!unsaved) {
            return;
        }
    }
    hideCreateEntry();
    // clear content and list
    clearContent();
    while (teamList.firstChild) {
        teamList.removeChild(teamList.firstChild);
    }
    // set the team list title (ex. Indiana district teams)
    let file = evt.target.files[0];
    teamListTitle.textContent = (file.name).substring(0, file.name.length - 4);
    teamListName = file.name;
    // retrieve data from file
    let reader = new FileReader();
    reader.onload = function() {
        if (reader.result.length != 0) {
            let data = JSON.parse(reader.result);
            currentTeamListData = data;
            sortTeamList();
        } else {
            currentTeamListData = [];
        }
    }
    reader.readAsText(file);
}

function saveTeamList() {
    createTeamList(JSON.stringify(currentTeamListData));
    teamListSavedYet = true;
}

function sortTeamList() {
    for (let i = 0; i < currentTeamListData.length; i++) {
        for (let j = i + 1; j < currentTeamListData.length; j++) {
            if (currentTeamListData[j]["Team Number"] < currentTeamListData[i]["Team Number"]) {
                // swap them
                let low = currentTeamListData[j];
                let high = currentTeamListData[i];
                currentTeamListData[i] = low;
                currentTeamListData[j] = high;
            }
        }
    }
    updateTeamList();
}

function updateTeamList() {
    // remove all teams
    while (teamList.firstChild) {
        teamList.removeChild(teamList.firstChild);
    }
    // display all the teams as a list
    for (let i = 0; i < currentTeamListData.length; i++) {
        let li = document.createElement("li");
        teamList.appendChild(li);
        let teamLink = document.createElement("a");
        teamLink.textContent = currentTeamListData[i]["Team Number"];
        li.appendChild(teamLink);
        teamLink.onclick = function () {
            openTeam(i);
        }
    }
}

function addNewTeam() {
    let newTeam = {};
    while (true) {
        let teamNumber = prompt("Enter team number: ");
        if (teamNumber != null && teamNumber.length != 0 && !isNaN(teamNumber)) {
            newTeam["Team Number"] = parseInt(teamNumber);
            newTeam["Matches"] = [];
            currentTeamListData.push(newTeam);
            break;
        } else if (teamNumber == null) {
            return;
        } else {
            alert("You didn't enter a team number!");
        }
    }
    let li = document.createElement("li");
    teamList.appendChild(li);
    let teamLink = document.createElement("a");
    teamLink.textContent = newTeam["Team Number"];
    li.appendChild(teamLink);
    teamLink.onclick = function () {
        openTeam(currentTeamListData.length - 1);
    }
    sortTeamList();
}

function openTeam(teamIndex) {
    clearContent();
    viewContentDiv(true);
    viewSummaryDiv(false);
    viewTeamListSummaryDiv(false);
    teamNumberTitle.textContent = "Team Number: " + currentTeamListData[teamIndex]["Team Number"];
    let matches = currentTeamListData[teamIndex]["Matches"];
    currentTeamIndex = teamIndex;
    for (let i = 0; i < matches.length; i++) {
        addEntry(matches[i]);
    }
}

// Clears content, gets rid of all displayed match entries
function clearContent() {
    while (contentDiv.firstChild) {
        contentDiv.removeChild(contentDiv.firstChild);
    }
}

// Adds a match entry
function addEntry(data) {
    // adding entry div
    let entry = document.createElement("div");
    entry.className = "entry";
    if (contentDiv.firstChild != null) {
        contentDiv.insertBefore(entry, contentDiv.firstChild);
    } else {
        contentDiv.appendChild(entry);
    }

    // adding match title
    let matchTitle = document.createElement("h3");
    matchTitle.className = "matchTitle";
    matchTitle.textContent = data["Match Title"];
    entry.appendChild(matchTitle);

    // adding the table of data
    let table = document.createElement("table");
    entry.appendChild(table);

    // for each data property, add a row and 2 columns: title and value
    Object.keys(data).forEach(property => {
        if (property != "Match Title") {
            let tr = document.createElement("tr");
            table.appendChild(tr);
            let propertyName = document.createElement("td");
            propertyName.textContent = property + ":";
            tr.appendChild(propertyName);
            let value = document.createElement("td");
            value.textContent = data[property];
            tr.appendChild(value);
        }
    });

    let removeButton = document.createElement("button");
    removeButton.textContent = "Remove Entry";
    entry.appendChild(removeButton);

    removeButton.onclick = function() {
        removeEntry(data, entry);
    }
}

function createEntry() {
    createdEntry.style.display = "block";
    teamListSavedYet = false;
}

function saveEntry() {
    let newMatch = {};
    for (let i = 0; i < createdEntryInputs.length; i++) {
        if (createdEntryInputs[i].type == "text" && createdEntryInputs[i].value.length == 0) {
            alert("You must fill out all data out!")
            return;
        } else if (createdEntryInputs[i].type == "text") {
            newMatch[createdEntryProperties[i].textContent.substring(0, createdEntryProperties[i].textContent.length - 1)] = createdEntryInputs[i].value;
        } else {
            newMatch[createdEntryProperties[i].textContent.substring(0, createdEntryProperties[i].textContent.length - 1)] = createdEntryInputs[i].checked;
        }
    }
    currentTeamListData[currentTeamIndex]["Matches"].push(newMatch);
    addEntry(newMatch);
    hideCreateEntry();
}

function removeEntry(data, entry) {
    let removeConfirm = confirm("Are you sure you want to remove this entry? It cannot be undone.");
    if (!removeConfirm) return;
    teamListSavedYet = false;
    contentDiv.removeChild(entry);
    let currentTeam = currentTeamListData[currentTeamIndex];
    for (let i = 0; i < currentTeam["Matches"].length; i++) {
        if (currentTeam["Matches"][i] === data) {
            currentTeam["Matches"].splice(i, 1);
            return;
        }
    }
}

function hideCreateEntry() {
    for (let i = 0; i < createdEntryInputs.length; i++) {
        createdEntryInputs[i].value = "";
        createdEntryInputs[i].checked = false;
    }
    createdEntry.style.display = "none";
}

function viewContentDiv(view) {
    contentDiv.style.display = view ? "block" : "none";
}

function viewSummaryDiv(view) {
    summaryDiv.style.display = view ? "block" : "none";
}

function viewTeamListSummaryDiv(view) {
    teamListSummaryDiv.style.display = view ? "block" : "none";
}

function toggleContentAndSummary() {
    if (contentDiv.style.display == "block") {
        viewContentDiv(false);
        viewSummaryDiv(true);
    } else {
        viewContentDiv(true);
        viewSummaryDiv(false);
    }
}

function viewSummary() {
    toggleContentAndSummary();
    let currentTeamMatches = currentTeamListData[currentTeamIndex]["Matches"];
    let averagedValues = averageTeamValues(currentTeamMatches);

    // display the averaged values
    // clear table first
    while (summaryTable.firstChild) {
        summaryTable.removeChild(summaryTable.firstChild);
    }
    //display values in table
    Object.keys(averagedValues).forEach(property => {
        let tr = document.createElement("tr");
        summaryTable.appendChild(tr);
        let propertyName = document.createElement("td");
        propertyName.textContent = property + ":";
        tr.appendChild(propertyName);
        let value = document.createElement("td");
        value.textContent = averagedValues[property];
        tr.appendChild(value);
    });
    //clear the comments list
    while (summaryComments.firstChild) {
        summaryComments.removeChild(summaryComments.firstChild);
    }
    //display list of comments
    currentTeamMatches.forEach(match => {
        let li = document.createElement("li");
        li.textContent = match["Additional comments"];
        summaryComments.appendChild(li);
    });
}

function averageTeamValues(teamMatches) {
    let averagedValues = {};
    // setting the key values
    for (let i = 0; i < createdEntryProperties.length; i++) {
        if (createdEntryProperties[i].textContent != "Match Title:" && createdEntryProperties[i].textContent != "Additional comments:") {
            averagedValues[createdEntryProperties[i].textContent.substring(0, createdEntryProperties[i].textContent.length - 1)] = 0;
        }
    }

    // get and average the values
    Object.keys(averagedValues).forEach(property => {
        for (let i = 0; i < teamMatches.length; i++) {
            if (!isNaN(teamMatches[i][property]) && typeof teamMatches[i][property] != "boolean") {
                averagedValues[property] += parseInt(teamMatches[i][property]);
            } else if (typeof teamMatches[i][property] === "boolean") {
                averagedValues[property] += teamMatches[i][property] ? 1 : 0;
			}
        }
        averagedValues[property] /= teamMatches.length;
    });

    return averagedValues;
}

function viewTeamListSummary() {
    //displaying things correctly
    viewContentDiv(false);
    viewSummaryDiv(false);
    viewTeamListSummaryDiv(true);
    teamNumberTitle.textContent = "All Teams Summary"

    //get an average for values 
    let allTeamsAverage = [];
    for (let i = 0; i < currentTeamListData.length; i++) {
        let averagedTeam = {
            teamNumber: currentTeamListData[i]["Team Number"],
            matches: averageTeamValues(currentTeamListData[i]["Matches"])
        }
        allTeamsAverage.push(averagedTeam);
    }

    // get properties
    let sampleTeam = allTeamsAverage[0];
    Object.keys(sampleTeam.matches).forEach(property => {
        // copying array
        let teams = [];
        for (let k = 0; k < allTeamsAverage.length; k++) {
            teams.push(allTeamsAverage[k]);
        }
        // reorder them
        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                if (teams[i].matches[property] < teams[j].matches[property]) {
                    // swap
                    let lowerIndex = teams[i];
                    let higherIndex = teams[j];
                    teams[i] = higherIndex;
                    teams[j] = lowerIndex;
                }
            }
        }
        // displaying the best stuff
        // first set up the property title
        let table = teamListSummaryTable;
        let titleRow = document.createElement("tr");
        table.appendChild(titleRow);
        let title = document.createElement("h3");
        title.textContent = "Best at " + property + ":";
        titleRow.appendChild(title);

        // now set up the team list
        // displaying it in two columns
        let teamMidpoint = Math.round(teams.length / 2);
        for (let i = 0; i < teamMidpoint; i++) {
            let row = document.createElement("tr");
            table.appendChild(row);
            let team = document.createElement("td");
            team.textContent = (i + 1) + ") " + teams[i].teamNumber;
            row.appendChild(team);
        }
        for (let i = teamMidpoint; i < teams.length; i++) {
            let row = table.childNodes[table.childNodes.length - teamMidpoint + (i - teamMidpoint)];
            let team = document.createElement("td");
            team.textContent = (i + 1) + ") " + teams[i].teamNumber;
            row.appendChild(team);
        }
    });
}