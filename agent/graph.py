from agent.state import AgentState
from agent.tools import TOOLS


class StoreAgent:
    def __init__(self) -> None:
        self.tools = TOOLS

    async def run(self, state: AgentState) -> AgentState:
        # The LLM will inspect `state`, select tools from `self.tools`,
        # and mutate `state` until the order workflow is complete.
        return state


agent = StoreAgent()
