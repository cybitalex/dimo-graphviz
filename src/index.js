import G6 from "@antv/g6";
import insertCss from "insert-css";
import { isNumber, isArray } from "@antv/util";
import { GraphQLClient, gql, request } from 'graphql-request'








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
let cachePositions = {};
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
let CANVAS_WIDTH = 800,
  CANVAS_HEIGHT = 800;

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
  "#9661BC"
];


const dimoProjectColorIndex = 0;
const dimoOrgColorIndex = 1;
const dimoFunctionColorIndex = 2;
const dimoDeviceColorIndex = 3;


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
          cursor: "crosshair",
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
                  x: -90,
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

// Custom real node
G6.registerNode(
  "real-node",
  {
    draw(cfg, group) {
      let r = 100;
      if (isNumber(cfg.size)) {
        r = cfg.size / 2;
      } else if (isArray(cfg.size)) {
        r = cfg.size[0] / 2;
      }
      const style = cfg.style || {};
      const colorSet = cfg.colorSet || colorSets[0];

      // halo for hover
      group.addShape("circle", {
        attrs: {
          x: 0,
          y: 0,
          r: r + 5,
          fill: style.fill || colorSet.mainFill || "#2B384E",
          opacity: 0.9,
          lineWidth: 0
        },
        name: "halo-shape",
        visible: false
      });

      // focus stroke for hover
      group.addShape("circle", {
        attrs: {
          x: 0,
          y: 0,
          r: r + 5,
          fill: style.fill || colorSet.mainFill || "#2B384E",
          stroke: "#fff",
          strokeOpacity: 0.85,
          lineWidth: 1
        },
        name: "stroke-shape",
        visible: false
      });

      const keyShape = group.addShape("circle", {
        attrs: {
          ...style,
          x: 0,
          y: 0,
          r,
          fill: colorSet.mainFill,
          stroke: colorSet.mainStroke,
          lineWidth: 2,
          cursor: "pointer"
        },
        name: "aggregated-node-keyShape"
      });

      let labelStyle = {};
      if (cfg.labelCfg) {
        labelStyle = Object.assign(labelStyle, cfg.labelCfg.style);
      }

      if (cfg.label) {
        const text = cfg.label;
        let labelStyle = {};
        let refY = 0;
        if (cfg.labelCfg) {
          labelStyle = Object.assign(labelStyle, cfg.labelCfg.style);
          refY += cfg.labelCfg.refY || 0;
        }
        let offsetY = 0;
        const fontSize = labelStyle.fontSize < 8 ? 8 : labelStyle.fontSize;
        const lineNum = cfg.labelLineNum || 1;
        offsetY = lineNum * (fontSize || 12);
        group.addShape("text", {
          attrs: {
            text,
            x: 0,
            y: r + refY + offsetY + 5,
            textAlign: "center",
            textBaseLine: "alphabetic",
            cursor: "pointer",
            fontSize,
            fill: "#fff",
            opacity: .85,
            fontWeight: 400,
            stroke: global.edge.labelCfg.style.stroke
          },
          name: "text-shape",
          className: "text-shape"
        });
      }

      // tag for new node
      if (cfg.new) {
        group.addShape("circle", {
          attrs: {
            x: r - 3,
            y: -r + 3,
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
        const label = group.find((e) => e.get("name") === "text-shape");
        const keyShape = item.getKeyShape();
        const colorSet = item.getModel().colorSet || colorSets[0];
        if (value) {
          stroke && stroke.show();
          keyShape.attr("fill", colorSet.selectedFill);
          label && label.attr("fontWeight", 800);
        } else {
          stroke && stroke.hide();
          keyShape.attr("fill", colorSet.mainFill); // '#2B384E'
          label && label.attr("fontWeight", 400);
        }
      }
    },
    update: undefined
  },
  "dimo-node"
);

// Custom the quadratic edge for multiple edges between one node pair
G6.registerEdge(
  "custom-quadratic",
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
  "quadratic"
);

// Custom the line edge for single edge between one node pair
G6.registerEdge(
  "custom-line",
  {
    setState: (name, value, item) => {
      const group = item.get("group");
      const model = item.getModel();
      if (name === "focus") {
        const keyShape = group.find((ele) => ele.get("name") === "edge-shape");
        const back = group.find((ele) => ele.get("name") === "back-line");
        if (back) {
          back.stopAnimate();
          back.remove();
          back.destroy();
        }
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
            const { path, stroke, lineWidth } = keyShape.attr();
            const back = group.addShape("path", {
              attrs: {
                path,
                stroke,
                lineWidth,
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
            const lineDash = keyShape.attr("lineDash");
            const totalLength = lineDash[0] + lineDash[1];
            let index = 0;
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
            opacity: opacity,
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
  "single-edge"
);

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

//
const processNodesEdges = (
  nodes,
  edges,
  width,
  height,
  largeGraphMode,
  edgeLabelVisible,
  isNewGraph = false
) => {
  if (!nodes || nodes.length === 0) return {};
  const currentNodeMap = {};
  let maxNodeCount = -Infinity;
  const paddingRatio = 0.3;
  const paddingLeft = paddingRatio * width;
  const paddingTop = paddingRatio * height;
  nodes.forEach((node) => {
    node.type = node.level === 0 ? "real-node" : "dimo-node";
    node.isReal = node.level === 0 ? true : false;
    node.label = `${node.id}`;
    node.labelLineNum = undefined;
    node.oriLabel = node.label;
    node.label = formatText(node.label, labelMaxLength, "...");
    node.degree = 0;
    node.inDegree = 0;
    node.outDegree = 0;
    if (currentNodeMap[node.id]) {
      console.warn("node exists already!", node.id);
      node.id = `${node.id}${Math.random()}`;
    }
    currentNodeMap[node.id] = node;
    if (node.count > maxNodeCount) maxNodeCount = node.count;
    const cachePosition = cachePositions ? cachePositions[node.id] : undefined;
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

  let maxCount = -Infinity;
  let minCount = Infinity;
  // let maxCount = 0;
  edges.forEach((edge) => {
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

    if (edge.count > maxCount) maxCount = edge.count;
    if (edge.count < minCount) minCount = edge.count;
  });

  nodes.sort(descendCompare(NODESIZEMAPPING));
  const maxDegree = nodes[0].degree || 1;

  const descreteNodes = [];
  nodes.forEach((node, i) => {
    // assign the size mapping to the outDegree
    const countRatio = node.count / maxNodeCount;
    const isRealNode = node.level === 0;
    node.size = isRealNode ? DEFAULTNODESIZE : DEFAULTAGGREGATEDNODESIZE;
    node.isReal = isRealNode;
    node.labelCfg = {
      position: "bottom",
      offset: 5,
      style: {
        fill: global.node.labelCfg.style.fill,
        fontSize: 6 + countRatio * 6 || 12,
        stroke: global.node.labelCfg.style.stroke,
        lineWidth: 3
      }
    };

    if (!node.degree) {
      descreteNodes.push(node);
    }
  });

  const countRange = maxCount - minCount;
  const minEdgeSize = 1;
  const maxEdgeSize = 7;
  const edgeSizeRange = maxEdgeSize - minEdgeSize;
  edges.forEach((edge) => {
    // set edges' style
    const targetNode = currentNodeMap[edge.target];

    const size =
      ((edge.count - minCount) / countRange) * edgeSizeRange + minEdgeSize || 1;
    edge.size = size;

    const arrowWidth = Math.max(size / 2 + 2, 3);
    const arrowLength = 10;
    const arrowBeging = targetNode.size + arrowLength;
    let arrowPath = `M ${arrowBeging},0 L ${
      arrowBeging + arrowLength
    },-${arrowWidth} L ${arrowBeging + arrowLength},${arrowWidth} Z`;
    let d = targetNode.size / 2 + arrowLength;
    if (edge.source === edge.target) {
      edge.type = "loop";
      arrowPath = undefined;
    }
    const sourceNode = currentNodeMap[edge.source];
    const isRealEdge = targetNode.isReal && sourceNode.isReal;
    edge.isReal = isRealEdge;
    const stroke = isRealEdge
      ? global.edge.style.realEdgeStroke
      : global.edge.style.stroke;
    const opacity = isRealEdge
      ? global.edge.style.realEdgeOpacity
      : global.edge.style.strokeOpacity;
    const dash = Math.max(size, 2);
    const lineDash = isRealEdge ? undefined : [dash, dash];
    edge.style = {
      stroke,
      strokeOpacity: opacity,
      cursor: "pointer",
      lineAppendWidth: Math.max(edge.size || 5, 5),
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
    edge.labelCfg = {
      autoRotate: true,
      style: {
        stroke: global.edge.labelCfg.style.stroke,
        fill: global.edge.labelCfg.style.fill,
        lineWidth: 4,
        fontSize: 12,
        lineAppendWidth: 10,
        opacity: 1
      }
    };
    if (!edge.oriLabel) edge.oriLabel = edge.label;
    if (largeGraphMode || !edgeLabelVisible) edge.label = "";
    else {
      edge.label = labelFormatter(edge.label, labelMaxLength);
    }

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

  descreteNodeCenter = {
    x: width - paddingLeft,
    y: height - paddingTop
  };
  descreteNodes.forEach((node) => {
    if (!node.x && !node.y) {
      node.x =
        descreteNodeCenter.x + 30 * Math.cos(Math.random() * Math.PI * 2);
      node.y =
        descreteNodeCenter.y + 30 * Math.sin(Math.random() * Math.PI * 2);
    }
  });

  G6.Util.processParallelEdges(edges, 12.5, "custom-quadratic", "custom-line");
  return {
    maxDegree,
    edges
  };
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


  console.log("order","linkDistance","edgeStrength","nodeStrength","preventOverlap","nodeSize","collideStrength","alpha","alphaDecay","alphaMin");
  console.log(linkDistance,edgeStrength,nodeStrength,preventOverlap,nodeSize,collideStrength,alpha,alphaDecay,alphaMin);




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

const handleRefreshGraph = (
  graph,
  graphData,
  width,
  height,
  largeGraphMode,
  edgeLabelVisible,
  isNewGraph
) => {
  if (!graphData || !graph) return;
  clearFocusItemState(graph);
  // reset the filtering
  graph.getNodes().forEach((node) => {
    if (!node.isVisible()) node.show();
  });
  graph.getEdges().forEach((edge) => {
    if (!edge.isVisible()) edge.show();
  });

  let nodes = [],
    edges = [];

  nodes = graphData.nodes;
  const processRes = processNodesEdges(
    nodes,
    graphData.edges || [],
    width,
    height,
    largeGraphMode,
    edgeLabelVisible,
    isNewGraph
  );

  edges = processRes.edges;

  graph.changeData({ nodes, edges });

  hideItems(graph);
  graph.getNodes().forEach((node) => {
    node.toFront();
  });

  layout.instance.init({
    nodes: graphData.nodes,
    edges
  });

  layout.instance.minMovement = 0.0001;
  // layout.instance.getCenter = d => {
  //   const cachePosition = cachePositions[d.id];
  //   if (!cachePosition && (d.x || d.y)) return [d.x, d.y, 10];
  //   else if (cachePosition) return [cachePosition.x, cachePosition.y, 10];
  //   return [width / 2, height / 2, 10];
  // }
  layout.instance.getMass = (d) => {
    const cachePosition = cachePositions[d.id];
    if (cachePosition) return 5;
    return 1;
  };
  layout.instance.execute();
  return { nodes, edges };
};

const getMixedGraph = (
  aggregatedData,
  originData,
  nodeMap,
  aggregatedNodeMap,
  expandArray,
  collapseArray
) => {
  let nodes = [],
    edges = [];

  const expandMap = {},
    collapseMap = {};
  expandArray.forEach((expandModel) => {
    expandMap[expandModel.id] = true;
  });
  collapseArray.forEach((collapseModel) => {
    collapseMap[collapseModel.id] = true;
  });

  aggregatedData.clusters.forEach((cluster, i) => {
    if (expandMap[cluster.id]) {
      nodes = nodes.concat(cluster.nodes);
      aggregatedNodeMap[cluster.id].expanded = true;
    } else {
      nodes.push(aggregatedNodeMap[cluster.id]);
      aggregatedNodeMap[cluster.id].expanded = false;
    }
  });
  originData.edges.forEach((edge) => {
    const isSourceInExpandArray = expandMap[nodeMap[edge.source].clusterId];
    const isTargetInExpandArray = expandMap[nodeMap[edge.target].clusterId];
    if (isSourceInExpandArray && isTargetInExpandArray) {
      edges.push(edge);
    } else if (isSourceInExpandArray) {
      const targetClusterId = nodeMap[edge.target].clusterId;
      const vedge = {
        source: edge.source,
        target: targetClusterId,
        id: `edge-${uniqueId()}`,
        label: ""
      };
      edges.push(vedge);
    } else if (isTargetInExpandArray) {
      const sourceClusterId = nodeMap[edge.source].clusterId;
      const vedge = {
        target: edge.target,
        source: sourceClusterId,
        id: `edge-${uniqueId()}`,
        label: ""
      };
      edges.push(vedge);
    }
  });
  aggregatedData.clusterEdges.forEach((edge) => {
    if (expandMap[edge.source] || expandMap[edge.target]) return;
    else edges.push(edge);
  });
  return { nodes, edges };
};

const getNeighborMixedGraph = (
  centerNodeModel,
  step,
  originData,
  clusteredData,
  currentData,
  nodeMap,
  aggregatedNodeMap,
  maxNeighborNumPerNode = 5
) => {
  // update the manipulate position for center gravity of the new nodes
  manipulatePosition = { x: centerNodeModel.x, y: centerNodeModel.y };

  // the neighborSubGraph does not include the centerNodeModel. the elements are all generated new nodes and edges
  const neighborSubGraph = generateNeighbors(
    centerNodeModel,
    step,
    maxNeighborNumPerNode
  );
  // update the origin data
  originData.nodes = originData.nodes.concat(neighborSubGraph.nodes);
  originData.edges = originData.edges.concat(neighborSubGraph.edges);
  // update the origin nodeMap
  neighborSubGraph.nodes.forEach((node) => {
    nodeMap[node.id] = node;
  });
  // update the clusteredData
  const clusterId = centerNodeModel.clusterId;
  clusteredData.clusters.forEach((cluster) => {
    if (cluster.id !== clusterId) return;
    cluster.nodes = cluster.nodes.concat(neighborSubGraph.nodes);
    cluster.sumTot += neighborSubGraph.edges.length;
  });
  // update the count
  aggregatedNodeMap[clusterId].count += neighborSubGraph.nodes.length;

  currentData.nodes = currentData.nodes.concat(neighborSubGraph.nodes);
  currentData.edges = currentData.edges.concat(neighborSubGraph.edges);
  return currentData;
};

const generateNeighbors = (
  centerNodeModel,
  step,
  maxNeighborNumPerNode = 5
) => {
  if (step <= 0) return undefined;
  let nodes = [],
    edges = [];
  const clusterId = centerNodeModel.clusterId;
  const centerId = centerNodeModel.id;
  const neighborNum = Math.ceil(Math.random() * maxNeighborNumPerNode);
  for (let i = 0; i < neighborNum; i++) {
    const neighborNode = {
      id: uniqueId(),
      clusterId,
      level: 0,
      colorSet: centerNodeModel.colorSet
    };
    nodes.push(neighborNode);
    const dire = Math.random() > 0.5;
    const source = dire ? centerId : neighborNode.id;
    const target = dire ? neighborNode.id : centerId;
    const neighborEdge = {
      id: uniqueId(),
      source,
      target,
      label: `${source}-${target}`
    };
    edges.push(neighborEdge);
    const subNeighbors = generateNeighbors(
      neighborNode,
      step - 1,
      maxNeighborNumPerNode
    );
    if (subNeighbors) {
      nodes = nodes.concat(subNeighbors.nodes);
      edges = edges.concat(subNeighbors.edges);
    }
  }
  return { nodes, edges };
};

const getExtractNodeMixedGraph = (
  extractNodeData,
  originData,
  nodeMap,
  aggregatedNodeMap,
  currentUnproccessedData
) => {
  const extractNodeId = extractNodeData.id;
  // const extractNodeClusterId = extractNodeData.clusterId;
  // push to the current rendering data
  currentUnproccessedData.nodes.push(extractNodeData);
  // update the count of aggregatedNodeMap, when to revert?
  // aggregatedNodeMap[extractNodeClusterId].count --;

  // extract the related edges
  originData.edges.forEach((edge) => {
    if (edge.source === extractNodeId) {
      const targetClusterId = nodeMap[edge.target].clusterId;
      if (!aggregatedNodeMap[targetClusterId].expanded) {
        // did not expand, create an virtual edge fromt he extract node to the cluster
        currentUnproccessedData.edges.push({
          id: uniqueId(),
          source: extractNodeId,
          target: targetClusterId
        });
      } else {
        // if the cluster is already expanded, push the origin edge
        currentUnproccessedData.edges.push(edge);
      }
    } else if (edge.target === extractNodeId) {
      const sourceClusterId = nodeMap[edge.source].clusterId;
      if (!aggregatedNodeMap[sourceClusterId].expanded) {
        // did not expand, create an virtual edge fromt he extract node to the cluster
        currentUnproccessedData.edges.push({
          id: uniqueId(),
          target: extractNodeId,
          source: sourceClusterId
        });
      } else {
        // if the cluster is already expanded, push the origin edge
        currentUnproccessedData.edges.push(edge);
      }
    }
  });
  return currentUnproccessedData;
};

const examAncestors = (model, expandedArray, length, keepTags) => {
  for (let i = 0; i < length; i++) {
    const expandedNode = expandedArray[i];
    if (!keepTags[i] && model.parentId === expandedNode.id) {
      keepTags[i] = true; // 需要被保留
      examAncestors(expandedNode, expandedArray, length, keepTags);
      break;
    }
  }
};

const manageExpandCollapseArray = (
  nodeNumber,
  model,
  collapseArray,
  expandArray
) => {
  manipulatePosition = { x: model.x, y: model.y };

  // 维护 expandArray，若当前画布节点数高于上限，移出 expandedArray 中非 model 祖先的节点)
  if (nodeNumber > NODE_LIMIT) {
    // 若 keepTags[i] 为 true，则 expandedArray 的第 i 个节点需要被保留
    const keepTags = {};
    const expandLen = expandArray.length;
    // 检查 X 的所有祖先并标记 keepTags
    examAncestors(model, expandArray, expandLen, keepTags);
    // 寻找 expandedArray 中第一个 keepTags 不为 true 的点
    let shiftNodeIdx = -1;
    for (let i = 0; i < expandLen; i++) {
      if (!keepTags[i]) {
        shiftNodeIdx = i;
        break;
      }
    }
    // 如果有符合条件的节点，将其从 expandedArray 中移除
    if (shiftNodeIdx !== -1) {
      let foundNode = expandArray[shiftNodeIdx];
      if (foundNode.level === 2) {
        let foundLevel1 = false;
        // 找到 expandedArray 中 parentId = foundNode.id 且 level = 1 的第一个节点
        for (let i = 0; i < expandLen; i++) {
          const eNode = expandArray[i];
          if (eNode.parentId === foundNode.id && eNode.level === 1) {
            foundLevel1 = true;
            foundNode = eNode;
            expandArray.splice(i, 1);
            break;
          }
        }
        // 若未找到，则 foundNode 不变, 直接删去 foundNode
        if (!foundLevel1) expandArray.splice(shiftNodeIdx, 1);
      } else {
        // 直接删去 foundNode
        expandArray.splice(shiftNodeIdx, 1);
      }
      // const removedNode = expandedArray.splice(shiftNodeIdx, 1); // splice returns an array
      const idSplits = foundNode.id.split("-");
      let collapseNodeId;
      // 去掉最后一个后缀
      for (let i = 0; i < idSplits.length - 1; i++) {
        const str = idSplits[i];
        if (collapseNodeId) collapseNodeId = `${collapseNodeId}-${str}`;
        else collapseNodeId = str;
      }
      const collapseNode = {
        id: collapseNodeId,
        parentId: foundNode.id,
        level: foundNode.level - 1
      };
      collapseArray.push(collapseNode);
    }
  }

  const currentNode = {
    id: model.id,
    level: model.level,
    parentId: model.parentId
  };

  // 加入当前需要展开的节点
  expandArray.push(currentNode);

  graph.get("canvas").setCursor("default");
  return { expandArray, collapseArray };
};

const cacheNodePositions = (nodes) => {
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
  console.log("positionMap",positionMap)
  return positionMap;
};

const stopLayout = () => {
  layout.instance.stop();
};

const bindListener = (graph) => {
  graph.on("keydown", (evt) => {
    const code = evt.key;
    if (!code) {
      return;
    }
    if (code.toLowerCase() === "shift") {
      shiftKeydown = true;
    } else {
      shiftKeydown = false;
    }
  });
  graph.on("keyup", (evt) => {
    const code = evt.key;
    if (!code) {
      return;
    }
    if (code.toLowerCase() === "shift") {
      shiftKeydown = false;
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
    console.log(
      graph.getGroup(),
      graph.getGroup().getBBox(),
      graph.getGroup().getCanvasBBox()
    );
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
    device_functions {
      function {
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
    function_projects {
      function {
        id
        UI_screenshot
        added_by
        added_on
        blueprint_file
        assigned_to
        blueprint_url
        cms_tags
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
}

`

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
        cms_tags
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
}

`

const funtionQuery = gql`query graphvizFunctionQuery($function_id: String!) {
  function(where: {id: {_eq: $function_id}}) {
    UI_screenshot
    added_by
    added_on
    assigned_to
    cover_photo
    cost_model
    cms_tags
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


function gqlProjectDataToNode(project) {

    var node = {
        "id": project.id,
        "type": "dimo-node",
        "class":"[Project]",
        "label":project.name,
        "airtableURL":"https://airtable.com/tblpm4ls9gP94bmGA/viwbmZinIAOULOOCc/" + project.id,
    };
 
    node.logo = {
                    "show":false
      }
    

     node.level = 1;


    node.icon = {
      "url":dimoProjectIcon
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
            var projNode = gqlProjectDataToNode(proj);
            if (initial) {

            
            self.dimoProjects[projNode.id] = projNode
            nodes.push(projNode)

          }

            var device, deviceNode;
            for (var i = proj.project_devices.length - 1; i >= 0; i--) {

                device = proj.project_devices[i].device;
                deviceNode = gqlDeviceDataToNode(device);
                

                if (self.dimoDevices[deviceNode.id] == undefined){


                self.dimoDevices[deviceNode.id] = deviceNode;
                nodes.push(deviceNode)

              }


                edges.push({ "source": projNode.id, "target": deviceNode.id, type: "custom-quadratic" })

            }


            var func, funcNode;
            for (var i = proj.function_projects.length - 1; i >= 0; i--) {
                func = proj.function_projects[i].function;
                funcNode = gqlFunctionDataToNode(func);

                if (self.dimoFunctions[funcNode.id] == undefined){

                self.dimoFunctions[funcNode.id] = funcNode;
                nodes.push(funcNode);

              }
                edges.push({ "source": projNode.id, "target": funcNode.id, type: "custom-quadratic" })


            }


            var org, orgNode;

            for (var i = proj.org_projects.length - 1; i >= 0; i--) {
                org = proj.org_projects[i].organization;
                orgNode = gqlOrgDataToNode(org);
                
                if (self.dimoOrgs[orgNode.id] == undefined){

                self.dimoOrgs[orgNode.id] = orgNode;
                nodes.push(orgNode);

              }
                edges.push({ "source": orgNode.id, "target": projNode.id, type: "custom-quadratic" })
            }




            for (var i = proj.project_devices.length - 1; i >= 0; i--) {

                device = proj.project_devices[i].device;

                for (var j = device.device_functions.length - 1; j >= 0; j--) {
                  
                  if (self.dimoFunctions[device.device_functions[j].function.id] != undefined) {
                    edges.push({ "source": device.id, "target": device.device_functions[j].function.id, type: "custom-quadratic" })
                  }
                
                }
                
                for (var j = device.device_sp_orgs.length - 1; j >= 0; j--) {
                  
                  if (self.dimoOrgs[device.device_sp_orgs[j].organization.id] != undefined) {
                    edges.push({ "source": device.id, "target": device.device_sp_orgs[j].organization.id, type: "custom-quadratic" })
                  }
                
                }



                for (var j = device.project_devices.length - 1; j >= 0; j--) {
                  
                  if (self.dimoProjects[device.project_devices[j].project.id] != undefined) {
                    edges.push({ "source": device.id, "target": device.project_devices[j].project.id, type: "custom-quadratic" })
                  }
                
                }


             }


             for (var i = proj.function_projects.length - 1; i >= 0; i--) {
                 func = proj.function_projects[i].function;


                 for (var j = func.function_projects.length - 1; j >= 0; j--) {

                     if (self.dimoProjects[func.function_projects[j].project.id] != undefined) {
                         edges.push({ "source": func.id, "target": func.function_projects[j].project.id, type: "custom-quadratic" })
                     }

                 }

                 for (var j = func.function_sp_orgs.length - 1; j >= 0; j--) {

                     if (self.dimoOrgs[func.function_sp_orgs[j].organization.id] != undefined) {
                         edges.push({ "source": func.id, "target": func.function_sp_orgs[j].organization.id, type: "custom-quadratic" })
                     }

                 }


                 for (var j = func.device_functions.length - 1; j >= 0; j--) {

                     if (self.dimoDevices[func.device_functions[j].device.id] != undefined) {
                         edges.push({ "source": func.id, "target": func.device_functions[j].device.id, type: "custom-quadratic" })
                     }

                 }



              }



              for (var i = proj.org_projects.length - 1; i >= 0; i--) {

                org = proj.org_projects[i].organization;


                 for (var j = org.device_oem_orgs.length - 1; j >= 0; j--) {

                     if (self.dimoDevices[org.device_oem_orgs[j].device.id] != undefined) {
                         edges.push({ "source": org.id, "target": org.device_oem_orgs[j].device.id, type: "custom-quadratic" })
                     }

                 }


            for (var j = org.device_sp_orgs.length - 1; j >= 0; j--) {

                     if (self.dimoDevices[org.device_sp_orgs[j].device.id] != undefined) {
                         edges.push({ "source": org.id, "target": org.device_sp_orgs[j].device.id, type: "custom-quadratic" })
                     }

                 }


            for (var j = org.function_sp_orgs.length - 1; j >= 0; j--) {

                     if (self.dimoFunctions[org.function_sp_orgs[j].function.id] != undefined) {
                         edges.push({ "source": org.id, "target": org.function_sp_orgs[j].function.id, type: "custom-quadratic" })
                     }

                 }


           for (var j = org.org_projects.length - 1; j >= 0; j--) {

                     if (self.dimoProjects[org.org_projects[j].project.id] != undefined) {
                         edges.push({ "source": org.id, "target": org.org_projects[j].project.id, type: "custom-quadratic" })
                     }

                 }



              }







            if (initial) {
                initGraph(nodes,edges);
            }
            else {
              refreshGraph(nodes, edges);
            }
        })

}

function gqlOrgDataToNode(org) {

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

    node.icon = {
      "url":dimoOrgIcon
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
            var orgNode = gqlOrgDataToNode(org);

            if (initial) {

                self.dimoOrgs[orgNode.id] = orgNode
                nodes.push(orgNode)
            }

            var device, deviceNode;
            for (var i = org.device_oem_orgs.length - 1; i >= 0; i--) {

                device = org.device_oem_orgs[i].device;
                deviceNode = gqlDeviceDataToNode(device);

                if (self.dimoDevices[deviceNode.id] == undefined) {
                    self.dimoDevices[deviceNode.id] = deviceNode;
                    nodes.push(deviceNode)
                }


                edges.push({ "source": orgNode.id, "target": deviceNode.id, type: "custom-quadratic" })






            }

            for (var i = org.device_sp_orgs.length - 1; i >= 0; i--) {

                device = org.device_sp_orgs[i].device;
                deviceNode = gqlDeviceDataToNode(device);

                if (self.dimoDevices[deviceNode.id] == undefined) {

                    self.dimoDevices[deviceNode.id] = deviceNode;
                    nodes.push(deviceNode)

                }
                edges.push({ "source": orgNode.id, "target": deviceNode.id, type: "custom-quadratic" })

            }


            var func, funcNode;

            for (var i = org.function_sp_orgs.length - 1; i >= 0; i--) {
                func = org.function_sp_orgs[i].function;
                funcNode = gqlFunctionDataToNode(func);

                if (self.dimoFunctions[funcNode.id] == undefined) {
                    self.dimoFunctions[funcNode.id] = funcNode;
                    nodes.push(funcNode);

                }
                edges.push({ "source": orgNode.id, "target": funcNode.id, type: "custom-quadratic" })
                



            }


            var project, projNode;

            for (var i = org.org_projects.length - 1; i >= 0; i--) {
                project = org.org_projects[i].project;
                projNode = gqlProjectDataToNode(project);

                if (self.dimoProjects[projNode.id] == undefined) {
                    self.dimoProjects[projNode.id] = projNode;
                    nodes.push(projNode);
                }
                edges.push({ "source": orgNode.id, "target": projNode.id, type: "custom-quadratic" })
            }











            for (var i = org.function_sp_orgs.length - 1; i >= 0; i--) {
                func = org.function_sp_orgs[i].function;
                
                for (var j = func.function_projects.length - 1; j >= 0; j--) {
                  
                  if (self.dimoProjects[func.function_projects[j].project.id] != undefined) {
                    edges.push({ "source": func.id, "target": func.function_projects[j].project.id, type: "custom-quadratic" })
                  }
                
                }
                
                for (var j = func.function_sp_orgs.length - 1; j >= 0; j--) {
                  
                  if (self.dimoOrgs[func.function_sp_orgs[j].organization.id] != undefined) {
                    edges.push({ "source": func.id, "target": func.function_sp_orgs[j].organization.id, type: "custom-quadratic" })
                  }
                
                }

                
                for (var j = func.device_functions.length - 1; j >= 0; j--) {
                  
                  if (self.dimoDevices[func.device_functions[j].device.id] != undefined) {
                    edges.push({ "source": func.id, "target": func.device_functions[j].device.id, type: "custom-quadratic" })
                  }
                
                }



            }


           for (var i = org.device_oem_orgs.length - 1; i >= 0; i--) {
                device = org.device_oem_orgs[i].device;
                
                for (var j = device.device_functions.length - 1; j >= 0; j--) {
                  
                  if (self.dimoFunctions[device.device_functions[j].function.id] != undefined) {
                    edges.push({ "source": device.id, "target": device.device_functions[j].function.id, type: "custom-quadratic" })
                  }
                
                }
                
                for (var j = device.device_sp_orgs.length - 1; j >= 0; j--) {
                  
                  if (self.dimoOrgs[device.device_sp_orgs[j].organization.id] != undefined) {
                    edges.push({ "source": device.id, "target": device.device_sp_orgs[j].organization.id, type: "custom-quadratic" })
                  }
                
                }


                for (var j = device.device_oem_orgs.length - 1; j >= 0; j--) {
                  
                  if (self.dimoOrgs[device.device_oem_orgs[j].organization.id] != undefined) {
                    edges.push({ "source": device.id, "target": device.device_oem_orgs[j].organization.id, type: "custom-quadratic" })
                  }
                
                }




                for (var j = device.project_devices.length - 1; j >= 0; j--) {
                  
                  if (self.dimoProjects[device.project_devices[j].project.id] != undefined) {
                    edges.push({ "source": device.id, "target": device.project_devices[j].project.id, type: "custom-quadratic" })
                  }
                
                }


            }


            for (var i = org.org_projects.length - 1; i >= 0; i--) {
                project = org.org_projects[i].project;

                for (var j = project.function_projects.length - 1; j >= 0; j--) {

                  if (self.dimoFunctions[project.function_projects[j].function.id] != undefined) {
                    edges.push({ "source": project.id, "target": project.function_projects[j].function.id, type: "custom-quadratic" })
                  }

                }


                for (var j = project.org_projects.length - 1; j >= 0; j--) {

                  if (self.dimoOrgs[project.org_projects[j].organization.id] != undefined) {
                    edges.push({ "source": project.id, "target": project.org_projects[j].organization.id, type: "custom-quadratic" })
                  }
                  
                }

                for (var j = project.project_devices.length - 1; j >= 0; j--) {

                  if (self.dimoDevices[project.project_devices[j].device.id] != undefined) {
                    edges.push({ "source": project.id, "target": project.project_devices[j].device.id, type: "custom-quadratic" })
                  }
                  
                }


            }










            if (initial) {
                initGraph(nodes,edges);
            }
            else {
              refreshGraph(nodes, edges);
            }
        })



}
function gqlFunctionDataToNode(func) {

    var node = {
        "id": func.id,
        "type": "dimo-node",
        "class":"[Function]",
        "label":func.name,
        "airtableURL":"https://airtable.com/tbluJQFoXFEof7rdM/viwLeV2hJyBobLFZW/" + func.id,
    };
 
    node.logo = {
                    "show":false
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
            var funcNode = gqlFunctionDataToNode(func);

            if (initial) {

                self.dimoFunctions[funcNode.id] = funcNode
                nodes.push(funcNode)
            }


            var device, devNode;
            for (var i = func.device_functions.length - 1; i >= 0; i--) {

                device = func.device_functions[i].device;
                devNode = gqlDeviceDataToNode(device);

                if (self.dimoDevices[devNode.id] == undefined) {
                    self.dimoDevices[devNode.id] = devNode;
                    nodes.push(devNode)
                }


                edges.push({ "source": funcNode.id, "target": devNode.id, type: "custom-quadratic" })

            }



            var project, projNode;
            for (var i = func.function_projects.length - 1; i >= 0; i--) {

                project = func.function_projects[i].project;
                projNode = gqlProjectDataToNode(project);

                if (self.dimoProjects[projNode.id] == undefined) {
                    self.dimoProjects[projNode.id] = projNode;
                    nodes.push(projNode)
                }


                edges.push({ "source": funcNode.id, "target": projNode.id, type: "custom-quadratic" })

            }

            var org, orgNode;
            for (var i = func.function_sp_orgs.length - 1; i >= 0; i--) {

                org = func.function_sp_orgs[i].organization;
                orgNode = gqlOrgDataToNode(org);

                if (self.dimoOrgs[orgNode.id] == undefined) {
                    self.dimoOrgs[orgNode.id] = orgNode;
                    nodes.push(orgNode)
                }


                edges.push({ "source": funcNode.id, "target": orgNode.id, type: "custom-quadratic" })

            }




            for (var i = func.device_functions.length - 1; i >= 0; i--) {
                device = func.device_functions[i].device;

                for (var j = device.device_functions.length - 1; j >= 0; j--) {

                    if (self.dimoFunctions[device.device_functions[j].function.id] != undefined) {
                        edges.push({ "source": device.id, "target": device.device_functions[j].function.id, type: "custom-quadratic" })
                    }

                }

                for (var j = device.device_sp_orgs.length - 1; j >= 0; j--) {

                    if (self.dimoOrgs[device.device_sp_orgs[j].organization.id] != undefined) {
                        edges.push({ "source": device.id, "target": device.device_sp_orgs[j].organization.id, type: "custom-quadratic" })
                    }

                }


                for (var j = device.device_oem_orgs.length - 1; j >= 0; j--) {

                    if (self.dimoOrgs[device.device_oem_orgs[j].organization.id] != undefined) {
                        edges.push({ "source": device.id, "target": device.device_oem_orgs[j].organization.id, type: "custom-quadratic" })
                    }

                }




                for (var j = device.project_devices.length - 1; j >= 0; j--) {

                    if (self.dimoProjects[device.project_devices[j].project.id] != undefined) {
                        edges.push({ "source": device.id, "target": device.project_devices[j].project.id, type: "custom-quadratic" })
                    }

                }


            }


            for (var i = func.function_projects.length - 1; i >= 0; i--) {
                project = func.function_projects[i].project;

                for (var j = project.function_projects.length - 1; j >= 0; j--) {

                    if (self.dimoFunctions[project.function_projects[j].function.id] != undefined) {
                        edges.push({ "source": project.id, "target": project.function_projects[j].function.id, type: "custom-quadratic" })
                    }

                }


                for (var j = project.org_projects.length - 1; j >= 0; j--) {

                    if (self.dimoOrgs[project.org_projects[j].organization.id] != undefined) {
                        edges.push({ "source": project.id, "target": project.org_projects[j].organization.id, type: "custom-quadratic" })
                    }

                }

                for (var j = project.project_devices.length - 1; j >= 0; j--) {

                    if (self.dimoDevices[project.project_devices[j].device.id] != undefined) {
                        edges.push({ "source": project.id, "target": project.project_devices[j].device.id, type: "custom-quadratic" })
                    }

                }


            }

            for (var i = func.function_sp_orgs.length - 1; i >= 0; i--) {
                org = func.function_sp_orgs[i].organization;

                for (var j = org.device_oem_orgs.length - 1; j >= 0; j--) {

                    if (self.dimoDevices[org.device_oem_orgs[j].device.id] != undefined) {
                        edges.push({ "source": org.id, "target": org.device_oem_orgs[j].device.id, type: "custom-quadratic" })
                    }

                }


                for (var j = org.device_sp_orgs.length - 1; j >= 0; j--) {

                    if (self.dimoDevices[org.device_sp_orgs[j].device.id] != undefined) {
                        edges.push({ "source": org.id, "target": org.device_sp_orgs[j].device.id, type: "custom-quadratic" })
                    }

                }

                for (var j = org.function_sp_orgs.length - 1; j >= 0; j--) {

                    if (self.dimoFunctions[org.function_sp_orgs[j].function.id] != undefined) {
                        edges.push({ "source": org.id, "target": org.function_sp_orgs[j].function.id, type: "custom-quadratic" })
                    }

                }


                for (var j = org.org_projects.length - 1; j >= 0; j--) {

                    if (self.dimoProjects[org.org_projects[j].project.id] != undefined) {
                        edges.push({ "source": org.id, "target": org.org_projects[j].project.id, type: "custom-quadratic" })
                    }

                }



            }




            if (initial) {
                initGraph(nodes, edges);
            } else {
                refreshGraph(nodes, edges);
            }




        })
}



function gqlDeviceDataToNode(device) {

    var node = {
        "id": device.id,
        "type": "dimo-node",
        "class":"[Device]",
        "label":device.name,
        "airtableURL":"https://airtable.com/tblBfeuQ77VxrrGAx/viwrAkUlftN8UCRvK/" + device.id,
    };
 
    node.level = 1;


    node.logo = {
                    "show":false
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

            console.info("[Device] Request", data);


            var device = data.device[0];
            var devNode = gqlDeviceDataToNode(device);

            if (initial) {

                self.dimoDevices[devNode.id] = devNode
                nodes.push(devNode)
            }

            var func, funcNode;
            for (var i = device.device_functions.length - 1; i >= 0; i--) {

                func = device.device_functions[i].function;
                funcNode = gqlFunctionDataToNode(func);

                if (self.dimoFunctions[funcNode.id] == undefined) {
                    self.dimoFunctions[funcNode.id] = funcNode;
                    nodes.push(funcNode)
                }


                edges.push({ "source": devNode.id, "target": funcNode.id, type: "custom-quadratic" })






            }

            var org, orgNode;
            for (var i = device.device_oem_orgs.length - 1; i >= 0; i--) {

                org = device.device_oem_orgs[i].organization;
                orgNode = gqlOrgDataToNode(org);

                if (self.dimoOrgs[orgNode.id] == undefined) {
                    self.dimoOrgs[orgNode.id] = orgNode;
                    nodes.push(orgNode)
                }


                edges.push({ "source": devNode.id, "target": orgNode.id, type: "custom-quadratic" })






            }


            for (var i = device.device_sp_orgs.length - 1; i >= 0; i--) {

                org = device.device_sp_orgs[i].organization;
                orgNode = gqlOrgDataToNode(org);

                if (self.dimoOrgs[orgNode.id] == undefined) {
                    self.dimoOrgs[orgNode.id] = orgNode;
                    nodes.push(orgNode)
                }


                edges.push({ "source": devNode.id, "target": orgNode.id, type: "custom-quadratic" })






            }

            var project, projNode
            for (var i = device.project_devices.length - 1; i >= 0; i--) {

                project = device.project_devices[i].project;
                projNode = gqlProjectDataToNode(project);

                if (self.dimoProjects[projNode.id] == undefined) {
                    self.dimoProjects[projNode.id] = projNode;
                    nodes.push(projNode)
                }


                edges.push({ "source": devNode.id, "target": projNode.id, type: "custom-quadratic" })






            }






          for (var i = device.device_functions.length - 1; i >= 0; i--) {
              func = device.device_functions[i].function;

              for (var j = func.device_functions.length - 1; j >= 0; j--) {

                  if (self.dimoDevices[func.device_functions[j].device.id] != undefined) {
                      edges.push({ "source": func.id, "target": func.device_functions[j].device.id, type: "custom-quadratic" })
                  }

              }


              for (var j = func.function_projects.length - 1; j >= 0; j--) {

                  if (self.dimoProjects[func.function_projects[j].project.id] != undefined) {
                      edges.push({ "source": func.id, "target": func.function_projects[j].project.id, type: "custom-quadratic" })
                  }

              }


              for (var j = func.function_sp_orgs.length - 1; j >= 0; j--) {

                  if (self.dimoOrgs[func.function_sp_orgs[j].organization.id] != undefined) {
                      edges.push({ "source": func.id, "target": func.function_sp_orgs[j].organization.id, type: "custom-quadratic" })
                  }

              }
          }


          for (var i = device.device_oem_orgs.length - 1; i >= 0; i--) {
              org = device.device_oem_orgs[i].organization;

              for (var j = org.device_oem_orgs.length - 1; j >= 0; j--) {

                  if (self.dimoDevices[org.device_oem_orgs[j].device.id] != undefined) {
                      edges.push({ "source": org.id, "target": org.device_oem_orgs[j].device.id, type: "custom-quadratic" })
                  }

              }


              for (var j = org.device_sp_orgs.length - 1; j >= 0; j--) {

                  if (self.dimoDevices[org.device_sp_orgs[j].device.id] != undefined) {
                      edges.push({ "source": org.id, "target": org.device_sp_orgs[j].device.id, type: "custom-quadratic" })
                  }

              }

              for (var j = org.function_sp_orgs.length - 1; j >= 0; j--) {

                  if (self.dimoFunctions[org.function_sp_orgs[j].function.id] != undefined) {
                      edges.push({ "source": org.id, "target": org.function_sp_orgs[j].function.id, type: "custom-quadratic" })
                  }

              }              


              for (var j = org.org_projects.length - 1; j >= 0; j--) {

                  if (self.dimoProjects[org.org_projects[j].project.id] != undefined) {
                      edges.push({ "source": org.id, "target": org.org_projects[j].project.id, type: "custom-quadratic" })
                  }

              }              



            }

          for (var i = device.device_sp_orgs.length - 1; i >= 0; i--) {
              org = device.device_sp_orgs[i].organization;

              for (var j = org.device_oem_orgs.length - 1; j >= 0; j--) {

                  if (self.dimoDevices[org.device_oem_orgs[j].device.id] != undefined) {
                      edges.push({ "source": org.id, "target": org.device_oem_orgs[j].device.id, type: "custom-quadratic" })
                  }

              }


              for (var j = org.device_sp_orgs.length - 1; j >= 0; j--) {

                  if (self.dimoDevices[org.device_sp_orgs[j].device.id] != undefined) {
                      edges.push({ "source": org.id, "target": org.device_sp_orgs[j].device.id, type: "custom-quadratic" })
                  }

              }

              for (var j = org.function_sp_orgs.length - 1; j >= 0; j--) {

                  if (self.dimoFunctions[org.function_sp_orgs[j].function.id] != undefined) {
                      edges.push({ "source": org.id, "target": org.function_sp_orgs[j].function.id, type: "custom-quadratic" })
                  }

              }              


              for (var j = org.org_projects.length - 1; j >= 0; j--) {

                  if (self.dimoProjects[org.org_projects[j].project.id] != undefined) {
                      edges.push({ "source": org.id, "target": org.org_projects[j].project.id, type: "custom-quadratic" })
                  }

              }              



            }




          for (var i = device.project_devices.length - 1; i >= 0; i--) {
              project = device.project_devices[i].project;

              for (var j = project.function_projects.length - 1; j >= 0; j--) {

                  if (self.dimoFunctions[project.function_projects[j].function.id] != undefined) {
                      edges.push({ "source": project.id, "target": project.function_projects[j].function.id, type: "custom-quadratic" })
                  }

              }


            for (var j = project.org_projects.length - 1; j >= 0; j--) {

                  if (self.dimoOrgs[project.org_projects[j].organization.id] != undefined) {
                      edges.push({ "source": project.id, "target": project.org_projects[j].organization.id, type: "custom-quadratic" })
                  }

              }


            for (var j = project.project_devices.length - 1; j >= 0; j--) {

                  if (self.dimoDevices[project.project_devices[j].device.id] != undefined) {
                      edges.push({ "source": project.id, "target": project.project_devices[j].device.id, type: "custom-quadratic" })
                  }

              }



            }


            if (initial) {
                initGraph(nodes,edges);
            }
            else {
              refreshGraph(nodes, edges);
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




function refreshGraph(nodes, edges) {

    
    layout.instance.stop();
    nodes.forEach((node) => {
      node.skip = false;


    })

    edges.forEach((edge) => {
      edge.skip = false;


    })

    console.log(edges)

    const graphNodes = graph.getNodes();
    const graphEdges = graph.getEdges();
    var node,edge;
     for (var i = graphNodes.length - 1; i >= 0; i--) {
       //console.log(graphNodes[i].getModel())
       node = graphNodes[i].getModel()
       node.skip = true;
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


  var layoutConfig = getForceLayoutConfig(graph, largeGraphMode);
  // layoutConfig.center = [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2];
  layout.instance = new G6.Layout["gForce"](layoutConfig);
  // layout.instance.getMass = (d) => {
  //   const cachePosition = cachePositions[d.id];
  //   if (cachePosition) return 5;
  //   return 1;
  // };

  // layout.instance.getCenter = d => {
  //   const cachePosition = cachePositions[d.id];
  //   if (!cachePosition && (d.x || d.y)) return [d.x, d.y, 10];
  //   else if (cachePosition) return [cachePosition.x, cachePosition.y, 10];
  //   return [width / 2, height / 2, 10];
  // }

   layout.instance.init({
    nodes: nodes,
    edges:edges_
  });

  layout.instance.execute();
}



function initGraphData() {

  const vars = getUrlVars();
  console.info("initGraph",vars)
  if (vars["org_id"] != undefined) {
    loadDimoOrg(vars["org_id"], self.dimoGraphData.nodes, self.dimoGraphData.edges);

  }
  else if (vars["project_id"] != undefined) {
    loadDimoProject(vars["project_id"], self.dimoGraphData.nodes, self.dimoGraphData.edges)
  }
  else if (vars["device_id"] != undefined) {
    loadDimoDevice(vars["device_id"], self.dimoGraphData.nodes, self.dimoGraphData.edges)
  }
  else if (vars["function_id"] != undefined) {
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
      console.log(node.skip)

      //console.log(node)
      node.labelLineNum = undefined;
      node.oriLabel = node.label;
      node.label = formatText(node.label, labelMaxLength, "...");
      node.degree = 0;
      node.inDegree = 0;
      node.outDegree = 0;
      nodeMap[node.id] = node;


      if (currentNodeMap[node.id]) {
        console.warn("node exists already!", node.id);
        node.id = `${node.id}${Math.random()}`;
      }
      currentNodeMap[node.id] = node;
      if (node.count > maxNodeCount) maxNodeCount = node.count;
      const cachePosition = cachePositions ? cachePositions[node.id] : undefined;
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
                        console.log(edges[i].source, edges[j].source,edges[i].target, edges[j].target)
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
                        console.log(edges[i].source, edges[j].target,edges[i].target, edges[j].source)
                        toRemove.push(j)
                    }
                }

            }
        }



    }

    toRemove = [...new Set(toRemove)];
    toRemove.sort();
    console.log("toRemove", toRemove);
    for (var i = edges.length - 1; i >= 0; i--) {
        if(toRemove.includes(i)!=true){
          newEdges.push(edges[i])
        }
    }

    console.log(edges.length,newEdges.length);
    return newEdges;


}





function initGraph(nodes, edges_) {

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
              <li id='hide'>Hide the Node</li>
              <li id='url'>View in Airtable</li>
              <li id='load'>Load Connected Items</li>
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
            graph.hideItem(item);
            hiddenItemIds.push(model.id);
            break;

          case "show":
            showItems(graph);
            break;
          case "url":
            window.open(model.airtableURL, '_blank');

          case "load":
            cachePositions = cacheNodePositions(graph.getNodes());
            loadConnectedItems(model);
            // handleRefreshGraph(
            //   graph,
            //   currentUnproccessedData,
            //   CANVAS_WIDTH,
            //   CANVAS_HEIGHT,
            //   largeGraphMode,
            //   true,
            //   false
            // );
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




    graph = new G6.Graph({
      container: "container",
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      linkCenter: true,
      minZoom: 0.1,
      groupByTypes: false,
      modes: {
        default: [
          {
            type: "drag-canvas",
            enableOptimize: true
          },
          {
            type: "zoom-canvas",
            enableOptimize: true,
            optimizeZoom: 0.01
          },
          "drag-node",
          "shortcuts-call"
        ],
        lassoSelect: [
          {
            type: "zoom-canvas",
            enableOptimize: true,
            optimizeZoom: 0.01
          },
          {
            type: "lasso-select",
            selectedState: "focus",
            trigger: "drag"
          }
        ],
        fisheyeMode: []
      },
      defaultNode: {
        type: "dimo-node",
        size: DEFAULTNODESIZE
      },
      plugins: [contextMenu]
    });

    graph.get("canvas").set("localRefresh", false);

    var layoutConfig = getForceLayoutConfig(graph, largeGraphMode);
    layoutConfig.center = [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2];
    layout.instance = new G6.Layout["gForce"](layoutConfig);
    layout.instance.init(self.dimoGraphData);
    layout.instance.execute();

    bindListener(graph);
    

    processAllNodesEdges(nodes,edges,true);


    graph.data({nodes:nodes,edges:edges});
    graph.render();


}





// fetch("https://gw.alipayobjects.com/os/antvdemo/assets/data/relations.json")
//   .then((res) => res.json())
//   .then((data) => {
//     const container = document.getElementById("container");

//     container.style.backgroundColor = "#2b2f33";

//     CANVAS_WIDTH = container.scrollWidth;
//     CANVAS_HEIGHT = (self.innerHeight) - 25;
//     console.log("dimension",CANVAS_HEIGHT,CANVAS_WIDTH);

//     nodeMap = {};
//     const clusteredData = louvain(data, false, "weight");

//     console.log("clusteredData",clusteredData);

//     const aggregatedData = { nodes: [], edges: [] };
//     clusteredData.clusters.forEach((cluster, i) => {
//       cluster.nodes.forEach((node) => {
//         node.level = 0;
//         node.label = node.id;
//         node.type = "";
//         node.colorSet = colorSets[i];
//         nodeMap[node.id] = node;
//       });
//       const cnode = {
//         id: cluster.id,
//         type: "aggregated-node",
//         count: cluster.nodes.length,
//         level: 1,
//         label: cluster.id,
//         colorSet: colorSets[i],
//         idx: i,
//         icon: {
//           url:dimoOrgIcon
//         },
//         logo: {
//           show:false
//         }
//       };
//       aggregatedNodeMap[cluster.id] = cnode;
//       aggregatedData.nodes.push(cnode);
//     });
//     clusteredData.clusterEdges.forEach((clusterEdge) => {
//       const cedge = {
//         ...clusterEdge,
//         size: Math.log(clusterEdge.count),
//         label: "",
//         id: `edge-${uniqueId()}`
//       };
//       if (cedge.source === cedge.target) {
//         cedge.type = "loop";
//         cedge.loopCfg = {
//           dist: 20
//         };
//       } else cedge.type = "line";
//       aggregatedData.edges.push(cedge);
//     });

//     data.edges.forEach((edge) => {
//       edge.label = `${edge.source}-${edge.target}`;
//       edge.id = `edge-${uniqueId()}`;
//     });

//     currentUnproccessedData = aggregatedData;

//     const { edges: processedEdges } = processNodesEdges(
//       currentUnproccessedData.nodes,
//       currentUnproccessedData.edges,
//       CANVAS_WIDTH,
//       CANVAS_HEIGHT,
//       largeGraphMode,
//       true,
//       true
//     );

//     const contextMenu = new G6.Menu({
//       shouldBegin(evt) {
//         if (evt.target && evt.target.isCanvas && evt.target.isCanvas())
//           return true;
//         if (evt.item) return true;
//         return false;
//       },
//       getContent(evt) {
//         const { item } = evt;
//         if (evt.target && evt.target.isCanvas && evt.target.isCanvas()) {
//           return `<ul>
//           <li id='show'>Show all Hidden Items</li>
//           <li id='collapseAll'>Collapse all Clusters</li>
//         </ul>`;
//         } else if (!item) return;
//         const itemType = item.getType();
//         const model = item.getModel();
//         if (itemType && model) {
//           if (itemType === "node") {
//             if (model.level !== 0) {
//               return `<ul>
//               <li id='expand'>Expand the Cluster</li>
//               <li id='hide'>Hide the Node</li>
//             </ul>`;
//             } else {
//               return `<ul>
//               <li id='collapse'>Collapse the Cluster</li>
//               <li id='neighbor-1'>Find 1-degree Neighbors</li>
//               <li id='neighbor-2'>Find 2-degree Neighbors</li>
//               <li id='neighbor-3'>Find 3-degree Neighbors</li>
//               <li id='hide'>Hide the Node</li>
//             </ul>`;
//             }
//           } else {
//             return `<ul>
//             <li id='hide'>Hide the Edge</li>
//           </ul>`;
//           }
//         }
//       },
//       handleMenuClick: (target, item) => {
//         const model = item && item.getModel();
//         const liIdStrs = target.id.split("-");
//         let mixedGraphData;
//         switch (liIdStrs[0]) {
//           case "hide":
//             graph.hideItem(item);
//             hiddenItemIds.push(model.id);
//             break;
//           case "expand":
//             const newArray = manageExpandCollapseArray(
//               graph.getNodes().length,
//               model,
//               collapseArray,
//               expandArray
//             );
//             expandArray = newArray.expandArray;
//             collapseArray = newArray.collapseArray;
//             mixedGraphData = getMixedGraph(
//               clusteredData,
//               data,
//               nodeMap,
//               aggregatedNodeMap,
//               expandArray,
//               collapseArray
//             );
//             break;
//           case "collapse":
//             const aggregatedNode = aggregatedNodeMap[model.clusterId];
//             manipulatePosition = { x: aggregatedNode.x, y: aggregatedNode.y };
//             collapseArray.push(aggregatedNode);
//             for (let i = 0; i < expandArray.length; i++) {
//               if (expandArray[i].id === model.clusterId) {
//                 expandArray.splice(i, 1);
//                 break;
//               }
//             }
//             mixedGraphData = getMixedGraph(
//               clusteredData,
//               data,
//               nodeMap,
//               aggregatedNodeMap,
//               expandArray,
//               collapseArray
//             );
//             break;
//           case "collapseAll":
//             expandArray = [];
//             collapseArray = [];
//             mixedGraphData = getMixedGraph(
//               clusteredData,
//               data,
//               nodeMap,
//               aggregatedNodeMap,
//               expandArray,
//               collapseArray
//             );
//             break;
//           case "neighbor":
//             const expandNeighborSteps = parseInt(liIdStrs[1]);
//             mixedGraphData = getNeighborMixedGraph(
//               model,
//               expandNeighborSteps,
//               data,
//               clusteredData,
//               currentUnproccessedData,
//               nodeMap,
//               aggregatedNodeMap,
//               10
//             );
//             break;
//           case "show":
//             showItems(graph);
//             break;
//           default:
//             break;
//         }
//         if (mixedGraphData) {
//           cachePositions = cacheNodePositions(graph.getNodes());
//           currentUnproccessedData = mixedGraphData;
//           handleRefreshGraph(
//             graph,
//             currentUnproccessedData,
//             CANVAS_WIDTH,
//             CANVAS_HEIGHT,
//             largeGraphMode,
//             true,
//             false
//           );
//         }
//       },

//       offsetX: 16 + 10,
//       offsetY: 0,

//       itemTypes: ["node", "edge", "canvas"]
//     });


//     graph = new G6.Graph({
//       container: "container",
//       width: CANVAS_WIDTH,
//       height: CANVAS_HEIGHT,
//       linkCenter: true,
//       minZoom: 0.1,
//       groupByTypes: false,
//       modes: {
//         default: [
//           {
//             type: "drag-canvas",
//             enableOptimize: true
//           },
//           {
//             type: "zoom-canvas",
//             enableOptimize: true,
//             optimizeZoom: 0.01
//           },
//           "drag-node",
//           "shortcuts-call"
//         ],
//         lassoSelect: [
//           {
//             type: "zoom-canvas",
//             enableOptimize: true,
//             optimizeZoom: 0.01
//           },
//           {
//             type: "lasso-select",
//             selectedState: "focus",
//             trigger: "drag"
//           }
//         ],
//         fisheyeMode: []
//       },
//       defaultNode: {
//         type: "aggregated-node",
//         size: DEFAULTNODESIZE
//       },
//       plugins: [contextMenu]
//     });

//     graph.get("canvas").set("localRefresh", false);

//     const layoutConfig = getForceLayoutConfig(graph, largeGraphMode);
//     layoutConfig.center = [CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2];
//     layout.instance = new G6.Layout["gForce"](layoutConfig);
//     layout.instance.init({
//       nodes: currentUnproccessedData.nodes,
//       edges: processedEdges
//     });
//     layout.instance.execute();

//     bindListener(graph);
//     graph.data({ nodes: aggregatedData.nodes, edges: processedEdges });
//     graph.render();
//   });

if (typeof window !== "undefined")
  window.onresize = () => {
    if (!graph || graph.get("destroyed")) return;
    const container = document.getElementById("container");
    if (!container) return;
    CANVAS_WIDTH = container.scrollWidth;
    CANVAS_HEIGHT = self.innerHeight - 25
    graph.changeSize(CANVAS_WIDTH, CANVAS_HEIGHT);
  };