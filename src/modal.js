if (window.localStorage.getItem("setNodeGroupingPreference") == null) {
    self.groupByTable = false;
    self.groupByType = true;
    self.groupByNone = false;
} else {
    self.groupByTable = (window.localStorage.getItem("groupByTable") == "true")
    self.groupByType = (window.localStorage.getItem("groupByType") == "true")
    self.groupByNone = (window.localStorage.getItem("groupByNone") == "true")

}

self.settingsModalOpenBool = false;
self.searchModalOpenBool = false;




self.settingsModal = document.getElementById("settingsModal");

// Get the <span> element that closes the modal
self.settingsModalCloseButton = document.getElementById("settingsModalCloseButton");
self.settingsModalSaveButton = document.getElementById("settingsModalSaveButton");
self.settingsModalTableGroupingRadio = document.getElementById("nodeGrouping0")
self.settingsModalTypeGroupingRadio = document.getElementById("nodeGrouping1")
self.settingsModalNoGroupingRadio = document.getElementById("nodeGrouping2")







self.setSettingsModalNodeGroupingRadio = () => {
    if (self.groupByTable) {
        self.settingsModalTableGroupingRadio.click()
    } else if (self.groupByType) {
        self.settingsModalTypeGroupingRadio.click()
    } else {
        self.settingsModalNoGroupingRadio.click()
    }
}


// When the user clicks on the button, open the modal 
self.settingsModalOpen = function() {
    self.setSettingsModalNodeGroupingRadio()
    self.settingsModal.style.display = "block";
    self.modalOpen = true
    self.settingsModalOpenBool = true;

}

// When the user clicks on <span> (x), close the modal
self.settingsModalCloseButton.onclick = function() {
    self.settingsModal.style.display = "none";
    self.modalOpen = false
    self.settingsModalOpenBool = false;
}








self.settingsModalSave = () => {

    self.groupByTable = false;
    self.groupByType = false;
    self.groupByNone = false



    const formData = $('#settingsModalForm').serializeArray()

    console.log(formData)
    var formItem
    for (var i = formData.length - 1; i >= 0; i--) {
        formItem = formData[i]

        if (formItem.name == "nodeGrouping") {

            if (formItem.value == "type") {
                self.groupByType = true
            } else if (formItem.value == "table") {
                self.groupByTable = true
            } else {
                self.groupByNone = true
            }

        }

    }

    window.localStorage.setItem("groupByTable", self.groupByTable)
    window.localStorage.setItem("groupByType", self.groupByType)
    window.localStorage.setItem("groupByNone", self.groupByNone)
    window.localStorage.setItem("setNodeGroupingPreference", true)


    self.closeAllModals()

}

self.settingsModalSaveButton.onclick = ()=>{
   self.settingsModalSave()

 
}







self.searchModal = document.getElementById("searchModal");







// Get the <span> element that closes the modal
self.searchModalCloseButton = document.getElementById("searchModalCloseButton");


// When the user clicks on the button, open the modal 
self.searchModalOpen = function() {
    self.searchModal.style.display = "block";
    self.modalOpen = true
    self.searchModalOpenBool = true;
}

// When the user clicks on <span> (x), close the modal
self.searchModalCloseButton.onclick = function() {
    self.searchModal.style.display = "none";
    self.modalOpen = false
    self.searchModalOpenBool = false;
}



self.closeAllModals = ()=>{

    self.searchModal.style.display = "none";
    self.settingsModal.style.display = "none";
    self.modalOpen = false
    self.searchModalOpenBool = false;
    self.settingsModalOpenBool = false;
}


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == self.searchModal) {
        self.closeAllModals()
    }
    if (event.target == self.settingsModal) {
       self.closeAllModals()
    }

}





// START Search Modal

self.searchModalSearchButton = document.getElementById("searchModalSearchButton");
self.searchModalClearButton = document.getElementById("searchModalClearButton");
self.searchModalAddButton = document.getElementById("searchModalSaveButton");
self.searchModalSearchText = document.getElementById("searchModalSearchText");



self.searchModalSearchText.addEventListener("keyup", function(event) {
    if (event.keyCode === 13 && self.searchModalOpenBool) {
        event.preventDefault();
        document.getElementById("searchModalSearchButton").click();
    }
});





self.searchModalClearButton.onclick = function() {
    self.clearSearchDatatable()

    self.searchDevicesContextID = {};
    self.searchProjectsContextID = {};
    self.searchFunctionsContextID = {};
    self.searchOrgsContextID = {};
    self.searchResourcesContextID = {};
    self.searchPeopleContextID = {};

}

