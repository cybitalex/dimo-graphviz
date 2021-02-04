import React from 'react';
import ReactDOM from 'react-dom';
import App from './tutorital.jsx';
import { GraphQLClient, gql, request } from 'graphql-request'
import Airtable from 'airtable'



function convertData(data) {
    //self.dimoGraphData.nodes.push({"id":org.id,size:50,type:"rect",label:org.name.slice(0,20)});
    self.orgs = {};
    self.projects = {};
    self.tasks = {};
    self.devices = {};
    self.functions = {};
    self.dimoGraphData = { nodes: [], edges: [] };
    var proj;


    for (var i = data.project.length - 1; i >= 0; i--) {
        proj = data.project[i]
        self.projects[proj.id] = proj

        // [Projects]
        self.dimoGraphData.nodes.push({ "id": proj.id, 
                                        size: [200,50],
                                        linkPoints: {
                                          top: true,
                                          bottom: true,
                                          left: true,
                                          right: true,
                                          size: 5,
                                        },
                                        preRect: {
                                          // false means hiding it
                                          show: true,
                                          fill: '#187a24',
                                          width: 8,
                                        },
                                        stateIcon: {
                                            show: true,
                                            img:"https://api.iconify.design/mdi-crane.svg",
                                            width:32,
                                            height:32
                                        },
                                        logoIcon : {
                                            show:false
                                        },
                                        style: {
                                            fill: '#72CC4A', 
                                            opacity: 0.3,
                                            lineWidth: 2
                                        }, 
                                        type: "modelRect", 
                                        label: proj.name,
                                        labelCfg: { 
                                            style: { 
                                                fill: '#000000A6', 
                                                fontSize: 10 
                                            }
                                        }
                                    })


        for (var j = proj.function_projects.length - 1; j >= 0; j--) {
            if (self.rubyFunctions.indexOf(proj.function_projects[j].function.id) >= 0) {
                self.dimoGraphData.edges.push({ source: proj.id, target: proj.function_projects[j].function.id })
            }
        }


        for (var k = proj.project_devices.length - 1; k >= 0; k--) {
            if (self.rubyDevices.indexOf(proj.project_devices[k].device.id) >= 0) {
                self.dimoGraphData.edges.push({ source: proj.id, target: proj.project_devices[k].device.id })
            }
        }

        for (var k = proj.org_projects.length - 1; k >= 0; k--) {
            if (self.rubyOrgs.indexOf(proj.org_projects[k].organization.id) >= 0) {
                self.dimoGraphData.edges.push({ source: proj.id, target: proj.org_projects[k].organization.id })
            }
        }


    }

    var org;
    for (var i = data.organization.length - 1; i >= 0; i--) {
        org = data.organization[i]
        self.orgs[org.id] = org
        // [Orgs]
        console.log("logo",org.logo)
        self.dimoGraphData.nodes.push({ "id": org.id,
                                        size: [200,50], 
                                        style: {
                                            fill: '#6600FF', 
                                            opacity: 0.3,
                                            lineWidth: 2 
                                        }, 
                                        linkPoints: {
                                          top: true,
                                          bottom: true,
                                          left: true,
                                          right: true,
                                          size: 5,
                                        },
                                        preRect: {
                                          // false means hiding it
                                          show: true,
                                          fill: '#f759ab',
                                          width: 8,
                                        },
                                        stateIcon: {
                                            show: true,
                                            img:"https://dl.airtable.com/.attachmentThumbnails/f17c35f9affd107e60b57b5ac91e84aa/03673739",
                                            width:32,
                                            height:32
                                        },
                                        logoIcon: {
                                            show:true,
                                            img:org.logo[0],
                                            width:32,
                                            height:32,
                                            offset:-10
                                        },
                                        type: "modelRect", 
                                        label: org.name, 
                                        labelCfg: { 
                                            style: { 
                                                fill: '#000000A6', 
                                                fontSize: 10 
                                            } 
                                        } 
                                    })

        for (var k = org.device_sp_orgs.length - 1; k >= 0; k--) {
            if (self.rubyDevices.indexOf(org.device_sp_orgs[k].device.id) >= 0) {
                self.dimoGraphData.edges.push({ source: org.id, target: org.device_sp_orgs[k].device.id })
            }
        }
        for (var k = org.device_oem_orgs.length - 1; k >= 0; k--) {
            if (self.rubyDevices.indexOf(org.device_oem_orgs[k].device.id) >= 0) {
                self.dimoGraphData.edges.push({ source: org.id, target: org.device_oem_orgs[k].device.id })
            }
        }

        for (var j = org.function_sp_orgs.length - 1; j >= 0; j--) {
            if (self.rubyFunctions.indexOf(org.function_sp_orgs[j].function.id) >= 0) {
                self.dimoGraphData.edges.push({ source: org.id, target: org.function_sp_orgs[j].function.id })
            }
        }

    }


    var function_;
    for (var i = data.function.length - 1; i >= 0; i--) {
        function_ = data.function[i]
        self.functions[function_.id] = function_
        //[Functions]
        self.dimoGraphData.nodes.push({ "id": function_.id, 
                                        size: [200,50],
                                        style: {  
                                            fill: '#FF6600', 
                                            opacity: 0.3,
                                            lineWidth:2
                                        }, 
                                        linkPoints: {
                                          top: true,
                                          bottom: true,
                                          left: true,
                                          right: true,
                                          size: 5,
                                        },
                                        preRect: {
                                          // false means hiding it
                                          show: true,
                                          fill: '#96430c',
                                          width: 8,
                                        },
                                        stateIcon: {
                                            show: true,
                                            img:"https://api.iconify.design/mdi-function.svg",
                                            width:32,
                                            height:32
                                        },
                                        logoIcon: {
                                            show:false
                                        },
                                        type: "modelRect", 
                                        label: function_.name, 
                                        labelCfg: { 
                                            style: { 
                                                fill: '#000000A6', 
                                                fontSize: 10
                                            } 
                                        } 
                                    })


        for (var k = function_.device_functions.length - 1; k >= 0; k--) {
            if (self.rubyDevices.indexOf(function_.device_functions[k].device.id) >= 0) {
                self.dimoGraphData.edges.push({ source: function_.id, target: function_.device_functions[k].device.id })
            }
        }


    }

    var device;
    for (var i = data.device.length - 1; i >= 0; i--) {
        device = data.device[i]
        self.devices[device.id] = device
        //[Device]
        self.dimoGraphData.nodes.push({ "id": device.id, 
                                        size: [200,50],
                                        style: {  
                                            fill: '#3333FF', 
                                            opacity: 0.3,
                                            lineWidth:2
                                        }, 
                                        linkPoints: {
                                          top: true,
                                          bottom: true,
                                          left: true,
                                          right: true,
                                          size: 5,
                                        },
                                        preRect: {
                                          // false means hiding it
                                          show: true,
                                          fill: '#050585',
                                          width: 8,
                                        },
                                        stateIcon: {
                                            show: true,
                                            img:"https://api.iconify.design/mdi-chip.svg",
                                            height:32,
                                            width:32
                                        },
                                        logoIcon: {
                                            show:false
                                        },
                                        type: "modelRect", 
                                        label: device.name, 
                                        labelCfg: { 
                                            style: { 
                                                fill: '#000000A6', 
                                                fontSize: 10 
                                            } 
                                        } 
                                    })
    


    }


}




