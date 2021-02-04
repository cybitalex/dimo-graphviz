import React, { useEffect } from 'react'
import G6 from '@antv/g6';








// const data = {
//     nodes: [
//         { id: 'node0', size: 50, label: "Text", type: "rect" },
//         { id: 'node1', size: 30 },
//         { id: 'node2', size: 30 },
//         { id: 'node3', size: 30 },
//         { id: 'node4', size: 30 },
//         { id: 'node5', size: 30 },
//         { id: 'node6', size: 15 },
//         { id: 'node7', size: 15 },
//         { id: 'node8', size: 15 },
//         { id: 'node9', size: 15 },
//         { id: 'node10', size: 15 },
//         { id: 'node11', size: 15 },
//         { id: 'node12', size: 15 },
//         { id: 'node13', size: 15 },
//         { id: 'node14', size: 15 },
//         { id: 'node15', size: 15 },
//         { id: 'node16', size: 15 },
//     ],
//     edges: [
//         { source: 'node0', target: 'node1' },
//         { source: 'node0', target: 'node2' },
//         { source: 'node0', target: 'node3' },
//         { source: 'node0', target: 'node4' },
//         { source: 'node0', target: 'node5' },
//         { source: 'node1', target: 'node6' },
//         { source: 'node1', target: 'node7' },
//         { source: 'node2', target: 'node8' },
//         { source: 'node2', target: 'node9' },
//         { source: 'node2', target: 'node10' },
//         { source: 'node2', target: 'node11' },
//         { source: 'node2', target: 'node12' },
//         { source: 'node2', target: 'node13' },
//         { source: 'node3', target: 'node14' },
//         { source: 'node3', target: 'node15' },
//         { source: 'node3', target: 'node16' },
//     ],
// };


const Tutorital = () => {
    const ref = React.useRef(null)
    let graph = null

    useEffect(() => {
        if (!graph) {

            const minimap = new G6.Minimap()


            graph = new G6.Graph({
                container: ref.current,
                width: 1800,
                height: 900,
                fitView: true,
                plugins: [minimap],
                modes: {
                    default: ['drag-canvas', 'zoom-canvas', 'drag-node']
                },
                // defaultNode: {
                //     type: 'circle',
                //     labelCfg: {
                //         style: {
                //             fill: '#000000A6',
                //             fontSize: 8
                //         }
                //     },
                //     style: {
                //         stroke: '#72CC4A',
                //         width: 150
                //     }
                // },
                defaultEdge: {
                    type: 'cubic',
                    lineWidth: 3
                },
                layout: {
                    type: 'radial',
                    center: [900, 450], // The center of the graph by default
                    //linkDistance: 50, // The edge length
                    maxIteration: 1000,
                    focusNode: 'recGQ1YwacCrLTQiy',
                    unitRadius: 700,
                    nodeSpacing:800,
                    preventOverlap: true, // nodeSize or size in data is required for preventOverlap: true
                    maxPreventOverlapIteration: 1000,
                    //nodeSize: 100,
                    strictRadial: true,
                    workerEnabled: true, // Whether to activate web-worker
                    sortBy: "cluster"
                },
                nodeStateStyles: {
                    hover: {
                        stroke: 'red',
                        lineWidth: 5
                    }
                },
                edgeStateStyles: {
                    hover: {
                        stroke: 'red',
                        lineWidth: 5
                    }
                }
            })
        }
        console.log("Rendering Tut");
        graph.data(self.dimoGraphData);

        graph.render();

        graph.on('node:mouseenter', evt => {
            graph.setItemState(evt.item, 'hover', true)
            for (var i = evt.item._cfg.edges.length - 1; i >= 0; i--) {
                var edge = evt.item._cfg.edges[i];
                graph.setItemState(edge, 'hover', true)
                graph.setItemState(edge._cfg.target, 'hover', true)
                graph.setItemState(edge._cfg.source, 'hover', true)
            }
        })

        graph.on('node:mouseleave', evt => {
            graph.setItemState(evt.item, 'hover', false)
            for (var i = evt.item._cfg.edges.length - 1; i >= 0; i--) {
                var edge = evt.item._cfg.edges[i];
                graph.setItemState(edge, 'hover', false)
                graph.setItemState(edge._cfg.target, 'hover', false)
                graph.setItemState(edge._cfg.source, 'hover', false)
            }
        })


        graph.on('edge:mouseenter', evt => {
            graph.setItemState(evt.item, 'hover', true)
            graph.setItemState(evt.item._cfg.target, 'hover', true)
            graph.setItemState(evt.item._cfg.source, 'hover', true)
        })

        graph.on('edge:mouseleave', evt => {
            console.log(evt.item)
            graph.setItemState(evt.item, 'hover', false)
            graph.setItemState(evt.item._cfg.target, 'hover', false)
            graph.setItemState(evt.item._cfg.source, 'hover', false)

        })

    }, [])

    return <div ref={ref}></div>
}

export default Tutorital