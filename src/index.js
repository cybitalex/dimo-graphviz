import G6 from "@antv/g6";
import insertCss from "insert-css";
import { isNumber, isArray } from "@antv/util";
import { GraphQLClient, gql, request } from 'graphql-request'
import './dataTable.js'
import './modal.js'
const Lrequest = require('request')
// import React from "react";
// import ReactDOM from "react-dom";





insertCss(`
  .g6-component-contextmenu {
    position: absolute;
    z-index: 2;
    list-style-type: none;
    background-color: #363b40;
    border-radius: 6px;
    font-size: 14px;
    color: hsla(0,0%,100%,.85);
    width: fit-content;
    transition: opacity .2s;
    text-align: center;
    padding: 0px 20px 0px 20px;
    box-shadow: 0 5px 18px 0 rgba(0, 0, 0, 0.6);
    border: 0px;
  }
  .g6-component-contextmenu ul {
    padding-left: 0px;
    margin: 0;
  }
  .g6-component-contextmenu li {
    cursor: pointer;
    list-style-type: none;
    list-style: none;
    margin-left: 0;
    line-height: 38px;
  }
  .g6-component-contextmenu li:hover {
    color: #aaaaaa;
  }
  .g6-component-tooltip {
    background-color: rgba(255, 255, 255, 0.8);
    padding: 0px 25px 0px 0px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
  }
`);

const { labelPropagation, louvain, findShortestPath } = G6.Algorithm;
const { uniqueId } = G6.Util;

const NODESIZEMAPPING = "degree";
const SMALLGRAPHLABELMAXLENGTH = 20;
let labelMaxLength = SMALLGRAPHLABELMAXLENGTH;
const DEFAULTNODESIZE = 200;
const DEFAULTAGGREGATEDNODESIZE = 200;
const NODE_LIMIT = 40; // TODO: find a proper number for maximum node number on the canvas

let graph = null;
let currentUnproccessedData = { nodes: [], edges: [] };
let nodeMap = {};
let aggregatedNodeMap = {};
let hiddenItemIds = [];
let largeGraphMode = false;
self.cachePositions = {};
let manipulatePosition = undefined;
let descreteNodeCenter;
let layout = {
  type: "",
  instance: null,
  destroyed: true
};
let expandArray = [];
let collapseArray = [];
let shiftKeydown = false;
let ctrlKeydown = false;
let altKeydown = false;
let dragX = undefined;
let dragY = undefined;
let dragdX = undefined;
let dragdY = undefined;
let CANVAS_WIDTH = 800,
  CANVAS_HEIGHT = 800;

var dragSelectedNodes = undefined;


const duration = 2000;
const animateOpacity = 0.6;
const animateBackOpacity = 0.1;
const virtualEdgeOpacity = 0.1;
const realEdgeOpacity = 0.2;

const darkBackColor = "rgb(43, 47, 51)";
const disableColor = "#777";
const theme = "dark";
const subjectColors = [
  "#5F95FF",
  "#61DDAA",
  "#F6BD16",
  "#9661BC",
  "#C91C25",
  "#D37099",
];


const dimoProjectColorIndex = 0;
const dimoOrgColorIndex = 1;
const dimoFunctionColorIndex = 2;
const dimoDeviceColorIndex = 3;
const dimoResourceColorIndex = 4;
const dimoPersonColorIndex = 5;

const colorSets = G6.Util.getColorSetsBySubjectColors(
  subjectColors,
  darkBackColor,
  theme,
  disableColor
);


// DIMO stuff

const dimoOrgIcon = "https://dl.airtable.com/.attachmentThumbnails/f17c35f9affd107e60b57b5ac91e84aa/03673739";
const dimoProjectIcon = "https://api.iconify.design/mdi-crane.svg";
const dimoFunctionIcon = "https://api.iconify.design/mdi-function.svg";
const dimoDeviceIcon = "https://api.iconify.design/mdi-chip.svg";
const dimoResourceIcon = "https://api.iconify.design/emojione-monotone:letter-r.svg"
const dimoPeopleIcon = "https://api.iconify.design/akar-icons:person.svg"


var graphInit = false;



const global = {
  node: {
    style: {
      fill: "#2B384E"
    },
    labelCfg: {
      style: {
        fill: "#acaeaf",
        stroke: "#191b1c"
      }
    },
    stateStyles: {
      focus: {
        fill: "#2B384E"
      }
    }
  },
  edge: {
    style: {
      stroke: "#acaeaf",
      realEdgeStroke: "#acaeaf", //'#f00',
      realEdgeOpacity,
      strokeOpacity: realEdgeOpacity
    },
    labelCfg: {
      style: {
        fill: "#acaeaf",
        realEdgeStroke: "#acaeaf", //'#f00',
        realEdgeOpacity: 0.5,
        stroke: "#191b1c"
      }
    },
    stateStyles: {
      focus: {
        stroke: "#fff" // '#3C9AE8',
      }
    }
  }
};

// Custom super node
G6.registerNode(
  "dimo-node",
  {
    draw(cfg, group) {
      let width = 225,
        height = 45;
      const style = cfg.style || {};
      const colorSet = cfg.colorSet || colorSets[0];

      // Hightlight for Hover
      group.addShape("rect", {
        attrs: {
          x: -width * 0.55,
          y: -height * 0.6,
          width: width * 1.1,
          height: height * 1.2,
          fill: colorSet.mainFill,
          opacity: 0.9,
          lineWidth: 0,
          radius: (height / 2 || 13) * 1.2
        },
        name: "halo-shape",
        visible: false
      });

      // focus stroke for active (clicked)
      group.addShape("rect", {
        attrs: {
          x: -width * 0.55,
          y: -height * 0.6,
          width: width * 1.1,
          height: height * 1.2,
          fill: colorSet.mainFill, // '#3B4043',
          stroke: "#AAB7C4",
          lineWidth: 1,
          lineOpacty: 0.85,
          radius: (height / 2 || 13) * 1.2
        },
        name: "stroke-shape",
        visible: false
      });

      const keyShape = group.addShape("rect", {
        attrs: {
          ...style,
          x: -width / 2,
          y: -height / 2,
          width,
          height,
          fill: colorSet.mainFill, // || '#3B4043',
          stroke: colorSet.mainStroke,
          lineWidth: 2,
          radius: height / 2 || 13,
          lineDash: [2, 2]
        },
        name: "dimo-node-keyShape"
      });

      let labelStyle = {};
      if (cfg.labelCfg) {
        labelStyle = Object.assign(labelStyle, cfg.labelCfg.style);
      }
      
      group.addShape('image', {
          attrs: {
              x: 70,
              y: -16,
              width: 32,
              height: 32,
              img:cfg.icon.url
          },
          className: 'node-icon',
          name: 'node-icon',
          draggable: true,
      });

      if (cfg.logo.show) {

          group.addShape('image', {
              attrs: {
                  x: -102,
                  y: -16,
                  width: 32,
                  height: 32,
                  img: cfg.logo.url
              },
              className: 'node-logo',
              name: 'node-logo',
              draggable: true,
          });
      }



      group.addShape("text", {
        attrs: {
          text: cfg.label,
          x: 0,
          y: 0,
          textAlign: "center",
          textBaseline: "middle",
          cursor: "pointer",
          fontSize: 12,
          fill: "#fff",
          opacity: 0.85,
          fontWeight: 400
        },
        name: "count-shape",
        className: "count-shape",
        draggable: true
      });



      // tag for new node
      if (cfg.new) {
        group.addShape("circle", {
          attrs: {
            x: width / 2 - 3,
            y: -height / 2 + 3,
            r: 4,
            fill: "#6DD400",
            lineWidth: 0.5,
            stroke: "#FFFFFF"
          },
          name: "typeNode-tag-circle"
        });
      }
      return keyShape;
    },
    setState: (name, value, item) => {
      const group = item.get("group");
      if (name === "layoutEnd" && value) {
        const labelShape = group.find((e) => e.get("name") === "text-shape");
        if (labelShape) labelShape.set("visible", true);
      } else if (name === "hover") {
        if (item.hasState("focus")) {
          return;
        }
        const halo = group.find((e) => e.get("name") === "halo-shape");
        const keyShape = item.getKeyShape();
        const colorSet = item.getModel().colorSet || colorSets[0];
        if (value) {
          halo && halo.show();
          keyShape.attr("fill", colorSet.activeFill);
        } else {
          halo && halo.hide();
          keyShape.attr("fill", colorSet.mainFill);
        }
      } else if (name === "focus") {
        const stroke = group.find((e) => e.get("name") === "stroke-shape");
        const keyShape = item.getKeyShape();
        const colorSet = item.getModel().colorSet || colorSets[0];
        if (value) {
          stroke && stroke.show();
          keyShape.attr("fill", colorSet.selectedFill);
        } else {
          stroke && stroke.hide();
          keyShape.attr("fill", colorSet.mainFill);
        }
      }
    },






    update: undefined
  },
  "single-node"
);