// const query = gql`query MyQuery {
//   organization(limit: 5000) {
//     id
//     added_on
//     category_example
//     headquarters
//     linkedn
//     name
//     logo_url
//     github
//     devices_page
//     employees
//     crunchbase_profile
//     company_tagline
//     bd_tier
//     company_email
//     naics_code
//     logo
//     featured_project_link
//     capital_raised
//     org_chart_link
//     product_picture
//     product_service_description
//     sales_outreach
//     tags
//     team_page_url
//     twitter_handle
//     website
//     summary_video
//     org_projects {
//       project {
//         id
//         access
//         cover_photo
//         contacts
//         area_image
//         anchor_address
//         description
//         geocode_cache
//         geospatial_data
//         import_source_url
//         name
//         tags
//         sla
//         project_website
//         thumbnail
//         zone_area_kml
//       }
//     }
//   }
// }`;










var base = new Airtable({ apiKey: 'keyj1h87CLBk93l5J' }).base('appLOrOaNnL354pHl');


self.rubyProjects = [];
self.didProjects = false;
var total_proj = 0;
base('[Projects]').select({
    // Selecting the first 3 records in Grid view:
    view: "Project Ruby"
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
        //console.log('Retrieved', record.id);
        self.rubyProjects.push(record.id);
        total_proj += 1;
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
    console.log(total_proj, "[Projects]");
    console.log("[Projects]", self.rubyProjects);
    self.didProjects = true;



});

