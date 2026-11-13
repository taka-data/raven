import type { WorkflowMeta } from "@hooks/useDoctypeMeta"

/** One row of frappe.model.workflow.get_transitions. */
export type WorkflowTransition = {
    name: string
    action: string
    state: string
    next_state: string
}

/** Submitting or cancelling cannot be undone by another transition, so the card asks first. */
export const isIrreversibleTransition = (workflowDoc: WorkflowMeta | undefined, transition: WorkflowTransition) => {
    const nextState = workflowDoc?.states?.find((state) => state.state === transition.next_state)
    return ["1", "2"].includes(String(nextState?.doc_status ?? "0"))
}
