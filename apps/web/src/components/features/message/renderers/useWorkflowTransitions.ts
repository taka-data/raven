import { useContext, useState } from "react"
import { FrappeContext, useFrappeGetCall, type FrappeConfig } from "frappe-react-sdk"
import { toast } from "sonner"
import { errorResponseToast } from "@components/ui/error-banner"
import _ from "@lib/translate"
import type { WorkflowTransition } from "./workflowTransitions"

/** The actions the current user can take on a document now, and a way to take one. */
export const useWorkflowTransitions = (doctype: string, docname: string, onApplied: () => void) => {
    const { call } = useContext(FrappeContext) as FrappeConfig
    const [applyingAction, setApplyingAction] = useState<string>()
    const { data, error, mutate } = useFrappeGetCall<{ message: WorkflowTransition[] }>(
        "frappe.model.workflow.get_transitions",
        { doc: { doctype, name: docname } },
        `workflow_transitions::${doctype}::${docname}`,
        { revalidateOnFocus: false, shouldRetryOnError: false },
    )

    const apply = (action: string) => {
        setApplyingAction(action)
        return call
            .post("frappe.model.workflow.apply_workflow", { doc: { doctype, name: docname }, action })
            .then(() => {
                // Both go stale together: the doc's state field and what can happen next.
                onApplied()
                mutate()
                toast.success(_("Workflow updated"))
            })
            .catch((e) => errorResponseToast(_("Could not apply workflow action"), e))
            .finally(() => setApplyingAction(undefined))
    }

    return { transitions: data?.message, error, apply, applyingAction }
}
