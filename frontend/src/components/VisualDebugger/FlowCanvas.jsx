import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    useReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Panel,
    MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { generateVisualFlowAPI, optimizeNodeCodeAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Loader2, PlayCircle, Info, Activity } from 'lucide-react';
import dagre from 'dagre';
import CustomComplexityNode from './CustomComplexityNode';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 150;

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const nodeTypes = {
    complexityNode: CustomComplexityNode,
};

const FlowCanvasContent = ({ code, language, onNodeSelect, onOptimizationComplete }) => {
    const { setCenter, fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        if (nodes.length > 0) {
            const timer = setTimeout(() => {
                fitView({ padding: 0.2, duration: 800, minZoom: 0.85, maxZoom: 1.2 });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [nodes, fitView]);

    const handleOptimizeClick = useCallback(async (nodeData) => {
        try {
            const toastId = toast.loading("AI is optimizing this logic block...");
            const result = await optimizeNodeCodeAPI(code, nodeData.lineNumber, language);

            toast.update(toastId, { render: "Optimization complete!", type: "success", isLoading: false, autoClose: 3000 });

            if (onOptimizationComplete && result) {
                onOptimizationComplete(result);
            }
        } catch (err) {
            toast.dismiss();
            toast.error("Failed to optimize node.");
        }
    }, [code, language, onOptimizationComplete]);

    const defaultEdgeOptions = useMemo(() => ({
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' }
    }), []);

    const handleGeneratePulse = async () => {
        if (!code || code.trim() === '') {
            toast.error("No code available to visualize!");
            return;
        }

        setIsGenerating(true);
        setNodes([]); // Clear previous graph
        setEdges([]);

        try {
            const responseData = await generateVisualFlowAPI(code, language);
            console.log("AI Flow response:", responseData);

            if (responseData && responseData.nodes && responseData.edges) {
                // Ensure nodes use our custom type and bind optimization handler
                const formattedNodes = responseData.nodes.map(node => ({
                    ...node,
                    type: 'complexityNode',
                    data: {
                        ...node.data,
                        onOptimize: handleOptimizeClick
                    }
                }));
                // Map API edges directly
                const formattedEdges = responseData.edges.map((e, index) => ({
                    ...e,
                    id: e.id || `e-${index}`
                }));

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    formattedNodes,
                    formattedEdges
                );

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
                toast.success("Algorithmic Pulse generated!");
            } else {
                toast.error("Invalid AI response format.");
            }
        } catch (error) {
            console.error("Failed to generate flow:", error);
            const msg = error.response?.data?.error || "Error generating visual flow.";
            toast.error(msg);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSimulatePulse = () => {
        if (edges.length === 0) return;
        setIsSimulating(true);

        // Pre-Simulation Viewport Reset: Zoom out to see the entire graph
        fitView({ padding: 0.1, duration: 500 });

        // Reset all edges to calm state
        setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { stroke: '#94a3b8', strokeWidth: 2 } })));

        let currentIndex = 0;

        const interval = setInterval(() => {
            if (currentIndex >= edges.length) {
                clearInterval(interval);
                setIsSimulating(false);
                // Return to default active state after 1.5s
                setTimeout(() => {
                    setEdges(eds => eds.map(e => ({ ...e, animated: true, style: { stroke: '#94a3b8', strokeWidth: 2 } })));
                }, 1500);
                return;
            }

            setEdges(eds => eds.map((e, idx) => {
                if (idx === currentIndex) {
                    return { ...e, animated: true, style: { stroke: '#4f46e5', strokeWidth: 3 } }; // flash indigo tracking
                }
                return e;
            }));

            const activeEdge = edges[currentIndex];
            if (activeEdge) {
                const activeNode = nodes.find(n => n.id === activeEdge.target);
                if (activeNode && activeNode.position) {
                    setCenter(activeNode.position.x, activeNode.position.y, { zoom: 1, duration: 600 });
                }
            }

            currentIndex++;
        }, 800);
    };

    const handleNodeClick = useCallback((event, node) => {
        if (node.data?.lineNumber && onNodeSelect) {
            onNodeSelect(node.data.lineNumber);
        }
    }, [onNodeSelect]);

    return (
        <div className="w-full h-full bg-[#f8fafc] relative">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={handleNodeClick}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                preventScrolling={false}
                zoomOnScroll={false}
                panOnScroll={false}
                panOnDrag={true}
                minZoom={0.05}
                maxZoom={2}
                fitView={true}
                fitViewOptions={{ padding: 0.2, includeHiddenNodes: false }}
                className="bg-slate-50"
            >
                <Background color="#cbd5e1" gap={20} size={2} variant="dots" />
                <MiniMap
                    nodeStrokeColor={(n) => {
                        if (n.data?.complexityScore > 7) return '#ef4444';
                        if (n.data?.complexityScore > 3) return '#f59e0b';
                        return '#4f46e5';
                    }}
                    nodeColor={(n) => {
                        if (n.data?.complexityScore > 7) return 'rgba(239, 68, 68, 0.2)';
                        if (n.data?.complexityScore > 3) return 'rgba(245, 158, 11, 0.2)';
                        return 'rgba(79, 70, 229, 0.2)';
                    }}
                    maskColor="rgba(248, 250, 252, 0.7)"
                    style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />

                <Panel position="top-right" className="m-4 flex items-center gap-3">
                    <button
                        onClick={handleSimulatePulse}
                        disabled={isGenerating || isSimulating || edges.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-indigo-600 font-medium rounded-lg shadow-sm border border-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Activity className="w-4 h-4" />
                        Simulate Pulse
                    </button>
                    <button
                        onClick={handleGeneratePulse}
                        disabled={isGenerating || isSimulating}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-600"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Pulse...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-5 h-5" />
                                Generate Pulse
                            </>
                        )}
                    </button>
                </Panel>

                <Panel position="top-left" className="m-4 pointer-events-none">
                    <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm text-xs max-w-[240px]">
                        <div className="flex items-center gap-2 mb-3 text-slate-500 font-bold tracking-wide uppercase text-[10px]">
                            <Info className="w-3.5 h-3.5 text-slate-400" />
                            Complexity Legend
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                            <span className="text-slate-700 font-medium">O(1) Constant Time</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-[#4f46e5]"></div>
                            <span className="text-slate-700 font-medium">O(log N) Logarithmic</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                            <span className="text-slate-700 font-medium">O(N) Linear Time</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                            <span className="text-slate-700 font-medium">O(N²) Quadratic Time</span>
                        </div>
                    </div>
                </Panel>
            </ReactFlow>

            {nodes.length === 0 && !isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-slate-400 text-lg mb-2 font-medium">Canvas is empty</div>
                    <div className="text-slate-500 text-sm">Click "Generate Pulse" to visualize your code's 4D execution map.</div>
                </div>
            )}
        </div>
    );
};

const FlowCanvas = (props) => (
    <ReactFlowProvider>
        <FlowCanvasContent {...props} />
    </ReactFlowProvider>
);

export default FlowCanvas;