self.rubyOrgs = [];
var total_orgs = 0;
self.didOrgs = false;
base('[Orgs]').select({
    // Selecting the first 3 records in Grid view:
    view: "Project Ruby"
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
        //console.log('Retrieved', record.id);
        self.rubyOrgs.push(record.id);
        total_orgs += 1;
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
    console.log(total_orgs, "[Orgs]");
    console.log("[Orgs]", self.rubyOrgs);
    self.didOrgs = true;

});

self.rubyFunctions = [];
var total_functions = 0;
self.didFunctions = false;
base('[Functions]').select({
    // Selecting the first 3 records in Grid view:
    view: "Project Ruby"
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
        //console.log('Retrieved', record.id);
        self.rubyFunctions.push(record.id);
        total_functions += 1;
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
    console.log(total_functions, "[Functions]");
    console.log("[Functions]", self.rubyFunctions);
    self.didFunctions = true;

});

self.rubyDevices = [];
var total_devices = 0;
self.didDevices = false;
base('[Devices]').select({
    // Selecting the first 3 records in Grid view:
    view: "Project Ruby"
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
        //console.log('Retrieved', record.id);
        self.rubyDevices.push(record.id);
        total_devices += 1;
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
    console.log(total_devices, "[Devices]");
    console.log("[Devices]", self.rubyDevices);
    self.didDevices = true;

});


self.rubyTasks = [];
var total_tasks = 0;
self.didTasks = false;
base('[Tasks]').select({
    // Selecting the first 3 records in Grid view:
    view: "Project RUBY"
}).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function(record) {
        //console.log('Retrieved', record.id);
        self.rubyTasks.push(record.id);
        total_tasks += 1;
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

}, function done(err) {
    if (err) { console.error(err); return; }
    console.log(total_tasks, "[Tasks]");
    console.log("[Tasks]", self.rubyTasks);
    self.didTasks = true;

});


function checkAirtableStatus() {
    if (self.didProjects & self.didFunctions & self.didOrgs & self.didDevices & self.didTasks) {
        return true;
    } else {
        return false;
    }
}