self.getDeviceEdges = (device) => {
    var edges = []
    var func
    for (var i = device.device_functions.length - 1; i >= 0; i--) {
        func = device.device_functions[i].function;
        if (self.dimoFunctions[func.id] != undefined) {
            edges.push({ "source": device.id, "target": func.id, type: "custom-cubic" })
        }
    }

    var org
    for (var i = device.device_oem_orgs.length - 1; i >= 0; i--) {

        org = device.device_oem_orgs[i].organization;
        console.log(org)
        if (self.dimoOrgs[org.id] != undefined) {
            edges.push({ "source": device.id, "target": org.id, type: "custom-cubic" })
        }

    }

    for (var i = device.device_sp_orgs.length - 1; i >= 0; i--) {

        org = device.device_sp_orgs[i].organization;

        if (self.dimoOrgs[org.id] != undefined) {
            edges.push({ "source": device.id, "target": org.id, type: "custom-cubic" })
        }

    }

    var project
    for (var i = device.project_devices.length - 1; i >= 0; i--) {

        project = device.project_devices[i].project;

        if (self.dimoProjects[project.id] != undefined) {
            edges.push({ "source": device.id, "target": project.id, type: "custom-cubic" })

        }
    }


    return edges

}


self.getProjectEdges = (proj) => {

    var edges = []



    var device
    for (var i = proj.project_devices.length - 1; i >= 0; i--) {

        device = proj.project_devices[i].device;

        if (self.dimoDevices[device.id] != undefined) {
            edges.push({ "source": proj.id, "target": device.id, type: "custom-cubic" })
        }

    }


    var func
    for (var i = proj.function_projects.length - 1; i >= 0; i--) {
        func = proj.function_projects[i].function;

        if (self.dimoFunctions[func.id] != undefined) {
            edges.push({ "source": proj.id, "target": func.id, type: "custom-cubic" })

        }



    }


    var org
    for (var i = proj.org_projects.length - 1; i >= 0; i--) {
        org = proj.org_projects[i].organization;
        if (self.dimoOrgs[org.id] != undefined) {

            edges.push({ "source": org.id, "target": proj.id, type: "custom-cubic" })

        }

    }

    return edges


}


self.getFunctionEdges = (func) => {


    var edges = []


    var device
    for (var i = func.device_functions.length - 1; i >= 0; i--) {

        device = func.device_functions[i].device;

        if (self.dimoDevices[device.id] != undefined) {
            edges.push({ "source": func.id, "target": device.id, type: "custom-cubic" })

        }
    }

    var project
    for (var i = func.function_projects.length - 1; i >= 0; i--) {
        project = func.function_projects[i].project;
        if (self.dimoProjects[project.id] != undefined) {
            edges.push({ "source": func.id, "target": project.id, type: "custom-cubic" })
        }
    }

    var org
    for (var i = func.function_sp_orgs.length - 1; i >= 0; i--) {

        org = func.function_sp_orgs[i].organization;

        if (self.dimoOrgs[org.id] != undefined) {
            edges.push({ "source": func.id, "target": org.id, type: "custom-cubic" })
        }
    }

    return edges

}


self.getOrgEdges = (org) => {


    var edges = [];

    var device
    for (var i = org.device_oem_orgs.length - 1; i >= 0; i--) {

        device = org.device_oem_orgs[i].device;

        if (self.dimoDevices[device.id] != undefined) {
            edges.push({ "source": org.id, "target": device.id, type: "custom-cubic" })

        }

    }

    for (var i = org.device_sp_orgs.length - 1; i >= 0; i--) {

        device = org.device_sp_orgs[i].device;

        if (self.dimoDevices[device.id] != undefined) {
            edges.push({ "source": org.id, "target": device.id, type: "custom-cubic" })

        }

    }


    var func

    for (var i = org.function_sp_orgs.length - 1; i >= 0; i--) {
        func = org.function_sp_orgs[i].function;
        if (self.dimoFunctions[func.id] != undefined) {
            edges.push({ "source": org.id, "target": func.id, type: "custom-cubic" })

        }




    }


    var project

    for (var i = org.org_projects.length - 1; i >= 0; i--) {
        project = org.org_projects[i].project;

        if (self.dimoProjects[project.id] != undefined) {
            edges.push({ "source": org.id, "target": project.id, type: "custom-cubic" })

        }
    }

    return edges

}



