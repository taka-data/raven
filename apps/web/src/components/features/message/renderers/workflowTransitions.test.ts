import { describe, expect, it } from "vitest"
import { isIrreversibleTransition, type WorkflowTransition } from "./workflowTransitions"

const workflowDoc = {
    name: "Quotation Approval",
    states: [
        { state: "Pending", doc_status: "0" },
        { state: "Approved", doc_status: "1" },
        { state: "Cancelled", doc_status: "2" },
    ],
}
const transitionTo = (next_state: string): WorkflowTransition => ({ name: next_state, action: "Act", state: "Pending", next_state })

describe("isIrreversibleTransition", () => {
    it("asks before a transition that submits or cancels the document", () => {
        expect(isIrreversibleTransition(workflowDoc, transitionTo("Approved"))).toBe(true)
        expect(isIrreversibleTransition(workflowDoc, transitionTo("Cancelled"))).toBe(true)
    })

    it("applies a transition that keeps the document a draft at once", () => {
        expect(isIrreversibleTransition(workflowDoc, transitionTo("Pending"))).toBe(false)
    })

    it("does not ask when the workflow states are unknown", () => {
        expect(isIrreversibleTransition(undefined, transitionTo("Approved"))).toBe(false)
    })
})
