

self.addNodesToTable = (nodes_)=>{

    var idSet = new Set()
    var nodes = [];

    for (var i = nodes_.length - 1; i >= 0; i--) {
        
        if(!idSet.has(nodes_[i].id)){
            idSet.add(nodes_[i].id)
            nodes.push(nodes_[i])
        }
        
    }


    var node;
    for (var i = nodes.length - 1; i >= 0; i--) {
        node = nodes[i]
        
        if (node.class=="[Function]"){
            self.addFunctionsToTable(node)
        } else if (node.class=="[Org]"){
            self.addOrgsToTable(node)
        } else if (node.class=="[Device]"){
            self.addDevicesToTable(node)
        } else if (node.class=="[Project]"){
            self.addProjectsToTable(node)
        } else if (node.class=="[Resource]"){
            self.addResourcesToTable(node)
        }
    }

    



}






self.checkProjectNode = (obj_id, project, nodes, edges) => {
    var projNode = self.gqlProjectDataToNode(project)
    if (self.dimoProjects[projNode.id] == undefined) {
        if(!self.graphInit){ 

        self.dimoProjects[projNode.id] = projNode;
    }
        nodes.push(projNode)
    }
    edges.push({ "source": obj_id, "target": project.id, type: "custom-cubic" })
}


self.checkProjectNodeConnections = (project, nodes, edges) => {


    for (var j = project.function_projects.length - 1; j >= 0; j--) {

        if (self.dimoFunctions[project.function_projects[j].function.id] != undefined) {
            edges.push({ "source": project.id, "target": project.function_projects[j].function.id, type: "custom-cubic" })
        }

    }


    for (var j = project.org_projects.length - 1; j >= 0; j--) {

        if (self.dimoOrgs[project.org_projects[j].organization.id] != undefined) {
            edges.push({ "source": project.id, "target": project.org_projects[j].organization.id, type: "custom-cubic" })
        }

    }

    for (var j = project.project_devices.length - 1; j >= 0; j--) {

        if (self.dimoDevices[project.project_devices[j].device.id] != undefined) {
            edges.push({ "source": project.id, "target": project.project_devices[j].device.id, type: "custom-cubic" })
        }

    }

    for (var j = project.project_resources.length - 1; j >= 0; j--) {

        if (self.dimoResources[project.project_resources[j].resource.id] != undefined) {
            edges.push({ "source": project.id, "target": project.project_resources[j].resource.id, type: "custom-cubic" })
        }

    }


    for (var j = project.people_projects.length - 1; j >= 0; j--) {

        if (self.dimoPeople[project.people_projects[j].person.id] != undefined) {
            edges.push({ "source": project.id, "target": project.people_projects[j].person.id, type: "custom-cubic" })
        }

    }
}





self.checkFuncNode = (obj_id, func, nodes, edges) => {
    var funcNode = self.gqlFunctionDataToNode(func)
    if (self.dimoFunctions[func.id] == undefined) {
        if(!self.graphInit){ 
     self.dimoFunctions[funcNode.id] = funcNode
    }
        nodes.push(funcNode)
    }
    edges.push({ "source": obj_id, "target": func.id, type: "custom-cubic" })
}

self.checkFunctionNodeConnections = (func, nodes, edges) => {


    for (var j = func.function_projects.length - 1; j >= 0; j--) {

        if (self.dimoProjects[func.function_projects[j].project.id] != undefined) {
            edges.push({ "source": func.id, "target": func.function_projects[j].project.id, type: "custom-cubic" })
        }

    }

    for (var j = func.function_sp_orgs.length - 1; j >= 0; j--) {

        if (self.dimoOrgs[func.function_sp_orgs[j].organization.id] != undefined) {
            edges.push({ "source": func.id, "target": func.function_sp_orgs[j].organization.id, type: "custom-cubic" })
        }

    }


    for (var j = func.device_functions.length - 1; j >= 0; j--) {

        if (self.dimoDevices[func.device_functions[j].device.id] != undefined) {
            edges.push({ "source": func.id, "target": func.device_functions[j].device.id, type: "custom-cubic" })
        }

    }


    for (var j = func.functions_resources.length - 1; j >= 0; j--) {

        if (self.dimoResources[func.functions_resources[j].resource.id] != undefined) {
            edges.push({ "source": func.id, "target": func.functions_resources[j].resource.id, type: "custom-cubic" })
        }

    }
    for (var j = func.people_functions.length - 1; j >= 0; j--) {

        if (self.dimoPeople[func.people_functions[j].person.id] != undefined) {
            edges.push({ "source": func.id, "target": func.people_functions[j].person.id, type: "custom-cubic" })
        }

    }

}