self.getResourceEdges = (resource) => {


    var edges = [];

    var project

    for (var i = resource.project_resources.length - 1; i >= 0; i--) {
        project = resource.project_resources[i].project;

        if (self.dimoProjects[project.id] != undefined) {
            edges.push({ "source": resource.id, "target": project.id, type: "custom-cubic" })

        }
    }

    var func
    for (var i = resource.functions_resources.length - 1; i >= 0; i--) {
        func = resource.functions_resources[i].function;

        if (self.dimoFunctions[func.id] != undefined) {
            edges.push({ "source": resource.id, "target": func.id, type: "custom-cubic" })

        }
    }

    var org
    for (var i = resource.org_resources.length - 1; i >= 0; i--) {
        org = resource.org_resources[i].organization;

        if (self.dimoOrgs[org.id] != undefined) {
            edges.push({ "source": resource.id, "target": org.id, type: "custom-cubic" })

        }
    }


    return edges

}


self.searchTableConvDeviceToNode = (id, index) => {
    const device = self.searchDevicesContextID[id]
    var devNode = self.gqlDeviceDataToNode(device);
    return [device, devNode]
}

self.searchTableConvProjectToNode = (id, index) => {
    const project = self.searchProjectsContextID[id]
    var projNode = self.gqlProjectDataToNode(project);
    return [project, projNode]
}

self.searchTableConvFunctionToNode = (id, index) => {
    const func = self.searchFunctionsContextID[id]
    var funcNode = self.gqlFunctionDataToNode(func);
    return [func, funcNode]
}

self.searchTableConvOrgToNode = (id, index) => {
    const org = self.searchOrgsContextID[id]
    var orgNode = self.gqlOrgDataToNode(org);
    return [org, orgNode]
}

self.searchTableConvResourceToNode = (id, index) => {
    const resource = self.searchResourcesContextID[id]
    var resourceNode = self.gqlResourceDataToNode(resource);
    return [resource, resourceNode]
}

self.searchTableConvPeopleToNode = (id, index) => {
    const person = self.searchPeopleContextID[id]
    var personNode = self.gqlPeopleDataToNode(person);
    return [person, personNode]
}


self.searchModalAddButton.onclick = function() {
    var selectedRows, indexes

    var nodes = [];
    var edges = [];

    var objs = [];

    var resp = self.getSelectedRowsDatatable()
    indexes = resp[0]
    selectedRows = resp[1]

    var row, tds, id, type, node, obj
    for (var i = selectedRows.length - 1; i >= 0; i--) {
        row = selectedRows[i]
        tds = row.getElementsByTagName("td")
        id = tds[0].getElementsByClassName("div-id")[0].id
        type = tds[2].textContent

        if (type == "[Device]") {
            [obj, node] = self.searchTableConvDeviceToNode(id, indexes[i])
            self.dimoDevices[node.id] = node
            nodes.push(node)
            objs.push(obj)
        } else if (type == "[Project]") {
            [obj, node] = self.searchTableConvProjectToNode(id, indexes[i])
            self.dimoProjects[node.id] = node
            nodes.push(node)
            objs.push(obj)
        } else if (type == "[Function]") {
            [obj, node] = self.searchTableConvFunctionToNode(id, indexes[i])
            self.dimoFunctions[node.id] = node
            nodes.push(node)
            objs.push(obj)
        } else if (type == "[Org]") {
            [obj, node] = self.searchTableConvOrgToNode(id, indexes[i])
            self.dimoOrgs[node.id] = node
            nodes.push(node)
            objs.push(obj)
        } else if (type == "[Resource]") {
            [obj, node] = self.searchTableConvResourceToNode(id, indexes[i])
            self.dimoOrgs[node.id] = node
            nodes.push(node)
            objs.push(obj)
        } else if (type == "[People]") {
            [obj, node] = self.searchTableConvPeopleToNode(id, indexes[i])
            self.dimoPeople[node.id] = node
            nodes.push(node)
            objs.push(obj)
        }


    }


    for (var i = nodes.length - 1; i >= 0; i--) {
        obj = objs[i]
        if (nodes[i].class == "[Device]") {
            self.checkDeviceNodeConnections(obj,nodes,edges)
        } else if (nodes[i].class == "[Project]") {
            self.checkProjectNodeConnections(obj,nodes,edges)
        } else if (nodes[i].class == "[Function]") {
            self.checkFunctionNodeConnections(obj,nodes,edges)
        } else if (nodes[i].class == "[Org]") {
            self.checkOrgNodeConnections(obj,nodes,edges)
        } else if (nodes[i].class == "[Resource]") {
            self.checkResourceNodeConnections(obj,nodes,edges)
        } else if (nodes[i].class == "[People]") {
            self.checkPeopleNodeConnections(obj,nodes,edges)
        }
       
    }



    self.removeRowsByIndexes(indexes)
    self.cachePositions = self.cacheNodePositions(graph.getNodes());
    self.refreshGraph(nodes, edges)
    self.alignNewNodes()
    self.closeAllModals()

}










