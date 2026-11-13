import { useState } from "react"
import { Button } from "@components/ui/button"
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@components/ui/alert-dialog"
import type { WorkflowMeta } from "@hooks/useDoctypeMeta"
import _ from "@lib/translate"
import { useWorkflowTransitions } from "./useWorkflowTransitions"
import { isIrreversibleTransition, type WorkflowTransition } from "./workflowTransitions"

/**
 * The workflow actions the current user can take, as buttons on the card, so
 * an approval is one tap from the message. Renders nothing when there are none.
 */
export const DocumentWorkflowActions = ({
    doctype,
    docname,
    workflowDoc,
    onApplied,
}: {
    doctype: string
    docname: string
    workflowDoc?: WorkflowMeta
    onApplied: () => void
}) => {
    const { transitions, apply, applyingAction } = useWorkflowTransitions(doctype, docname, onApplied)
    const [confirming, setConfirming] = useState<WorkflowTransition>()

    if (!transitions?.length) return null

    const onClick = (transition: WorkflowTransition) =>
        isIrreversibleTransition(workflowDoc, transition) ? setConfirming(transition) : apply(transition.action)

    return (
        <div className="flex flex-wrap gap-1.5">
            {transitions.map((transition) => (
                <Button
                    key={transition.name}
                    variant="outline"
                    size="md"
                    title={`${transition.state} → ${transition.next_state}`}
                    loading={applyingAction === transition.action}
                    disabled={Boolean(applyingAction) && applyingAction !== transition.action}
                    onClick={() => onClick(transition)}
                >
                    {transition.action}
                </Button>
            ))}
            <ConfirmTransitionDialog
                docname={docname}
                transition={confirming}
                onCancel={() => setConfirming(undefined)}
                onConfirm={(action) => apply(action).then(() => setConfirming(undefined))}
                loading={Boolean(applyingAction)}
            />
        </div>
    )
}

const ConfirmTransitionDialog = ({
    docname,
    transition,
    onCancel,
    onConfirm,
    loading,
}: {
    docname: string
    transition?: WorkflowTransition
    onCancel: () => void
    onConfirm: (action: string) => void
    loading: boolean
}) => (
    <AlertDialog open={Boolean(transition)} onOpenChange={(open) => !open && onCancel()}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{transition?.action}</AlertDialogTitle>
                <AlertDialogDescription>
                    {_("{0} will move to {1}. This cannot be undone from here.", [docname, transition?.next_state ?? ""])}
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel disabled={loading}>{_("Cancel")}</AlertDialogCancel>
                <Button variant="solid" size="md" loading={loading} onClick={() => transition && onConfirm(transition.action)}>
                    {transition?.action}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
)
