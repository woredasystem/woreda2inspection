import { LeaderForm } from "@/components/admin/LeaderForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default function NewLeaderPage() {
    return (
        <div className="space-y-8">
            <AdminPageHeader
                icon="plus"
                titleKey="createNewLeader"
                descriptionKey="createNewLeaderDesc"
                gradient="from-green-500 to-emerald-600"
            />
            <div className="max-w-4xl mx-auto">
                <LeaderForm />
            </div>
        </div>
    )
}