self.searchDevicesContextID = {};
self.searchProjectsContextID = {};
self.searchFunctionsContextID = {};
self.searchOrgsContextID = {};
self.searchResourcesContextID = {};
self.searchPeopleContextID = {};




self.searchModalSearchButton.onclick = function() {



    var searchFunctions = false;
    var searchProjects = false;
    var searchDevices = false;
    var searchOrgs = false;
    var searchResources = false;
    var searchPeople = false;
    var searchText = undefined;

    const formData = $('#searchModalForm').serializeArray()

    var formItem
    for (var i = formData.length - 1; i >= 0; i--) {
        formItem = formData[i]

        if (formItem.name == "searchFunctions") {
            searchFunctions = true;
        } else if (formItem.name == "searchProjects") {
            searchProjects = true;
        } else if (formItem.name == "searchDevices") {
            searchDevices = true;
        } else if (formItem.name == "searchOrgs") {
            searchOrgs = true;
        } else if (formItem.name == "searchModalSearchText") {
            searchText = "%" + formItem.value + "%"
        } else if (formItem.name == "searchResources") {
            searchResources = true;
        } else if (formItem.name == "searchPeople") {
            searchPeople = true;
        }



    }


    if (searchText == "%%") {
        window.alert("Please enter valid search query!")
        return
    }


    if (searchDevices) {
        self.searchDevicesFunc(searchText)
    }

    if (searchProjects) {
        self.searchProjectsFunc(searchText)
    }
    if (searchFunctions) {
        self.searchFunctionsFunc(searchText)
    }
    if (searchResources) {
        self.searchResourcesFunc(searchText)
    }

    if (searchOrgs) {
        self.searchOrgsFunc(searchText)
    }

    if (searchPeople) {
        self.searchPeopleFunc(searchText)
    }


}


self.addDevicesToTable = (item)=>{


if (self.dimoDevices[item.id] == undefined && self.searchDevicesContextID[item.id] == undefined) {

    var device_type = "N/A"
    if (item.device_device_types.length) {
        device_type = item.device_device_types[0].device_type.name
    }

    const airtableUrl = "https://airtable.com/tblBfeuQ77VxrrGAx/viwrAkUlftN8UCRvK/" + item.id

    const name = `<a href="${airtableUrl}" target="_blank">${item.name}</a>`
    const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

    var data = [checkbox, name, "[Device]", device_type, item.added_on]
    self.searchDevicesContextID[item.id] = item
    self.addRowToSearchTable(data)

}


}






self.searchDevicesFunc = (searchText) => {

    const vars = { "searchString": searchText }

    self.graphQLClient.request(self.deviceSearchQuery, vars).then((data) => {


        data.device.forEach((item) => {

            // <th>Name</th>
            // <th>Class</th>
            // <th>Type</th>
            // <th>Created On</th>
            self.addDevicesToTable(item)


        })


    })



}



self.addProjectsToTable = (item)=>{
if (self.dimoProjects[item.id] == undefined && self.searchProjectsContextID[item.id] == undefined) {
    var project_type = "N/A"
    if (item.project_project_types.length) {
        project_type = item.project_project_types[0].project_type.name
    }

    const airtableUrl = "https://airtable.com/tblpm4ls9gP94bmGA/viwbmZinIAOULOOCc/" + item.id

    const name = `<a href="${airtableUrl}" target="_blank">${item.name}</a>`
    const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

    var data = [checkbox, name, "[Project]", project_type, item.added_on]

    self.searchProjectsContextID[item.id] = item
    self.addRowToSearchTable(data)

}

}



self.searchProjectsFunc = (searchText) => {

    const vars = { "searchString": searchText }

    self.graphQLClient.request(self.projectSearchQuery, vars).then((data) => {


        data.project.forEach((item) => {

            // <th>Name</th>
            // <th>Class</th>
            // <th>Type</th>
            // <th>Created On</th>

                self.addProjectsToTable(item)


        })


    })



}