// Custom the quadratic edge for multiple edges between one node pair
G6.registerEdge(
  "custom-cubic",
  {
    setState: (name, value, item) => {
      const group = item.get("group");
      const model = item.getModel();
      if (name === "focus") {

        const back = group.find((ele) => ele.get("name") === "back-line");
        if (back) {
          back.stopAnimate();
          back.remove();
          back.destroy();
        }
        const keyShape = group.find((ele) => ele.get("name") === "edge-shape");
        const arrow = model.style.endArrow;
        if (value) {
          if (keyShape.cfg.animation) {
            keyShape.stopAnimate(true);
          }
          keyShape.attr({
            strokeOpacity: animateOpacity,
            opacity: animateOpacity,
            stroke: "#fff",
            endArrow: {
              ...arrow,
              stroke: "#fff",
              fill: "#fff"
            }
          });
          if (model.isReal) {
            const { lineWidth, path, endArrow, stroke } = keyShape.attr();
            const back = group.addShape("path", {
              attrs: {
                lineWidth,
                path,
                stroke,
                endArrow,
                opacity: animateBackOpacity
              },
              name: "back-line"
            });
            back.toBack();
            const length = keyShape.getTotalLength();
            keyShape.animate(
              (ratio) => {
                // the operations in each frame. Ratio ranges from 0 to 1 indicating the prograss of the animation. Returns the modified configurations
                const startLen = ratio * length;
                // Calculate the lineDash
                const cfg = {
                  lineDash: [startLen, length - startLen]
                };
                return cfg;
              },
              {
                repeat: true, // Whether executes the animation repeatly
                duration // the duration for executing once
              }
            );
          } else {
            let index = 0;
            const lineDash = keyShape.attr("lineDash");
            const totalLength = lineDash[0] + lineDash[1];
            keyShape.animate(
              () => {
                index++;
                if (index > totalLength) {
                  index = 0;
                }
                const res = {
                  lineDash,
                  lineDashOffset: -index
                };
                // returns the modified configurations here, lineDash and lineDashOffset here
                return res;
              },
              {
                repeat: true, // whether executes the animation repeatly
                duration // the duration for executing once
              }
            );
          }
        } else {
          keyShape.stopAnimate();
          const stroke = "#acaeaf";
          const opacity = model.isReal ? realEdgeOpacity : virtualEdgeOpacity;
          keyShape.attr({
            stroke,
            strokeOpacity: opacity,
            opacity,
            endArrow: {
              ...arrow,
              stroke,
              fill: stroke
            }
          });
        }
      }
    }
  },
  "cubic"
);




const hideEdgesPromise = () => {
  return new Promise((resolve, reject) => {
    graph.getEdges().forEach((edge)=> {
      graph.hideItem(edge, false)
    })
      resolve("Hiding Edges Worked.");
  });
};


const dragPromise = (node, dragdx, dragdy) => {
        return new Promise((resolve, reject) => {
            /*stuff using username, password*/
            const newX = node._cfg.model.x + dragdx
            const newY = node._cfg.model.y + dragdy
            graph.updateItem(node, {
                x: newX,
                y: newY
            });


            resolve("Stuff worked!");
        });
    };










// Custom the line edge for single edge between one node pair


const descendCompare = (p) => {
  // 这是比较函数
  return function (m, n) {
    const a = m[p];
    const b = n[p];
    return b - a; // 降序
  };
};

const clearFocusItemState = (graph) => {
  if (!graph) return;
  clearFocusNodeState(graph);
  clearFocusEdgeState(graph);
};

// 清除图上所有节点的 focus 状态及相应样式
const clearFocusNodeState = (graph) => {
  const focusNodes = graph.findAllByState("node", "focus");
  focusNodes.forEach((fnode) => {
    graph.setItemState(fnode, "focus", false); // false
  });
};

// 清除图上所有边的 focus 状态及相应样式
const clearFocusEdgeState = (graph) => {
  const focusEdges = graph.findAllByState("edge", "focus");
  focusEdges.forEach((fedge) => {
    graph.setItemState(fedge, "focus", false);
  });
};

// 截断长文本。length 为文本截断后长度，elipsis 是后缀
const formatText = (text, length = 5, elipsis = "...") => {
  if (!text) return "";
  if (text.length > length) {
    return `${text.substr(0, length)}${elipsis}`;
  }
  return text;
};

const labelFormatter = (text, minLength = 20) => {
  if (text && text.split("").length > minLength)
    return `${text.substr(0, minLength)}...`;
  return text;
};

const getForceLayoutConfig = (graph, largeGraphMode, configSettings) => {
  let {
    linkDistance,
    edgeStrength,
    nodeStrength,
    nodeSpacing,
    preventOverlap,
    nodeSize,
    collideStrength,
    alpha,
    alphaDecay,
    alphaMin
  } = configSettings || { preventOverlap: true };

  if (!linkDistance && linkDistance !== 0) linkDistance = 225;
  if (!edgeStrength && edgeStrength !== 0) edgeStrength = 0;
  if (!nodeStrength && nodeStrength !== 0) nodeStrength = 5000;
  if (!nodeSpacing && nodeSpacing !== 0) nodeSpacing = 1000;




  const config = {
    type: "gForce",
    minMovement: 0.01,
    maxIteration: 5000,
    preventOverlap: true,
    damping: 0.99,
    workerEnabled:true,
    gpuEnabled:true,
    nodeStrength:nodeStrength,
    linkDistance: (d) => {
      return linkDistance;
    },
    edgeStrength: (d) => {
      return edgeStrength;
    },
    nodeStrength: (d) => {
      return nodeStrength;
    },
    nodeSize: (d) => {
      return 200;
    },
    nodeSpacing: (d) => {
      return nodeSpacing;
    },
    onLayoutEnd: () => {
      if (largeGraphMode) {
        graph.getEdges().forEach((edge) => {
          if (!edge.oriLabel) return;
          edge.update({
            label: labelFormatter(edge.oriLabel, labelMaxLength)
          });
        });
      }
    },
    tick: () => {
      graph.refreshPositions();
    }
  };

  if (nodeSize) config["nodeSize"] = nodeSize;
  if (collideStrength) config["collideStrength"] = collideStrength;
  if (alpha) config["alpha"] = alpha;
  if (alphaDecay) config["alphaDecay"] = alphaDecay;
  if (alphaMin) config["alphaMin"] = alphaMin;

  return config;
};

const hideItems = (graph) => {
  hiddenItemIds.forEach((id) => {
    graph.hideItem(id);
  });
};

const showItems = (graph) => {
  graph.getNodes().forEach((node) => {
    if (!node.isVisible()) graph.showItem(node);
  });
  hiddenItemIds = [];
};



self.cacheNodePositions = (nodes) => {
  const positionMap = {};
  const nodeLength = nodes.length;
  for (let i = 0; i < nodeLength; i++) {

    const node = nodes[i].getModel();
    positionMap[node.id] = {
      x: node.x,
      y: node.y,
      level: node.level
    };
  }
  return positionMap;
};

const stopLayout = () => {
  if(layout.instance.stop){
  layout.instance.stop();
}
};

const bindListener = (graph) => {
  graph.on("keydown", (evt) => {
    if(window.modalOpen) {
      return
    }

    const code = evt.key;
    console.log("keydown",code)
    if (!code) {
      return;
    }
    
    if (code.toLowerCase() == 'z') {
      if (ctrlKeydown) {
        self.graphToolbar.undo();
      }
    }

    if (code.toLowerCase() === "shift") {
      shiftKeydown = true;
    } else {
      shiftKeydown = false;
    }
    if (code.toLowerCase() === "alt") {
      altKeydown = true;
      self.graph.setMode("brushSelect")
      console.log("mode",graph.getCurrentMode())
    } else {
      altKeydown = false;

    }

    if (code.toLowerCase() === "control" || code.toLowerCase() === "meta") {
      ctrlKeydown = true;
    } else {
      ctrlKeydown = false;
    }

    if (code.toLowerCase() == " ") {
      console.log("space")
      graph.fitView([20, 20]);
    }




  });

graph.on('afterlayout', function () {
  console.log("Layout Finished!")

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}


  if(graph.cfg.layout){
    if(graph.cfg.layout.type=="radial"){
      graph.destroyLayout()
}

}


});




  graph.on("keyup", (evt) => {
    if(window.modalOpen) {
      return
    }

    const code = evt.key;
    if (!code) {
      return;
    }
    if (code.toLowerCase() === "shift") {
      shiftKeydown = false;
    }
    if (code.toLowerCase() === "alt") {
      altKeydown = false;
      self.graph.setMode("default")
      console.log("mode",graph.getCurrentMode())
    }
    if (code.toLowerCase() === "control" || code.toLowerCase() === "meta") {
      ctrlKeydown = false;
    }

  });
  graph.on("node:mouseenter", (evt) => {
    const { item } = evt;
    const model = item.getModel();
    const currentLabel = model.label;
    model.oriFontSize = model.labelCfg.style.fontSize;
    item.update({
      label: model.oriLabel
    });


    model.oriLabel = currentLabel;
    graph.setItemState(item, "hover", true);
    item.toFront();

    if (altKeydown) {
      graph.setItemState(item, "focus", true);
    }


  });

  graph.on("node:mouseleave", (evt) => {
    const { item } = evt;
    const model = item.getModel();
    const currentLabel = model.label;
    item.update({
      label: model.oriLabel
    });
    model.oriLabel = currentLabel;
    graph.setItemState(item, "hover", false);
  });

  graph.on("edge:mouseenter", (evt) => {
    const { item } = evt;
    const model = item.getModel();
    const currentLabel = model.label;
    item.update({
      label: model.oriLabel
    });
    model.oriLabel = currentLabel;
    item.toFront();
    item.getSource().toFront();
    item.getTarget().toFront();
  });

  graph.on("edge:mouseleave", (evt) => {
    const { item } = evt;
    const model = item.getModel();
    const currentLabel = model.label;
    item.update({
      label: model.oriLabel
    });
    model.oriLabel = currentLabel;
  });
  // click node to show the detail drawer
  graph.on("node:click", (evt) => {
      stopLayout();
      if (!shiftKeydown) clearFocusItemState(graph);
      else clearFocusEdgeState(graph);
      const { item } = evt;
      // highlight the clicked node, it is down by click-select
      graph.setItemState(item, "focus", true);

      if (!shiftKeydown) {
          // 将相关边也高亮
          const relatedEdges = item.getEdges();
          relatedEdges.forEach((edge) => {
              graph.setItemState(edge, "focus", false);
          });

          setTimeout(() => {
              relatedEdges.forEach((edge) => {
                  graph.setItemState(edge, "focus", true);
              });
          }, 20);

      }
  });
    


    graph.on("node:dragstart", (evt) => {
      dragX = evt.x;
      dragY = evt.y;
      hideEdgesPromise();
      dragSelectedNodes = graph.findAllByState('node', 'focus');

  });

    graph.on("node:dragend", (evt) => {
      graph.findAllByState('node', 'focus').forEach((node)=>{
        graph.setItemState(node,"focus",false)
        graph.setItemState(node,"focus",true)
      })
            graph.getEdges().forEach((edge)=> {
        graph.showItem(edge, false)
      })
      dragSelectedNodes = undefined

  });



    graph.on("node:drag", (evt) => {
      dragdX = evt.x - dragX
      dragdY = evt.y - dragY
      dragX = evt.x
      dragY = evt.y

      const curItem = evt.item._cfg.id;
      
      dragSelectedNodes.forEach((node)=> {

        if (node._cfg.id != curItem){

        dragPromise(node, dragdX, dragdY)

        }
      })
  });


  // click edge to show the detail of integrated edge drawer
  graph.on("edge:click", (evt) => {
      stopLayout();
      if (!shiftKeydown) clearFocusItemState(graph);
      const { item } = evt;
      // highlight the clicked edge

      setTimeout(() => {
          graph.setItemState(item, "focus", true);
      }, 20);
  });

  // click canvas to cancel all the focus state
  graph.on("canvas:click", (evt) => {
    clearFocusItemState(graph);
    // console.log(
    //   graph.getGroup(),
    //   graph.getGroup().getBBox(),
    //   graph.getGroup().getCanvasBBox()
    // );
  });
};