self.checkOrgNode = (obj_id, org, nodes, edges) => {
    var orgNode = self.gqlOrgDataToNode(org)
    if (self.dimoOrgs[org.id] == undefined) {
        if(!self.graphInit){ 
        self.dimoOrgs[orgNode.id] = orgNode
    }
        nodes.push(orgNode)
    }
    edges.push({ "source": obj_id, "target": org.id, type: "custom-cubic" })
}

self.checkOrgNodeConnections = (org, nodes, edges) => {
    for (var j = org.device_oem_orgs.length - 1; j >= 0; j--) {

        if (self.dimoDevices[org.device_oem_orgs[j].device.id] != undefined) {
            edges.push({ "source": org.id, "target": org.device_oem_orgs[j].device.id, type: "custom-cubic" })
        }

    }


    for (var j = org.device_sp_orgs.length - 1; j >= 0; j--) {

        if (self.dimoDevices[org.device_sp_orgs[j].device.id] != undefined) {
            edges.push({ "source": org.id, "target": org.device_sp_orgs[j].device.id, type: "custom-cubic" })
        }

    }


    for (var j = org.function_sp_orgs.length - 1; j >= 0; j--) {

        if (self.dimoFunctions[org.function_sp_orgs[j].function.id] != undefined) {
            edges.push({ "source": org.id, "target": org.function_sp_orgs[j].function.id, type: "custom-cubic" })
        }

    }


    for (var j = org.org_projects.length - 1; j >= 0; j--) {

        if (self.dimoProjects[org.org_projects[j].project.id] != undefined) {
            edges.push({ "source": org.id, "target": org.org_projects[j].project.id, type: "custom-cubic" })
        }

    }


    for (var j = org.org_resources.length - 1; j >= 0; j--) {

        if (self.dimoResources[org.org_resources[j].resource.id] != undefined) {
            edges.push({ "source": org.id, "target": org.org_resources[j].resource.id, type: "custom-cubic" })
        }


    }

    for (var j = org.org_people.length - 1; j >= 0; j--) {

        if (self.dimoPeople[org.org_people[j].person.id] != undefined) {
            edges.push({ "source": org.id, "target": org.org_people[j].person.id, type: "custom-cubic" })
        }


    }
}



self.checkDeviceNode = (obj_id, device, nodes, edges) => {
    var deviceNode = self.gqlDeviceDataToNode(device);


    if (self.dimoDevices[deviceNode.id] == undefined) {

        if(!self.graphInit){ 
        self.dimoDevices[deviceNode.id] = deviceNode;
        }
        nodes.push(deviceNode)
    }

    edges.push({ "source": obj_id, "target": deviceNode.id, type: "custom-cubic" })


}
self.checkDeviceNodeConnections = (device, nodes, edges) => {
    for (var j = device.device_functions.length - 1; j >= 0; j--) {

        if (self.dimoFunctions[device.device_functions[j].function.id] != undefined) {
            edges.push({ "source": device.id, "target": device.device_functions[j].function.id, type: "custom-cubic" })
        }

    }

    for (var j = device.device_sp_orgs.length - 1; j >= 0; j--) {

        if (self.dimoOrgs[device.device_sp_orgs[j].organization.id] != undefined) {
            edges.push({ "source": device.id, "target": device.device_sp_orgs[j].organization.id, type: "custom-cubic" })
        }

    }

    for (var j = device.project_devices.length - 1; j >= 0; j--) {

        if (self.dimoProjects[device.project_devices[j].project.id] != undefined) {
            edges.push({ "source": device.id, "target": device.project_devices[j].project.id, type: "custom-cubic" })
        }

    }
    for (var j = device.people_devices.length - 1; j >= 0; j--) {

        if (self.dimoPeople[device.people_devices[j].person.id] != undefined) {
            edges.push({ "source": device.id, "target": device.people_devices[j].person.id, type: "custom-cubic" })
        }

    }


}


self.checkResourceNode = (obj_id, resource, nodes, edges) => {
    resourceNode = self.gqlResourceDataToNode(resource);

    if (self.dimoResources[resourceNode.id] == undefined) {
        if(!self.graphInit){ 
       self.dimoResources[resourceNode.id] = resourceNode;
   }
        nodes.push(resourceNode);

    }
    edges.push({ "source": obj_id, "target": resourceNode.id, type: "custom-cubic" })
}


