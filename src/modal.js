import { GraphQLClient, gql, request } from 'graphql-request'




self.settingsModal = document.getElementById("settingsModal");

// Get the <span> element that closes the modal
self.settingsModalCloseButton = document.getElementById("settingsModalCloseButton");

// When the user clicks on the button, open the modal 
self.settingsModalOpen = function() {
  self.settingsModal.style.display = "block";
  window.modalOpen = true
}

// When the user clicks on <span> (x), close the modal
self.settingsModalCloseButton.onclick = function() {
  self.settingsModal.style.display = "none";
  window.modalOpen = false
}



self.searchModal = document.getElementById("searchModal");

// Get the <span> element that closes the modal
self.searchModalCloseButton = document.getElementById("searchModalCloseButton");


// When the user clicks on the button, open the modal 
self.searchModalOpen = function() {
  self.searchModal.style.display = "block";
  window.modalOpen = true
}

// When the user clicks on <span> (x), close the modal
self.searchModalCloseButton.onclick = function() {
  self.searchModal.style.display = "none";
  window.modalOpen = false
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == self.searchModal) {
    self.searchModal.style.display = "none";
    window.modalOpen = false
  }
  if (event.target == self.settingsModal) {
    self.settingsModal.style.display = "none";
    window.modalOpen = false
  }
  
}





// START Search Modal

self.searchModalSearchButton = document.getElementById("searchModalSearchButton");
self.searchModalClearButton = document.getElementById("searchModalClearButton");
self.searchModalAddButton = document.getElementById("searchModalSaveButton");
self.searchModalSearchText = document.getElementById("searchModalSearchText");