function GQLQuery() {
    const query = gql `query ProjectRubyQuery($proj_id: [String!], $org_id: [String!], $function_id: [String!], $device_id: [String!], $task_id: [String!]) {
  project(where: {id: {_in: $proj_id}}) {
    id
    name
    added_by
    access
    anchor_address
    added_on
    area_image
    assigned_to
    contacts
    cover_photo
    description
    geocode_cache
    geospatial_data
    import_source_url
    implementation_target_rating
    last_modified_on
    last_modified_by
    project_screenshots
    project_website
    regulator_orgs
    sla
    tags
    thumbnail
    underwriting_model
    valid
    zone_area_kml
    wallet_address
    version_history
    function_projects {
      function {
        id
      }
    }
    project_badges {
      badge {
        name
      }
    }
    project_devices {
      device {
        id
      }
    }
    task_projects {
      task {
        id
      }
    }
    org_projects {
      organization {
        id
      }
    }
  }
  organization(where: {id: {_in: $org_id}}) {
    added_by
    added_on
    assigned_to
    bd_tier
    capital_raised
    category_example
    company_email
    company_tagline
    crunchbase_profile
    employees
    devices_page
    featured_project_link
    functions_page
    github
    headquarters
    id
    job_board_link_status
    job_board_used
    last_modified_by
    last_modified_on
    linkedn
    logo
    logo_url
    naics_code
    name
    org_chart_link
    product_service_description
    product_picture
    website
    wallet_address
    valid
    twitter_handle
    team_page_url
    tags
    summary_video
    sales_outreach
    device_oem_orgs {
      device {
        id
      }
    }
    device_sp_orgs {
      device {
        id
      }
    }
    function_purchase_orgs {
      function {
        id
      }
    }
    function_sp_orgs {
      function {
        id
      }
    }
    organization_badges {
      badge {
        name
      }
    }
    org_tasks {
      task {
        id
      }
    }
    org_projects {
      project {
        id
      }
    }
  }
  function(where: {id: {_in: $function_id}}) {
    id
    UI_screenshot
    added_by
    added_on
    assigned_to
    blueprint_file
    blueprint_url
    cms_tags
    cost_model
    cover_photo
    description
    github
    icon
    ongoing_monthly_subscription
    name
    last_modified_on
    last_modified_by
    sample_output
    priority
    size
    wallet_address
    valid
    tags
    upfront_price_credits_to_engage
    source_url
    device_functions {
      device {
        id
      }
    }
    function_badges {
      badge {
        name
      }
    }
    function_projects {
      project {
        id
      }
    }
    function_purchase_orgs {
      organization {
        id
      }
    }
    function_sp_orgs {
      organization {
        id
      }
    }
    function_task_templates {
      task {
        id
      }
    }
  }
  device(where: {id: {_in: $device_id}}) {
    added_by
    cost
    assigned_to
    added_on
    description
    id
    image
    notes
    name
    marketing_description
    listing_url
    last_modified_on
    last_modified_by
    tags
    wallet_address
    valid
    device_badges {
      badge {
        name
      }
    }
    device_functions {
      function {
        id
      }
    }
    device_oem_orgs {
      organization {
        id
      }
    }
    device_sp_orgs {
      organization {
        id
      }
    }
    project_devices {
      project {
        id
      }
    }
    task_devices {
      task {
        id
      }
    }
  }
  task(where: {id: {_in: $task_id}}) {
    added_by
    added_on
    assigned_to
    attachments
    calendar_meeting_invite
    contact_info
    description
    due_date
    gallery_page
    id
    invoice_id
    issue_date
    last_modified_by
    last_modified_on
    loom_video
    loom_video_author
    quantity
    requirements
    status
    tags
    valid
    unit_base_price
    task_url
    function_task_templates {
      function {
        id
      }
    }
    org_tasks {
      organization {
        id
      }
    }
    task_badges {
      badge {
        name
      }
    }
    task_projects {
      project {
        id
      }
    }
    task_devices {
      device {
        id
      }
    }
  }
}

`

    const endpoint = "https://api.dimo.zone/v1/graphql";
    const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
            'x-hasura-admin-secret': 'DG93PEr6e2gq9Ldo7Ru3'
        },
    });

    const variables = {
        proj_id: self.rubyProjects,
        org_id: self.rubyOrgs,
        function_id: self.rubyFunctions,
        device_id: self.rubyDevices,
        task_id: self.rubyTasks
    }

    graphQLClient.request(query, variables).then(function(data) {

        self.rubyData = data;
        console.log(data);
        //console.log("Rendering");
        convertData(data);
        //console.log(data);
        ReactDOM.render(<App/>, document.getElementById('container'));
    })


}


function waitFor(condition, callback) {
    if (!condition()) {
        console.log('waiting for airtable query to finish');
        window.setTimeout(waitFor.bind(null, condition, callback), 100); /* this checks the flag every 100 milliseconds*/
    } else {
        console.log('done');
        callback();
    }
}

waitFor(checkAirtableStatus, GQLQuery);