self.checkResourceNodeConnections = (resource, nodes, edges) => {
    for (var j = resource.project_resources.length - 1; j >= 0; j--) {

        if (self.dimoProjects[resource.project_resources[j].project.id] != undefined) {
            edges.push({ "source": resource.id, "target": resource.project_resources[j].project.id, type: "custom-cubic" })
        }

    }

    for (var j = resource.functions_resources.length - 1; j >= 0; j--) {

        if (self.dimoFunctions[resource.functions_resources[j].function.id] != undefined) {
            edges.push({ "source": resource.id, "target": resource.functions_resources[j].function.id, type: "custom-cubic" })
        }

    }

    for (var j = resource.org_resources.length - 1; j >= 0; j--) {

        if (self.dimoOrgs[resource.org_resources[j].organization.id] != undefined) {
            edges.push({ "source": resource.id, "target": resource.org_resources[j].organization.id, type: "custom-cubic" })
        }

    }
}

self.checkPeopleNode = (obj_id, person, nodes, edges) => {
    peopleNode = self.gqlPeopleDataToNode(person);

    if (self.dimoPeople[peopleNode.id] == undefined) {
        if(!self.graphInit){ 
       self.dimoPeople[peopleNode.id] = peopleNode;
   }
        nodes.push(peopleNode);

    }
    edges.push({ "source": obj_id, "target": peopleNode.id, type: "custom-cubic" })
}


self.checkPeopleNodeConnections = (person, nodes, edges) => {


    for (var j = person.people_projects.length - 1; j >= 0; j--) {

        if (self.dimoProjects[person.people_projects[j].project.id] != undefined) {
            edges.push({ "source": person.id, "target": person.people_projects[j].project.id, type: "custom-cubic" })
        }

    }
    for (var j = person.org_people.length - 1; j >= 0; j--) {

        if (self.dimoOrgs[person.org_people[j].organization.id] != undefined) {
            edges.push({ "source": person.id, "target": person.org_people[j].organization.id, type: "custom-cubic" })
        }

    }
    for (var j = person.people_devices.length - 1; j >= 0; j--) {

        if (self.dimoDevices[person.people_devices[j].device.id] != undefined) {
            edges.push({ "source": person.id, "target": person.people_devices[j].device.id, type: "custom-cubic" })
        }

    }
    for (var j = person.people_functions.length - 1; j >= 0; j--) {

        if (self.dimoFunctions[person.people_devices[j].function.id] != undefined) {
            edges.push({ "source": person.id, "target": person.people_devices[j].function.id, type: "custom-cubic" })
        }

    }


}



self.loadDimoResource = (resource_id, nodes, edges, initial = true) => {



    const vars = { "resource_id": resource_id }

    self.graphQLClient.request(self.resourceFullQuery, vars).then(



        function(data) {

            var rawData = [];


            var resource = data.resource[0];
            var resourceNode = self.gqlResourceDataToNode(resource);
            if (initial) {
                self.dimoResources[resourceNode.id] = resourceNode
                nodes.push(resourceNode)
            }


            var project
            for (var i = resource.project_resources.length - 1; i >= 0; i--) {
                project = resource.project_resources[i].project;
                project.class = "[Project]"
                rawData.push(project)
                self.checkProjectNode(resource.id, project, nodes, edges)

            }

            var func
            for (var i = resource.functions_resources.length - 1; i >= 0; i--) {
                func = resource.functions_resources[i].function;
                func.class = "[Function]"
                rawData.push(func)
                self.checkFuncNode(resource.id, func, nodes, edges)
            }

            var org
            for (var i = resource.org_resources.length - 1; i >= 0; i--) {
                org = resource.org_resources[i].organization;
                org.class = "[Org]"
                rawData.push(org)
                self.checkOrgNode(resource.id, org, nodes, edges)

            }

            for (var i = resource.project_resources.length - 1; i >= 0; i--) {
                project = resource.project_resources[i].project;
                project.class = "[Project]"
                rawData.push(project)
                self.checkProjectNodeConnections(project, nodes, edges)
            }


            for (var i = resource.functions_resources.length - 1; i >= 0; i--) {
                func = resource.functions_resources[i].function;
                self.checkFunctionNodeConnections(func, nodes, edges)
            }

            for (var i = resource.org_resources.length - 1; i >= 0; i--) {
                org = resource.org_resources[i].organization;
                self.checkOrgNodeConnections(org, nodes, edges)

            }


            if (initial) {
                self.initGraph(nodes, edges);
            } else {
                self.addNodesToTable(rawData);;
            }
        })
}