self.searchModalSearchText.addEventListener("keyup", function(event) {
  if (event.keyCode === 13) {
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



self.searchTableConvDeviceToNode = (id,index)=>{
    const device = self.searchDevicesContextID[id]
    var devNode = self.gqlDeviceDataToNode(device);    
    return [device,devNode]
}

self.searchTableConvProjectToNode = (id,index)=>{
    const project = self.searchProjectsContextID[id]
    var projNode = self.gqlProjectDataToNode(project);    
    return [project,projNode]
}

self.searchTableConvFunctionToNode = (id,index)=>{
    const func = self.searchFunctionsContextID[id]
    var funcNode = self.gqlFunctionDataToNode(func);    
    return [func,funcNode]
}

self.searchTableConvOrgToNode = (id,index)=>{
    const org = self.searchOrgsContextID[id]
    var orgNode = self.gqlOrgDataToNode(org);    
    return [org,orgNode]
}




self.searchModalAddButton.onclick = function() {
    var selectedRows, indexes

    var nodes = [];
    var edges = [];

    var objs = [];

    var resp = self.getSelectedRowsDatatable()
    indexes = resp[0]
    selectedRows = resp[1]

    var row, tds, id, type, node, edges_, obj
    for (var i = selectedRows.length - 1; i >= 0; i--) {
        row = selectedRows[i]
        tds = row.getElementsByTagName("td")
        id = tds[0].getElementsByClassName("div-id")[0].id
        type = tds[2].textContent

        if (type=="[Device]") {
            [obj,node] = self.searchTableConvDeviceToNode(id,indexes[i])
            self.dimoDevices[node.id] = node
            nodes.push(node)
            objs.push(obj)
        } else if (type=="[Project]") {
            [obj,node] = self.searchTableConvProjectToNode(id,indexes[i])
            self.dimoProjects[node.id] = node
            nodes.push(node)
            objs.push(obj)
        } else if (type=="[Function]") {
            [obj,node] = self.searchTableConvFunctionToNode(id,indexes[i])
            self.dimoFunctions[node.id] = node
            nodes.push(node)
            objs.push(obj)
        } else if (type=="[Org]") {
            [obj,node] = self.searchTableConvOrgToNode(id,indexes[i])
            self.dimoOrgs[node.id] = node
            nodes.push(node)
            objs.push(obj)
        }


    }


    for (var i = nodes.length - 1; i >= 0; i--) {
        obj = objs[i]
        if (nodes[i].class == "[Device]"){
        edges_ = self.getDeviceEdges(obj)
        edges = [...edges, ...edges_];         
        } else if (nodes[i].class == "[Project]"){
        edges_ = self.getProjectEdges(obj)
        edges = [...edges, ...edges_];         
        } else if (nodes[i].class == "[Function]"){
        edges_ = self.getFunctionEdges(obj)
        edges = [...edges, ...edges_];         
        } else if (nodes[i].class == "[Org]"){
        edges_ = self.getOrgEdges(obj)
        edges = [...edges, ...edges_];         
        }




    }

    self.removeRowsByIndexes(indexes)

    self.cachePositions = self.cacheNodePositions(graph.getNodes());
    self.refreshGraph(nodes,edges)

    
}










self.searchDevicesContextID = {};
self.searchProjectsContextID = {};
self.searchFunctionsContextID = {};
self.searchOrgsContextID = {};


const deviceSearchQuery = gql`query graphVizDeviceSearch($searchString: String!) {
  device(where: {name: {_ilike: $searchString}}) {
    added_by
    added_on
    assigned_to
    cost
    description
    wallet_address
    valid
    tags
    notes
    name
    marketing_description
    listing_url
    last_modified_on
    last_modified_by
    image
    id
    device_device_types {
      device_type {
        id
        name
        icon
      }
    }
    device_functions {
      function {
        id
        name
      }
    }
    device_oem_orgs {
      organization {
        id
        name
      }
    }
    device_sp_orgs {
      organization {
        id
        name
      }
    }
    project_devices {
      project {
        id
        name
      }
    }
  }
}`


const projectSearchQuery = gql`query graphVizProjectSearch($searchString: String!) {
  project(where: {name: {_ilike: $searchString}}) {
    access
    added_by
    added_on
    anchor_address
    area_image
    assigned_to
    contacts
    cover_photo
    dimo_rating
    description
    geocode_cache
    geospatial_data
    id
    implementation_target_rating
    import_source_url
    name
    last_modified_on
    last_modified_by
    tags
    sla
    regulator_orgs
    project_screenshots
    zone_area_kml
    wallet_address
    version_history
    valid
    underwriting_model
    thumbnail
    project_website
    project_project_types {
      project_type {
        id
        icon
        name
      }
    }
    function_projects {
      function {
        id
        name
      }
    }
    org_projects {
      organization {
        id
        name
      }
    }
    project_devices {
      device {
        id
        name
      }
    }
  }
}`



const orgSearchQuery = gql`query graphvizOrgSearchQuery($searchString: String!) {
  organization(where: {name: {_ilike: $searchString}}) {
    added_by
    added_on
    assigned_to
    bd_tier
    category_example
    capital_raised
    crunchbase_profile
    company_tagline
    company_email
    devices_page
    employees
    functions_page
    github
    headquarters
    id
    job_board_used
    job_board_link_status
    last_modified_by
    last_modified_on
    logo
    linkedn
    name
    naics_code
    logo_url
    org_chart_link
    product_picture
    website
    wallet_address
    valid
    twitter_handle
    team_page_url
    tags
    summary_video
    sales_outreach
    product_service_description
    org_org_types {
      org_type {
        icon
        name
        id
      }
    }
    device_oem_orgs {
      device {
        id
        name
      }
    }
    device_sp_orgs {
      device {
        id
        name
      }
    }
    function_sp_orgs {
      function {
        name
        id
      }
    }
    org_projects {
      project {
        id
        name
      }
    }
  }
}

`


const functionSearchQuery = gql`query graphvizFunctionQuery($searchString: String!) {
  function(where: {name: {_ilike: $searchString}}) {
    UI_screenshot
    added_by
    added_on
    assigned_to
    cover_photo
    cost_model
    blueprint_url
    blueprint_file
    description
    name
    ongoing_monthly_subscription
    last_modified_on
    last_modified_by
    id
    icon
    github
    priority
    wallet_address
    valid
    upfront_price_credits_to_engage
    tags
    source_url
    size
    sample_output
    function_function_types {
      function_type {
        icon
        id
        name
      }
    }
    device_functions {
      device {
        name
        id
      }
    }
    function_projects {
      project {
        name
        id
      }
    }
    function_sp_orgs {
      organization {
        name
        id
      }
    }
  }
}

`

self.searchModalSearchButton.onclick = function() {

    var searchFunctions = false;
    var searchProjects = false;
    var searchDevices = false;
    var searchOrgs = false;

    var searchText = undefined;


    const formData = $('#searchModalForm').serializeArray()
    
    var formItem
    for (var i = formData.length - 1; i >= 0; i--) {
        formItem = formData[i]

        if(formItem.name=="searchFunctions"){
          searchFunctions = true;
        } else if(formItem.name=="searchProjects"){
          searchProjects = true;
        } else if(formItem.name=="searchDevices"){
          searchDevices = true;
        } else if(formItem.name=="searchOrgs"){
          searchOrgs = true;
        } else if(formItem.name=="searchModalSearchText") {
          searchText = "%" + formItem.value + "%"
        }



    }


    if(searchText=="%%") {
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
    if (searchOrgs) {
      self.searchOrgsFunc(searchText)
    }


}


self.searchDevicesFunc = (searchText) => {

  const vars = { "searchString": searchText }

  self.graphQLClient.request(deviceSearchQuery, vars).then((data)=>{


      data.device.forEach((item)=>{

        // <th>Name</th>
        // <th>Class</th>
        // <th>Type</th>
        // <th>Created On</th>


        if (self.dimoDevices[item.id] == undefined && self.searchDevicesContextID[item.id] == undefined){

              var device_type = "N/A"
              if(item.device_device_types.length){
                device_type = item.device_device_types[0].device_type.name
              }

              const airtableUrl = "https://airtable.com/tblBfeuQ77VxrrGAx/viwrAkUlftN8UCRvK/" + item.id

              const name = `<a href="${airtableUrl}" target="_blank">${item.name}</a>`
              const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

              var data = [checkbox,name,"[Device]",device_type,item.added_on]
              self.searchDevicesContextID[item.id] = item
              self.addRowToSearchTable(data)

          }
      })


  })



}




self.searchProjectsFunc = (searchText) => {

  const vars = { "searchString": searchText }

  self.graphQLClient.request(projectSearchQuery, vars).then((data)=>{


      data.project.forEach((item)=>{

        // <th>Name</th>
        // <th>Class</th>
        // <th>Type</th>
        // <th>Created On</th>

        
        if (self.dimoProjects[item.id] == undefined && self.searchProjectsContextID[item.id] == undefined){
              var project_type = "N/A"
              if(item.project_project_types.length){
                project_type = item.project_project_types[0].project_type.name
              }

              const airtableUrl = "https://airtable.com/tblpm4ls9gP94bmGA/viwbmZinIAOULOOCc/" + item.id

              const name = `<a href="${airtableUrl}" target="_blank">${item.name}</a>`
              const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

              var data = [checkbox,name,"[Project]",project_type,item.added_on]

              self.searchProjectsContextID[item.id] = item              
              self.addRowToSearchTable(data)

          }
      })


  })



}

self.searchFunctionsFunc = (searchText) => {

  const vars = { "searchString": searchText }

  self.graphQLClient.request(functionSearchQuery, vars).then((data)=>{


      data.function.forEach((item)=>{

        // <th>Name</th>
        // <th>Class</th>
        // <th>Type</th>
        // <th>Created On</th>

        
        if (self.dimoFunctions[item.id] == undefined && self.searchFunctionsContextID[item.id] == undefined){
              var function_type = "N/A"
              if(item.function_function_types.length){
                function_type = item.function_function_types[0].function_type.name
              }

              const airtableUrl = "https://airtable.com/tbluJQFoXFEof7rdM/viwLeV2hJyBobLFZW/" + item.id

              const name = `<a href="${airtableUrl}" target="_blank">${item.name}</a>`
              const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

              var data = [checkbox,name,"[Function]",function_type,item.added_on]

              self.searchFunctionsContextID[item.id] = item
              
              self.addRowToSearchTable(data)

          }
      })


  })



}


self.searchOrgsFunc = (searchText) => {

  const vars = { "searchString": searchText }

  self.graphQLClient.request(orgSearchQuery, vars).then((data)=>{


      data.organization.forEach((item)=>{

        // <th>Name</th>
        // <th>Class</th>
        // <th>Type</th>
        // <th>Created On</th        
        if (self.dimoOrgs[item.id] == undefined && self.searchOrgsContextID[item.id] == undefined){
              var org_type = "N/A"
              if(item.org_org_types.length){
                org_type = item.org_org_types[0].org_type.name
              }

              const airtableUrl = "https://airtable.com/tblJopLUVAZR2Cfa5/viwuDxJer9n8E5Eze/" + item.id

              const name = `<a href="${airtableUrl}" target="_blank">${item.name}</a>`
              const checkbox = `<div class="div-id" id="${item.id}" type="id"></div>`

              var data = [checkbox,name,"[Org]",org_type,item.added_on]

              self.searchOrgsContextID[item.id] = item
              
              self.addRowToSearchTable(data)

          }
      })


  })



}






// END Search Modal
















