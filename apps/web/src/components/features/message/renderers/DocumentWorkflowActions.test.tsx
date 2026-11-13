import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DocumentWorkflowActions } from "./DocumentWorkflowActions"
import { useWorkflowTransitions } from "./useWorkflowTransitions"

vi.mock("./useWorkflowTransitions", () => ({ useWorkflowTransitions: vi.fn() }))
vi.mock("@lib/translate", () => ({ default: (text: string) => text }))

const transitions = [
    { name: "t1", action: "Approve", state: "Pending", next_state: "Approved" },
    { name: "t2", action: "Reject", state: "Pending", next_state: "Rejected" },
]
const render = () =>
    renderToStaticMarkup(<DocumentWorkflowActions doctype="Quotation" docname="QTN-1" onApplied={() => {}} />)

describe("DocumentWorkflowActions", () => {
    it("shows each action the user can take as a button", () => {
        vi.mocked(useWorkflowTransitions).mockReturnValue({ transitions, apply: vi.fn(), applyingAction: undefined, error: undefined })
        const html = render()
        expect(html.match(/<button/g)).toHaveLength(2)
        expect(html).toContain("Approve")
        expect(html).toContain("Reject")
    })

    it("shows nothing when the user has no action on the document", () => {
        vi.mocked(useWorkflowTransitions).mockReturnValue({ transitions: [], apply: vi.fn(), applyingAction: undefined, error: undefined })
        expect(render()).toBe("")
    })
})