const dimogqlEndpoint = "https://api.dimo.zone/v1/graphql";
const dimogqlauthHeaders = {
            'x-hasura-admin-secret': 'DG93PEr6e2gq9Ldo7Ru3'
        }

self.graphQLClient = new GraphQLClient(dimogqlEndpoint, {headers: dimogqlauthHeaders});



function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}


self.dimoProjects = [];
self.dimoOrgs = [];
self.dimoFunctions = [];
self.dimoDevices = [];
self.dimoResources = [];
self.dimoPeople = [];

const deviceQuery = gql`query graphvizDeviceQuery($device_id: String!) {
  device(where: {id: {_eq: $device_id}}) {
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
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cost_model
        cover_photo
        description
        github
        icon
        id
        last_modified_by
        name
        last_modified_on
        ongoing_monthly_subscription
        priority
        sample_output
        size
        source_url
        tags
        upfront_price_credits_to_engage
        wallet_address
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
      }
    }
    device_oem_orgs {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        crunchbase_profile
        company_tagline
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_link_status
        job_board_used
        name
        naics_code
        logo_url
        logo
        linkedn
        last_modified_on
        last_modified_by
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        website
        wallet_address
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
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
      }
    }
    device_sp_orgs {
      organization {
        added_by
        added_on
        assigned_to
        bd_tier
        capital_raised
        category_example
        company_email
        company_tagline
        crunchbase_profile
        devices_page
        employees
        featured_project_link
        functions_page
        github
        headquarters
        id
        job_board_used
        job_board_link_status
        last_modified_by
        last_modified_on
        linkedn
        logo
        logo_url
        naics_code
        name
        org_chart_link
        product_picture
        product_service_description
        summary_video
        sales_outreach
        website
        wallet_address
        valid
        twitter_handle
        team_page_url
        tags
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
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
      }
    }
    project_devices {
      project {
        access
        added_by
        added_on
        anchor_address
        area_image
        assigned_to
        contacts
        cover_photo
        description
        dimo_rating
        geocode_cache
        geospatial_data
        id
        import_source_url
        implementation_target_rating
        last_modified_by
        last_modified_on
        name
        tags
        sla
        regulator_orgs
        project_website
        project_screenshots
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
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
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
      }
    }
  }
}`

const projectQuery = gql`query graphvizProjectQuery($proj_id: String!) {
  project(where: {id: {_eq: $proj_id}}) {
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
        UI_screenshot
        added_by
        added_on
        blueprint_file
        assigned_to
        blueprint_url
        cost_model
        cover_photo
        description
        icon
        github
        name
        last_modified_on
        last_modified_by
        ongoing_monthly_subscription
        priority
        size
        sample_output
        source_url
        tags
        upfront_price_credits_to_engage
        valid
        wallet_address
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
      }
    }
    org_projects {
      organization {
        id
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
        github
        functions_page
        headquarters
        job_board_used
        job_board_link_status
        last_modified_by
        last_modified_on
        linkedn
        logo_url
        logo
        name
        naics_code
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        website
        wallet_address
        valid
        team_page_url
        twitter_handle
        tags
        summary_video
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
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
      }
    }
    project_devices {
      device {
        id
        added_by
        added_on
        assigned_to
        cost
        description
        image
        last_modified_by
        last_modified_on
        listing_url
        marketing_description
        name
        notes
        tags
        wallet_address
        valid
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
      }
    }
  }
}`

const orgQuery = gql`query graphvizOrgQuery($org_id: String!) {
  organization(where: {id: {_eq: $org_id}}) {
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
        added_by
        added_on
        assigned_to
        cost
        description
        id
        image
        last_modified_by
        listing_url
        last_modified_on
        notes
        name
        marketing_description
        tags
        valid
        wallet_address
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
          }
        }
        device_sp_orgs {
          organization {
            id
          }
        }
        device_oem_orgs {
          organization {
            id
          }
        }
        project_devices {
          project {
            id
          }
        }
      }
    }
    device_sp_orgs {
      device {
        added_by
        added_on
        assigned_to
        cost
        description
        id
        image
        last_modified_by
        last_modified_on
        listing_url
        notes
        name
        marketing_description
        tags
        wallet_address
        valid
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
      }
    }
    function_sp_orgs {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cover_photo
        cost_model
        description
        icon
        github
        ongoing_monthly_subscription
        name
        last_modified_on
        id
        last_modified_by
        priority
        sample_output
        size
        tags
        source_url
        wallet_address
        upfront_price_credits_to_engage
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
      }
    }
    org_projects {
      project {
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
        project_screenshots
        tags
        sla
        regulator_orgs
        project_website
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
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
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
      }
    }
  }
}`

const funtionQuery = gql`query graphvizFunctionQuery($function_id: String!) {
  function(where: {id: {_eq: $function_id}}) {
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
        added_by
        added_on
        assigned_to
        cost
        description
        id
        image
        last_modified_by
        last_modified_on
        listing_url
        marketing_description
        name
        notes
        tags
        wallet_address
        valid
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
      }
    }
    function_projects {
      project {
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
        last_modified_by
        last_modified_on
        name
        regulator_orgs
        project_website
        project_screenshots
        tags
        sla
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
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
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
      }
    }
    function_sp_orgs {
      organization {
        added_by
        added_on
        assigned_to
        crunchbase_profile
        company_tagline
        company_email
        category_example
        capital_raised
        bd_tier
        featured_project_link
        employees
        devices_page
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
        product_picture
        product_service_description
        sales_outreach
        summary_video
        tags
        team_page_url
        twitter_handle
        valid
        wallet_address
        website
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
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
      }
    }
  }
}`



const resourceQuery = gql`query graphvizResourceQuery($resource_id: String!) {
  resource(where: {id: {_eq: $resource_id}}) {
    id
    added_by
    added_on
    additional_parking
    attachments
    available_by
    break_room_sq_ft
    classroom_sq_ft
    dedicated_bathrooms
    icon
    geocode
    description
    monthly_rent
    max_classroom_space
    lease_min
    location
    last_modified_on
    last_modified_by
    kitchenette
    notes
    name
    parking_spaces
    number_of_charging_plugs
    recommendation
    secured_parking
    simultaneous_trainees
    status
    tags
    virtual_tour
    valid
    usable_sq_ft
    resource_resource_types {
      resource_type {
        name
        id
        icon
      }
    }

    project_resources {
      project {
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
        project_screenshots
        tags
        sla
        regulator_orgs
        project_website
        thumbnail
        underwriting_model
        valid
        version_history
        wallet_address
        zone_area_kml
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
          }
        }
        org_projects {
          organization {
            id
          }
        }
        project_devices {
          device {
            id
          }
        }
        project_resources {
          resource {
            id
          }
        }
      }
    }
    functions_resources {
      function {
        UI_screenshot
        added_by
        added_on
        assigned_to
        blueprint_file
        blueprint_url
        cover_photo
        cost_model
        description
        icon
        github
        ongoing_monthly_subscription
        name
        last_modified_on
        id
        last_modified_by
        priority
        sample_output
        size
        tags
        source_url
        wallet_address
        upfront_price_credits_to_engage
        valid
        function_function_types {
          function_type {
            icon
            id
            name
          }
        }
        device_functions {
          device {
            id
          }
        }
        function_projects {
          project {
            id
          }
        }
        function_sp_orgs {
          organization {
            id
          }
        }
        functions_resources {
          resource {
            id
          }
        }
      }
    }
org_resources {
      organization {
        id
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
        github
        functions_page
        headquarters
        job_board_used
        job_board_link_status
        last_modified_by
        last_modified_on
        linkedn
        logo_url
        logo
        name
        naics_code
        org_chart_link
        product_picture
        product_service_description
        sales_outreach
        website
        wallet_address
        valid
        team_page_url
        twitter_handle
        tags
        summary_video
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
          }
        }
        device_sp_orgs {
          device {
            id
          }
        }
        function_sp_orgs {
          function {
            id
          }
        }
        org_projects {
          project {
            id
          }
        }
        org_resources {
          resource {
            id
          }
        }



      }
    }
  }
}

`

self.gqlResourceDataToNode = (resource)=>{

    var node = {
        "id": resource.id,
        "type": "dimo-node",
        "class": "[Resource]",
        "label": resource.name,
        "airtableURL": "https://airtable.com/tblAKJHMkBTTAbuXE/viwfjiEW7MrdgTysI/" + resource.id,
    };

    if (resource.resource_resource_types.length) {

      //  var url = JSON.parse(project.project_project_types[0].project_type.icon.replace(/\'/g, '"'))

        node._type = resource.resource_resource_types[0].resource_type.name
        var url = ""


        if (url.length) {
            node.logo = {
                "show": true,
                "url": url[0]
            }
        } else {
            node.logo = {
                "show": false,
            }
        }




    } else {
        node.logo = {
            "show": false,
        }
    }

    node.level = 1;


    node.icon = {
        "url": dimoResourceIcon
    }

    node.colorSet = colorSets[dimoResourceColorIndex]

    node.labelCfg = {
        position: "bottom",
        offset: 5,
        style: {
            fill: global.node.labelCfg.style.fill,
            fontSize: 12,
            stroke: global.node.labelCfg.style.stroke,
            lineWidth: 3
        }
    }



    return node



}






