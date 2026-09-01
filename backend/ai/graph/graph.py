from langgraph.graph import StateGraph, START, END

from .state import GraphState
from .router import route_query
from .nodes import (
    rag_node,
    db_node,
    mcp_node,
    final_response_node,
)


# ============================================================
# ROUTER NODE
# ============================================================

def router_node(state: GraphState) -> GraphState:

    question = state["user_query"]

    route = route_query(question)

    return {
        **state,
        "route": route,
    }


# ============================================================
# CONDITIONAL ROUTING
# ============================================================

def route_after_router(state: GraphState):

    route = state.get("route")

    if route == "rag":
        return "rag"

    if route == "db":
        return "db"

    if route == "mcp":
        return "mcp"

    raise ValueError(
        f"Invalid route: {route}"
    )


# ============================================================
# BUILD GRAPH
# ============================================================

def build_graph():

    graph = StateGraph(GraphState)

    graph.add_node(
        "router",
        router_node,
    )

    graph.add_node(
        "rag",
        rag_node,
    )

    graph.add_node(
        "db",
        db_node,
    )

    graph.add_node(
        "mcp",
        mcp_node,
    )

    graph.add_node(
        "final_response",
        final_response_node,
    )

    graph.add_edge(
        START,
        "router",
    )

    graph.add_conditional_edges(
        "router",
        route_after_router,
        {
            "rag": "rag",
            "db": "db",
            "mcp": "mcp",
        },
    )

    graph.add_edge(
        "rag",
        "final_response",
    )

    graph.add_edge(
        "db",
        "final_response",
    )

    graph.add_edge(
        "mcp",
        "final_response",
    )

    graph.add_edge(
        "final_response",
        END,
    )

    return graph.compile()


graph = build_graph()