self.loadDimoProject = (project_id, nodes, edges, initial = true) => {
    const vars = { "proj_id": project_id }
    self.graphQLClient.request(self.projectFullQuery, vars).then(

        function(data) {
            console.info("[Project] Request", data);


            var rawData = [];

            var proj = data.project[0];
            var projNode = self.gqlProjectDataToNode(proj);
            if (initial) {


                self.dimoProjects[projNode.id] = projNode
                nodes.push(projNode)

            }

            var device
            for (var i = proj.project_devices.length - 1; i >= 0; i--) {

                device = proj.project_devices[i].device;
                device.class = "[Device]"
                rawData.push(device)
                self.checkDeviceNode(proj.id, device, nodes, edges)
            }


            var func
            for (var i = proj.function_projects.length - 1; i >= 0; i--) {
                func = proj.function_projects[i].function;
                func.class = "[Function]"
                rawData.push(func)
                self.checkFuncNode(proj.id, func, nodes, edges)
            }


            var org

            for (var i = proj.org_projects.length - 1; i >= 0; i--) {
                
                org = proj.org_projects[i].organization;
               org.class = "[Org]"
                rawData.push(org)
               self.checkOrgNode(proj.id, org, nodes, edges)
            }



            var resource

            for (var i = proj.project_resources.length - 1; i >= 0; i--) {
                resource = proj.project_resources[i].resource;
                resource.class = "[Resource]"
                rawData.push(resource)
                self.checkResourceNode(proj.id, resource, nodes, edges)
            }

            var person

            for (var i = proj.people_projects.length - 1; i >= 0; i--) {
                person = proj.people_projects[i].person;
                person.class = "[People]"
                rawData.push(person)
                self.checkPeopleNode(proj.id, person, nodes, edges)
            }




            for (var i = proj.project_devices.length - 1; i >= 0; i--) {
                device = proj.project_devices[i].device;
                self.checkDeviceNodeConnections(device, nodes, edges)
            }


            for (var i = proj.function_projects.length - 1; i >= 0; i--) {
                func = proj.function_projects[i].function;
                self.checkFunctionNodeConnections(func, nodes, edges)

            }



            for (var i = proj.org_projects.length - 1; i >= 0; i--) {
                org = proj.org_projects[i].organization;
                self.checkOrgNodeConnections(org, nodes, edges)
            }





            for (var i = proj.project_resources.length - 1; i >= 0; i--) {
                resource = proj.project_resources[i].resource;
                self.checkResourceNodeConnections(resource, nodes, edges)
            }

            for (var i = proj.people_projects.length - 1; i >= 0; i--) {
                person = proj.people_projects[i].person;
                self.checkPeopleNodeConnections(person, nodes, edges)
            }


            if (initial) {
                self.initGraph(nodes, edges);
            } else {
                self.addNodesToTable(rawData);;
            }
        })

}