self.gqlProjectDataToNode = (project)=>{

    var node = {
        "id": project.id,
        "type": "dimo-node",
        "class": "[Project]",
        "label": project.name,
        "airtableURL": "https://airtable.com/tblpm4ls9gP94bmGA/viwbmZinIAOULOOCc/" + project.id,
    };

    if (project.project_project_types.length) {

        var url = JSON.parse(project.project_project_types[0].project_type.icon.replace(/\'/g, '"'))

        node._type = project.project_project_types[0].project_type.name

        if (url.length) {
            node.logo = {
                "show": true,
                "url": url[0]
            }
        } else {
            node.logo = {
                "show": false,
            }
        }




    } else {
        node.logo = {
            "show": false,
        }
    }

    node.level = 1;


    node.icon = {
        "url": dimoProjectIcon
    }

    node.colorSet = colorSets[dimoProjectColorIndex]

    node.labelCfg = {
        position: "bottom",
        offset: 5,
        style: {
            fill: global.node.labelCfg.style.fill,
            fontSize: 12,
            stroke: global.node.labelCfg.style.stroke,
            lineWidth: 3
        }
    }



    return node



}



function loadDimoProject(project_id, nodes, edges, initial = true) {

  

  const vars = {"proj_id":project_id}

  graphQLClient.request(projectQuery, vars).then(



        function(data) {
            self.tempNodes = [];
            console.info("[Project] Request", data);


            var proj = data.project[0];
            var projNode = self.gqlProjectDataToNode(proj);
            if (initial) {

            
            self.dimoProjects[projNode.id] = projNode
            nodes.push(projNode)

          }

            var device, deviceNode;
            for (var i = proj.project_devices.length - 1; i >= 0; i--) {

                device = proj.project_devices[i].device;
                deviceNode = self.gqlDeviceDataToNode(device);
                

                if (self.dimoDevices[deviceNode.id] == undefined){


                self.dimoDevices[deviceNode.id] = deviceNode;
                nodes.push(deviceNode)

              }


                edges.push({ "source": projNode.id, "target": deviceNode.id, type: "custom-cubic" })

            }


            var func, funcNode;
            for (var i = proj.function_projects.length - 1; i >= 0; i--) {
                func = proj.function_projects[i].function;
                funcNode = self.gqlFunctionDataToNode(func);

                if (self.dimoFunctions[funcNode.id] == undefined){

                self.dimoFunctions[funcNode.id] = funcNode;
                nodes.push(funcNode);

              }
                edges.push({ "source": projNode.id, "target": funcNode.id, type: "custom-cubic" })


            }


            var org, orgNode;

            for (var i = proj.org_projects.length - 1; i >= 0; i--) {
                org = proj.org_projects[i].organization;
                orgNode = self.gqlOrgDataToNode(org);
                
                if (self.dimoOrgs[orgNode.id] == undefined){

                self.dimoOrgs[orgNode.id] = orgNode;
                nodes.push(orgNode);

              }
                edges.push({ "source": orgNode.id, "target": projNode.id, type: "custom-cubic" })
            }




            for (var i = proj.project_devices.length - 1; i >= 0; i--) {

                device = proj.project_devices[i].device;

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


             }


             for (var i = proj.function_projects.length - 1; i >= 0; i--) {
                 func = proj.function_projects[i].function;


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



              }



              for (var i = proj.org_projects.length - 1; i >= 0; i--) {

                org = proj.org_projects[i].organization;


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



              }







            if (initial) {
                initGraph(nodes,edges);
            }
            else {
              self.refreshGraph(nodes, edges);
            }
        })

}

self.gqlOrgDataToNode = (org)=>{

    var node = {
        "id": org.id,
        "type": "dimo-node",
        "class":"[Org]",
        "label":org.name,
        "airtableURL":"https://airtable.com/tblJopLUVAZR2Cfa5/viwuDxJer9n8E5Eze/" + org.id,
    };


    node.level = 1;

    if (org.logo.length) {
      node.logo = {
                    "show":true,
                    "url":org.logo[org.logo.length - 1]
      }
    }
    else {
      node.logo = {
                    "show":false
      }
    }

    if (org.org_org_types.length) {

        var url = JSON.parse(org.org_org_types[0].org_type.icon.replace(/\'/g, '"'))

        node._type = org.org_org_types[0].org_type.name

        if (url.length) {
            node.icon = {
                "url": url[0]
            }
        } else {
            node.icon = {
            "url": dimoOrgIcon,
        }
        }




    } else {
        node.icon = {
            "url": dimoOrgIcon,
        }
    }

    node.colorSet = colorSets[dimoOrgColorIndex]

    node.labelCfg = {
      position: "bottom",
      offset: 5,
      style: {
        fill: global.node.labelCfg.style.fill,
        fontSize: 12,
        stroke: global.node.labelCfg.style.stroke,
        lineWidth: 3
      }
    }



    return node



}




function loadDimoOrg(org_id, nodes, edges, initial = true) {


    const vars = { "org_id": org_id }

    graphQLClient.request(orgQuery, vars).then(



        function(data) {
            const currentEdges = {};
            console.info("[Org] Request", data);


            var org = data.organization[0];
            var orgNode = self.gqlOrgDataToNode(org);

            if (initial) {

                self.dimoOrgs[orgNode.id] = orgNode
                nodes.push(orgNode)
            }

            var device, deviceNode;
            for (var i = org.device_oem_orgs.length - 1; i >= 0; i--) {

                device = org.device_oem_orgs[i].device;
                deviceNode = self.gqlDeviceDataToNode(device);

                if (self.dimoDevices[deviceNode.id] == undefined) {
                    self.dimoDevices[deviceNode.id] = deviceNode;
                    nodes.push(deviceNode)
                }


                edges.push({ "source": orgNode.id, "target": deviceNode.id, type: "custom-cubic" })






            }

            for (var i = org.device_sp_orgs.length - 1; i >= 0; i--) {

                device = org.device_sp_orgs[i].device;
                deviceNode = self.gqlDeviceDataToNode(device);

                if (self.dimoDevices[deviceNode.id] == undefined) {

                    self.dimoDevices[deviceNode.id] = deviceNode;
                    nodes.push(deviceNode)

                }
                edges.push({ "source": orgNode.id, "target": deviceNode.id, type: "custom-cubic" })

            }


            var func, funcNode;

            for (var i = org.function_sp_orgs.length - 1; i >= 0; i--) {
                func = org.function_sp_orgs[i].function;
                funcNode = self.gqlFunctionDataToNode(func);

                if (self.dimoFunctions[funcNode.id] == undefined) {
                    self.dimoFunctions[funcNode.id] = funcNode;
                    nodes.push(funcNode);

                }
                edges.push({ "source": orgNode.id, "target": funcNode.id, type: "custom-cubic" })
                



            }


            var project, projNode;

            for (var i = org.org_projects.length - 1; i >= 0; i--) {
                project = org.org_projects[i].project;
                projNode = self.gqlProjectDataToNode(project);

                if (self.dimoProjects[projNode.id] == undefined) {
                    self.dimoProjects[projNode.id] = projNode;
                    nodes.push(projNode);
                }
                edges.push({ "source": orgNode.id, "target": projNode.id, type: "custom-cubic" })
            }











            for (var i = org.function_sp_orgs.length - 1; i >= 0; i--) {
                func = org.function_sp_orgs[i].function;
                
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



            }


           for (var i = org.device_oem_orgs.length - 1; i >= 0; i--) {
                device = org.device_oem_orgs[i].device;
                
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


                for (var j = device.device_oem_orgs.length - 1; j >= 0; j--) {
                  
                  if (self.dimoOrgs[device.device_oem_orgs[j].organization.id] != undefined) {
                    edges.push({ "source": device.id, "target": device.device_oem_orgs[j].organization.id, type: "custom-cubic" })
                  }
                
                }




                for (var j = device.project_devices.length - 1; j >= 0; j--) {
                  
                  if (self.dimoProjects[device.project_devices[j].project.id] != undefined) {
                    edges.push({ "source": device.id, "target": device.project_devices[j].project.id, type: "custom-cubic" })
                  }
                
                }


            }


            for (var i = org.org_projects.length - 1; i >= 0; i--) {
                project = org.org_projects[i].project;

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


            }










            if (initial) {
                initGraph(nodes,edges);
            }
            else {
              self.refreshGraph(nodes, edges);
            }
        })



}
self.gqlFunctionDataToNode = (func)=>{

    var node = {
        "id": func.id,
        "type": "dimo-node",
        "class":"[Function]",
        "label":func.name,
        "airtableURL":"https://airtable.com/tbluJQFoXFEof7rdM/viwLeV2hJyBobLFZW/" + func.id,
    };
 
    if (func.function_function_types.length) {

        node._type = func.function_function_types[0].function_type.name

        var url = func.function_function_types[0].function_type.icon

        if (url.length) {
            node.logo = {
                "show": true,
                "url": url[0]
            }
        } else {
            node.logo = {
                "show": false,
            }
        }




    } else {
        node.logo = {
            "show": false,
        }
    }
    
    node.level = 1;


    node.icon = {
      "url":dimoFunctionIcon
    }

    node.colorSet = colorSets[dimoFunctionColorIndex]

    node.labelCfg = {
      position: "bottom",
      offset: 5,
      style: {
        fill: global.node.labelCfg.style.fill,
        fontSize: 12,
        stroke: global.node.labelCfg.style.stroke,
        lineWidth: 3
      }
    }
    return node



}




function loadDimoFunction(function_id, nodes, edges, initial = true) {



    const vars = { "function_id": function_id }
    graphQLClient.request(funtionQuery, vars).then(



        function(data) {

            console.info("[Function] Request", data);

            var func = data.function[0];
            var funcNode = self.gqlFunctionDataToNode(func);

            if (initial) {

                self.dimoFunctions[funcNode.id] = funcNode
                nodes.push(funcNode)
            }


            var device, devNode;
            for (var i = func.device_functions.length - 1; i >= 0; i--) {

                device = func.device_functions[i].device;
                devNode = self.gqlDeviceDataToNode(device);

                if (self.dimoDevices[devNode.id] == undefined) {
                    self.dimoDevices[devNode.id] = devNode;
                    nodes.push(devNode)
                }


                edges.push({ "source": funcNode.id, "target": devNode.id, type: "custom-cubic" })

            }



            var project, projNode;
            for (var i = func.function_projects.length - 1; i >= 0; i--) {

                project = func.function_projects[i].project;
                projNode = self.gqlProjectDataToNode(project);

                if (self.dimoProjects[projNode.id] == undefined) {
                    self.dimoProjects[projNode.id] = projNode;
                    nodes.push(projNode)
                }


                edges.push({ "source": funcNode.id, "target": projNode.id, type: "custom-cubic" })

            }

            var org, orgNode;
            for (var i = func.function_sp_orgs.length - 1; i >= 0; i--) {

                org = func.function_sp_orgs[i].organization;
                orgNode = self.gqlOrgDataToNode(org);

                if (self.dimoOrgs[orgNode.id] == undefined) {
                    self.dimoOrgs[orgNode.id] = orgNode;
                    nodes.push(orgNode)
                }


                edges.push({ "source": funcNode.id, "target": orgNode.id, type: "custom-cubic" })

            }




            for (var i = func.device_functions.length - 1; i >= 0; i--) {
                device = func.device_functions[i].device;

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


                for (var j = device.device_oem_orgs.length - 1; j >= 0; j--) {

                    if (self.dimoOrgs[device.device_oem_orgs[j].organization.id] != undefined) {
                        edges.push({ "source": device.id, "target": device.device_oem_orgs[j].organization.id, type: "custom-cubic" })
                    }

                }




                for (var j = device.project_devices.length - 1; j >= 0; j--) {

                    if (self.dimoProjects[device.project_devices[j].project.id] != undefined) {
                        edges.push({ "source": device.id, "target": device.project_devices[j].project.id, type: "custom-cubic" })
                    }

                }


            }


            for (var i = func.function_projects.length - 1; i >= 0; i--) {
                project = func.function_projects[i].project;

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


            }

            for (var i = func.function_sp_orgs.length - 1; i >= 0; i--) {
                org = func.function_sp_orgs[i].organization;

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



            }




            if (initial) {
                initGraph(nodes, edges);
            } else {
                self.refreshGraph(nodes, edges);
            }




        })
}



self.gqlDeviceDataToNode = (device)=>{

    var node = {
        "id": device.id,
        "type": "dimo-node",
        "class":"[Device]",
        "label":device.name,
        "airtableURL":"https://airtable.com/tblBfeuQ77VxrrGAx/viwrAkUlftN8UCRvK/" + device.id,
    };
 
    node.level = 1;


    if (device.device_device_types.length) {

        node._type = device.device_device_types[0].device_type.name

        var url = device.device_device_types[0].device_type.icon

        if (url.length) {
            node.logo = {
                "show": true,
                "url": url[0]
            }
        } else {
            node.logo = {
                "show": false,
            }
        }




    } else {
        node.logo = {
            "show": false,
        }
    }
    

    node.icon = {
      "url":dimoDeviceIcon
    }

    node.colorSet = colorSets[dimoDeviceColorIndex]
    

    node.labelCfg = {
      position: "bottom",
      offset: 5,
      style: {
        fill: global.node.labelCfg.style.fill,
        fontSize: 12,
        stroke: global.node.labelCfg.style.stroke,
        lineWidth: 3
      }
    }
    return node



}






function loadDimoDevice(device_id, nodes, edges, initial = true) {



    const vars = { "device_id": device_id }
    graphQLClient.request(deviceQuery, vars).then(



        function(data) {



            var device = data.device[0];
            var devNode = self.gqlDeviceDataToNode(device);

            if (initial) {

                self.dimoDevices[devNode.id] = devNode
                nodes.push(devNode)
            }

            var func, funcNode;
            for (var i = device.device_functions.length - 1; i >= 0; i--) {

                func = device.device_functions[i].function;
                funcNode = self.gqlFunctionDataToNode(func);

                if (self.dimoFunctions[funcNode.id] == undefined) {
                    self.dimoFunctions[funcNode.id] = funcNode;
                    nodes.push(funcNode)
                }


                edges.push({ "source": devNode.id, "target": funcNode.id, type: "custom-cubic" })






            }

            var org, orgNode;
            for (var i = device.device_oem_orgs.length - 1; i >= 0; i--) {

                org = device.device_oem_orgs[i].organization;
                orgNode = self.gqlOrgDataToNode(org);

                if (self.dimoOrgs[orgNode.id] == undefined) {
                    self.dimoOrgs[orgNode.id] = orgNode;
                    nodes.push(orgNode)
                }


                edges.push({ "source": devNode.id, "target": orgNode.id, type: "custom-cubic" })






            }


            for (var i = device.device_sp_orgs.length - 1; i >= 0; i--) {

                org = device.device_sp_orgs[i].organization;
                orgNode = self.gqlOrgDataToNode(org);

                if (self.dimoOrgs[orgNode.id] == undefined) {
                    self.dimoOrgs[orgNode.id] = orgNode;
                    nodes.push(orgNode)
                }


                edges.push({ "source": devNode.id, "target": orgNode.id, type: "custom-cubic" })






            }

            var project, projNode
            for (var i = device.project_devices.length - 1; i >= 0; i--) {

                project = device.project_devices[i].project;
                projNode = self.gqlProjectDataToNode(project);

                if (self.dimoProjects[projNode.id] == undefined) {
                    self.dimoProjects[projNode.id] = projNode;
                    nodes.push(projNode)
                }


                edges.push({ "source": devNode.id, "target": projNode.id, type: "custom-cubic" })






            }






          for (var i = device.device_functions.length - 1; i >= 0; i--) {
              func = device.device_functions[i].function;

              for (var j = func.device_functions.length - 1; j >= 0; j--) {

                  if (self.dimoDevices[func.device_functions[j].device.id] != undefined) {
                      edges.push({ "source": func.id, "target": func.device_functions[j].device.id, type: "custom-cubic" })
                  }

              }


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
          }


          for (var i = device.device_oem_orgs.length - 1; i >= 0; i--) {
              org = device.device_oem_orgs[i].organization;

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



            }

          for (var i = device.device_sp_orgs.length - 1; i >= 0; i--) {
              org = device.device_sp_orgs[i].organization;

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



            }




          for (var i = device.project_devices.length - 1; i >= 0; i--) {
              project = device.project_devices[i].project;

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



            }


            if (initial) {
                initGraph(nodes,edges);
            }
            else {
              self.refreshGraph(nodes, edges);
            }




        })

}


function loadConnectedItems(model) {

    var nodes = [];
    var edges = [];



    if(model.class=="[Project]") {

      loadDimoProject(model.id,nodes, edges, false)

    }

    else if(model.class=="[Org]") {
      loadDimoOrg(model.id,nodes, edges, false)
    }

    else if (model.class=="[Device]") {
      loadDimoDevice(model.id,nodes,edges, false)
    }

    else if (model.class=="[Function]") {
      loadDimoFunction(model.id,nodes,edges, false)
    }    
    





}




self.refreshGraph = (nodes, edges)=>{

    
    layout.instance.stop();
    nodes.forEach((node) => {
      node.skip = false;


    })

    edges.forEach((edge) => {
      edge.skip = false;


    })

    console.log(edges)

    let currentNodeIds = [];
    let removeNodes = [];

    const graphNodes = graph.getNodes();
    const graphEdges = graph.getEdges();
    var node,edge;

     for (var i = graphNodes.length - 1; i >= 0; i--) {
       currentNodeIds.push(graphNodes[i]._cfg.id)
     }
     for (var i = nodes.length - 1; i >= 0; i--) {
       if(currentNodeIds.includes(nodes[i].id)){
         removeNodes.push(i);
       }
     }


     for (var i = 0; i <= removeNodes.length-1; i++) {
       
       nodes.splice(removeNodes[i],1)
        
     }


     for (var i = graphNodes.length - 1; i >= 0; i--) {
       //console.log(graphNodes[i].getModel())
       node = graphNodes[i].getModel()
       node.skip = true;
       node.label = node.oriLabel;
       nodes.push(node);
     }

     for (var i = graphEdges.length - 1; i >= 0; i--) {
       edge = graphEdges[i].getModel()
       edge.skip = true;
       edges.push(edge);
     }






    var edges_ = removeDuplicateEdges(edges);
    edges_ = removeDuplicateEdges(edges_);
    processAllNodesEdges(nodes,edges_, false);




    graph.changeData({nodes:nodes,edges:edges_});
    
  hideItems(graph);
  graph.getNodes().forEach((node) => {
    node.toFront();
  });


  //var layoutConfig = getForceLayoutConfig(graph, largeGraphMode);
  // layoutConfig.center = [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2];
  //layout.instance = new G6.Layout["gForce"](layoutConfig);
  // layout.instance.getMass = (d) => {
  //   const cachePosition = self.cachePositions[d.id];
  //   if (cachePosition) return 5;
  //   return 1;
  // };

  // layout.instance.getCenter = d => {
  //   const cachePosition = self.cachePositions[d.id];
  //   if (!cachePosition && (d.x || d.y)) return [d.x, d.y, 10];
  //   else if (cachePosition) return [cachePosition.x, cachePosition.y, 10];
  //   return [width / 2, height / 2, 10];
  // }

  //  layout.instance.init({
  //   nodes: nodes,
  //   edges:edges_
  // });

  // layout.instance.execute();
}



function initGraphData() {

  const vars = getUrlVars();
  console.info("initGraph",vars)

  if (vars["s3State"] != undefined){
    
    fetch("/graphviz-states/"+vars["s3State"]).then(rdata => {

      const jsonData = rdata.json().then(data => {

            console.log("jsonData",data)

      for (var i = data.nodes.length - 1; i >= 0; i--) {
      //colorSets[dimoProjectColorIndex]
      var indx;
      if (data.nodes[i].class == "[Project]"){
        self.dimoProjects.push(data.nodes[i])
        indx = dimoProjectColorIndex
      } else if (data.nodes[i].class == "[Device]"){
        self.dimoDevices.push(data.nodes[i])
        indx = dimoDeviceColorIndex
      } else if (data.nodes[i].class == "[Org]"){
        self.dimoOrgs.push(data.nodes[i])
        indx = dimoOrgColorIndex
      } else if (data.nodes[i].class == "[Function]"){
        self.dimoFunctions.push(data.nodes[i])
        indx = dimoFunctionColorIndex
      }
      data.nodes[i].colorSet = colorSets[indx];
      data.nodes[i].labelCfg = {
      position: "bottom",
      offset: 5,
      style: {
        fill: global.node.labelCfg.style.fill,
        fontSize: 12,
        stroke: global.node.labelCfg.style.stroke,
        lineWidth: 3
      }
    }
    }
    self.dimoGraphData.nodes = data.nodes
    self.dimoGraphData.edges = data.edges
    var ndata = initGraph(data.nodes,data.edges,false);

      })




    })
   // window.prompt("json",jsonData)


  } else if (vars["org_id"] != undefined) {
    loadDimoOrg(vars["org_id"], self.dimoGraphData.nodes, self.dimoGraphData.edges);

  } else if (vars["project_id"] != undefined) {
    loadDimoProject(vars["project_id"], self.dimoGraphData.nodes, self.dimoGraphData.edges)
  } else if (vars["device_id"] != undefined) {
    loadDimoDevice(vars["device_id"], self.dimoGraphData.nodes, self.dimoGraphData.edges)
  } else if (vars["function_id"] != undefined) {
    loadDimoFunction(vars["function_id"], self.dimoGraphData.nodes, self.dimoGraphData.edges)
  }

}

self.dimoGraphData = { nodes: [], edges: [] };



initGraphData();






function processAllNodesEdges(nodes_, edges_, isNewGraph) {


    const currentNodeMap = {};
    let maxNodeCount = -Infinity;
    const paddingRatio = 0.3;
    const paddingLeft = paddingRatio * CANVAS_WIDTH;
    const paddingTop = paddingRatio * CANVAS_HEIGHT;
    nodes_.forEach((node) => {
      //console.log(node.skip)

      //console.log(node)
      node.labelLineNum = undefined;
      node.oriLabel = node.label;
      node.label = formatText(node.label, labelMaxLength, "...");
      node.degree = 0;
      node.inDegree = 0;
      node.outDegree = 0;
      nodeMap[node.id] = node;


      if (currentNodeMap[node.id]) {
        debugger;
        console.warn("node exists already!", node.id);
        node.id = `${node.id}${Math.random()}`;
      }
      currentNodeMap[node.id] = node;
      if (node.count > maxNodeCount) maxNodeCount = node.count;
      const cachePosition = self.cachePositions ? self.cachePositions[node.id] : undefined;
      if (cachePosition) {
        node.x = cachePosition.x;
        node.y = cachePosition.y;
        node.new = false;
      } else {
        node.new = isNewGraph ? false : true;
        if (manipulatePosition && !node.x && !node.y) {
          node.x =
            manipulatePosition.x + 30 * Math.cos(Math.random() * Math.PI * 2);
          node.y =
            manipulatePosition.y + 30 * Math.sin(Math.random() * Math.PI * 2);
        }
      }
    });



  edges_.forEach((edge) => {

      if (edge.skip == true){
        return
      }

    // to avoid the dulplicated id to nodes
    if (!edge.id) edge.id = `edge-${uniqueId()}`;
    else if (edge.id.split("-")[0] !== "edge") edge.id = `edge-${edge.id}`;
    // TODO: delete the following line after the queried data is correct
    if (!currentNodeMap[edge.source] || !currentNodeMap[edge.target]) {
      console.warn(
        "edge source target does not exist",
        edge.source,
        edge.target,
        edge.id
      );
      return;
    }
    const sourceNode = currentNodeMap[edge.source];
    const targetNode = currentNodeMap[edge.target];

    if (!sourceNode || !targetNode)
      console.warn(
        "source or target is not defined!!!",
        edge,
        sourceNode,
        targetNode
      );

    // calculate the degree
    sourceNode.degree++;
    targetNode.degree++;
    sourceNode.outDegree++;
    targetNode.inDegree++;
  });

  edges_.forEach((edge) => {

         if (edge.skip == true){
        return
      }


    // to avoid the dulplicated id to nodes
    if (!edge.id) edge.id = `edge-${uniqueId()}`;
    else if (edge.id.split("-")[0] !== "edge") edge.id = `edge-${edge.id}`;
    // TODO: delete the following line after the queried data is correct
    if (!currentNodeMap[edge.source] || !currentNodeMap[edge.target]) {
      console.warn(
        "edge source target does not exist",
        edge.source,
        edge.target,
        edge.id
      );
      return;
    }
    const sourceNode = currentNodeMap[edge.source];
    const targetNode = currentNodeMap[edge.target];

    if (!sourceNode || !targetNode)
      console.warn(
        "source or target is not defined!!!",
        edge,
        sourceNode,
        targetNode
      );

    // calculate the degree
    sourceNode.degree++;
    targetNode.degree++;
    sourceNode.outDegree++;
    targetNode.inDegree++;
  });
  const countRange = 7;
  const minEdgeSize = 1;
  const maxEdgeSize = 7;
  const edgeSizeRange = maxEdgeSize - minEdgeSize;

  edges_.forEach((edge) => {

         if (edge.skip == true){
        return
      }
    // set edges' style
    const targetNode = currentNodeMap[edge.target];

    const size = 5
    edge.size = size;

    const arrowWidth = Math.max(size / 2 + 2, 3);
    const arrowLength = 10;
    const arrowBeging = arrowLength;
    let arrowPath = `M ${arrowBeging},0 L ${
      arrowBeging + arrowLength
    },-${arrowWidth} L ${arrowBeging + arrowLength},${arrowWidth} Z`;
    let d = arrowLength;

    const sourceNode = currentNodeMap[edge.source];
    const isRealEdge = false
    const stroke = global.edge.style.stroke;
    const opacity = global.edge.style.strokeOpacity;
    const dash = Math.max(size, 2);
    const lineDash = [dash, dash];
    edge.style = {
      stroke,
      strokeOpacity: opacity,
      cursor: "pointer",
      lineAppendWidth: 5,
      fillOpacity: 1,
      lineDash,
      endArrow: arrowPath
        ? {
            path: arrowPath,
            d,
            fill: stroke,
            strokeOpacity: 0
          }
        : false
    };

    // arrange the other nodes around the hub
    const sourceDis = sourceNode.size / 2 + 20;
    const targetDis = targetNode.size / 2 + 20;
    if (sourceNode.x && !targetNode.x) {
      targetNode.x =
        sourceNode.x + sourceDis * Math.cos(Math.random() * Math.PI * 2);
    }
    if (sourceNode.y && !targetNode.y) {
      targetNode.y =
        sourceNode.y + sourceDis * Math.sin(Math.random() * Math.PI * 2);
    }
    if (targetNode.x && !sourceNode.x) {
      sourceNode.x =
        targetNode.x + targetDis * Math.cos(Math.random() * Math.PI * 2);
    }
    if (targetNode.y && !sourceNode.y) {
      sourceNode.y =
        targetNode.y + targetDis * Math.sin(Math.random() * Math.PI * 2);
    }

    if (!sourceNode.x && !sourceNode.y && manipulatePosition) {
      sourceNode.x =
        manipulatePosition.x + 30 * Math.cos(Math.random() * Math.PI * 2);
      sourceNode.y =
        manipulatePosition.y + 30 * Math.sin(Math.random() * Math.PI * 2);
    }
    if (!targetNode.x && !targetNode.y && manipulatePosition) {
      targetNode.x =
        manipulatePosition.x + 30 * Math.cos(Math.random() * Math.PI * 2);
      targetNode.y =
        manipulatePosition.y + 30 * Math.sin(Math.random() * Math.PI * 2);
    }
  });


}

function removeDuplicateEdges(edges) {
    var edge
    const newEdges = [];
    var toRemove = [];


    for (var i = edges.length - 1; i >= 0; i--) {

        if (!toRemove.includes(i)) {
            for (var j = edges.length - 1; j >= 0; j--) {

                if (j != i && !toRemove.includes(j)) {
                    if (edges[j].source == edges[i].source && edges[j].target == edges[i].target) {
                        console.warn(edges[i].source, edges[j].source,edges[i].target, edges[j].target)
                        toRemove.push(j)
                    }
                }

            }


        }
    }

    toRemove = [...new Set(toRemove)];

    for (var i = edges.length - 1; i >= 0; i--) {
        if (!toRemove.includes(i)) {
            for (var j = edges.length - 1; j >= 0; j--) {

                if (!toRemove.includes(j)) {
                    if (edges[j].source == edges[i].target && edges[j].target == edges[i].source) {
                        console.warn(edges[i].source, edges[j].target,edges[i].target, edges[j].source)
                        toRemove.push(j)
                    }
                }

            }
        }



    }

    toRemove = [...new Set(toRemove)];
    toRemove.sort();
    for (var i = edges.length - 1; i >= 0; i--) {
        if(toRemove.includes(i)!=true){
          newEdges.push(edges[i])
        }
    }

    return newEdges;


}

function atou(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

function utoa(data) {
  return btoa(unescape(encodeURIComponent(data)));
}


function getStateURL() {




  var data = JSON.parse(JSON.stringify(graph.save()));
  console.log(data)
  var deleteNodes = [];
  var deleteEdges = [];
  for (var i = data.nodes.length - 1; i >= 0; i--) {
    delete data.nodes[i].colorSet
    data.nodes[i].label = data.nodes[i].oriLabel
    delete data.nodes[i].oriLabel
    delete data.nodes[i].degree
    delete data.nodes[i].inDegree
    delete data.nodes[i].outDegree
    delete data.nodes[i].labelCfg
    delete data.nodes[i].new
    delete data.nodes[i].style
    delete data.nodes[i].skip
    delete data.nodes[i].depth

    if (hiddenItemIds.includes(data.nodes[i].id)){
      deleteNodes.push(i)
    }
  }

  for (var i = data.edges.length - 1; i >= 0; i--) {
    delete data.edges[i].id
    delete data.edges[i].size
    delete data.edges[i].style
    delete data.edges[i].startPoint
    delete data.edges[i].endPoint
    delete data.edges[i].curveOffset
    delete data.edges[i].curvePosition
    delete data.edges[i].skip
    delete data.edges[i].depth
    
    if (hiddenItemIds.includes(data.edges[i].source)){
      deleteEdges.push(i)
    } 

    if (hiddenItemIds.includes(data.edges[i].target)){
      deleteEdges.push(i)
    }     
  }

  console.log(deleteNodes,deleteEdges,hiddenItemIds)
  for (var i = 0; i <= deleteNodes.length-1; i++) {
     data.nodes.splice(deleteNodes[i], 1);
  }

  for (var i = 0; i <= deleteEdges.length-1; i++) {
     data.edges.splice(deleteEdges[i], 1);
  }



  //console.log("saveData",data);
  const jsonData = JSON.stringify(data);
      fetch("/default/graphvizLambdaS3", {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: jsonData,

      }).then(data => {
          const s3resp = data.json().then(s3data => {
          const url = window.location.origin + window.location.pathname + "?s3State=" + s3data.url
          window.prompt("Page URL",url);

          })
          
      })
        // Lrequest.post("/default/graphvizLambdaS3", { json: data },
  //     (error, res, body) => {
  //         if (error) {
  //             console.error(error)
  //             return
  //         }
  //         console.log(`statusCode: ${res.statusCode}`)
  //         console.log(body)
  //     }
  // )




}


function initGraph(nodes, edges_, useLayout=true) {

  var edges = removeDuplicateEdges(edges_);
  const container = document.getElementById("container");
  container.style.backgroundColor = "#2b2f33";
  CANVAS_WIDTH = container.scrollWidth;
  CANVAS_HEIGHT = (self.innerHeight) - 25;

   
    const contextMenu = new G6.Menu({
      shouldBegin(evt) {
        if (evt.target && evt.target.isCanvas && evt.target.isCanvas())
          return true;
        if (evt.item) return true;
        return false;
      },
      getContent(evt) {
        const { item } = evt;
        if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
          return `<ul>
          <li id='show'>Show all Hidden Items</li>
        </ul>`;
        } else if (!item) return;
        const itemType = item.getType();
        const model = item.getModel();
        if (itemType && model) {
          if (itemType === "node") {
            if (model.level !== 0) {
              return `<ul>
              <li id='hide'>Hide Selected Node(s)</li>
              <li id='url'>View in Airtable</li>
              <li id='load'>Load Connected Items</li>
              <li id='selectConnections'>Select Connected Nodes</li>
              <li id='selectByType'>Select All Nodes of Same Type</li>
              <li id='group'>Group Selected Nodes</li>
              <li id='organizeAll'>Organize All Nodes</li>
            </ul>`;
            }
          }
        }
      },
      handleMenuClick: (target, item) => {
        const model = item && item.getModel();
        const liIdStrs = target.id.split("-");
        let mixedGraphData;
        switch (liIdStrs[0]) {
          case "hide":

            var hidNodes = graph.findAllByState("node", "focus");

            for (var i = hidNodes.length - 1; i >= 0; i--) {
              hiddenItemIds.push(hidNodes[i]._cfg.id);
              graph.hideItem(hidNodes[i])

            }
            //console.log(hiddenItemIds)
            
            break;
          case "show":
            showItems(graph);
            break;
          case "url":
            window.open(model.airtableURL, '_blank');
            break;
          case "load":
            self.cachePositions = self.cacheNodePositions(graph.getNodes());
            loadConnectedItems(model);
            break;
           case "selectConnections":
            item._cfg.edges.forEach((edge)=>{
              graph.setItemState(edge._cfg.source,"focus",true)
              graph.setItemState(edge._cfg.target,"focus",true)
            })
            break;
          case "group":
            const focusNodes = graph.findAllByState("node", "focus");
            
            for (var i = focusNodes.length - 1; i >= 0; i--) {
              if(focusNodes[i]._cfg.id==item._cfg.id){
                focusNodes.splice(i,1)
                break;
              }
            }

            const baseX = item._cfg.model.x
            const baseY = item._cfg.model.y
            var offset = 0;
            for (var i = focusNodes.length - 1; i >= 0; i--) {

                 const newX = baseX
                 const newY = baseY + (i+1+offset)*(50)
                 graph.updateItem(focusNodes[i],{x:newX,y:newY})
                 graph.setItemState(focusNodes[i],"focus",false)
                 graph.setItemState(focusNodes[i],"focus",true)

              
            
            }
            graph.setItemState(item,"focus",false)
            graph.setItemState(item,"focus",true)
            break
          case "selectByType":
            const Nodes = graph.getNodes()
            console.log(Nodes)
            for (var i = Nodes.length - 1; i >= 0; i--) {
              if(item._cfg.model.class==Nodes[i]._cfg.model.class){
                graph.setItemState(Nodes[i],"focus",true)
              }
            }

            
            break;
          case "organizeAll":
           
            var radLayoutConfig = {
                type: 'radial',
                center: [item._cfg.model.x,item._cfg.model.y], // The center of the graph by default
                linkDistance: 100, // The edge length
                maxIteration: 2000,
                focusNode: item._cfg.id,
                unitRadius: 500,
                preventOverlap: true, // nodeSize or size in data is required for preventOverlap: true
                maxPreventOverlapIteration:10000,
                nodeSize: 200,
                strictRadial: true,
                workerEnabled: true, // Whether to activate web-worker

            }
            graph.set('animate', true);
            graph.updateLayout(radLayoutConfig)


            break;
          default:
            break;
        }
      },
      // offsetX and offsetY include the padding of the parent container
      // 需要加上父级容器的 padding-left 16 与自身偏移量 10
      offsetX: 16 + 10,
      // 需要加上父级容器的 padding-top 24 、画布兄弟元素高度、与自身偏移量 10
      offsetY: 0,
      // the types of items that allow the menu show up
      // 在哪些类型的元素上响应
      itemTypes: ["node", "edge", "canvas"]
    });



  const tooltip = new G6.Tooltip({
    offsetX: 10,
    offsetY: 10,
    // the types of items that allow the tooltip show up
    // 允许出现 tooltip 的 item 类型
    itemTypes: ['edge'],
    // custom the tooltip's content
    // 自定义 tooltip 内容
    getContent: (e) => {
      const outDiv = document.createElement('div');
      outDiv.style.width = 'fit-content';
      //outDiv.style.padding = '0px 0px 20px 0px';
      
      if (e.item.getType()=="edge"){


      outDiv.innerHTML = `
        <ul>
          <li>${e.item.getSource().getModel().class} &#60;-&#62; ${e.item.getTarget().getModel().class}</li>
        </ul>
        <ul>
          <li>Source: ${e.item.getSource().getModel().oriLabel}</li>
        </ul>
        <ul>
          <li>Target: ${e.item.getTarget().getModel().oriLabel}</li>
        </ul>`;
      }


      return outDiv;
    },
  });







    const toolbar = new G6.ToolBar({
        getContent: () => {
            return `
<ul class="g6-component-toolbar" style="position: absolute;left: 25vw;right: 25vw;top: 9px;align:center">
    <li code="redo">
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M256 682.666667c0-102.741333 66.730667-213.333333 213.333333-213.333334 107.008 0 190.762667 56.576 230.570667 125.354667L611.968 682.666667H853.333333v-241.365334l-91.562666 91.562667C704.768 448.469333 601.130667 384 469.333333 384c-196.096 0-298.666667 150.229333-298.666666 298.666667h85.333333z" fill="" p-id="2041"></path>
        </svg>
    </li>
    <li code="undo">
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M170.666667 682.666667h241.365333l-87.936-87.978667C363.904 525.909333 447.658667 469.333333 554.666667 469.333333c146.602667 0 213.333333 110.592 213.333333 213.333334h85.333333c0-148.437333-102.570667-298.666667-298.666666-298.666667-131.797333 0-235.392 64.469333-292.48 148.821333L170.666667 441.301333V682.666667z" fill="" p-id="2764"></path>
        </svg>
    </li>
    <li code="zoomOut">
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M658.432 428.736a33.216 33.216 0 0 1-33.152 33.152H525.824v99.456a33.216 33.216 0 0 1-66.304 0V461.888H360.064a33.152 33.152 0 0 1 0-66.304H459.52V296.128a33.152 33.152 0 0 1 66.304 0V395.52H625.28c18.24 0 33.152 14.848 33.152 33.152z m299.776 521.792a43.328 43.328 0 0 1-60.864-6.912l-189.248-220.992a362.368 362.368 0 0 1-215.36 70.848 364.8 364.8 0 1 1 364.8-364.736 363.072 363.072 0 0 1-86.912 235.968l192.384 224.64a43.392 43.392 0 0 1-4.8 61.184z m-465.536-223.36a298.816 298.816 0 0 0 298.432-298.432 298.816 298.816 0 0 0-298.432-298.432A298.816 298.816 0 0 0 194.24 428.8a298.816 298.816 0 0 0 298.432 298.432z"></path>
        </svg>
    </li>
    <li code="zoomIn">
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
            <path d="M639.936 416a32 32 0 0 1-32 32h-256a32 32 0 0 1 0-64h256a32 32 0 0 1 32 32z m289.28 503.552a41.792 41.792 0 0 1-58.752-6.656l-182.656-213.248A349.76 349.76 0 0 1 480 768 352 352 0 1 1 832 416a350.4 350.4 0 0 1-83.84 227.712l185.664 216.768a41.856 41.856 0 0 1-4.608 59.072zM479.936 704c158.784 0 288-129.216 288-288S638.72 128 479.936 128a288.32 288.32 0 0 0-288 288c0 158.784 129.216 288 288 288z" p-id="3853"></path>
        </svg>
    </li>
    <li code="autoZoom">
        <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="24">
            <path d="M684.288 305.28l0.128-0.64-0.128-0.64V99.712c0-19.84 15.552-35.904 34.496-35.712a35.072 35.072 0 0 1 34.56 35.776v171.008h170.944c19.648 0 35.84 15.488 35.712 34.432a35.072 35.072 0 0 1-35.84 34.496h-204.16l-0.64-0.128a32.768 32.768 0 0 1-20.864-7.552c-1.344-1.024-2.816-1.664-3.968-2.816-0.384-0.32-0.512-0.768-0.832-1.088a33.472 33.472 0 0 1-9.408-22.848zM305.28 64a35.072 35.072 0 0 0-34.56 35.776v171.008H99.776A35.072 35.072 0 0 0 64 305.216c0 18.944 15.872 34.496 35.84 34.496h204.16l0.64-0.128a32.896 32.896 0 0 0 20.864-7.552c1.344-1.024 2.816-1.664 3.904-2.816 0.384-0.32 0.512-0.768 0.768-1.088a33.024 33.024 0 0 0 9.536-22.848l-0.128-0.64 0.128-0.704V99.712A35.008 35.008 0 0 0 305.216 64z m618.944 620.288h-204.16l-0.64 0.128-0.512-0.128c-7.808 0-14.72 3.2-20.48 7.68-1.28 1.024-2.752 1.664-3.84 2.752-0.384 0.32-0.512 0.768-0.832 1.088a33.664 33.664 0 0 0-9.408 22.912l0.128 0.64-0.128 0.704v204.288c0 19.712 15.552 35.904 34.496 35.712a35.072 35.072 0 0 0 34.56-35.776V753.28h170.944c19.648 0 35.84-15.488 35.712-34.432a35.072 35.072 0 0 0-35.84-34.496z m-593.92 11.52c-0.256-0.32-0.384-0.768-0.768-1.088-1.088-1.088-2.56-1.728-3.84-2.688a33.088 33.088 0 0 0-20.48-7.68l-0.512 0.064-0.64-0.128H99.84a35.072 35.072 0 0 0-35.84 34.496 35.072 35.072 0 0 0 35.712 34.432H270.72v171.008c0 19.84 15.552 35.84 34.56 35.776a35.008 35.008 0 0 0 34.432-35.712V720l-0.128-0.64 0.128-0.704a33.344 33.344 0 0 0-9.472-22.848zM512 374.144a137.92 137.92 0 1 0 0.128 275.84A137.92 137.92 0 0 0 512 374.08z"></path>
        </svg>
    </li>
    <li code="saveState">
        <svg class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" width="20" height="24"> <g> <g> <g> <path d="M416,0H152.64L48,122.08V464c0,26.51,21.49,48,48,48h320c26.51,0,48-21.49,48-48V48C464,21.49,442.51,0,416,0z M432,464 c0,8.837-7.163,16-16,16H96c-8.837,0-16-7.163-16-16v-48h64v-32H80V133.92L167.36,32H416c8.837,0,16,7.163,16,16V464z"/> <rect x="176" y="64" width="32" height="128"/> <rect x="240" y="64" width="32" height="128"/> <rect x="304" y="64" width="32" height="128"/> <rect x="368" y="64" width="32" height="128"/> </g> </g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> <g> </g> 
        </svg>
    </li>
    <li code="settings">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="24" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" viewBox="0 0 28 28"><g fill="none"><path d="M14 9.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9zM11 14a3 3 0 1 1 6 0a3 3 0 0 1-6 0z" fill="#000000"/><path d="M21.71 22.395l-1.728-.759a1.72 1.72 0 0 0-1.542.086c-.467.27-.765.747-.824 1.284l-.208 1.88a.923.923 0 0 1-.703.796a11.67 11.67 0 0 1-5.412 0a.923.923 0 0 1-.702-.796l-.208-1.877a1.701 1.701 0 0 0-.838-1.281a1.694 1.694 0 0 0-1.526-.086l-1.728.759a.92.92 0 0 1-1.043-.215a12.064 12.064 0 0 1-2.707-4.672a.924.924 0 0 1 .334-1.016l1.527-1.128a1.7 1.7 0 0 0 0-2.74l-1.527-1.125a.924.924 0 0 1-.334-1.017A12.059 12.059 0 0 1 5.25 5.821a.92.92 0 0 1 1.043-.214l1.72.757a1.707 1.707 0 0 0 2.371-1.376l.21-1.878a.923.923 0 0 1 .715-.799c.881-.196 1.78-.3 2.704-.311c.902.01 1.8.115 2.68.311a.922.922 0 0 1 .715.8l.209 1.878a1.701 1.701 0 0 0 1.688 1.518c.233 0 .464-.049.68-.144l1.72-.757a.92.92 0 0 1 1.043.214a12.057 12.057 0 0 1 2.708 4.667a.924.924 0 0 1-.333 1.016l-1.525 1.127c-.435.32-.698.829-.698 1.37c0 .54.263 1.049.699 1.37l1.526 1.126c.316.234.45.642.334 1.017a12.065 12.065 0 0 1-2.707 4.667a.92.92 0 0 1-1.043.215zm-5.447-.198a3.162 3.162 0 0 1 1.425-1.773a3.22 3.22 0 0 1 2.896-.161l1.344.59a10.565 10.565 0 0 0 1.97-3.398l-1.189-.877v-.001a3.207 3.207 0 0 1-1.309-2.578c0-1.027.497-1.98 1.307-2.576l.002-.001l1.187-.877a10.56 10.56 0 0 0-1.971-3.397l-1.333.586l-.002.001c-.406.18-.843.272-1.286.272a3.202 3.202 0 0 1-3.178-2.852v-.002l-.163-1.46a11.476 11.476 0 0 0-1.95-.193c-.674.009-1.33.074-1.975.193l-.163 1.461A3.207 3.207 0 0 1 7.41 7.737l-1.336-.588a10.558 10.558 0 0 0-1.971 3.397l1.19.877a3.201 3.201 0 0 1 0 5.155l-1.19.878a10.565 10.565 0 0 0 1.97 3.403l1.345-.59a3.194 3.194 0 0 1 2.878.16a3.2 3.2 0 0 1 1.579 2.411v.005l.162 1.464c1.297.255 2.63.255 3.927 0l.162-1.467c.024-.22.07-.437.138-.645z" fill="#000000"/></g>
        </svg>
    </li>
    <li code="search">
       <svg class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" focusable="false" width="20" height="24" style="-ms-transform: rotate(360deg); -webkit-transform: rotate(360deg); transform: rotate(360deg);" viewBox="0 0 24 24"><g fill="#000000"><path d="M15.25 0a8.25 8.25 0 0 0-6.18 13.72L1 22.88l1.12 1l8.05-9.12A8.251 8.251 0 1 0 15.25.01V0zm0 15a6.75 6.75 0 1 1 0-13.5a6.75 6.75 0 0 1 0 13.5z"/></g></svg>
    </li>


</ul>`
        },
        handleClick: (code, graph) => {
            const n = graph.getZoom()
            if (code === 'undo') {
                toolbar.undo()
            } else if (code == "redo") {
                toolbar.redo()
            } else if (code == "zoomIn") {
                var i = 1 - .05 * self.graphToolbar._cfgs.zoomSensitivity;
                if (i * n < (graph.get("minZoom"))) return;
                graph.zoomTo(n * i);
            } else if (code == "zoomOut") {
                var r = 1 / (1 - .05 * self.graphToolbar._cfgs.zoomSensitivity);
                if (r * n > (graph.get("maxZoom"))) return;
                graph.zoomTo(n * r);
            } else if (code == "autoZoom") {
              graph.fitView([20, 20]);
            } else if (code == "saveState") {
                  const pageUrl = getStateURL();
                  
            } else if (code == "settings") {
                    self.settingsModalOpen()
            } else if (code == "search") {
                    self.searchModalOpen()
            }

        }


    })
    self.graphToolbar = toolbar;

    graph = new G6.Graph({
    container: "container",
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    linkCenter: true,
    minZoom: 0.1,
    groupByTypes: false,
    enabledStack: true,
    animate:false,
    modes: {
        default: [{
                type: "drag-canvas",
                enableOptimize: true
            },
            {
                type: "zoom-canvas",
                enableOptimize: true,
                optimizeZoom: 0.01
            },
            "drag-node",
            "drag-combo",
            "collapse-expand-combo",
        ],
        brushSelect: [{
            includeEdges:false,
            type: "brush-select",
            selectedState: "focus",
            onSelect: (nodes, edges) => {
                console.log('onSelect', nodes, edges);
                },
            trigger: "drag"
        }]
    },
    defaultNode: {
        type: "dimo-node",
        size: DEFAULTNODESIZE
    },
    plugins: [contextMenu, toolbar, tooltip]
});

    self.graph = graph;
    graph.get("canvas").set("localRefresh", false);
    var layoutConfig = getForceLayoutConfig(graph, largeGraphMode);
    layoutConfig.center = [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2];
    layout.instance = new G6.Layout["gForce"](layoutConfig);
    layout.instance.init(self.dimoGraphData);
    if (useLayout) {


    layout.instance.execute();
}




    bindListener(graph);
    

    processAllNodesEdges(nodes,edges,true);


    graph.data({nodes:nodes,edges:edges});
    graph.render();


}


if (typeof window !== "undefined")
  window.onresize = () => {
    if (!graph || graph.get("destroyed")) return;
    const container = document.getElementById("container");
    if (!container) return;
    CANVAS_WIDTH = container.scrollWidth;
    CANVAS_HEIGHT = self.innerHeight - 25
    graph.changeSize(CANVAS_WIDTH, CANVAS_HEIGHT);
  };