self.addFunctionsToTable = (item)=>{


            if (self.dimoFunctions[item.id] == undefined && self.searchFunctionsContextID[item.id] == undefined) {
                var function_type = "N/A"
                if (item.function_function_types.length) {
                    function_type = item.function_function_types[0].function_type.name
                }

                const airtableUrl = "https://airtable.com/tbluJQFoXFEof7rdM/viwLeV2hJyBobLFZW/" + item.id

                const name = `<a href="${airtableUrl}" target="_blank">${item.name}</a>`
                const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

                var data = [checkbox, name, "[Function]", function_type, item.added_on]

                self.searchFunctionsContextID[item.id] = item

                self.addRowToSearchTable(data)

            }

}


self.searchFunctionsFunc = (searchText) => {

    const vars = { "searchString": searchText }

    self.graphQLClient.request(self.functionSearchQuery, vars).then((data) => {


        data.function.forEach((item) => {

            // <th>Name</th>
            // <th>Class</th>
            // <th>Type</th>
            // <th>Created On</th>
            self.addFunctionsToTable(item)

        })


    })



}
self.addOrgsToTable = (item)=>{
    if (self.dimoOrgs[item.id] == undefined && self.searchOrgsContextID[item.id] == undefined) {
    
    var org_type = "N/A"
    if (item.org_org_types.length) {
        org_type = item.org_org_types[0].org_type.name
    }

    const airtableUrl = "https://airtable.com/tblJopLUVAZR2Cfa5/viwuDxJer9n8E5Eze/" + item.id

    const name = `<a href="${airtableUrl}" target="_blank">${item.name}</a>`
    const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

    var data = [checkbox, name, "[Org]", org_type, item.added_on]

    self.searchOrgsContextID[item.id] = item

    self.addRowToSearchTable(data)

}


}



self.searchOrgsFunc = (searchText) => {

    const vars = { "searchString": searchText }

    self.graphQLClient.request(self.orgSearchQuery, vars).then((data) => {


        data.organization.forEach((item) => {

            // <th>Name</th>
            // <th>Class</th>
            // <th>Type</th>
            // <th>Created On</th        
        })


    })



}

self.addResourcesToTable = (item)=>{
    if (self.dimoResources[item.id] == undefined && self.searchResourcesContextID[item.id] == undefined) {

        var resource_type = "N/A"
        if (item.resource_resource_types.length) {
            resource_type = item.resource_resource_types[0].resource_type.name
        }

        const airtableUrl = "https://airtable.com/tblAKJHMkBTTAbuXE/viwfjiEW7MrdgTysI/" + item.id

        const name = `<a href="${airtableUrl}" target="_blank">${item.name}</a>`
        const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

        var data = [checkbox, name, "[Resource]", resource_type, item.added_on]
        self.searchResourcesContextID[item.id] = item
        self.addRowToSearchTable(data)

    }

}


self.searchResourcesFunc = (searchText) => {

    const vars = { "searchString": searchText }

    self.graphQLClient.request(self.resourceSearchQuery, vars).then((data) => {


        data.resource.forEach((item) => {

            // <th>Name</th>
            // <th>Class</th>
            // <th>Type</th>
            // <th>Created On</th>
            self.addResourcesToTable(item)


        })


    })



}


self.addPeopleToTable = (item)=>{

    console.log(item)
if (self.dimoPeople[item.id] == undefined && self.searchPeopleContextID[item.id] == undefined) {

    var people_type = "N/A"
    if (item.people_people_types.length) {
        people_type = item.people_people_types[0].people_type.name
    }

    const airtableUrl = "https://airtable.com/tbldctvNPqAx3UlIm/viw0OpS8m5ttBgica/" + item.id

    const name = `<a href="${airtableUrl}" target="_blank">${item.full_name}</a>`
    const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

    var data = [checkbox, name, "[People]", people_type, item.added_on]
    self.searchPeopleContextID[item.id] = item
    self.addRowToSearchTable(data)

}


}






self.searchPeopleFunc = (searchText) => {

    const vars = { "searchString": searchText }

    self.graphQLClient.request(self.peopleSearchQuery, vars).then((data) => {

        data.people.forEach((item) => {

            // <th>Name</th>
            // <th>Class</th>
            // <th>Type</th>
            // <th>Created On</th>
            self.addPeopleToTable(item)


        })


    })



}
// END Search Modal