self.loadDimoOrg = (org_id, nodes, edges, initial = true) => {

    const vars = { "org_id": org_id }
    self.graphQLClient.request(self.orgFullQuery, vars).then(

        function(data) {

            var org = data.organization[0];
            var orgNode = self.gqlOrgDataToNode(org);

            rawData = [];
            if (initial) {

                self.dimoOrgs[orgNode.id] = orgNode
                nodes.push(orgNode)
            }

            var device
            for (var i = org.device_oem_orgs.length - 1; i >= 0; i--) {

                device = org.device_oem_orgs[i].device;
                device.class = "[Device]"
                rawData.push(device)
                self.checkDeviceNode(orgNode.id, device, nodes, edges)

            }

            for (var i = org.device_sp_orgs.length - 1; i >= 0; i--) {

                device = org.device_sp_orgs[i].device;
                device.class = "[Device]"
                rawData.push(device)
                self.checkDeviceNode(orgNode.id, device, nodes, edges)

            }


            var func

            for (var i = org.function_sp_orgs.length - 1; i >= 0; i--) {
                func = org.function_sp_orgs[i].function;
                func.class = "[Function]"
                rawData.push(func)
                self.checkFuncNode(orgNode.id, func, nodes, edges)

            }


            var project

            for (var i = org.org_projects.length - 1; i >= 0; i--) {
                project = org.org_projects[i].project;
                project.class = "[Project]"
                rawData.push(project)
                self.checkProjectNode(orgNode.id, project, nodes, edges)
            }

            var resource
            for (var i = org.org_resources.length - 1; i >= 0; i--) {
                resource = org.org_resources[i].resource;
                resource.class = "[Resource]"
                rawData.push(resource)
                self.checkResourceNode(orgNode.id, resource, nodes, edges)
            }

            var person
            for (var i = org.org_people.length - 1; i >= 0; i--) {
                person = org.org_people[i].person;
                person.class = "[People]"
                rawData.push(person)
                self.checkPeopleNode(orgNode.id, person, nodes, edges)
            }


            for (var i = org.function_sp_orgs.length - 1; i >= 0; i--) {
                func = org.function_sp_orgs[i].function;
                self.checkFunctionNodeConnections(func, nodes, edges)
            }


            for (var i = org.device_oem_orgs.length - 1; i >= 0; i--) {
                device = org.device_oem_orgs[i].device;
                self.checkDeviceNodeConnections(device, nodes, edges)
            }


            for (var i = org.org_projects.length - 1; i >= 0; i--) {
                project = org.org_projects[i].project;
                self.checkProjectNodeConnections(project, nodes, edges)
            }

            for (var i = org.org_people.length - 1; i >= 0; i--) {
                person = org.org_people[i].person;
                self.checkPeopleNodeConnections(person, nodes, edges)
            }

            if (initial) {
                self.initGraph(nodes, edges);
            } else {
                self.addNodesToTable(rawData);;
            }
        })
}


self.loadDimoFunction = (function_id, nodes, edges, initial = true) => {



    const vars = { "function_id": function_id }
    self.graphQLClient.request(self.functionFullQuery, vars).then(



        function(data) {


            var func = data.function[0];
            var funcNode = self.gqlFunctionDataToNode(func);
            var rawData = []
            if (initial) {

                self.dimoFunctions[funcNode.id] = funcNode
                nodes.push(funcNode)
            }


            var device
            for (var i = func.device_functions.length - 1; i >= 0; i--) {

                device = func.device_functions[i].device;
                device.class = "[Device]"
                rawData.push(device)
                self.checkDeviceNode(func.id, device, nodes, edges)
            }



            var project
            for (var i = func.function_projects.length - 1; i >= 0; i--) {

                project = func.function_projects[i].project;
                project.class = "[Project]"
                rawData.push(project)
                self.checkProjectNode(func.id, project, nodes, edges)

            }

            var org
            for (var i = func.function_sp_orgs.length - 1; i >= 0; i--) {
                org = func.function_sp_orgs[i].organization;
                org.class = "[Org]"
                rawData.push(org)
                self.checkOrgNode(func.id, org, nodes, edges)
            }



            var resource

            for (var i = func.functions_resources.length - 1; i >= 0; i--) {
                resource = func.functions_resources[i].resource;
                org.class = "[Org]"
                rawData.push(org)
                self.checkResourceNode(func.id, resource, nodes, edges)
            }


            var person

            for (var i = func.people_functions.length - 1; i >= 0; i--) {
                person = func.people_functions[i].person;
                person.class = "[People]"
                rawData.push(person)
                self.checkPeopleNode(func.id, person, nodes, edges)
            }


            for (var i = func.device_functions.length - 1; i >= 0; i--) {
                device = func.device_functions[i].device;
                self.checkDeviceNodeConnections(device, nodes, edges)

            }


            for (var i = func.function_projects.length - 1; i >= 0; i--) {
                project = func.function_projects[i].project;
                self.checkProjectNodeConnections(project, nodes, edges)

            }

            for (var i = func.function_sp_orgs.length - 1; i >= 0; i--) {
                org = func.function_sp_orgs[i].organization;
                self.checkOrgNodeConnections(org, nodes, edges)
            }



            for (var i = func.functions_resources.length - 1; i >= 0; i--) {
                resource = func.functions_resources[i];
                self.checkResourceNodeConnections(resource, nodes, edges)

            }

            for (var i = func.people_functions.length - 1; i >= 0; i--) {
                person = func.people_functions[i];
                self.checkResourceNodeConnections(person, nodes, edges)

            }


            if (initial) {
                self.initGraph(nodes, edges);
            } else {
                self.addNodesToTable(rawData);;
            }




        })
}





self.loadDimoDevice = (device_id, nodes, edges, initial = true) => {
    const vars = { "device_id": device_id }
    self.graphQLClient.request(self.deviceFullQuery, vars).then(

        function(data) {
            var device = data.device[0];
            var devNode = self.gqlDeviceDataToNode(device);
            var rawData = [];
            if (initial) {

                self.dimoDevices[devNode.id] = devNode
                nodes.push(devNode)
            }

            var func
            for (var i = device.device_functions.length - 1; i >= 0; i--) {

                func = device.device_functions[i].function;
                func.class = "[Function]"
                rawData.push(func)
                self.checkFuncNode(devNode.id, func, nodes, edges)
            }

            var org
            for (var i = device.device_oem_orgs.length - 1; i >= 0; i--) {

                org = device.device_oem_orgs[i].organization;
                org.class = "[Org]"
                rawData.push(org)
                self.checkOrgNode(devNode.id, org, nodes, edges)
            }


            for (var i = device.device_sp_orgs.length - 1; i >= 0; i--) {

                org = device.device_sp_orgs[i].organization;
                org.class = "[Org]"
                rawData.push(org)
                self.checkOrgNode(devNode.id, org, nodes, edges)
            }

            var project
            for (var i = device.project_devices.length - 1; i >= 0; i--) {

                project = device.project_devices[i].project;
                project.class = "[Project]"
                rawData.push(project)
                self.checkProjectNode(devNode.id, project, nodes, edges)

            }

            var person
            for (var i = device.people_devices.length - 1; i >= 0; i--) {

                person = device.people_devices[i].person;
                person.class = "[People]"
                rawData.push(person)
                self.checkPeopleNode(devNode.id, person, nodes, edges)

            }



            for (var i = device.device_functions.length - 1; i >= 0; i--) {
                func = device.device_functions[i].function;
                self.checkFunctionNodeConnections(func, nodes, edges)
            }


            for (var i = device.device_oem_orgs.length - 1; i >= 0; i--) {
                org = device.device_oem_orgs[i].organization;
                self.checkOrgNodeConnections(org, nodes, edges)

            }

            for (var i = device.device_sp_orgs.length - 1; i >= 0; i--) {
                org = device.device_sp_orgs[i].organization;
                self.checkOrgNodeConnections(org, nodes, edges)

            }

            for (var i = device.project_devices.length - 1; i >= 0; i--) {
                project = device.project_devices[i].project;
                self.checkProjectNodeConnections(project, nodes, edges)

            }

            for (var i = device.people_devices.length - 1; i >= 0; i--) {
                person = device.people_devices[i].person;
                self.checkPeopleNodeConnections(person, nodes, edges)

            }


            if (initial) {
                self.initGraph(nodes, edges);
            } else {
                self.addNodesToTable(rawData);
            }




        })

}

self.loadDimoPerson = (person_id, nodes, edges, initial = true) => {



    const vars = { "person_id": person_id }

    self.graphQLClient.request(self.peopleFullQuery, vars).then(



        function(data) {

            var rawData = [];


            var person = data.people[0];
            var personNode = self.gqlPeopleDataToNode(person);
            if (initial) {
                self.dimoPeople[personNode.id] = personNode
                nodes.push(personNode)
            }


            var project
            for (var i = person.people_projects.length - 1; i >= 0; i--) {
                project = person.people_projects[i].project;
                project.class = "[Project]"
                rawData.push(project)
                self.checkProjectNode(person.id, project, nodes, edges)

            }

            var func
            for (var i = person.people_functions.length - 1; i >= 0; i--) {
                func = person.people_functions[i].function;
                func.class = "[Function]"
                rawData.push(func)
                self.checkFuncNode(person.id, func, nodes, edges)
            }

            var org
            for (var i = person.org_people.length - 1; i >= 0; i--) {
                org = person.org_people[i].organization;
                org.class = "[Org]"
                rawData.push(org)
                self.checkOrgNode(person.id, org, nodes, edges)

            }

            for (var i = person.people_projects.length - 1; i >= 0; i--) {
                project = person.people_projects[i].project;
                self.checkProjectNodeConnections(project, nodes, edges)
            }


            for (var i = person.people_functions.length - 1; i >= 0; i--) {
                func = person.people_functions[i].function;
                self.checkFunctionNodeConnections(func, nodes, edges)
            }

            for (var i = person.org_people.length - 1; i >= 0; i--) {
                org = person.org_people[i].organization;
                self.checkOrgNodeConnections(org, nodes, edges)

            }


            if (initial) {
                self.initGraph(nodes, edges);
            } else {
                self.addNodesToTable(rawData);;
            }
        })
}




